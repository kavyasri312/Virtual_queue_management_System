package com.smartqueue.service;

import com.smartqueue.model.Department;
import com.smartqueue.model.TokenSequence;
import com.smartqueue.repository.TokenSequenceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;

@Service
public class TokenSequenceService {

    @Autowired
    private TokenSequenceRepository sequenceRepository;

    /**
     * Database-backed, transaction-safe sequence mechanism with pessimistic write locking
     * to prevent race conditions and duplicate token numbers under concurrent bookings.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW, isolation = Isolation.READ_COMMITTED)
    public GeneratedSequence nextSequence(Department department, LocalDate serviceDate) {
        Long deptId = department.getId();
        Optional<TokenSequence> opt = sequenceRepository.findByDepartmentIdAndServiceDateForUpdate(deptId, serviceDate);

        TokenSequence sequence;
        if (opt.isPresent()) {
            sequence = opt.get();
            sequence.incrementAndGet();
            sequence = sequenceRepository.save(sequence);
        } else {
            // Create sequence record for this department and date
            try {
                sequence = new TokenSequence(department, serviceDate, 1L);
                sequence = sequenceRepository.saveAndFlush(sequence);
            } catch (DataIntegrityViolationException dive) {
                // If another concurrent thread inserted it just now, reload with lock
                sequence = sequenceRepository.findByDepartmentIdAndServiceDateForUpdate(deptId, serviceDate)
                        .orElseThrow(() -> new IllegalStateException("Failed to acquire token sequence lock"));
                sequence.incrementAndGet();
                sequence = sequenceRepository.save(sequence);
            }
        }

        Long seqNum = sequence.getCurrentSequence();
        String code = department.getCode() != null ? department.getCode().trim().toUpperCase() : "T";
        String tokenNumber = String.format("%s-%03d", code, seqNum);

        return new GeneratedSequence(seqNum, tokenNumber);
    }

    public static class GeneratedSequence {
        private final Long sequenceNumber;
        private final String tokenNumber;

        public GeneratedSequence(Long sequenceNumber, String tokenNumber) {
            this.sequenceNumber = sequenceNumber;
            this.tokenNumber = tokenNumber;
        }

        public Long getSequenceNumber() {
            return sequenceNumber;
        }

        public String getTokenNumber() {
            return tokenNumber;
        }
    }
}
