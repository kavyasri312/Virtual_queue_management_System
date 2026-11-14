package com.smartqueue.service;

import com.smartqueue.dto.AdminDashboardStatsDto;
import com.smartqueue.dto.DepartmentQueueStatsDto;
import com.smartqueue.dto.PeakHourStatsDto;
import com.smartqueue.dto.TokenResponse;
import com.smartqueue.model.*;
import com.smartqueue.repository.CounterRepository;
import com.smartqueue.repository.DepartmentRepository;
import com.smartqueue.repository.TokenRepository;
import com.smartqueue.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private TokenRepository tokenRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private CounterRepository counterRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private QueueService queueService;

    @Transactional(readOnly = true)
    public AdminDashboardStatsDto getDashboardStats() {
        LocalDate today = LocalDate.now();
        AdminDashboardStatsDto stats = new AdminDashboardStatsDto();

        stats.setTotalCustomers(userRepository.countByRole(Role.ROLE_CUSTOMER));
        stats.setTotalTokensToday(tokenRepository.countByBookingDate(today));
        stats.setWaitingTokens(tokenRepository.countByBookingDateAndStatus(today, TokenStatus.WAITING));
        stats.setCurrentlyServing(tokenRepository.countByBookingDateAndStatus(today, TokenStatus.SERVING));
        stats.setCompletedTokens(tokenRepository.countByBookingDateAndStatus(today, TokenStatus.COMPLETED));
        stats.setCancelledTokens(tokenRepository.countByBookingDateAndStatus(today, TokenStatus.CANCELLED));
        long skipped = tokenRepository.countByBookingDateAndStatus(today, TokenStatus.SKIPPED);
        long noShow = tokenRepository.countByBookingDateAndStatus(today, TokenStatus.NO_SHOW);
        stats.setSkippedOrNoShowTokens(skipped + noShow);

        long activeCounters = counterRepository.countByStatus(CounterStatus.ACTIVE) + counterRepository.countByStatus(CounterStatus.BUSY);
        stats.setActiveCounters(activeCounters);
        stats.setTotalCounters(counterRepository.count());

        // Status distribution
        Map<String, Long> statusMap = new LinkedHashMap<>();
        statusMap.put("WAITING", stats.getWaitingTokens());
        statusMap.put("SERVING", stats.getCurrentlyServing());
        statusMap.put("COMPLETED", stats.getCompletedTokens());
        statusMap.put("CANCELLED", stats.getCancelledTokens());
        statusMap.put("SKIPPED", skipped);
        statusMap.put("NO_SHOW", noShow);
        stats.setStatusDistribution(statusMap);

        // Department breakdown
        List<Department> departments = departmentRepository.findAll();
        List<DepartmentQueueStatsDto> deptStats = new ArrayList<>();
        double totalAvgDuration = 0;
        int completedCountWithDuration = 0;

        for (Department dept : departments) {
            DepartmentQueueStatsDto dDto = new DepartmentQueueStatsDto();
            dDto.setDepartmentId(dept.getId());
            dDto.setDepartmentName(dept.getName());
            dDto.setDepartmentCode(dept.getCode());

            List<Token> tokens = tokenRepository.findByDepartmentIdAndBookingDate(dept.getId(), today);
            dDto.setTotalTokens(tokens.size());
            dDto.setWaitingCount(tokens.stream().filter(t -> t.getStatus() == TokenStatus.WAITING).count());
            dDto.setServingCount(tokens.stream().filter(t -> t.getStatus() == TokenStatus.SERVING).count());
            dDto.setCompletedCount(tokens.stream().filter(t -> t.getStatus() == TokenStatus.COMPLETED).count());

            long deptActiveCounters = counterRepository.countByDepartmentIdAndStatus(dept.getId(), CounterStatus.ACTIVE)
                    + counterRepository.countByDepartmentIdAndStatus(dept.getId(), CounterStatus.BUSY);
            dDto.setActiveCounters(deptActiveCounters);

            Double avgDuration = tokenRepository.findAvgDurationMinutesToday(dept.getId(), today);
            if (avgDuration != null && avgDuration > 0) {
                dDto.setAvgServiceDuration(Math.round(avgDuration * 10.0) / 10.0);
                totalAvgDuration += avgDuration;
                completedCountWithDuration++;
            } else {
                dDto.setAvgServiceDuration((double) dept.getAvgServiceTimeMinutes());
            }

            deptStats.add(dDto);
        }
        stats.setDepartmentStats(deptStats);

        double overallAvgService = completedCountWithDuration > 0
                ? totalAvgDuration / completedCountWithDuration
                : 10.0;
        stats.setAvgServiceTimeMinutes(Math.round(overallAvgService * 10.0) / 10.0);

        // Overall estimated avg wait time: (waiting / activeCounters) * avgService
        double wait = (stats.getActiveCounters() > 0)
                ? (stats.getWaitingTokens() / (double) stats.getActiveCounters()) * overallAvgService
                : 0.0;
        stats.setAvgWaitTimeMinutes(Math.round(wait * 10.0) / 10.0);

        // Peak hours (8 AM to 5 PM)
        List<Token> todayTokens = tokenRepository.findByBookingDate(today);
        Map<Integer, Long> hourlyCounts = todayTokens.stream()
                .filter(t -> t.getBookingTime() != null)
                .collect(Collectors.groupingBy(t -> t.getBookingTime().getHour(), Collectors.counting()));

        List<PeakHourStatsDto> peakList = new ArrayList<>();
        for (int h = 8; h <= 18; h++) {
            String hourLabel = String.format("%02d:00", h);
            peakList.add(new PeakHourStatsDto(hourLabel, hourlyCounts.getOrDefault(h, 0L)));
        }
        stats.setPeakHours(peakList);

        return stats;
    }

    @Transactional(readOnly = true)
    public List<TokenResponse> searchTokens(Long departmentId, TokenStatus status, LocalDate date, String search) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        List<Token> list = (departmentId != null)
                ? tokenRepository.findByDepartmentIdAndBookingDate(departmentId, targetDate)
                : tokenRepository.findByBookingDate(targetDate);

        if (status != null) {
            list = list.stream().filter(t -> t.getStatus() == status).toList();
        }

        if (search != null && !search.isBlank()) {
            String query = search.trim().toLowerCase();
            list = list.stream().filter(t ->
                    t.getTokenNumber().toLowerCase().contains(query) ||
                    t.getCustomer().getName().toLowerCase().contains(query) ||
                    t.getCustomer().getEmail().toLowerCase().contains(query) ||
                    (t.getVerificationCode() != null && t.getVerificationCode().toLowerCase().contains(query))
            ).toList();
        }

        return list.stream()
                .sorted(Comparator.comparing(Token::getCreatedAt).reversed())
                .map(queueService::mapToTokenResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<User> getAllCustomers() {
        return userRepository.findByRole(Role.ROLE_CUSTOMER);
    }
}
