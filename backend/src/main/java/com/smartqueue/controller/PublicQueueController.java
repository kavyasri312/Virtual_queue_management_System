package com.smartqueue.controller;

import com.smartqueue.dto.DepartmentDto;
import com.smartqueue.dto.QrVerifyResponse;
import com.smartqueue.dto.QueueStatusResponse;
import com.smartqueue.service.DepartmentService;
import com.smartqueue.service.QueueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public")
public class PublicQueueController {

    @Autowired
    private DepartmentService departmentService;

    @Autowired
    private QueueService queueService;

    @GetMapping("/departments")
    public ResponseEntity<List<DepartmentDto>> getDepartments() {
        return ResponseEntity.ok(departmentService.getActiveDepartmentsWithMetrics());
    }

    @GetMapping("/queue/{departmentId}")
    public ResponseEntity<QueueStatusResponse> getDepartmentQueue(@PathVariable Long departmentId) {
        return ResponseEntity.ok(queueService.getDepartmentQueueStatus(departmentId));
    }

    @GetMapping("/verify/{code}")
    public ResponseEntity<QrVerifyResponse> verifyToken(@PathVariable String code) {
        return ResponseEntity.ok(queueService.verifyTokenCode(code));
    }
}
