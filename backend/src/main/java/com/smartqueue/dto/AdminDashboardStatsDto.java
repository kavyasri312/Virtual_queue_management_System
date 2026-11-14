package com.smartqueue.dto;

import java.util.List;
import java.util.Map;

public class AdminDashboardStatsDto {
    private long totalCustomers;
    private long totalTokensToday;
    private long waitingTokens;
    private long currentlyServing;
    private long completedTokens;
    private long cancelledTokens;
    private long skippedOrNoShowTokens;
    private long activeCounters;
    private long totalCounters;
    private Double avgWaitTimeMinutes;
    private Double avgServiceTimeMinutes;

    private List<DepartmentQueueStatsDto> departmentStats;
    private List<PeakHourStatsDto> peakHours;
    private Map<String, Long> statusDistribution;

    public AdminDashboardStatsDto() {
    }

    public long getTotalCustomers() {
        return totalCustomers;
    }

    public void setTotalCustomers(long totalCustomers) {
        this.totalCustomers = totalCustomers;
    }

    public long getTotalTokensToday() {
        return totalTokensToday;
    }

    public void setTotalTokensToday(long totalTokensToday) {
        this.totalTokensToday = totalTokensToday;
    }

    public long getWaitingTokens() {
        return waitingTokens;
    }

    public void setWaitingTokens(long waitingTokens) {
        this.waitingTokens = waitingTokens;
    }

    public long getCurrentlyServing() {
        return currentlyServing;
    }

    public void setCurrentlyServing(long currentlyServing) {
        this.currentlyServing = currentlyServing;
    }

    public long getCompletedTokens() {
        return completedTokens;
    }

    public void setCompletedTokens(long completedTokens) {
        this.completedTokens = completedTokens;
    }

    public long getCancelledTokens() {
        return cancelledTokens;
    }

    public void setCancelledTokens(long cancelledTokens) {
        this.cancelledTokens = cancelledTokens;
    }

    public long getSkippedOrNoShowTokens() {
        return skippedOrNoShowTokens;
    }

    public void setSkippedOrNoShowTokens(long skippedOrNoShowTokens) {
        this.skippedOrNoShowTokens = skippedOrNoShowTokens;
    }

    public long getActiveCounters() {
        return activeCounters;
    }

    public void setActiveCounters(long activeCounters) {
        this.activeCounters = activeCounters;
    }

    public long getTotalCounters() {
        return totalCounters;
    }

    public void setTotalCounters(long totalCounters) {
        this.totalCounters = totalCounters;
    }

    public Double getAvgWaitTimeMinutes() {
        return avgWaitTimeMinutes;
    }

    public void setAvgWaitTimeMinutes(Double avgWaitTimeMinutes) {
        this.avgWaitTimeMinutes = avgWaitTimeMinutes;
    }

    public Double getAvgServiceTimeMinutes() {
        return avgServiceTimeMinutes;
    }

    public void setAvgServiceTimeMinutes(Double avgServiceTimeMinutes) {
        this.avgServiceTimeMinutes = avgServiceTimeMinutes;
    }

    public List<DepartmentQueueStatsDto> getDepartmentStats() {
        return departmentStats;
    }

    public void setDepartmentStats(List<DepartmentQueueStatsDto> departmentStats) {
        this.departmentStats = departmentStats;
    }

    public List<PeakHourStatsDto> getPeakHours() {
        return peakHours;
    }

    public void setPeakHours(List<PeakHourStatsDto> peakHours) {
        this.peakHours = peakHours;
    }

    public Map<String, Long> getStatusDistribution() {
        return statusDistribution;
    }

    public void setStatusDistribution(Map<String, Long> statusDistribution) {
        this.statusDistribution = statusDistribution;
    }
}
