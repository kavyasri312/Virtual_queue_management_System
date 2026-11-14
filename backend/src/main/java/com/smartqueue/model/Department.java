package com.smartqueue.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "departments")
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 10)
    private String code;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private DepartmentCategory category;

    @Column(name = "avg_service_time_minutes", nullable = false)
    private Integer avgServiceTimeMinutes = 10;

    @Column(name = "daily_token_limit", nullable = false)
    private Integer dailyTokenLimit = 200;

    @Column(name = "opening_time", nullable = false)
    private LocalTime openingTime = LocalTime.of(8, 30);

    @Column(name = "closing_time", nullable = false)
    private LocalTime closingTime = LocalTime.of(17, 0);

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Department() {
    }

    public Department(String name, String code, String description, DepartmentCategory category, Integer avgServiceTimeMinutes, Integer dailyTokenLimit) {
        this.name = name;
        this.code = code;
        this.description = description;
        this.category = category;
        this.avgServiceTimeMinutes = avgServiceTimeMinutes != null ? avgServiceTimeMinutes : 10;
        this.dailyTokenLimit = dailyTokenLimit != null ? dailyTokenLimit : 200;
        this.active = true;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
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

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code != null ? code.toUpperCase() : null;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public DepartmentCategory getCategory() {
        return category;
    }

    public void setCategory(DepartmentCategory category) {
        this.category = category;
    }

    public Integer getAvgServiceTimeMinutes() {
        return avgServiceTimeMinutes;
    }

    public void setAvgServiceTimeMinutes(Integer avgServiceTimeMinutes) {
        this.avgServiceTimeMinutes = avgServiceTimeMinutes;
    }

    public Integer getDailyTokenLimit() {
        return dailyTokenLimit;
    }

    public void setDailyTokenLimit(Integer dailyTokenLimit) {
        this.dailyTokenLimit = dailyTokenLimit;
    }

    public LocalTime getOpeningTime() {
        return openingTime;
    }

    public void setOpeningTime(LocalTime openingTime) {
        this.openingTime = openingTime;
    }

    public LocalTime getClosingTime() {
        return closingTime;
    }

    public void setClosingTime(LocalTime closingTime) {
        this.closingTime = closingTime;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
