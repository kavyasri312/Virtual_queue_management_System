package com.smartqueue.service;

import com.smartqueue.dto.DepartmentDto;
import com.smartqueue.model.CounterStatus;
import com.smartqueue.model.Department;
import com.smartqueue.model.Token;
import com.smartqueue.repository.CounterRepository;
import com.smartqueue.repository.DepartmentRepository;
import com.smartqueue.repository.TokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DepartmentService {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private CounterRepository counterRepository;

    @Autowired
    private TokenRepository tokenRepository;

    @Autowired
    private QueueService queueService;

    @Transactional(readOnly = true)
    public List<DepartmentDto> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(this::mapWithMetrics)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DepartmentDto> getActiveDepartmentsWithMetrics() {
        return departmentRepository.findByActiveTrue().stream()
                .map(this::mapWithMetrics)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DepartmentDto getDepartmentById(Long id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));
        return mapWithMetrics(dept);
    }

    @Transactional
    public DepartmentDto createDepartment(DepartmentDto dto) {
        if (departmentRepository.existsByCode(dto.getCode().trim().toUpperCase())) {
            throw new IllegalArgumentException("Department code '" + dto.getCode() + "' is already in use.");
        }

        Department dept = new Department();
        dept.setName(dto.getName().trim());
        dept.setCode(dto.getCode().trim().toUpperCase());
        dept.setDescription(dto.getDescription());
        dept.setCategory(dto.getCategory());
        dept.setAvgServiceTimeMinutes(dto.getAvgServiceTimeMinutes() != null ? dto.getAvgServiceTimeMinutes() : 10);
        dept.setDailyTokenLimit(dto.getDailyTokenLimit() != null ? dto.getDailyTokenLimit() : 200);
        if (dto.getOpeningTime() != null) dept.setOpeningTime(dto.getOpeningTime());
        if (dto.getClosingTime() != null) dept.setClosingTime(dto.getClosingTime());
        dept.setActive(true);

        dept = departmentRepository.save(dept);
        return mapWithMetrics(dept);
    }

    @Transactional
    public DepartmentDto updateDepartment(Long id, DepartmentDto dto) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));

        if (!dept.getCode().equalsIgnoreCase(dto.getCode().trim()) &&
                departmentRepository.existsByCode(dto.getCode().trim().toUpperCase())) {
            throw new IllegalArgumentException("Department code '" + dto.getCode() + "' is already in use.");
        }

        dept.setName(dto.getName().trim());
        dept.setCode(dto.getCode().trim().toUpperCase());
        dept.setDescription(dto.getDescription());
        dept.setCategory(dto.getCategory());
        dept.setAvgServiceTimeMinutes(dto.getAvgServiceTimeMinutes());
        dept.setDailyTokenLimit(dto.getDailyTokenLimit());
        if (dto.getOpeningTime() != null) dept.setOpeningTime(dto.getOpeningTime());
        if (dto.getClosingTime() != null) dept.setClosingTime(dto.getClosingTime());
        dept.setActive(dto.isActive());

        dept = departmentRepository.save(dept);
        return mapWithMetrics(dept);
    }

    @Transactional
    public void deleteDepartment(Long id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));
        dept.setActive(false); // Soft delete / deactivation
        departmentRepository.save(dept);
    }

    private DepartmentDto mapWithMetrics(Department dept) {
        DepartmentDto dto = new DepartmentDto();
        dto.setId(dept.getId());
        dto.setName(dept.getName());
        dto.setCode(dept.getCode());
        dto.setDescription(dept.getDescription());
        dto.setCategory(dept.getCategory());
        dto.setAvgServiceTimeMinutes(dept.getAvgServiceTimeMinutes());
        dto.setDailyTokenLimit(dept.getDailyTokenLimit());
        dto.setOpeningTime(dept.getOpeningTime());
        dto.setClosingTime(dept.getClosingTime());
        dto.setActive(dept.isActive());

        LocalDate today = LocalDate.now();
        List<Token> waiting = tokenRepository.findNextWaitingTokens(dept.getId(), today);
        dto.setWaitingCount(waiting.size());

        long activeCounters = counterRepository.countByDepartmentIdAndStatus(dept.getId(), CounterStatus.ACTIVE)
                + counterRepository.countByDepartmentIdAndStatus(dept.getId(), CounterStatus.BUSY);
        dto.setActiveCounters(activeCounters);

        dto.setEstimatedWaitMinutes(queueService.calculateEstimatedWaitTime(dept, waiting.size(), today));

        List<Token> serving = tokenRepository.findCurrentlyServingTokens(dept.getId(), today);
        dto.setCurrentServingToken(!serving.isEmpty() ? serving.get(0).getTokenNumber() : "None");

        return dto;
    }
}
