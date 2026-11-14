package com.smartqueue.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(
    name = "token_sequences",
    uniqueConstraints = @UniqueConstraint(name = "uk_dept_date", columnNames = {"department_id", "service_date"})
)
public class TokenSequence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(name = "service_date", nullable = false)
    private LocalDate serviceDate;

    @Column(name = "current_sequence", nullable = false)
    private Long currentSequence = 0L;

    public TokenSequence() {
    }

    public TokenSequence(Department department, LocalDate serviceDate, Long currentSequence) {
        this.department = department;
        this.serviceDate = serviceDate;
        this.currentSequence = currentSequence;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Department getDepartment() {
        return department;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }

    public LocalDate getServiceDate() {
        return serviceDate;
    }

    public void setServiceDate(LocalDate serviceDate) {
        this.serviceDate = serviceDate;
    }

    public Long getCurrentSequence() {
        return currentSequence;
    }

    public void setCurrentSequence(Long currentSequence) {
        this.currentSequence = currentSequence;
    }

    public Long incrementAndGet() {
        this.currentSequence++;
        return this.currentSequence;
    }
}
