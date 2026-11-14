package com.smartqueue.dto;

import jakarta.validation.constraints.NotNull;

public class CounterAssignRequest {
    @NotNull(message = "Counter ID is required")
    private Long counterId;

    private Long staffId; // null to unassign

    public CounterAssignRequest() {
    }

    public Long getCounterId() {
        return counterId;
    }

    public void setCounterId(Long counterId) {
        this.counterId = counterId;
    }

    public Long getStaffId() {
        return staffId;
    }

    public void setStaffId(Long staffId) {
        this.staffId = staffId;
    }
}
