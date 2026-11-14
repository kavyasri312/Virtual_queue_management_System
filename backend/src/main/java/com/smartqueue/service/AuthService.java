package com.smartqueue.service;

import com.smartqueue.config.JwtUtils;
import com.smartqueue.dto.AuthResponse;
import com.smartqueue.dto.LoginRequest;
import com.smartqueue.dto.RegisterRequest;
import com.smartqueue.model.Counter;
import com.smartqueue.model.Role;
import com.smartqueue.model.User;
import com.smartqueue.repository.CounterRepository;
import com.smartqueue.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CounterRepository counterRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new IllegalArgumentException("Email is already registered. Please log in.");
        }

        User user = new User(
                request.getName().trim(),
                request.getEmail().trim().toLowerCase(),
                request.getPhone() != null ? request.getPhone().trim() : "",
                passwordEncoder.encode(request.getPassword()),
                Role.ROLE_CUSTOMER
        );

        user = userRepository.save(user);

        String jwt = jwtUtils.generateToken(user.getEmail(), user.getRole().name(), user.getId(), user.getName());
        return new AuthResponse(jwt, user.getId(), user.getName(), user.getEmail(), user.getPhone(), user.getRole());
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!user.isEnabled()) {
            throw new IllegalStateException("Your account has been deactivated. Please contact administrator.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        String jwt = jwtUtils.generateToken(user.getEmail(), user.getRole().name(), user.getId(), user.getName());
        AuthResponse resp = new AuthResponse(jwt, user.getId(), user.getName(), user.getEmail(), user.getPhone(), user.getRole());

        // If staff, populate assigned counter and department
        if (user.getRole() == Role.ROLE_STAFF) {
            Optional<Counter> counterOpt = counterRepository.findByCurrentStaffId(user.getId());
            if (counterOpt.isPresent()) {
                Counter c = counterOpt.get();
                resp.setAssignedCounterId(c.getId());
                resp.setAssignedCounterName(c.getCounterName() + " (" + c.getCounterNumber() + ")");
                resp.setAssignedDepartmentId(c.getDepartment().getId());
                resp.setAssignedDepartmentName(c.getDepartment().getName());
            }
        }

        return resp;
    }

    public User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new IllegalStateException("User is not authenticated");
        }
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found: " + email));
    }
}
