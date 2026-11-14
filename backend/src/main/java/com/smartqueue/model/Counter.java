package com.smartqueue.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "counters")
public class Counter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "counter_number", nullable = false, length = 20)
    private String counterNumber;

    @Column(name = "counter_name", nullable = false, length = 100)
    private String counterName;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "current_staff_id")
    private User currentStaff;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CounterStatus status = CounterStatus.INACTIVE;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public Counter() {
    }

    public Counter(String counterNumber, String counterName, Department department) {
        this.counterNumber = counterNumber;
        this.counterName = counterName;
        this.department = department;
        this.status = CounterStatus.INACTIVE;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
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

    public Department getDepartment() {
        return department;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }

    public User getCurrentStaff() {
        return currentStaff;
    }

    public void setCurrentStaff(User currentStaff) {
        this.currentStaff = currentStaff;
    }

    public CounterStatus getStatus() {
        return status;
    }

    public void setStatus(CounterStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
