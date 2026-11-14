package com.smartqueue.controller;

import com.smartqueue.dto.QrVerifyResponse;
import com.smartqueue.dto.StaffActionRequest;
import com.smartqueue.dto.StaffStatsDto;
import com.smartqueue.dto.TokenResponse;
import com.smartqueue.model.User;
import com.smartqueue.service.AuthService;
import com.smartqueue.service.QueueService;
import com.smartqueue.service.StaffService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/staff")
public class StaffController {

    @Autowired
    private AuthService authService;

    @Autowired
    private StaffService staffService;

    @Autowired
    private QueueService queueService;

    @GetMapping("/stats")
    public ResponseEntity<?> getStaffStats() {
        try {
            User staff = authService.getAuthenticatedUser();
            StaffStatsDto stats = staffService.getStaffStats(staff.getId());
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/call-next")
    public ResponseEntity<?> callNextToken() {
        try {
            User staff = authService.getAuthenticatedUser();
            TokenResponse resp = queueService.callNextToken(staff.getId());
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/recall")
    public ResponseEntity<?> recallToken() {
        try {
            User staff = authService.getAuthenticatedUser();
            TokenResponse resp = queueService.recallToken(staff.getId());
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/start-serving")
    public ResponseEntity<?> startServing() {
        try {
            User staff = authService.getAuthenticatedUser();
            TokenResponse resp = queueService.startServing(staff.getId());
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/complete")
    public ResponseEntity<?> completeToken(@RequestBody(required = false) StaffActionRequest req) {
        try {
            User staff = authService.getAuthenticatedUser();
            String notes = req != null ? req.getNotes() : null;
            TokenResponse resp = queueService.completeToken(staff.getId(), notes);
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/skip")
    public ResponseEntity<?> skipToken(@RequestBody(required = false) StaffActionRequest req) {
        try {
            User staff = authService.getAuthenticatedUser();
            String notes = req != null ? req.getNotes() : null;
            TokenResponse resp = queueService.skipToken(staff.getId(), notes);
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/no-show")
    public ResponseEntity<?> markNoShow(@RequestBody(required = false) StaffActionRequest req) {
        try {
            User staff = authService.getAuthenticatedUser();
            String notes = req != null ? req.getNotes() : null;
            TokenResponse resp = queueService.markNoShow(staff.getId(), notes);
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/verify-token")
    public ResponseEntity<?> verifyToken(@RequestBody Map<String, String> payload) {
        String code = payload.get("code");
        QrVerifyResponse resp = queueService.verifyTokenCode(code);
        return ResponseEntity.ok(resp);
    }
}
