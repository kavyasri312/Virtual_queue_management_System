package com.smartqueue.dto;

import com.smartqueue.model.Priority;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class BookTokenRequest {

    @NotNull(message = "Department is required")
    private Long departmentId;

    private Priority priority = Priority.NORMAL;

    private LocalDate preferredDate;

    private String notes;

    public BookTokenRequest() {
    }

    public Long getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Long departmentId) {
        this.departmentId = departmentId;
    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }

    public LocalDate getPreferredDate() {
        return preferredDate;
    }

    public void setPreferredDate(LocalDate preferredDate) {
        this.preferredDate = preferredDate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
