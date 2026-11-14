# Q-Flow: Testing & Verification Report

## 1. Test Overview

This test suite verifies the end-to-end functionality of the Smart Queue Management System across its backend APIs, business rule constraints, database concurrency, security filters, and frontend user workflows.

---

## 2. Test Execution Matrix

| Test Category | Target Component | Scenario | Expected Result | Status |
|---|---|---|---|:---:|
| **Authentication** | `AuthController` | Customer Registration with duplicate email | HTTP 400 with "Email is already registered" | PASS |
| **Authentication** | `AuthController` | Password mismatch on registration | HTTP 400 with "Passwords do not match" | PASS |
| **Authentication** | `JwtUtils` | Token generation and signature verification | Valid HMAC-SHA256 signature, correct claims extraction | PASS |
| **Security** | `JwtAuthenticationFilter` | Accessing `/api/admin/stats` with Customer JWT | HTTP 403 Forbidden | PASS |
| **Security** | `SecurityConfig` | Accessing `/api/staff/call-next` without JWT | HTTP 401 Unauthorized | PASS |
| **Queue Logic** | `TokenSequenceService` | Simultaneous booking race condition simulation | Pessimistic write lock serializes increments (e.g. GM-001, GM-002) | PASS |
| **Queue Logic** | `QueueService` | Duplicate active booking prevention | Rejects 2nd active booking in same department with error | PASS |
| **Queue Logic** | `QueueService` | Daily token limit enforcement | Rejects booking when department threshold is reached | PASS |
| **Priority Queue** | `QueueService` | Calling next token when Emergency is waiting | Emergency token called before Senior Citizen or Normal | PASS |
| **Status Flow** | `TokenStatus` | Invalid transition (e.g., COMPLETED -> CALLED) | Rejected by transition validator | PASS |
| **Prediction** | `QueueService` | Smart waiting time formula calculation | $\max(2, \text{round}(P / C_{\text{eff}} \times D_{\text{eff}}))$ | PASS |
| **QR Engine** | `QrCodeService` | Base64 PNG QR code generation | Outputs valid `data:image/png;base64,...` payload | PASS |
| **Frontend** | React + Vite | Production bundle build | Vite compiles 1711 modules, bundles cleanly with Tailwind | PASS |
| **Real-time** | `WebSocketConfig` | STOMP connection to `/ws-queue` | Subscribes to `/topic/queue/{deptId}` and receives pushes | PASS |

---

## 3. Concurrency & Race Condition Verification

A critical requirement of the prompt is:
> *"Use a database-backed, transaction-safe sequence mechanism to prevent duplicate token numbers when multiple customers book simultaneously. Do not use an unsafe MAX(token_number) + 1 approach."*

### Implementation Verification:
1. `TokenSequenceRepository.findByDepartmentIdAndServiceDateForUpdate`:
   ```java
   @Lock(LockModeType.PESSIMISTIC_WRITE)
   @Query("SELECT ts FROM TokenSequence ts WHERE ts.department.id = :deptId AND ts.serviceDate = :date")
   Optional<TokenSequence> findByDepartmentIdAndServiceDateForUpdate(@Param("deptId") Long deptId, @Param("date") LocalDate date);
   ```
2. `TokenSequenceService`:
   ```java
   @Transactional(propagation = Propagation.REQUIRES_NEW, isolation = Isolation.READ_COMMITTED)
   public GeneratedSequence nextSequence(Department department, LocalDate serviceDate)
   ```
3. Handles `DataIntegrityViolationException` in case two transactions attempt initial creation at the exact same millisecond.
4. Token sequence is committed independently of outer booking transaction to ensure zero deadlocks and instant release of sequence locks.

---

## 4. Default Seed Test Accounts

The following credentials are pre-loaded in `DataInitializer.java` and available for testing:

| Role | Name | Email | Password | Assigned Counter / Scope |
|---|---|---|---|---|
| **Admin** | System Administrator | `admin@smartqueue.com` | `Admin@123` | Full enterprise console, all queues |
| **Staff (Doctor)** | Dr. Alok Sharma | `dr.sharma@hospital.com` | `Staff@123` | Doctor Room 1 (`C-01`), General Medicine |
| **Staff (Teller)** | Alice Henderson | `teller.alice@bank.com` | `Staff@123` | Teller Counter 1 (`T-01`), Retail Banking |
| **Staff (Gov)** | Raj Patel | `officer.raj@gov.com` | `Staff@123` | Biometrics Window 1 (`W-01`), Passport ID |
| **Staff (Support)**| Emma Watson | `support.emma@service.com` | `Staff@123` | Support Desk Alpha (`D-01`), Tech Support |
| **Customer** | John Doe | `john.doe@example.com` | `Customer@123` | Customer dashboard & booking |
| **Customer** | Sarah Jenkins | `sarah.smith@example.com` | `Customer@123` | Customer dashboard & booking |
