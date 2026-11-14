package com.smartqueue.dto;

import com.smartqueue.model.Role;

public class AuthResponse {
    private String token;
    private String tokenType = "Bearer";
    private Long id;
    private String name;
    private String email;
    private String phone;
    private Role role;
    private Long assignedCounterId;
    private String assignedCounterName;
    private Long assignedDepartmentId;
    private String assignedDepartmentName;

    public AuthResponse() {
    }

    public AuthResponse(String token, Long id, String name, String email, String phone, Role role) {
        this.token = token;
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public Long getAssignedCounterId() {
        return assignedCounterId;
    }

    public void setAssignedCounterId(Long assignedCounterId) {
        this.assignedCounterId = assignedCounterId;
    }

    public String getAssignedCounterName() {
        return assignedCounterName;
    }

    public void setAssignedCounterName(String assignedCounterName) {
        this.assignedCounterName = assignedCounterName;
    }

    public Long getAssignedDepartmentId() {
        return assignedDepartmentId;
    }

    public void setAssignedDepartmentId(Long assignedDepartmentId) {
        this.assignedDepartmentId = assignedDepartmentId;
    }

    public String getAssignedDepartmentName() {
        return assignedDepartmentName;
    }

    public void setAssignedDepartmentName(String assignedDepartmentName) {
        this.assignedDepartmentName = assignedDepartmentName;
    }
}
