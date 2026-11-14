package com.smartqueue.repository;

import com.smartqueue.model.Counter;
import com.smartqueue.model.CounterStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CounterRepository extends JpaRepository<Counter, Long> {
    List<Counter> findByDepartmentId(Long departmentId);
    Optional<Counter> findByCurrentStaffId(Long staffId);
    long countByDepartmentIdAndStatus(Long departmentId, CounterStatus status);
    long countByStatus(CounterStatus status);
}
