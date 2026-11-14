package com.smartqueue.controller;

import com.smartqueue.dto.AuthResponse;
import com.smartqueue.dto.LoginRequest;
import com.smartqueue.dto.RegisterRequest;
import com.smartqueue.dto.UserProfileDto;
import com.smartqueue.model.User;
import com.smartqueue.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        try {
            User user = authService.getAuthenticatedUser();
            UserProfileDto dto = new UserProfileDto(user.getId(), user.getName(), user.getEmail(), user.getPhone(), user.getRole());
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }
    }
}
