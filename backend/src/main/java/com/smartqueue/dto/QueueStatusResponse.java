package com.smartqueue.dto;

import java.util.List;

public class QueueStatusResponse {
    private Long departmentId;
    private String departmentName;
    private String departmentCode;
    private String currentServingToken;
    private long waitingCount;
    private long activeCounters;
    private Integer estimatedAvgWaitMinutes;
    private List<TokenResponse> nextTokens;

    public QueueStatusResponse() {
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

    public String getCurrentServingToken() {
        return currentServingToken;
    }

    public void setCurrentServingToken(String currentServingToken) {
        this.currentServingToken = currentServingToken;
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

    public Integer getEstimatedAvgWaitMinutes() {
        return estimatedAvgWaitMinutes;
    }

    public void setEstimatedAvgWaitMinutes(Integer estimatedAvgWaitMinutes) {
        this.estimatedAvgWaitMinutes = estimatedAvgWaitMinutes;
    }

    public List<TokenResponse> getNextTokens() {
        return nextTokens;
    }

    public void setNextTokens(List<TokenResponse> nextTokens) {
        this.nextTokens = nextTokens;
    }
}
