package com.smartqueue.config;

import com.smartqueue.model.*;
import com.smartqueue.repository.*;
import com.smartqueue.service.TokenSequenceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private CounterRepository counterRepository;

    @Autowired
    private TokenRepository tokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            return; // Data already exists
        }

        System.out.println(">>> Initializing Smart Queue Management System Sample Data...");

        // 1. Users
        User admin = new User("System Administrator", "admin@smartqueue.com", "+1-800-555-0100", passwordEncoder.encode("Admin@123"), Role.ROLE_ADMIN);
        userRepository.save(admin);

        User drSharma = new User("Dr. Alok Sharma", "dr.sharma@hospital.com", "+1-800-555-0101", passwordEncoder.encode("Staff@123"), Role.ROLE_STAFF);
        User tellerAlice = new User("Alice Henderson", "teller.alice@bank.com", "+1-800-555-0102", passwordEncoder.encode("Staff@123"), Role.ROLE_STAFF);
        User officerRaj = new User("Raj Patel", "officer.raj@gov.com", "+1-800-555-0103", passwordEncoder.encode("Staff@123"), Role.ROLE_STAFF);
        User supportEmma = new User("Emma Watson", "support.emma@service.com", "+1-800-555-0104", passwordEncoder.encode("Staff@123"), Role.ROLE_STAFF);
        userRepository.saveAll(List.of(drSharma, tellerAlice, officerRaj, supportEmma));

        User customerJohn = new User("John Doe", "john.doe@example.com", "+1-555-0199", passwordEncoder.encode("Customer@123"), Role.ROLE_CUSTOMER);
        User customerSarah = new User("Sarah Jenkins", "sarah.smith@example.com", "+1-555-0198", passwordEncoder.encode("Customer@123"), Role.ROLE_CUSTOMER);
        User customerDavid = new User("David Miller", "david.m@example.com", "+1-555-0197", passwordEncoder.encode("Customer@123"), Role.ROLE_CUSTOMER);
        userRepository.saveAll(List.of(customerJohn, customerSarah, customerDavid));

        // 2. Departments
        // Hospitals
        Department deptGM = new Department("General Medicine", "GM", "Primary outpatient consultations, general health checks, and triage.", DepartmentCategory.HOSPITAL, 8, 150);
        Department deptCardio = new Department("Cardiology Clinic", "CRD", "Heart health, ECG diagnostics, and cardiac consultations.", DepartmentCategory.HOSPITAL, 15, 80);
        Department deptPedia = new Department("Pediatrics", "PED", "Specialized pediatric consultation and infant care.", DepartmentCategory.HOSPITAL, 10, 100);

        // Banking
        Department deptBank = new Department("Retail Banking & Cashier", "BNK", "Cash deposits, withdrawals, foreign exchange, and teller services.", DepartmentCategory.BANK, 5, 250);
        Department deptLoans = new Department("Loans & Mortgages", "LNS", "Personal loans, mortgage advisory, and credit assessment.", DepartmentCategory.BANK, 20, 60);

        // Government
        Department deptGov = new Department("Passport & National ID", "GOV", "Passport issuance, biometric registration, and citizen identity cards.", DepartmentCategory.GOVERNMENT, 12, 180);
        Department deptDoc = new Department("Licensing & Permits", "LIC", "Driver licensing, vehicle registration, and municipal business permits.", DepartmentCategory.GOVERNMENT, 10, 120);

        // Customer Service
        Department deptSupport = new Department("Technical Support", "SUP", "Hardware diagnostics, device warranty service, and tech troubleshooting.", DepartmentCategory.CUSTOMER_SERVICE, 15, 90);
        Department deptBilling = new Department("Billing & Subscriptions", "BIL", "Account reconciliation, invoice payments, and dispute settlements.", DepartmentCategory.CUSTOMER_SERVICE, 6, 200);

        departmentRepository.saveAll(List.of(deptGM, deptCardio, deptPedia, deptBank, deptLoans, deptGov, deptDoc, deptSupport, deptBilling));

        // 3. Counters
        Counter c1 = new Counter("C-01", "Doctor Room 1", deptGM);
        c1.setCurrentStaff(drSharma);
        c1.setStatus(CounterStatus.BUSY);

        Counter c2 = new Counter("C-02", "Doctor Room 2", deptGM);
        c2.setStatus(CounterStatus.ACTIVE);

        Counter c3 = new Counter("T-01", "Teller Counter 1", deptBank);
        c3.setCurrentStaff(tellerAlice);
        c3.setStatus(CounterStatus.ACTIVE);

        Counter c4 = new Counter("T-02", "Teller Counter 2", deptBank);
        c4.setStatus(CounterStatus.ACTIVE);

        Counter c5 = new Counter("W-01", "Biometrics Window 1", deptGov);
        c5.setCurrentStaff(officerRaj);
        c5.setStatus(CounterStatus.ACTIVE);

        Counter c6 = new Counter("D-01", "Support Desk Alpha", deptSupport);
        c6.setCurrentStaff(supportEmma);
        c6.setStatus(CounterStatus.ACTIVE);

        counterRepository.saveAll(List.of(c1, c2, c3, c4, c5, c6));

        // 4. Initial Sample Tokens for today
        LocalDate today = LocalDate.now();

        // GM completed tokens (to feed historical duration)
        Token t1 = new Token("GM-001", 1L, deptGM, customerDavid, Priority.NORMAL, today, "Checkup headache");
        t1.setStatus(TokenStatus.COMPLETED);
        t1.setCounter(c1);
        t1.setStaff(drSharma);
        t1.setBookingTime(LocalTime.of(9, 0));
        t1.setCalledTime(LocalDateTime.of(today, LocalTime.of(9, 5)));
        t1.setServingStartTime(LocalDateTime.of(today, LocalTime.of(9, 6)));
        t1.setCompletedTime(LocalDateTime.of(today, LocalTime.of(9, 14)));
        t1.setActualDurationMinutes(8);

        Token t2 = new Token("GM-002", 2L, deptGM, customerSarah, Priority.SENIOR_CITIZEN, today, "Blood pressure review");
        t2.setStatus(TokenStatus.COMPLETED);
        t2.setCounter(c1);
        t2.setStaff(drSharma);
        t2.setBookingTime(LocalTime.of(9, 10));
        t2.setCalledTime(LocalDateTime.of(today, LocalTime.of(9, 16)));
        t2.setServingStartTime(LocalDateTime.of(today, LocalTime.of(9, 17)));
        t2.setCompletedTime(LocalDateTime.of(today, LocalTime.of(9, 26)));
        t2.setActualDurationMinutes(9);

        // GM currently serving
        Token t3 = new Token("GM-003", 3L, deptGM, customerDavid, Priority.NORMAL, today, "Fever consultation");
        t3.setStatus(TokenStatus.SERVING);
        t3.setCounter(c1);
        t3.setStaff(drSharma);
        t3.setBookingTime(LocalTime.of(9, 25));
        t3.setCalledTime(LocalDateTime.of(today, LocalTime.of(9, 30)));
        t3.setServingStartTime(LocalDateTime.of(today, LocalTime.of(9, 31)));

        // GM waiting for John Doe
        Token t4 = new Token("GM-004", 4L, deptGM, customerJohn, Priority.NORMAL, today, "Routine checkup");
        t4.setStatus(TokenStatus.WAITING);
        t4.setBookingTime(LocalTime.of(9, 35));

        // GM waiting with Senior Citizen
        Token t5 = new Token("GM-005", 5L, deptGM, customerSarah, Priority.SENIOR_CITIZEN, today, "Joint pain evaluation");
        t5.setStatus(TokenStatus.WAITING);
        t5.setBookingTime(LocalTime.of(9, 40));

        // Bank tokens
        Token tb1 = new Token("BNK-001", 1L, deptBank, customerJohn, Priority.NORMAL, today, "Cash deposit");
        tb1.setStatus(TokenStatus.COMPLETED);
        tb1.setCounter(c3);
        tb1.setStaff(tellerAlice);
        tb1.setBookingTime(LocalTime.of(9, 15));
        tb1.setServingStartTime(LocalDateTime.of(today, LocalTime.of(9, 18)));
        tb1.setCompletedTime(LocalDateTime.of(today, LocalTime.of(9, 23)));
        tb1.setActualDurationMinutes(5);

        Token tb2 = new Token("BNK-002", 2L, deptBank, customerDavid, Priority.NORMAL, today, "Cheque clearance");
        tb2.setStatus(TokenStatus.WAITING);
        tb2.setBookingTime(LocalTime.of(9, 45));

        tokenRepository.saveAll(List.of(t1, t2, t3, t4, t5, tb1, tb2));

        System.out.println(">>> Smart Queue Management System Sample Data Loaded Successfully!");
        System.out.println(">>> Admin: admin@smartqueue.com / Admin@123");
        System.out.println(">>> Staff: dr.sharma@hospital.com / Staff@123");
        System.out.println(">>> Staff: teller.alice@bank.com / Staff@123");
        System.out.println(">>> Customer: john.doe@example.com / Customer@123");
    }
}
