package com.smartqueue.dto;

import com.smartqueue.model.CounterStatus;

public class CounterDto {
    private Long id;
    private String counterNumber;
    private String counterName;
    private Long departmentId;
    private String departmentName;
    private Long currentStaffId;
    private String currentStaffName;
    private CounterStatus status;
    private String currentlyServingToken;

    public CounterDto() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Long getCurrentStaffId() {
        return currentStaffId;
    }

    public void setCurrentStaffId(Long currentStaffId) {
        this.currentStaffId = currentStaffId;
    }

    public String getCurrentStaffName() {
        return currentStaffName;
    }

    public void setCurrentStaffName(String currentStaffName) {
        this.currentStaffName = currentStaffName;
    }

    public CounterStatus getStatus() {
        return status;
    }

    public void setStatus(CounterStatus status) {
        this.status = status;
    }

    public String getCurrentlyServingToken() {
        return currentlyServingToken;
    }

    public void setCurrentlyServingToken(String currentlyServingToken) {
        this.currentlyServingToken = currentlyServingToken;
    }
}
