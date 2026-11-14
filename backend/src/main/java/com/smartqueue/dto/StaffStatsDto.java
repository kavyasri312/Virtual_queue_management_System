package com.smartqueue.dto;

import java.util.List;

public class StaffStatsDto {
    private Long staffId;
    private String staffName;
    private Long counterId;
    private String counterNumber;
    private String counterName;
    private Long departmentId;
    private String departmentName;
    private String departmentCode;
    private TokenResponse currentServingToken;
    private long totalServedToday;
    private Double avgServiceDurationMinutes;
    private long waitingInDepartment;
    private List<TokenResponse> upcomingTokens;

    public StaffStatsDto() {
    }

    public Long getStaffId() {
        return staffId;
    }

    public void setStaffId(Long staffId) {
        this.staffId = staffId;
    }

    public String getStaffName() {
        return staffName;
    }

    public void setStaffName(String staffName) {
        this.staffName = staffName;
    }

    public Long getCounterId() {
        return counterId;
    }

    public void setCounterId(Long counterId) {
        this.counterId = counterId;
    }

    public String getCounterNumber() {
        return counterNumber;
    }

    public void setCounterNumber(String counterNumber) {
        this.counterNumber = counterNumber;
    }

    public String getCounterName() {
        return counterName;
    }

    public void setCounterName(String counterName) {
        this.counterName = counterName;
    }

    public Long getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Long departmentId) {
        this.departmentId = departmentId;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public String getDepartmentCode() {
        return departmentCode;
    }

    public void setDepartmentCode(String departmentCode) {
        this.departmentCode = departmentCode;
    }

    public TokenResponse getCurrentServingToken() {
        return currentServingToken;
    }

    public void setCurrentServingToken(TokenResponse currentServingToken) {
        this.currentServingToken = currentServingToken;
    }

    public long getTotalServedToday() {
        return totalServedToday;
    }

    public void setTotalServedToday(long totalServedToday) {
        this.totalServedToday = totalServedToday;
    }

    public Double getAvgServiceDurationMinutes() {
        return avgServiceDurationMinutes;
    }

    public void setAvgServiceDurationMinutes(Double avgServiceDurationMinutes) {
        this.avgServiceDurationMinutes = avgServiceDurationMinutes;
    }

    public long getWaitingInDepartment() {
        return waitingInDepartment;
    }

    public void setWaitingInDepartment(long waitingInDepartment) {
        this.waitingInDepartment = waitingInDepartment;
    }

    public List<TokenResponse> getUpcomingTokens() {
        return upcomingTokens;
    }

    public void setUpcomingTokens(List<TokenResponse> upcomingTokens) {
        this.upcomingTokens = upcomingTokens;
    }
}
