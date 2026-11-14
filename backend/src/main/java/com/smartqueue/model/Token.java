package com.smartqueue.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(
    name = "tokens",
    indexes = {
        @Index(name = "idx_tokens_dept_date_status", columnList = "department_id, booking_date, status"),
        @Index(name = "idx_tokens_customer", columnList = "customer_id"),
        @Index(name = "idx_tokens_verification", columnList = "verification_code")
    }
)
public class Token {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "token_number", nullable = false, length = 30)
    private String tokenNumber;

    @Column(name = "token_sequence", nullable = false)
    private Long tokenSequence;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "counter_id")
    private Counter counter;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "staff_id")
    private User staff;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Priority priority = Priority.NORMAL;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TokenStatus status = TokenStatus.WAITING;

    @Column(name = "booking_date", nullable = false)
    private LocalDate bookingDate;

    @Column(name = "booking_time", nullable = false)
    private LocalTime bookingTime;

    @Column(name = "called_time")
    private LocalDateTime calledTime;

    @Column(name = "serving_start_time")
    private LocalDateTime servingStartTime;

    @Column(name = "completed_time")
    private LocalDateTime completedTime;

    @Column(name = "actual_duration_minutes")
    private Integer actualDurationMinutes;

    @Column(name = "verification_code", nullable = false, unique = true, length = 64)
    private String verificationCode;

    @Column(length = 500)
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public Token() {
    }

    public Token(String tokenNumber, Long tokenSequence, Department department, User customer, Priority priority, LocalDate bookingDate, String notes) {
        this.tokenNumber = tokenNumber;
        this.tokenSequence = tokenSequence;
        this.department = department;
        this.customer = customer;
        this.priority = priority != null ? priority : Priority.NORMAL;
        this.status = TokenStatus.WAITING;
        this.bookingDate = bookingDate != null ? bookingDate : LocalDate.now();
        this.bookingTime = LocalTime.now();
        this.verificationCode = UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();
        this.notes = notes;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.verificationCode == null) {
            this.verificationCode = UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();
        }
        if (this.bookingTime == null) {
            this.bookingTime = LocalTime.now();
        }
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

    public Department getDepartment() {
        return department;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }

    public User getCustomer() {
        return customer;
    }

    public void setCustomer(User customer) {
        this.customer = customer;
    }

    public Counter getCounter() {
        return counter;
    }

    public void setCounter(Counter counter) {
        this.counter = counter;
    }

    public User getStaff() {
        return staff;
    }

    public void setStaff(User staff) {
        this.staff = staff;
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

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
