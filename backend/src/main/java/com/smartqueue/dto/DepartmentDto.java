package com.smartqueue.dto;

import com.smartqueue.model.DepartmentCategory;
import java.time.LocalTime;

public class DepartmentDto {
    private Long id;
    private String name;
    private String code;
    private String description;
    private DepartmentCategory category;
    private Integer avgServiceTimeMinutes;
    private Integer dailyTokenLimit;
    private LocalTime openingTime;
    private LocalTime closingTime;
    private boolean active;

    // Real-time queue metrics for dashboard display
    private long waitingCount;
    private long activeCounters;
    private Integer estimatedWaitMinutes;
    private String currentServingToken;

    public DepartmentDto() {
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

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
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

    public long getWaitingCount() {
        return waitingCount;
    }

    public void setWaitingCount(long waitingCount) {
        this.waitingCount = waitingCount;
    }

    public long getActiveCounters() {
        return activeCounters;
    }

    public void setActiveCounters(long activeCounters) {
        this.activeCounters = activeCounters;
    }

    public Integer getEstimatedWaitMinutes() {
        return estimatedWaitMinutes;
    }

    public void setEstimatedWaitMinutes(Integer estimatedWaitMinutes) {
        this.estimatedWaitMinutes = estimatedWaitMinutes;
    }

    public String getCurrentServingToken() {
        return currentServingToken;
    }

    public void setCurrentServingToken(String currentServingToken) {
        this.currentServingToken = currentServingToken;
    }
}
