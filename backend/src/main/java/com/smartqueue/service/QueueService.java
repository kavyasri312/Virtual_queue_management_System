package com.smartqueue.service;

import com.smartqueue.dto.*;
import com.smartqueue.model.*;
import com.smartqueue.repository.CounterRepository;
import com.smartqueue.repository.DepartmentRepository;
import com.smartqueue.repository.TokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class QueueService {

    @Autowired
    private TokenRepository tokenRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private CounterRepository counterRepository;

    @Autowired
    private TokenSequenceService tokenSequenceService;

    @Autowired
    private QrCodeService qrCodeService;

    @Autowired
    private NotificationService notificationService;

    @Autowired(required = false)
    private SimpMessagingTemplate messagingTemplate;

    /**
     * Book a new token for a customer.
     */
    @Transactional
    public TokenResponse bookToken(User customer, BookTokenRequest request) {
        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));

        if (!department.isActive()) {
            throw new IllegalStateException("This department is currently closed or inactive");
        }

        LocalDate bookingDate = request.getPreferredDate() != null ? request.getPreferredDate() : LocalDate.now();

        // 1. Check daily token limit
        long countToday = tokenRepository.findByDepartmentIdAndBookingDate(department.getId(), bookingDate).size();
        if (countToday >= department.getDailyTokenLimit()) {
            throw new IllegalStateException("Daily token limit reached for " + department.getName() + " on " + bookingDate);
        }

        // 2. Prevent duplicate active booking for the same customer and department
        Optional<Token> existingActive = tokenRepository.findFirstByCustomerIdAndDepartmentIdAndStatusIn(
                customer.getId(),
                department.getId(),
                List.of(TokenStatus.WAITING, TokenStatus.CALLED, TokenStatus.SERVING)
        );
        if (existingActive.isPresent()) {
            throw new IllegalStateException("You already have an active token (" +
                    existingActive.get().getTokenNumber() + ") in " + department.getName());
        }

        // 3. Generate transaction-safe sequence and token number
        TokenSequenceService.GeneratedSequence gen = tokenSequenceService.nextSequence(department, bookingDate);

        // 4. Create and persist token
        Token token = new Token(
                gen.getTokenNumber(),
                gen.getSequenceNumber(),
                department,
                customer,
                request.getPriority() != null ? request.getPriority() : Priority.NORMAL,
                bookingDate,
                request.getNotes()
        );

        token = tokenRepository.save(token);

        // 5. Send notification
        notificationService.sendNotification(
                customer,
                "Token Booked: " + token.getTokenNumber(),
                "Your token " + token.getTokenNumber() + " for " + department.getName() + " is confirmed.",
                "TOKEN_BOOKED"
        );

        // 6. Broadcast real-time queue update
        broadcastQueueUpdate(department.getId());
        broadcastAdminStats();

        return mapToTokenResponse(token);
    }

    /**
     * Get real-time queue position for a token.
     */
    @Transactional(readOnly = true)
    public QueuePositionDto getQueuePosition(Long tokenId) {
        Token token = tokenRepository.findById(tokenId)
                .orElseThrow(() -> new IllegalArgumentException("Token not found"));

        QueuePositionDto dto = new QueuePositionDto();
        dto.setTokenNumber(token.getTokenNumber());
        dto.setStatus(token.getStatus());
        dto.setDepartmentName(token.getDepartment().getName());
        dto.setDepartmentCode(token.getDepartment().getCode());
        dto.setNotes(token.getNotes());

        if (token.getCounter() != null) {
            dto.setCounterNumber(token.getCounter().getCounterNumber());
            dto.setCounterName(token.getCounter().getCounterName());
        }

        // Find currently serving token in this department
        List<Token> servingTokens = tokenRepository.findCurrentlyServingTokens(token.getDepartment().getId(), token.getBookingDate());
        if (!servingTokens.isEmpty()) {
            dto.setCurrentServingToken(servingTokens.get(0).getTokenNumber());
        } else {
            dto.setCurrentServingToken("None");
        }

        if (token.getStatus() == TokenStatus.WAITING) {
            long ahead = tokenRepository.countPeopleAhead(
                    token.getDepartment().getId(),
                    token.getBookingDate(),
                    token.getPriority(),
                    token.getCreatedAt()
            );
            dto.setPeopleAhead(ahead);
            dto.setEstimatedWaitMinutes(calculateEstimatedWaitTime(token.getDepartment(), ahead, token.getBookingDate()));
        } else if (token.getStatus() == TokenStatus.CALLED || token.getStatus() == TokenStatus.SERVING) {
            dto.setPeopleAhead(0);
            dto.setEstimatedWaitMinutes(0);
        } else {
            dto.setPeopleAhead(0);
            dto.setEstimatedWaitMinutes(0);
        }

        // Next 3 waiting tokens
        List<Token> nextWaiting = tokenRepository.findNextWaitingTokens(token.getDepartment().getId(), token.getBookingDate());
        List<String> nextList = nextWaiting.stream()
                .limit(4)
                .map(Token::getTokenNumber)
                .collect(Collectors.toList());
        dto.setNextTokens(nextList);

        return dto;
    }

    /**
     * Calculate smart waiting time: (peopleAhead / activeCounters) * effectiveAvgServiceDuration.
     */
    public int calculateEstimatedWaitTime(Department department, long peopleAhead, LocalDate date) {
        if (peopleAhead <= 0) return 2; // Approximate buffer for next call

        long activeCounters = counterRepository.countByDepartmentIdAndStatus(department.getId(), CounterStatus.ACTIVE)
                + counterRepository.countByDepartmentIdAndStatus(department.getId(), CounterStatus.BUSY);
        if (activeCounters <= 0) activeCounters = 1;

        // Rolling actual average or configured default
        Double actualAvg = tokenRepository.findAvgDurationMinutesToday(department.getId(), date);
        double effectiveDuration = (actualAvg != null && actualAvg > 0)
                ? (actualAvg * 0.7 + department.getAvgServiceTimeMinutes() * 0.3)
                : department.getAvgServiceTimeMinutes();

        int wait = (int) Math.round((peopleAhead / (double) activeCounters) * effectiveDuration);
        return Math.max(2, wait);
    }

    /**
     * Staff calls next token in department queue.
     */
    @Transactional
    public TokenResponse callNextToken(Long staffUserId) {
        Counter counter = counterRepository.findByCurrentStaffId(staffUserId)
                .orElseThrow(() -> new IllegalStateException("Staff is not assigned to any service counter"));

        Department department = counter.getDepartment();

        // Check if counter is already serving an unfinished token
        List<Token> currentlyServing = tokenRepository.findActiveQueueTokens(
                department.getId(),
                LocalDate.now(),
                List.of(TokenStatus.SERVING)
        ).stream().filter(t -> t.getCounter() != null && t.getCounter().getId().equals(counter.getId())).toList();

        if (!currentlyServing.isEmpty()) {
            throw new IllegalStateException("Counter " + counter.getCounterNumber() +
                    " is currently serving " + currentlyServing.get(0).getTokenNumber() +
                    ". Please complete or skip it first.");
        }

        // Find next eligible waiting token ordered by priority (EMERGENCY -> PWD -> SENIOR -> NORMAL) and timestamp
        List<Token> waiting = tokenRepository.findNextWaitingTokens(department.getId(), LocalDate.now());
        if (waiting.isEmpty()) {
            throw new IllegalStateException("No customers currently waiting in " + department.getName() + " queue");
        }

        Token tokenToCall = waiting.get(0);
        tokenToCall.setStatus(TokenStatus.CALLED);
        tokenToCall.setCounter(counter);
        tokenToCall.setStaff(counter.getCurrentStaff());
        tokenToCall.setCalledTime(LocalDateTime.now());
        tokenToCall = tokenRepository.save(tokenToCall);

        counter.setStatus(CounterStatus.BUSY);
        counterRepository.save(counter);

        // Notify customer
        notificationService.sendNotification(
                tokenToCall.getCustomer(),
                "Your Turn: " + tokenToCall.getTokenNumber(),
                "Please proceed to " + counter.getCounterName() + " (" + counter.getCounterNumber() + ")",
                "TOKEN_CALLED"
        );

        broadcastQueueUpdate(department.getId());
        broadcastTokenEvent(tokenToCall.getId(), "CALLED");
        broadcastAdminStats();

        return mapToTokenResponse(tokenToCall);
    }

    /**
     * Staff recalls the current called/serving token.
     */
    @Transactional
    public TokenResponse recallToken(Long staffUserId) {
        Counter counter = counterRepository.findByCurrentStaffId(staffUserId)
                .orElseThrow(() -> new IllegalStateException("Staff is not assigned to any service counter"));

        List<Token> activeAtCounter = tokenRepository.findActiveQueueTokens(
                counter.getDepartment().getId(),
                LocalDate.now(),
                List.of(TokenStatus.CALLED, TokenStatus.SERVING)
        ).stream().filter(t -> t.getCounter() != null && t.getCounter().getId().equals(counter.getId())).toList();

        if (activeAtCounter.isEmpty()) {
            throw new IllegalStateException("No active token at your counter to recall");
        }

        Token token = activeAtCounter.get(0);

        notificationService.sendNotification(
                token.getCustomer(),
                "Recall Notice: " + token.getTokenNumber(),
                "Reminder: Please proceed immediately to " + counter.getCounterName() + " (" + counter.getCounterNumber() + ")",
                "TOKEN_RECALLED"
        );

        broadcastTokenEvent(token.getId(), "RECALLED");
        broadcastQueueUpdate(counter.getDepartment().getId());

        return mapToTokenResponse(token);
    }

    /**
     * Staff starts serving the called customer.
     */
    @Transactional
    public TokenResponse startServing(Long staffUserId) {
        Counter counter = counterRepository.findByCurrentStaffId(staffUserId)
                .orElseThrow(() -> new IllegalStateException("Staff is not assigned to any service counter"));

        List<Token> called = tokenRepository.findActiveQueueTokens(
                counter.getDepartment().getId(),
                LocalDate.now(),
                List.of(TokenStatus.CALLED)
        ).stream().filter(t -> t.getCounter() != null && t.getCounter().getId().equals(counter.getId())).toList();

        if (called.isEmpty()) {
            throw new IllegalStateException("No called token found at your counter to start serving");
        }

        Token token = called.get(0);
        token.setStatus(TokenStatus.SERVING);
        token.setServingStartTime(LocalDateTime.now());
        token = tokenRepository.save(token);

        counter.setStatus(CounterStatus.BUSY);
        counterRepository.save(counter);

        notificationService.sendNotification(
                token.getCustomer(),
                "Now Serving: " + token.getTokenNumber(),
                "You are currently being served at " + counter.getCounterName(),
                "TOKEN_SERVING"
        );

        broadcastQueueUpdate(counter.getDepartment().getId());
        broadcastTokenEvent(token.getId(), "SERVING");
        broadcastAdminStats();

        return mapToTokenResponse(token);
    }

    /**
     * Staff completes service for the current token.
     */
    @Transactional
    public TokenResponse completeToken(Long staffUserId, String notes) {
        Counter counter = counterRepository.findByCurrentStaffId(staffUserId)
                .orElseThrow(() -> new IllegalStateException("Staff is not assigned to any service counter"));

        List<Token> servingList = tokenRepository.findActiveQueueTokens(
                counter.getDepartment().getId(),
                LocalDate.now(),
                List.of(TokenStatus.SERVING, TokenStatus.CALLED)
        ).stream().filter(t -> t.getCounter() != null && t.getCounter().getId().equals(counter.getId())).toList();

        if (servingList.isEmpty()) {
            throw new IllegalStateException("No token currently being served at your counter");
        }

        Token token = servingList.get(0);
        token.setStatus(TokenStatus.COMPLETED);
        token.setCompletedTime(LocalDateTime.now());

        if (token.getServingStartTime() != null) {
            long minutes = Duration.between(token.getServingStartTime(), token.getCompletedTime()).toMinutes();
            token.setActualDurationMinutes(Math.max(1, (int) minutes));
        } else {
            token.setActualDurationMinutes(Math.max(1, (int) Duration.between(token.getCalledTime(), token.getCompletedTime()).toMinutes()));
        }

        if (notes != null && !notes.isBlank()) {
            token.setNotes(token.getNotes() != null ? token.getNotes() + " | " + notes : notes);
        }

        token = tokenRepository.save(token);

        counter.setStatus(CounterStatus.ACTIVE);
        counterRepository.save(counter);

        notificationService.sendNotification(
                token.getCustomer(),
                "Completed: " + token.getTokenNumber(),
                "Your service at " + counter.getDepartment().getName() + " has concluded. Thank you!",
                "TOKEN_COMPLETED"
        );

        broadcastQueueUpdate(counter.getDepartment().getId());
        broadcastTokenEvent(token.getId(), "COMPLETED");
        broadcastAdminStats();

        return mapToTokenResponse(token);
    }

    /**
     * Staff skips a token when customer does not arrive.
     */
    @Transactional
    public TokenResponse skipToken(Long staffUserId, String notes) {
        Counter counter = counterRepository.findByCurrentStaffId(staffUserId)
                .orElseThrow(() -> new IllegalStateException("Staff is not assigned to any service counter"));

        List<Token> list = tokenRepository.findActiveQueueTokens(
                counter.getDepartment().getId(),
                LocalDate.now(),
                List.of(TokenStatus.CALLED, TokenStatus.SERVING)
        ).stream().filter(t -> t.getCounter() != null && t.getCounter().getId().equals(counter.getId())).toList();

        if (list.isEmpty()) {
            throw new IllegalStateException("No active token to skip at your counter");
        }

        Token token = list.get(0);
        token.setStatus(TokenStatus.SKIPPED);
        if (notes != null) token.setNotes(notes);
        token = tokenRepository.save(token);

        counter.setStatus(CounterStatus.ACTIVE);
        counterRepository.save(counter);

        broadcastQueueUpdate(counter.getDepartment().getId());
        broadcastTokenEvent(token.getId(), "SKIPPED");
        broadcastAdminStats();

        return mapToTokenResponse(token);
    }

    /**
     * Mark a token as no-show.
     */
    @Transactional
    public TokenResponse markNoShow(Long staffUserId, String notes) {
        Counter counter = counterRepository.findByCurrentStaffId(staffUserId)
                .orElseThrow(() -> new IllegalStateException("Staff is not assigned to any service counter"));

        List<Token> list = tokenRepository.findActiveQueueTokens(
                counter.getDepartment().getId(),
                LocalDate.now(),
                List.of(TokenStatus.CALLED, TokenStatus.SERVING)
        ).stream().filter(t -> t.getCounter() != null && t.getCounter().getId().equals(counter.getId())).toList();

        if (list.isEmpty()) {
            throw new IllegalStateException("No active token to mark as no-show at your counter");
        }

        Token token = list.get(0);
        token.setStatus(TokenStatus.NO_SHOW);
        if (notes != null) token.setNotes(notes);
        token = tokenRepository.save(token);

        counter.setStatus(CounterStatus.ACTIVE);
        counterRepository.save(counter);

        notificationService.sendNotification(
                token.getCustomer(),
                "No-Show Recorded: " + token.getTokenNumber(),
                "You missed your turn at " + counter.getCounterName() + ". Please book a new token if needed.",
                "TOKEN_NO_SHOW"
        );

        broadcastQueueUpdate(counter.getDepartment().getId());
        broadcastTokenEvent(token.getId(), "NO_SHOW");
        broadcastAdminStats();

        return mapToTokenResponse(token);
    }

    /**
     * Customer or admin cancels a token.
     */
    @Transactional
    public TokenResponse cancelToken(Long tokenId, Long userId, boolean isAdmin) {
        Token token = tokenRepository.findById(tokenId)
                .orElseThrow(() -> new IllegalArgumentException("Token not found"));

        if (!isAdmin && !token.getCustomer().getId().equals(userId)) {
            throw new IllegalStateException("You are not authorized to cancel this token");
        }

        if (token.getStatus() == TokenStatus.SERVING || token.getStatus() == TokenStatus.COMPLETED) {
            throw new IllegalStateException("Cannot cancel a token that is currently serving or completed");
        }

        if (token.getStatus() == TokenStatus.CANCELLED) {
            return mapToTokenResponse(token);
        }

        token.setStatus(TokenStatus.CANCELLED);
        token = tokenRepository.save(token);

        if (token.getCounter() != null) {
            Counter counter = token.getCounter();
            counter.setStatus(CounterStatus.ACTIVE);
            counterRepository.save(counter);
        }

        notificationService.sendNotification(
                token.getCustomer(),
                "Token Cancelled: " + token.getTokenNumber(),
                "Your token " + token.getTokenNumber() + " has been cancelled.",
                "TOKEN_CANCELLED"
        );

        broadcastQueueUpdate(token.getDepartment().getId());
        broadcastTokenEvent(token.getId(), "CANCELLED");
        broadcastAdminStats();

        return mapToTokenResponse(token);
    }

    /**
     * QR code verification endpoint for staff scanner.
     */
    @Transactional(readOnly = true)
    public QrVerifyResponse verifyTokenCode(String code) {
        if (code == null || code.isBlank()) {
            return QrVerifyResponse.invalid("Verification code cannot be empty");
        }

        // Clean code if prefixed (e.g. from scanner "TOKEN_VERIFY:XXXX" or bare code)
        String cleanCode = code.replace("TOKEN_VERIFY:", "").trim().toUpperCase();

        Optional<Token> opt = tokenRepository.findByVerificationCode(cleanCode);
        if (opt.isEmpty()) {
            // Also try matching token number directly as a convenience
            List<Token> byNum = tokenRepository.findByBookingDate(LocalDate.now()).stream()
                    .filter(t -> t.getTokenNumber().equalsIgnoreCase(cleanCode))
                    .toList();
            if (!byNum.isEmpty()) {
                opt = Optional.of(byNum.get(0));
            } else {
                return QrVerifyResponse.invalid("Token reference '" + cleanCode + "' is invalid or not found in system.");
            }
        }

        Token t = opt.get();
        QrVerifyResponse resp = new QrVerifyResponse();
        resp.setValid(true);
        resp.setMessage("Token verified successfully");
        resp.setTokenNumber(t.getTokenNumber());
        resp.setVerificationCode(t.getVerificationCode());
        resp.setCustomerName(t.getCustomer().getName());
        resp.setDepartmentName(t.getDepartment().getName());
        resp.setStatus(t.getStatus());
        resp.setPriority(t.getPriority());
        resp.setBookingDate(t.getBookingDate());
        resp.setBookingTime(t.getBookingTime());
        if (t.getCounter() != null) {
            resp.setCounterNumber(t.getCounter().getCounterNumber() + " (" + t.getCounter().getCounterName() + ")");
        }
        return resp;
    }

    /**
     * Get queue status for a department (used by live display board and customer).
     */
    @Transactional(readOnly = true)
    public QueueStatusResponse getDepartmentQueueStatus(Long departmentId) {
        Department dept = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));

        LocalDate today = LocalDate.now();
        List<Token> waiting = tokenRepository.findNextWaitingTokens(dept.getId(), today);
        List<Token> serving = tokenRepository.findCurrentlyServingTokens(dept.getId(), today);

        QueueStatusResponse resp = new QueueStatusResponse();
        resp.setDepartmentId(dept.getId());
        resp.setDepartmentName(dept.getName());
        resp.setDepartmentCode(dept.getCode());
        resp.setCurrentServingToken(!serving.isEmpty() ? serving.get(0).getTokenNumber() : "None");
        resp.setWaitingCount(waiting.size());

        long activeCounters = counterRepository.countByDepartmentIdAndStatus(dept.getId(), CounterStatus.ACTIVE)
                + counterRepository.countByDepartmentIdAndStatus(dept.getId(), CounterStatus.BUSY);
        resp.setActiveCounters(activeCounters);

        resp.setEstimatedAvgWaitMinutes(calculateEstimatedWaitTime(dept, waiting.size(), today));
        resp.setNextTokens(waiting.stream().limit(5).map(this::mapToTokenResponse).collect(Collectors.toList()));

        return resp;
    }

    /**
     * Maps Token entity to TokenResponse DTO.
     */
    public TokenResponse mapToTokenResponse(Token token) {
        TokenResponse res = new TokenResponse();
        res.setId(token.getId());
        res.setTokenNumber(token.getTokenNumber());
        res.setTokenSequence(token.getTokenSequence());
        res.setDepartmentId(token.getDepartment().getId());
        res.setDepartmentName(token.getDepartment().getName());
        res.setDepartmentCode(token.getDepartment().getCode());
        res.setCustomerId(token.getCustomer().getId());
        res.setCustomerName(token.getCustomer().getName());
        res.setCustomerEmail(token.getCustomer().getEmail());
        res.setCustomerPhone(token.getCustomer().getPhone());

        if (token.getCounter() != null) {
            res.setCounterId(token.getCounter().getId());
            res.setCounterNumber(token.getCounter().getCounterNumber());
            res.setCounterName(token.getCounter().getCounterName());
        }

        if (token.getStaff() != null) {
            res.setStaffId(token.getStaff().getId());
            res.setStaffName(token.getStaff().getName());
        }

        res.setPriority(token.getPriority());
        res.setStatus(token.getStatus());
        res.setBookingDate(token.getBookingDate());
        res.setBookingTime(token.getBookingTime());
        res.setCalledTime(token.getCalledTime());
        res.setServingStartTime(token.getServingStartTime());
        res.setCompletedTime(token.getCompletedTime());
        res.setActualDurationMinutes(token.getActualDurationMinutes());
        res.setVerificationCode(token.getVerificationCode());
        res.setNotes(token.getNotes());

        // Generate QR code base64
        String qrPayload = "TOKEN_VERIFY:" + token.getVerificationCode();
        res.setQrCodeBase64(qrCodeService.generateQrCodeBase64(qrPayload, 220, 220));

        // Calculation of people ahead and wait time if waiting
        if (token.getStatus() == TokenStatus.WAITING) {
            long ahead = tokenRepository.countPeopleAhead(
                    token.getDepartment().getId(),
                    token.getBookingDate(),
                    token.getPriority(),
                    token.getCreatedAt()
            );
            res.setPeopleAhead(ahead);
            res.setEstimatedWaitMinutes(calculateEstimatedWaitTime(token.getDepartment(), ahead, token.getBookingDate()));
        } else {
            res.setPeopleAhead(0);
            res.setEstimatedWaitMinutes(0);
        }

        List<Token> servingTokens = tokenRepository.findCurrentlyServingTokens(token.getDepartment().getId(), token.getBookingDate());
        if (!servingTokens.isEmpty()) {
            res.setCurrentServingToken(servingTokens.get(0).getTokenNumber());
        } else {
            res.setCurrentServingToken("None");
        }

        return res;
    }

    private void broadcastQueueUpdate(Long departmentId) {
        if (messagingTemplate != null) {
            try {
                QueueStatusResponse status = getDepartmentQueueStatus(departmentId);
                messagingTemplate.convertAndSend("/topic/queue/" + departmentId, status);
            } catch (Exception ignored) {
            }
        }
    }

    private void broadcastTokenEvent(Long tokenId, String event) {
        if (messagingTemplate != null) {
            try {
                Map<String, Object> payload = Map.of("tokenId", tokenId, "event", event, "timestamp", LocalDateTime.now().toString());
                messagingTemplate.convertAndSend("/topic/token/" + tokenId, payload);
            } catch (Exception ignored) {
            }
        }
    }

    private void broadcastAdminStats() {
        if (messagingTemplate != null) {
            try {
                messagingTemplate.convertAndSend("/topic/admin/stats-refresh", Map.of("refresh", true));
            } catch (Exception ignored) {
            }
        }
    }
}
