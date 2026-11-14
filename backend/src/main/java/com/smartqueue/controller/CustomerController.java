package com.smartqueue.controller;

import com.smartqueue.dto.*;
import com.smartqueue.model.Token;
import com.smartqueue.model.TokenStatus;
import com.smartqueue.model.User;
import com.smartqueue.repository.TokenRepository;
import com.smartqueue.service.AuthService;
import com.smartqueue.service.DepartmentService;
import com.smartqueue.service.NotificationService;
import com.smartqueue.service.QueueService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/customer")
public class CustomerController {

    @Autowired
    private AuthService authService;

    @Autowired
    private DepartmentService departmentService;

    @Autowired
    private QueueService queueService;

    @Autowired
    private TokenRepository tokenRepository;

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/departments")
    public ResponseEntity<List<DepartmentDto>> getActiveDepartments() {
        return ResponseEntity.ok(departmentService.getActiveDepartmentsWithMetrics());
    }

    @PostMapping("/tokens/book")
    public ResponseEntity<?> bookToken(@Valid @RequestBody BookTokenRequest request) {
        try {
            User user = authService.getAuthenticatedUser();
            TokenResponse response = queueService.bookToken(user, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/tokens/my-tokens")
    public ResponseEntity<?> getMyTokens(@RequestParam(required = false) TokenStatus status) {
        User user = authService.getAuthenticatedUser();
        List<Token> tokens = tokenRepository.findByCustomerIdOrderByCreatedAtDesc(user.getId());

        if (status != null) {
            tokens = tokens.stream().filter(t -> t.getStatus() == status).toList();
        }

        List<TokenResponse> list = tokens.stream()
                .map(queueService::mapToTokenResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(list);
    }

    @GetMapping("/tokens/{id}")
    public ResponseEntity<?> getTokenDetails(@PathVariable Long id) {
        User user = authService.getAuthenticatedUser();
        Token token = tokenRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Token not found"));

        if (!token.getCustomer().getId().equals(user.getId()) && !user.getRole().name().equals("ROLE_ADMIN")) {
            return ResponseEntity.status(403).body(Map.of("message", "Access denied"));
        }

        return ResponseEntity.ok(queueService.mapToTokenResponse(token));
    }

    @GetMapping("/tokens/{id}/queue-position")
    public ResponseEntity<?> getQueuePosition(@PathVariable Long id) {
        try {
            QueuePositionDto dto = queueService.getQueuePosition(id);
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/tokens/{id}/cancel")
    public ResponseEntity<?> cancelToken(@PathVariable Long id) {
        try {
            User user = authService.getAuthenticatedUser();
            TokenResponse resp = queueService.cancelToken(id, user.getId(), false);
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/notifications")
    public ResponseEntity<?> getNotifications() {
        User user = authService.getAuthenticatedUser();
        return ResponseEntity.ok(notificationService.getUserNotifications(user.getId()));
    }

    @PostMapping("/notifications/read-all")
    public ResponseEntity<?> markAllNotificationsRead() {
        User user = authService.getAuthenticatedUser();
        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }
}
