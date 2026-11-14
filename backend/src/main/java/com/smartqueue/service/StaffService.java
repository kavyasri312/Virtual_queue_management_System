package com.smartqueue.service;

import com.smartqueue.dto.RegisterRequest;
import com.smartqueue.dto.StaffStatsDto;
import com.smartqueue.dto.TokenResponse;
import com.smartqueue.model.*;
import com.smartqueue.repository.CounterRepository;
import com.smartqueue.repository.TokenRepository;
import com.smartqueue.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class StaffService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CounterRepository counterRepository;

    @Autowired
    private TokenRepository tokenRepository;

    @Autowired
    private QueueService queueService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public StaffStatsDto getStaffStats(Long staffUserId) {
        User staff = userRepository.findById(staffUserId)
                .orElseThrow(() -> new IllegalArgumentException("Staff user not found"));

        StaffStatsDto stats = new StaffStatsDto();
        stats.setStaffId(staff.getId());
        stats.setStaffName(staff.getName());

        Optional<Counter> counterOpt = counterRepository.findByCurrentStaffId(staffUserId);
        if (counterOpt.isPresent()) {
            Counter counter = counterOpt.get();
            Department dept = counter.getDepartment();

            stats.setCounterId(counter.getId());
            stats.setCounterNumber(counter.getCounterNumber());
            stats.setCounterName(counter.getCounterName());
            stats.setDepartmentId(dept.getId());
            stats.setDepartmentName(dept.getName());
            stats.setDepartmentCode(dept.getCode());

            LocalDate today = LocalDate.now();

            // Currently serving or called token
            List<Token> current = tokenRepository.findActiveQueueTokens(
                    dept.getId(),
                    today,
                    List.of(TokenStatus.CALLED, TokenStatus.SERVING)
            ).stream().filter(t -> t.getCounter() != null && t.getCounter().getId().equals(counter.getId())).toList();

            if (!current.isEmpty()) {
                stats.setCurrentServingToken(queueService.mapToTokenResponse(current.get(0)));
            }

            // Stats
            long servedToday = tokenRepository.countByStaffIdAndBookingDateAndStatus(staffUserId, today, TokenStatus.COMPLETED);
            stats.setTotalServedToday(servedToday);

            Double avgMinutes = tokenRepository.findStaffAvgServingMinutesToday(staffUserId, today);
            stats.setAvgServiceDurationMinutes(avgMinutes != null ? Math.round(avgMinutes * 10.0) / 10.0 : 0.0);

            List<Token> waiting = tokenRepository.findNextWaitingTokens(dept.getId(), today);
            stats.setWaitingInDepartment(waiting.size());
            stats.setUpcomingTokens(waiting.stream().limit(8).map(queueService::mapToTokenResponse).collect(Collectors.toList()));
        }

        return stats;
    }

    @Transactional(readOnly = true)
    public List<User> getAllStaff() {
        return userRepository.findByRole(Role.ROLE_STAFF);
    }

    @Transactional
    public User createStaff(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail().trim().toLowerCase())) {
            throw new IllegalArgumentException("Email already in use");
        }

        User staff = new User(
                req.getName().trim(),
                req.getEmail().trim().toLowerCase(),
                req.getPhone(),
                passwordEncoder.encode(req.getPassword()),
                Role.ROLE_STAFF
        );

        return userRepository.save(staff);
    }

    @Transactional
    public User toggleStaffStatus(Long staffId, boolean enabled) {
        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new IllegalArgumentException("Staff user not found"));
        staff.setEnabled(enabled);
        return userRepository.save(staff);
    }
}
