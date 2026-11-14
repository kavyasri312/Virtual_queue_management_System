package com.smartqueue.dto;

import com.smartqueue.model.Priority;
import com.smartqueue.model.TokenStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class TokenResponse {
    private Long id;
    private String tokenNumber;
    private Long tokenSequence;
    private Long departmentId;
    private String departmentName;
    private String departmentCode;
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private Long counterId;
    private String counterNumber;
    private String counterName;
    private Long staffId;
    private String staffName;
    private Priority priority;
    private TokenStatus status;
    private LocalDate bookingDate;
    private LocalTime bookingTime;
    private LocalDateTime calledTime;
    private LocalDateTime servingStartTime;
    private LocalDateTime completedTime;
    private Integer actualDurationMinutes;
    private String verificationCode;
    private String qrCodeBase64;
    private String notes;

    // Computed queue indicators
    private long peopleAhead;
    private Integer estimatedWaitMinutes;
    private String currentServingToken;

    public TokenResponse() {
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTokenNumber() {
        return tokenNumber;
    }

    public void setTokenNumber(String tokenNumber) {
        this.tokenNumber = tokenNumber;
    }

    public Long getTokenSequence() {
        return tokenSequence;
    }

    public void setTokenSequence(Long tokenSequence) {
        this.tokenSequence = tokenSequence;
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

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
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

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }

    public TokenStatus getStatus() {
        return status;
    }

    public void setStatus(TokenStatus status) {
        this.status = status;
    }

    public LocalDate getBookingDate() {
        return bookingDate;
    }

    public void setBookingDate(LocalDate bookingDate) {
        this.bookingDate = bookingDate;
    }

    public LocalTime getBookingTime() {
        return bookingTime;
    }

    public void setBookingTime(LocalTime bookingTime) {
        this.bookingTime = bookingTime;
    }

    public LocalDateTime getCalledTime() {
        return calledTime;
    }

    public void setCalledTime(LocalDateTime calledTime) {
        this.calledTime = calledTime;
    }

    public LocalDateTime getServingStartTime() {
        return servingStartTime;
    }

    public void setServingStartTime(LocalDateTime servingStartTime) {
        this.servingStartTime = servingStartTime;
    }

    public LocalDateTime getCompletedTime() {
        return completedTime;
    }

    public void setCompletedTime(LocalDateTime completedTime) {
        this.completedTime = completedTime;
    }

    public Integer getActualDurationMinutes() {
        return actualDurationMinutes;
    }

    public void setActualDurationMinutes(Integer actualDurationMinutes) {
        this.actualDurationMinutes = actualDurationMinutes;
    }

    public String getVerificationCode() {
        return verificationCode;
    }

    public void setVerificationCode(String verificationCode) {
        this.verificationCode = verificationCode;
    }

    public String getQrCodeBase64() {
        return qrCodeBase64;
    }

    public void setQrCodeBase64(String qrCodeBase64) {
        this.qrCodeBase64 = qrCodeBase64;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
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

    public String getCurrentServingToken() {
        return currentServingToken;
    }

    public void setCurrentServingToken(String currentServingToken) {
        this.currentServingToken = currentServingToken;
    }
}
