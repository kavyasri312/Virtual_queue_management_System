package com.smartqueue.repository;

import com.smartqueue.model.Priority;
import com.smartqueue.model.Token;
import com.smartqueue.model.TokenStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface TokenRepository extends JpaRepository<Token, Long> {

    List<Token> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    Optional<Token> findFirstByCustomerIdAndDepartmentIdAndStatusIn(Long customerId, Long departmentId, Collection<TokenStatus> statuses);

    Optional<Token> findFirstByCustomerIdAndStatusIn(Long customerId, Collection<TokenStatus> statuses);

    Optional<Token> findByVerificationCode(String verificationCode);

    List<Token> findByBookingDate(LocalDate bookingDate);

    List<Token> findByDepartmentIdAndBookingDate(Long departmentId, LocalDate bookingDate);

    // Tokens waiting or called ordered by priority (Emergency -> PWD -> Senior -> Normal) then creation time
    @Query("""
        SELECT t FROM Token t
        WHERE t.department.id = :deptId
          AND t.bookingDate = :date
          AND t.status IN :statuses
        ORDER BY t.priority ASC, t.createdAt ASC
    """)
    List<Token> findActiveQueueTokens(
        @Param("deptId") Long deptId,
        @Param("date") LocalDate date,
        @Param("statuses") Collection<TokenStatus> statuses
    );

    // Find next eligible waiting token for calling
    @Query("""
        SELECT t FROM Token t
        WHERE t.department.id = :deptId
          AND t.bookingDate = :date
          AND t.status = 'WAITING'
        ORDER BY t.priority ASC, t.createdAt ASC
    """)
    List<Token> findNextWaitingTokens(@Param("deptId") Long deptId, @Param("date") LocalDate date);

    // Current serving token for a department
    @Query("""
        SELECT t FROM Token t
        WHERE t.department.id = :deptId
          AND t.bookingDate = :date
          AND t.status = 'SERVING'
        ORDER BY t.servingStartTime DESC
    """)
    List<Token> findCurrentlyServingTokens(@Param("deptId") Long deptId, @Param("date") LocalDate date);

    // Count people ahead of a specific token
    @Query("""
        SELECT COUNT(t) FROM Token t
        WHERE t.department.id = :deptId
          AND t.bookingDate = :date
          AND t.status = 'WAITING'
          AND (
              t.priority < :priority
              OR (t.priority = :priority AND t.createdAt < :createdAt)
          )
    """)
    long countPeopleAhead(
        @Param("deptId") Long deptId,
        @Param("date") LocalDate date,
        @Param("priority") Priority priority,
        @Param("createdAt") java.time.LocalDateTime createdAt
    );

    // Average duration of completed tokens for department today
    @Query("""
        SELECT AVG(t.actualDurationMinutes) FROM Token t
        WHERE t.department.id = :deptId
          AND t.status = 'COMPLETED'
          AND t.actualDurationMinutes IS NOT NULL
          AND t.bookingDate = :date
    """)
    Double findAvgDurationMinutesToday(@Param("deptId") Long deptId, @Param("date") LocalDate date);

    // Overall count by status and date
    long countByBookingDateAndStatus(LocalDate bookingDate, TokenStatus status);

    long countByBookingDate(LocalDate bookingDate);

    long countByDepartmentIdAndBookingDateAndStatus(Long departmentId, LocalDate bookingDate, TokenStatus status);

    long countByStaffIdAndBookingDateAndStatus(Long staffId, LocalDate bookingDate, TokenStatus status);

    @Query("""
        SELECT AVG(t.actualDurationMinutes) FROM Token t
        WHERE t.staff.id = :staffId
          AND t.status = 'COMPLETED'
          AND t.actualDurationMinutes IS NOT NULL
          AND t.bookingDate = :date
    """)
    Double findStaffAvgServingMinutesToday(@Param("staffId") Long staffId, @Param("date") LocalDate date);
}
