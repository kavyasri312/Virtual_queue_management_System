package com.smartqueue.repository;

import com.smartqueue.model.TokenSequence;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface TokenSequenceRepository extends JpaRepository<TokenSequence, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT ts FROM TokenSequence ts WHERE ts.department.id = :deptId AND ts.serviceDate = :date")
    Optional<TokenSequence> findByDepartmentIdAndServiceDateForUpdate(@Param("deptId") Long deptId, @Param("date") LocalDate date);
}
