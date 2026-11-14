package com.smartqueue.dto;

public class DepartmentQueueStatsDto {
    private Long departmentId;
    private String departmentName;
    private String departmentCode;
    private long totalTokens;
    private long waitingCount;
    private long servingCount;
    private long completedCount;
    private long activeCounters;
    private Double avgServiceDuration;

    public DepartmentQueueStatsDto() {
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

    public long getTotalTokens() {
        return totalTokens;
    }

    public void setTotalTokens(long totalTokens) {
        this.totalTokens = totalTokens;
    }

    public long getWaitingCount() {
        return waitingCount;
    }

    public void setWaitingCount(long waitingCount) {
        this.waitingCount = waitingCount;
    }

    public long getServingCount() {
        return servingCount;
    }

    public void setServingCount(long servingCount) {
        this.servingCount = servingCount;
    }

    public long getCompletedCount() {
        return completedCount;
    }

    public void setCompletedCount(long completedCount) {
        this.completedCount = completedCount;
    }

    public long getActiveCounters() {
        return activeCounters;
    }

    public void setActiveCounters(long activeCounters) {
        this.activeCounters = activeCounters;
    }

    public Double getAvgServiceDuration() {
        return avgServiceDuration;
    }

    public void setAvgServiceDuration(Double avgServiceDuration) {
        this.avgServiceDuration = avgServiceDuration;
    }
}
