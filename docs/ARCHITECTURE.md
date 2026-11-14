# Q-Flow: Smart Queue Management System Architecture

## 1. System Overview

**Q-Flow** is an enterprise-grade, responsive full-stack platform designed to eliminate physical waiting lines in high-traffic service institutions. It features a reactive, event-driven architecture using **Spring Boot 3 (Java 17)**, **React 18 with Vite**, **Tailwind CSS**, and **STOMP WebSockets** over SockJS with a database-backed transaction-safe sequence generator.

---

## 2. High-Level Architecture Diagram

```mermaid
flowchart TD
    subgraph ClientLayer["Frontend Client Layer (React 18 + Vite)"]
        Landing["Landing & Directory View"]
        Customer["Customer Dashboard & My Tokens"]
        LiveQueue["Live Queue Tracker (WebSocket Client)"]
        StaffTerm["Staff Operator Terminal"]
        AdminDesk["Admin Management Console"]
        PublicKiosk["Lobby TV / Kiosk Display"]
    end

    subgraph GatewayLayer["API & Communication Gateway"]
        REST["REST API Endpoints (/api/**)"]
        WSEndpoint["STOMP WebSocket Endpoint (/ws-queue)"]
        JWTSec["Spring Security 6 (Stateless JWT Filter)"]
    end

    subgraph ServiceLayer["Spring Boot 3 Core Services"]
        AuthSvc["AuthService (BCrypt + JWT)"]
        SeqSvc["TokenSequenceService (Pessimistic Lock)"]
        QueueSvc["QueueService (Triage + Predictions)"]
        StaffSvc["StaffService (Operator Allocation)"]
        AdminSvc["AdminService (Analytics & Reports)"]
        QRSvc["QrCodeService (ZXing Engine)"]
        NotifSvc["NotificationService (Push + WS)"]
    end

    subgraph StorageLayer["Persistence & Message Broker Layer"]
        Broker["Simple Message Broker (/topic, /queue)"]
        RDBMS[("MySQL 8 / Embedded H2 Mode")]
    end

    ClientLayer --> GatewayLayer
    GatewayLayer --> ServiceLayer
    ServiceLayer --> StorageLayer
    StorageLayer -.->|Event Push| Broker
    Broker -.->|Real-time STOMP Push| LiveQueue
    Broker -.->|Real-time STOMP Push| PublicKiosk
```

---

## 3. Entity-Relationship (ER) Data Model

```mermaid
erDiagram
    USERS ||--o{ TOKENS : "books as customer"
    USERS ||--o{ TOKENS : "serves as operator"
    USERS ||--o{ COUNTERS : "operates desk"
    USERS ||--o{ NOTIFICATIONS : "receives"
    DEPARTMENTS ||--o{ COUNTERS : "has"
    DEPARTMENTS ||--o{ TOKENS : "owns queue"
    DEPARTMENTS ||--o{ TOKEN_SEQUENCES : "tracks sequence"
    COUNTERS ||--o{ TOKENS : "calls & serves"

    USERS {
        bigint id PK
        string name
        string email UK
        string phone
        string password
        enum role "CUSTOMER, STAFF, ADMIN"
        boolean enabled
        datetime created_at
    }

    DEPARTMENTS {
        bigint id PK
        string name
        string code UK
        string description
        enum category "HOSPITAL, BANK, GOVERNMENT, CUSTOMER_SERVICE"
        int avg_service_time_minutes
        int daily_token_limit
        time opening_time
        time closing_time
        boolean is_active
    }

    COUNTERS {
        bigint id PK
        string counter_number
        string counter_name
        bigint department_id FK
        bigint current_staff_id FK
        enum status "ACTIVE, BUSY, ON_BREAK, INACTIVE"
    }

    TOKEN_SEQUENCES {
        bigint id PK
        bigint department_id FK
        date service_date
        bigint current_sequence
    }

    TOKENS {
        bigint id PK
        string token_number
        bigint token_sequence
        bigint department_id FK
        bigint customer_id FK
        bigint counter_id FK
        bigint staff_id FK
        enum priority "EMERGENCY, PERSON_WITH_DISABILITY, SENIOR_CITIZEN, NORMAL"
        enum status "WAITING, CALLED, SERVING, COMPLETED, CANCELLED, SKIPPED, NO_SHOW"
        date booking_date
        time booking_time
        datetime called_time
        datetime serving_start_time
        datetime completed_time
        int actual_duration_minutes
        string verification_code UK
        string notes
    }

    NOTIFICATIONS {
        bigint id PK
        bigint user_id FK
        string title
        string message
        string type
        boolean is_read
        datetime created_at
    }
```

