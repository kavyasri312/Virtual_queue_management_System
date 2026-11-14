package com.smartqueue.service;

import com.smartqueue.dto.CounterAssignRequest;
import com.smartqueue.dto.CounterDto;
import com.smartqueue.model.*;
import com.smartqueue.repository.CounterRepository;
import com.smartqueue.repository.DepartmentRepository;
import com.smartqueue.repository.TokenRepository;
import com.smartqueue.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CounterService {

    @Autowired
    private CounterRepository counterRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TokenRepository tokenRepository;

    @Transactional(readOnly = true)
    public List<CounterDto> getAllCounters() {
        return counterRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CounterDto> getCountersByDepartment(Long departmentId) {
        return counterRepository.findByDepartmentId(departmentId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public CounterDto createCounter(CounterDto dto) {
        Department dept = departmentRepository.findById(dto.getDepartmentId())
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));

        Counter counter = new Counter(dto.getCounterNumber().trim(), dto.getCounterName().trim(), dept);
        if (dto.getCurrentStaffId() != null) {
            User staff = userRepository.findById(dto.getCurrentStaffId())
                    .orElseThrow(() -> new IllegalArgumentException("Staff user not found"));
            counter.setCurrentStaff(staff);
            counter.setStatus(CounterStatus.ACTIVE);
        } else {
            counter.setStatus(CounterStatus.INACTIVE);
        }

        counter = counterRepository.save(counter);
        return mapToDto(counter);
    }

    @Transactional
    public CounterDto updateCounter(Long id, CounterDto dto) {
        Counter counter = counterRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Counter not found"));

        if (dto.getDepartmentId() != null && !dto.getDepartmentId().equals(counter.getDepartment().getId())) {
            Department dept = departmentRepository.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new IllegalArgumentException("Department not found"));
            counter.setDepartment(dept);
        }

        counter.setCounterNumber(dto.getCounterNumber());
        counter.setCounterName(dto.getCounterName());
        if (dto.getStatus() != null) {
            counter.setStatus(dto.getStatus());
        }

        if (dto.getCurrentStaffId() != null) {
            User staff = userRepository.findById(dto.getCurrentStaffId())
                    .orElseThrow(() -> new IllegalArgumentException("Staff user not found"));
            counter.setCurrentStaff(staff);
        } else {
            counter.setCurrentStaff(null);
        }

        counter = counterRepository.save(counter);
        return mapToDto(counter);
    }

    @Transactional
    public CounterDto assignStaff(CounterAssignRequest request) {
        Counter counter = counterRepository.findById(request.getCounterId())
                .orElseThrow(() -> new IllegalArgumentException("Counter not found"));

        if (request.getStaffId() != null) {
            User staff = userRepository.findById(request.getStaffId())
                    .orElseThrow(() -> new IllegalArgumentException("Staff user not found"));

            if (staff.getRole() != Role.ROLE_STAFF && staff.getRole() != Role.ROLE_ADMIN) {
                throw new IllegalArgumentException("User must have STAFF or ADMIN role");
            }

            // Unassign staff from any previous counter
            Optional<Counter> existing = counterRepository.findByCurrentStaffId(staff.getId());
            if (existing.isPresent() && !existing.get().getId().equals(counter.getId())) {
                Counter prev = existing.get();
                prev.setCurrentStaff(null);
                prev.setStatus(CounterStatus.INACTIVE);
                counterRepository.save(prev);
            }

            counter.setCurrentStaff(staff);
            counter.setStatus(CounterStatus.ACTIVE);
        } else {
            counter.setCurrentStaff(null);
            counter.setStatus(CounterStatus.INACTIVE);
        }

        counter = counterRepository.save(counter);
        return mapToDto(counter);
    }

    @Transactional
    public CounterDto toggleStatus(Long counterId, CounterStatus status) {
        Counter counter = counterRepository.findById(counterId)
                .orElseThrow(() -> new IllegalArgumentException("Counter not found"));
        counter.setStatus(status);
        counter = counterRepository.save(counter);
        return mapToDto(counter);
    }

    @Transactional
    public void deleteCounter(Long id) {
        counterRepository.deleteById(id);
    }

    public CounterDto mapToDto(Counter counter) {
        CounterDto dto = new CounterDto();
        dto.setId(counter.getId());
        dto.setCounterNumber(counter.getCounterNumber());
        dto.setCounterName(counter.getCounterName());
        dto.setDepartmentId(counter.getDepartment().getId());
        dto.setDepartmentName(counter.getDepartment().getName());
        dto.setStatus(counter.getStatus());

        if (counter.getCurrentStaff() != null) {
            dto.setCurrentStaffId(counter.getCurrentStaff().getId());
            dto.setCurrentStaffName(counter.getCurrentStaff().getName());
        }

        // Check if currently serving a token
        List<Token> servingTokens = tokenRepository.findActiveQueueTokens(
                counter.getDepartment().getId(),
                LocalDate.now(),
                List.of(TokenStatus.SERVING, TokenStatus.CALLED)
        ).stream().filter(t -> t.getCounter() != null && t.getCounter().getId().equals(counter.getId())).toList();

        if (!servingTokens.isEmpty()) {
            dto.setCurrentlyServingToken(servingTokens.get(0).getTokenNumber());
        }

        return dto;
    }
}
