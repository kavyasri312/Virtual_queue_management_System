package com.smartqueue.dto;

import com.smartqueue.model.TokenStatus;
import java.util.List;

public class QueuePositionDto {
    private String tokenNumber;
    private TokenStatus status;
    private String departmentName;
    private String departmentCode;
    private String counterNumber;
    private String counterName;
    private String currentServingToken;
    private long peopleAhead;
    private Integer estimatedWaitMinutes;
    private String notes;
    private List<String> nextTokens;

    public QueuePositionDto() {
    }

    public String getTokenNumber() {
        return tokenNumber;
    }

    public void setTokenNumber(String tokenNumber) {
        this.tokenNumber = tokenNumber;
    }

    public TokenStatus getStatus() {
        return status;
    }

    public void setStatus(TokenStatus status) {
        this.status = status;
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

    public String getCurrentServingToken() {
        return currentServingToken;
    }

    public void setCurrentServingToken(String currentServingToken) {
        this.currentServingToken = currentServingToken;
    }

    public long getPeopleAhead() {
        return peopleAhead;
    }

    public void setPeopleAhead(long peopleAhead) {
        this.peopleAhead = peopleAhead;
    }

    public Integer getEstimatedWaitMinutes() {
        return estimatedWaitMinutes;
    }

    public void setEstimatedWaitMinutes(Integer estimatedWaitMinutes) {
        this.estimatedWaitMinutes = estimatedWaitMinutes;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<String> getNextTokens() {
        return nextTokens;
    }

    public void setNextTokens(List<String> nextTokens) {
        this.nextTokens = nextTokens;
    }
}
