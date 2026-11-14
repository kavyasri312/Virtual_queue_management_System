package com.smartqueue.dto;

import com.smartqueue.model.Priority;
import com.smartqueue.model.TokenStatus;
import java.time.LocalDate;
import java.time.LocalTime;

public class QrVerifyResponse {
    private boolean valid;
    private String message;
    private String tokenNumber;
    private String verificationCode;
    private String customerName;
    private String departmentName;
    private String counterNumber;
    private TokenStatus status;
    private Priority priority;
    private LocalDate bookingDate;
    private LocalTime bookingTime;

    public QrVerifyResponse() {
    }

    public static QrVerifyResponse invalid(String message) {
        QrVerifyResponse resp = new QrVerifyResponse();
        resp.setValid(false);
        resp.setMessage(message);
        return resp;
    }

    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getTokenNumber() {
        return tokenNumber;
    }

    public void setTokenNumber(String tokenNumber) {
        this.tokenNumber = tokenNumber;
    }

    public String getVerificationCode() {
        return verificationCode;
    }

    public void setVerificationCode(String verificationCode) {
        this.verificationCode = verificationCode;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public String getCounterNumber() {
        return counterNumber;
    }

    public void setCounterNumber(String counterNumber) {
        this.counterNumber = counterNumber;
    }

    public TokenStatus getStatus() {
        return status;
    }

    public void setStatus(TokenStatus status) {
        this.status = status;
    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
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
}
