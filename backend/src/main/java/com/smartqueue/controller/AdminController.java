package com.smartqueue.controller;

import com.smartqueue.dto.*;
import com.smartqueue.model.CounterStatus;
import com.smartqueue.model.TokenStatus;
import com.smartqueue.model.User;
import com.smartqueue.service.*;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private DepartmentService departmentService;

    @Autowired
    private CounterService counterService;

    @Autowired
    private StaffService staffService;

    @Autowired
    private QueueService queueService;

    @Autowired
    private AuthService authService;

    @GetMapping("/stats")
    public ResponseEntity<AdminDashboardStatsDto> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    // Departments
    @GetMapping("/departments")
    public ResponseEntity<List<DepartmentDto>> getAllDepartments() {
        return ResponseEntity.ok(departmentService.getAllDepartments());
    }

    @PostMapping("/departments")
    public ResponseEntity<?> createDepartment(@Valid @RequestBody DepartmentDto dto) {
        try {
            return ResponseEntity.ok(departmentService.createDepartment(dto));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/departments/{id}")
    public ResponseEntity<?> updateDepartment(@PathVariable Long id, @Valid @RequestBody DepartmentDto dto) {
        try {
            return ResponseEntity.ok(departmentService.updateDepartment(id, dto));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/departments/{id}")
    public ResponseEntity<?> deleteDepartment(@PathVariable Long id) {
        try {
            departmentService.deleteDepartment(id);
            return ResponseEntity.ok(Map.of("message", "Department deactivated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // Counters
    @GetMapping("/counters")
    public ResponseEntity<List<CounterDto>> getAllCounters() {
        return ResponseEntity.ok(counterService.getAllCounters());
    }

    @PostMapping("/counters")
    public ResponseEntity<?> createCounter(@Valid @RequestBody CounterDto dto) {
        try {
            return ResponseEntity.ok(counterService.createCounter(dto));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/counters/{id}")
    public ResponseEntity<?> updateCounter(@PathVariable Long id, @Valid @RequestBody CounterDto dto) {
        try {
            return ResponseEntity.ok(counterService.updateCounter(id, dto));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/counters/assign")
    public ResponseEntity<?> assignStaffToCounter(@Valid @RequestBody CounterAssignRequest request) {
        try {
            return ResponseEntity.ok(counterService.assignStaff(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PatchMapping("/counters/{id}/status")
    public ResponseEntity<?> toggleCounterStatus(@PathVariable Long id, @RequestParam CounterStatus status) {
        try {
            return ResponseEntity.ok(counterService.toggleStatus(id, status));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/counters/{id}")
    public ResponseEntity<?> deleteCounter(@PathVariable Long id) {
        try {
            counterService.deleteCounter(id);
            return ResponseEntity.ok(Map.of("message", "Counter deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // Staff
    @GetMapping("/staff")
    public ResponseEntity<List<User>> getAllStaff() {
        return ResponseEntity.ok(staffService.getAllStaff());
    }

    @PostMapping("/staff")
    public ResponseEntity<?> createStaff(@Valid @RequestBody RegisterRequest req) {
        try {
            return ResponseEntity.ok(staffService.createStaff(req));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PatchMapping("/staff/{id}/toggle-status")
    public ResponseEntity<?> toggleStaffStatus(@PathVariable Long id, @RequestParam boolean enabled) {
        try {
            return ResponseEntity.ok(staffService.toggleStaffStatus(id, enabled));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // Tokens
    @GetMapping("/tokens")
    public ResponseEntity<List<TokenResponse>> searchTokens(
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) TokenStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(adminService.searchTokens(departmentId, status, date, search));
    }

    @PostMapping("/tokens/{id}/cancel")
    public ResponseEntity<?> cancelToken(@PathVariable Long id) {
        try {
            User user = authService.getAuthenticatedUser();
            TokenResponse resp = queueService.cancelToken(id, user.getId(), true);
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // Customers
    @GetMapping("/customers")
    public ResponseEntity<List<User>> getAllCustomers() {
        return ResponseEntity.ok(adminService.getAllCustomers());
    }
}