---

## 4. Concurrency-Safe Sequence & Token Generation

To satisfy strict anti-collision requirements, the sequence mechanism guarantees:
1. No `MAX(token_number) + 1` race conditions.
2. A separate `token_sequences` table with composite unique constraint `(department_id, service_date)`.
3. Java `@Lock(LockModeType.PESSIMISTIC_WRITE)` executing inside `@Transactional(propagation = Propagation.REQUIRES_NEW)`.
4. Immediate commit of sequence counter so concurrent customer transactions serialize cleanly.

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Customer Browser
    participant API as CustomerController
    participant QSvc as QueueService
    participant SeqSvc as TokenSequenceService
    participant DB as MySQL DB (token_sequences)
    participant Broker as WebSocket Broker

    Customer->>API: POST /api/customer/tokens/book {deptId: 1, priority: NORMAL}
    API->>QSvc: bookToken(customer, request)
    QSvc->>QSvc: Check daily token limit & duplicate active booking
    QSvc->>SeqSvc: nextSequence(department, today)
    SeqSvc->>DB: SELECT FOR UPDATE WHERE dept_id=1 AND date=today
    Note over SeqSvc,DB: Row-level pessimistic lock acquired
    SeqSvc->>DB: UPDATE token_sequences SET current_sequence = current_sequence + 1
    SeqSvc-->>QSvc: Returns sequence number (e.g. 5) & formatted code (GM-005)
    QSvc->>DB: INSERT INTO tokens (GM-005, WAITING, UUID, ...)
    QSvc->>Broker: Broadcast queue update to /topic/queue/1
    QSvc-->>API: Returns TokenResponse + QR base64
    API-->>Customer: 200 OK Token Confirmed
```

---

## 5. Smart Waiting-Time Prediction Algorithm

Estimated waiting time is computed dynamically using:
- **$P$**: Number of customers ahead in queue for the same department and date with higher priority or earlier timestamp.
- **$C$**: Total active and busy counters currently serving that department:
  $$\text{Effective Counters } C_{\text{eff}} = \max(1, C_{\text{active}} + C_{\text{busy}})$$
- **$D_{\text{avg}}$**: Blended rolling average service duration:
  $$D_{\text{eff}} = \begin{cases} 
  0.7 \times \bar{D}_{\text{completed today}} + 0.3 \times D_{\text{configured default}}, & \text{if completed visits } \ge 1 \\
  D_{\text{configured default}}, & \text{otherwise}
  \end{cases}$$
- **Formula**:
  $$\text{Estimated Waiting Time (minutes)} = \max\left(2, \; \left\lceil \frac{P}{C_{\text{eff}}} \times D_{\text{eff}} \right\rceil\right)$$

This accounts for parallel desks serving in the same pool, and adapts dynamically as operators work faster or handle more complex cases throughout the day.

---

## 6. Priority Queue Triage

Customers are queued with an explicit multi-tiered rank:

| Priority Category | Rank | Use Cases | Precedence |
|---|:---:|---|---|
| **EMERGENCY** | 1 | Acute medical trauma, severe clinical distress | Called first by next open counter |
| **PERSON_WITH_DISABILITY** | 2 | Wheelchair users, visual/hearing impaired | Served ahead of general queue |
| **SENIOR_CITIZEN** | 3 | Elderly citizens (60+ years of age) | High-priority civic and banking service |
| **NORMAL** | 4 | Standard walk-in or booked appointment | Standard FIFO processing |
