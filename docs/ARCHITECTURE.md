# EVENT MANAGEMENT SYSTEM - ARCHITECTURE DOCUMENTATION

## TABLE OF CONTENTS
1. [Application Architecture (Development)](#1-application-architecture-development)
2. [Database Architecture](#2-database-architecture)
3. [DevOps/Infrastructure Architecture](#3-devopsinfrastructure-architecture)
4. [Service Communication Matrix](#4-service-communication-matrix)
5. [Data Flow Diagrams](#5-data-flow-diagrams)

---

# 1. APPLICATION ARCHITECTURE (DEVELOPMENT)

## Microservices Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                     EVENT MANAGEMENT SYSTEM                         │
│                      Microservices Architecture                      │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                                │
├──────────────────────────────────────────────────────────────────────┤
│  React.js (Vite)                                                     │
│  ├─ Components: Navbar, Events, Bookings, Login, Admin Dashboard   │
│  ├─ State: React Hooks, localStorage (user, token)                 │
│  ├─ Communication: Axios HTTP + Socket.io (Notifications)          │
│  └─ Runs: http://localhost:3000 (Dev) / Port 80 (K8s)             │
└──────────────────┬───────────────────────────────────────────────────┘
                   │
                   │ HTTP/REST + WebSocket
                   │
┌──────────────────▼───────────────────────────────────────────────────┐
│                   API GATEWAY LAYER                                  │
├──────────────────────────────────────────────────────────────────────┤
│  Kubernetes Gateway API (kgateway)                                   │
│  Port: 80 (HTTP)                                                     │
│  Routes requests to microservices                                    │
│  ├─ Path rewriting (/api/users → /)                                │
│  ├─ Load balancing                                                  │
│  └─ External IP: 172.31.20.240 (LoadBalancer)                      │
└──────────────────┬───────────────────────────────────┬────────────────┘
                   │                                   │
        ┌──────────┼──────────┬──────────┬───────────┬─┴────────┐
        │          │          │          │           │          │
┌───────▼────┐ ┌──▼─────┐ ┌──▼────┐ ┌──▼──┐ ┌──────▼─┐ ┌────▼────┐
│   USERS    │ │ EVENTS │ │BOOKING│ │ADMIN│ │ PAYMENT│ │ AI/TICKET│
│  SERVICE   │ │SERVICE │ │SERVICE│ │ SRV │ │SERVICE │ │ SERVICES │
│ :8001      │ │ :8002  │ │ :8003 │ │:8008│ │ :8004  │ │:8007/5/6 │
└────────────┘ └────────┘ └───────┘ └─────┘ └────────┘ └──────────┘
```

## Service Details

### 1. **Frontend Service**
- **Port**: 3000 (Dev) / 80 (K8s)
- **Framework**: React.js with Vite
- **Key Components**:
  - Home, Events, Bookings, Admin Dashboard, Login/Register
  - Navbar with theme toggle
  - Real-time notifications via Socket.io
- **APIs Called**:
  - POST /api/users/login, /register, /profile
  - GET /api/events/events, POST /api/events/events
  - POST /api/bookings/bookings
  - GET /api/payment, POST /api/payment
  - GET /api/admin/analytics
  - POST /api/ai/generate
  - WebSocket: /api/notifications (Socket.io)

---

### 2. **Users Service** (Port 8001)
- **Language**: Python (FastAPI)
- **Database**: PostgreSQL
- **Key Endpoints**:
  - POST /login
  - POST /register
  - GET /profile
  - POST /users
  - GET /users/{id}
- **Features**:
  - User authentication (OAuth2)
  - User profile management

---

### 3. **Events Service** (Port 8002)
- **Language**: Python (FastAPI)
- **Database**: MongoDB (team3-ns namespace)
- **Key Endpoints**:
  - GET /events (with search)
  - POST /events
  - GET /events/{id}
  - PUT /events/{id}
  - DELETE /events/{id}
- **Features**:
  - Event CRUD operations
  - Full-text search

---

### 4. **Booking Service** (Port 8003)
- **Language**: Python (FastAPI)
- **Database**: PostgreSQL
- **Key Endpoints**:
  - POST /bookings (create booking)
  - GET /bookings/user/{user_id}
  - GET /bookings/{id}
- **Features**:
  - Create bookings
  - Track user bookings
  - Message Queue: RabbitMQ integration

---

### 5. **Payment Service** (Port 8004)
- **Language**: Python (FastAPI)
- **Database**: PostgreSQL
- **Key Endpoints**:
  - POST /pay
  - GET /payments/{id}
  - POST /refund
- **Features**:
  - Process payments
  - Refund handling
  - Calls Booking & Ticket services

---

### 6. **Ticket Service** (Port 8005)
- **Language**: Python (FastAPI)
- **Database**: PostgreSQL
- **Key Endpoints**:
  - POST /tickets
  - GET /tickets/user/{user_id}
  - GET /tickets/{id}
- **Features**:
  - Generate tickets
  - Track user tickets
  - Calls Notification service

---

### 7. **Notification Service** (Port 8006)
- **Language**: Node.js (Express/Socket.io)
- **Database**: Redis
- **Key Features**:
  - Real-time WebSocket connections
  - Emit notifications to users
  - Broadcast booking/payment updates

---

### 8. **Admin Service** (Port 8008)
- **Language**: Python (FastAPI)
- **Key Endpoints**:
  - GET /analytics
  - POST /seed-data
- **Features**:
  - Platform analytics
  - Admin-only operations

---

### 9. **AI Service** (Port 8007)
- **Language**: Python (FastAPI)
- **External API**: Google Generative AI (Gemini)
- **Key Endpoints**:
  - POST /generate (AI event generation)
- **Features**:
  - AI-powered event suggestions
  - Generate event title/description from keywords

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React.js, Vite, Axios | UI & HTTP client |
| **API Gateway** | Kubernetes Gateway API | Request routing |
| **Backend** | FastAPI (Python) | Microservices |
| **Authentication** | OAuth2 (JWT) | User auth |
| **Message Queue** | RabbitMQ | Service messaging |
| **Caching** | Redis | Session/cache storage |
| **Real-time** | Socket.io | WebSocket notifications |
| **Logging** | System logs | Debugging |

---

# 2. DATABASE ARCHITECTURE

```
┌──────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                           │
│                   (Multi-Database Pattern)                  │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────────────────┐
│    PostgreSQL (Primary DB)      │
│    Default: localhost:5432      │
├─────────────────────────────────┤
│ users_db (Users Service)        │
│ ├─ users                        │
│ ├─ roles                        │
│ └─ permissions                  │
│                                 │
│ booking_db (Booking Service)    │
│ ├─ bookings                     │
│ ├─ booking_items                │
│ └─ booking_status               │
│                                 │
│ payment_db (Payment Service)    │
│ ├─ payments                     │
│ ├─ transactions                 │
│ └─ refunds                      │
│                                 │
│ ticket_db (Ticket Service)      │
│ ├─ tickets                      │
│ └─ ticket_metadata              │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│        MongoDB (K8s)            │
│   team3-ns/events-mongodb:27017 │
├─────────────────────────────────┤
│ events_db                       │
│ ├─ events (collection)          │
│ │   ├─ _id                      │
│ │   ├─ title                    │
│ │   ├─ description              │
│ │   ├─ date                     │
│ │   ├─ location                 │
│ │   ├─ capacity                 │
│ │   ├─ price                    │
│ │   ├─ organizer_id             │
│ │   ├─ image_url                │
│ │   └─ created_at               │
│ └─ [future collections]         │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│      Redis (Cache/Session)      │
│      localhost:6379             │
├─────────────────────────────────┤
│ Stores:                         │
│ ├─ Session tokens              │
│ ├─ User cache                  │
│ ├─ Rate limiting               │
│ └─ Real-time notification data  │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│    RabbitMQ (Message Queue)     │
│    localhost:5672 (AMQP)        │
│    localhost:15672 (Management) │
├─────────────────────────────────┤
│ Queues:                         │
│ ├─ booking_events              │
│ ├─ payment_events              │
│ ├─ ticket_events               │
│ └─ notification_events          │
└─────────────────────────────────┘
```

## Database Mapping

| Service | Database | Type | Purpose |
|---------|----------|------|---------|
| Users | PostgreSQL (users_db) | Relational | User accounts, auth |
| Events | MongoDB (events_db) | Document | Event listings |
| Bookings | PostgreSQL (booking_db) | Relational | Booking records |
| Payments | PostgreSQL (payment_db) | Relational | Transaction history |
| Tickets | PostgreSQL (ticket_db) | Relational | Ticket records |
| Notifications | Redis | Key-Value | Real-time data |
| Inter-service Communication | RabbitMQ | Message Queue | Event-driven architecture |

---

# 3. DEVOPS/INFRASTRUCTURE ARCHITECTURE

## Kubernetes Cluster Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│                      KUBERNETES CLUSTER                              │
│                         (3 Worker Nodes)                             │
└──────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      NAMESPACE: team3-ns                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  GATEWAY LAYER:                                                    │
│  ├─ Service: iyas-gateway (LoadBalancer)                          │
│  │  └─ External IP: 172.31.20.240, Port: 80                      │
│  │                                                                 │
│  ├─ Gateway Resource: event-gateway                               │
│  │  └─ gatewayClassName: kgateway                                 │
│  │                                                                 │
│  └─ HTTPRoutes:                                                   │
│     ├─ users-route → users-service:8001                           │
│     ├─ events-route → events-service:8002                         │
│     ├─ bookings-route → booking-service:8003                      │
│     ├─ payment-route → payment-service:8004                       │
│     ├─ tickets-route → ticket-service:8005                        │
│     ├─ notifications-route → notification-service:8006            │
│     ├─ ai-route → ai-service:8007                                 │
│     ├─ admin-route → admin-service:8008                           │
│     └─ frontend-route → frontend-service:80                       │
│                                                                     │
│  STATEFUL SERVICES:                                                │
│  ├─ StatefulSet: events-mongodb (1 replica)                       │
│  │  ├─ Pod: events-mongodb-0                                      │
│  │  ├─ Container: mongo:6.0                                       │
│  │  ├─ Port: 27017 (MongoDB)                                      │
│  │  ├─ Storage: PVC (mongo-data) 2Gi                              │
│  │  ├─ StorageClass: mongo-storageclass                           │
│  │  └─ Service: events-mongodb (Headless, ClusterIP: None)        │
│  │                                                                 │
│  ├─ Secret: mongodb-secret                                        │
│  │  ├─ MONGO_INITDB_ROOT_USERNAME: admin                          │
│  │  └─ MONGO_INITDB_ROOT_PASSWORD: adminpass                      │
│  │                                                                 │
│  DEPLOYMENTS (Microservices):                                      │
│  ├─ Deployment: events-deployment (3 replicas) 🚀                │
│  │  ├─ Container: team3kubectl/events-service:v1.1.0             │
│  │  ├─ Port: 8002                                                │
│  │  ├─ Config: events-config (ConfigMap)                         │
│  │  │  ├─ MONGO_HOST: events-mongodb                             │
│  │  │  ├─ MONGO_PORT: 27017                                      │
│  │  │  ├─ MONGO_DB: events_db                                    │
│  │  │  └─ MONGO_URI: mongodb://events-mongodb:27017/...          │
│  │  ├─ Secret: events-secret                                     │
│  │  ├─ Service: events-service (ClusterIP)                       │
│  │  ├─ Health Probes: startup, readiness, liveness               │
│  │  └─ Replicas: 3 pods                                          │
│  │                                                                 │
│  ├─ Deployment: users-deployment                                 │
│  │  ├─ Service: users-service:8001                               │
│  │  └─ Database: PostgreSQL (external)                            │
│  │                                                                 │
│  ├─ Deployment: booking-deployment                               │
│  │  ├─ Service: booking-service:8003                             │
│  │  ├─ Database: PostgreSQL (external)                            │
│  │  └─ Message Queue: RabbitMQ (external)                        │
│  │                                                                 │
│  ├─ Deployment: payment-deployment                               │
│  │  ├─ Service: payment-service:8004                             │
│  │  └─ Database: PostgreSQL (external)                            │
│  │                                                                 │
│  ├─ Deployment: ticket-deployment                                │
│  │  ├─ Service: ticket-service:8005                              │
│  │  └─ Database: PostgreSQL (external)                            │
│  │                                                                 │
│  ├─ Deployment: notification-deployment                          │
│  │  ├─ Service: notification-service:8006                        │
│  │  └─ Cache: Redis (external)                                   │
│  │                                                                 │
│  ├─ Deployment: ai-deployment                                    │
│  │  ├─ Service: ai-service:8007                                  │
│  │  └─ External API: Google Generative AI                        │
│  │                                                                 │
│  ├─ Deployment: admin-deployment                                 │
│  │  └─ Service: admin-service:8008                               │
│  │                                                                 │
│  └─ Deployment: frontend-deployment                              │
│     ├─ Service: frontend-service:80 (ClusterIP)                  │
│     └─ Container: frontend:latest (Nginx)                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│              EXTERNAL SERVICES (Outside K8s Cluster)                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Database Layer:                                                   │
│  ├─ PostgreSQL Server (localhost:5432 in Dev)                     │
│  │  ├─ users_db                                                  │
│  │  ├─ booking_db                                                │
│  │  ├─ payment_db                                                │
│  │  └─ ticket_db                                                 │
│  │                                                                 │
│  Message Queue:                                                   │
│  └─ RabbitMQ (localhost:5672 in Dev)                             │
│                                                                     │
│  Cache:                                                            │
│  └─ Redis (localhost:6379 in Dev)                                │
│                                                                     │
│  External APIs:                                                    │
│  └─ Google Generative AI (Gemini)                                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Infrastructure Components

### **Ingress & Gateway**
- **Gateway Type**: Kubernetes Gateway API (kgateway)
- **Service Type**: LoadBalancer
- **External IP**: 172.31.20.240
- **Port**: 80 (HTTP)
- **Routing**: HTTPRoute resources define path-based routing

### **Storage**
- **Type**: Custom StorageClass (mongo-storageclass)
- **MongoDB PVC**: mongo-data-events-mongodb-0 (2Gi)
- **Access Mode**: ReadWriteOnce
- **Path**: /data/db inside MongoDB pod

### **Health Checks**
- **Startup Probe**: Allows 30 attempts over 5 minutes
- **Readiness Probe**: Every 5 seconds (10 second initial delay)
- **Liveness Probe**: Every 10 seconds (30 second initial delay)

### **Resource Limits** (per events-service pod)
- **Requests**: 100m CPU, 128Mi Memory
- **Limits**: 300m CPU, 256Mi Memory

---

# 4. SERVICE COMMUNICATION MATRIX

## Internal Service-to-Service Communication

```
┌─────────────────┬──────────────┬──────────────────┬──────────────────┐
│ Source Service  │ Target       │ Protocol         │ Connection Type  │
├─────────────────┼──────────────┼──────────────────┼──────────────────┤
│ Frontend        │ API Gateway  │ HTTP/REST        │ HTTP Client      │
│ (3000/80)       │ (80)         │                  │ (axios)          │
├─────────────────┼──────────────┼──────────────────┼──────────────────┤
│ Frontend        │ Notification │ WebSocket        │ Socket.io        │
│ (3000/80)       │ Service      │                  │ Client           │
│                 │ (8006)       │                  │                  │
├─────────────────┼──────────────┼──────────────────┼──────────────────┤
│ Events Service  │ MongoDB      │ MongoDB Protocol │ MongoClient      │
│ (:8002)         │ (:27017)     │ (Port 27017)     │ (pymongo)        │
├─────────────────┼──────────────┼──────────────────┼──────────────────┤
│ Booking Service │ Events Svc   │ HTTP/REST        │ requests lib     │
│ (:8003)         │ (:8002)      │                  │                  │
├─────────────────┼──────────────┼──────────────────┼──────────────────┤
│ Booking Service │ RabbitMQ     │ AMQP             │ pika (Python)    │
│ (:8003)         │ (:5672)      │                  │                  │
├─────────────────┼──────────────┼──────────────────┼──────────────────┤
│ Payment Service │ Booking Svc  │ HTTP/REST        │ requests lib     │
│ (:8004)         │ (:8003)      │                  │                  │
├─────────────────┼──────────────┼──────────────────┼──────────────────┤
│ Payment Service │ Ticket Svc   │ HTTP/REST        │ requests lib     │
│ (:8004)         │ (:8005)      │                  │                  │
├─────────────────┼──────────────┼──────────────────┼──────────────────┤
│ Ticket Service  │ Notification │ HTTP/REST        │ requests lib     │
│ (:8005)         │ Service      │                  │                  │
│                 │ (:8006)      │                  │                  │
├─────────────────┼──────────────┼──────────────────┼──────────────────┤
│ Admin Service   │ Events Svc   │ HTTP/REST        │ requests lib     │
│ (:8008)         │ (:8002)      │                  │                  │
├─────────────────┼──────────────┼──────────────────┼──────────────────┤
│ Admin Service   │ Booking Svc  │ HTTP/REST        │ requests lib     │
│ (:8008)         │ (:8003)      │                  │                  │
└─────────────────┴──────────────┴──────────────────┴──────────────────┘
```

## Database Connection Matrix

```
┌──────────────────────┬──────────────────┬──────────────┬───────────────┐
│ Service              │ Database         │ Type         │ Connection    │
├──────────────────────┼──────────────────┼──────────────┼───────────────┤
│ Users Service        │ PostgreSQL       │ SQL          │ SQLAlchemy    │
│ (:8001)              │ (users_db)       │ Query        │ ORM           │
├──────────────────────┼──────────────────┼──────────────┼───────────────┤
│ Events Service       │ MongoDB          │ NoSQL        │ MongoClient / │
│ (:8002)              │ (events_db)      │ Document     │ pymongo       │
├──────────────────────┼──────────────────┼──────────────┼───────────────┤
│ Booking Service      │ PostgreSQL       │ SQL          │ SQLAlchemy    │
│ (:8003)              │ (booking_db)     │ Query        │ ORM           │
├──────────────────────┼──────────────────┼──────────────┼───────────────┤
│ Payment Service      │ PostgreSQL       │ SQL          │ SQLAlchemy    │
│ (:8004)              │ (payment_db)     │ Query        │ ORM           │
├──────────────────────┼──────────────────┼──────────────┼───────────────┤
│ Ticket Service       │ PostgreSQL       │ SQL          │ SQLAlchemy    │
│ (:8005)              │ (ticket_db)      │ Query        │ ORM           │
├──────────────────────┼──────────────────┼──────────────┼───────────────┤
│ Notification Service │ Redis            │ Key-Value    │ redis-py      │
│ (:8006)              │ (Cache/Session)  │ Store        │ (Node.js)     │
├──────────────────────┼──────────────────┼──────────────┼───────────────┤
│ Admin Service        │ (Aggregates)     │ -            │ REST calls    │
│ (:8008)              │ from others      │ -            │ to services   │
└──────────────────────┴──────────────────┴──────────────┴───────────────┘
```

---

# 5. DATA FLOW DIAGRAMS

## 5.1 User Registration Flow

```
┌─────────┐
│ Browser │
└────┬────┘
     │ 1. POST /api/users/register
     │    {username, email, password}
     │
     ▼
┌──────────────────┐
│   API Gateway    │
│ (Port 80)        │
└────┬─────────────┘
     │ Route to /api/users
     │
     ▼
┌──────────────────┐
│ Users Service    │
│ (:8001)          │
└────┬─────────────┘
     │ 3. Hash password + Create user
     │
     ▼
┌──────────────────────────┐
│ PostgreSQL (users_db)    │
│ INSERT INTO users ...    │
└────┬─────────────────────┘
     │ 4. Return user ID
     │
     ▼
┌──────────────────┐
│ Users Service    │
└────┬─────────────┘
     │ 5. Generate JWT token
     │
     ▼
┌─────────┐
│ Browser │
│ Store   │
│ token   │ ✓ Success
└─────────┘
```

## 5.2 Create Event Flow

```
Frontend                API Gateway         Events Service           MongoDB
   │                       │                     │                      │
   │ 1. POST /api/events   │                     │                      │
   │──────────────────────▶│                     │                      │
   │   {title, date, ...}  │                     │                      │
   │                       │ 2. Route /api/events                        │
   │                       │────────────────────▶│                       │
   │                       │                     │ 3. Validate event   │
   │                       │                     │ 4. Insert into events
   │                       │                     │──────────────────────▶│
   │                       │                     │                       │ 5. Save
   │                       │                     │◀──────────────────────│
   │                       │                     │ 6. Return event_id   │
   │                       │◀────────────────────│                       │
   │◀──────────────────────│                     │                       │
   │ Response: {id, ...}   │                     │                       │
   │ ✓ Event created       │                     │                       │
```

## 5.3 Booking → Payment → Ticket Flow

```
Frontend                 Booking Service      Payment Service      Ticket Service
   │                           │                    │                    │
   │ 1. POST /api/bookings    │                    │                    │
   │──────────────────────────▶│                    │                    │
   │ {user_id, event_id,qty}   │                    │                    │
   │                           │ 2. Create booking  │                    │
   │                           │ (Save to DB)       │                    │
   │                           │                    │                    │
   │                           │ 3. Emit RabbitMQ   │                    │
   │                           │ "booking.created"  │                    │
   │                           │                    │                    │
   │◀──────────────────────────│                    │                    │
   │ Booking ID returned       │                    │                    │
   │                           │                    │                    │
   │ 4. POST /api/payment/pay  │                    │                    │
   │──────────────────────────────────────────────▶│                    │
   │    {booking_id, amount}   │                    │ 5. Process payment│
   │                           │                    │ 6. Update booking │
   │                           │                    │────▶ (HTTP call)  │
   │                           │                    │                    │
   │                           │                    │ 7. Create ticket  │
   │                           │                    │   via API          │
   │                           │                    │──────────────────▶│
   │                           │                    │                    │
   │                           │                    │                    │ 8. Save ticket
   │◀────────────────────────────────────────────────────────────────────│
   │ ✓ Ticket generated        │                    │                    │
```

## 5.4 Real-time Notification Flow

```
Notification Service    Redis Cache          Browser (Frontend)
        │                     │                       │
        │ 1. User connects    │                       │
        │◀──────────────────────────────────────────▶│ Socket.io
        │ socket.emit('register', user_id)           │
        │                     │                       │
        │ 2. Store session    │                       │
        │────────────────────▶│                       │
        │                     │                       │
   [Event occurs: payment processed]                  │
        │                     │                       │
        │ 3. Retrieve user    │                       │
        │────────────────────▶│                       │
        │◀────────────────────│                       │
        │ user_socket_id      │                       │
        │                     │                       │
        │ 4. Emit notification│                       │
        │────────────────────────────────────────────▶│ WebSocket
        │ {type: "payment_success", ...}              │ Message
        │                     │                       │
        │                     │                ✓ Toast notification
```

---

# 6. COMPLETE END-TO-END CONNECTION FLOW

## 6.1 Full Request Flow (ALL Connections)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                         BROWSER / CLIENT                                     │
│                      (http://172.31.20.240:80)                              │
└──────────────────────────────┬───────────────────────────────────────────────┘
                               │
                               │ HTTP Request
                               │ GET /api/events
                               │ POST /api/bookings
                               │ WebSocket /api/notifications
                               ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│              KUBERNETES CLUSTER (team3-ns Namespace)                         │
│                                                                              │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ LOADBALANCER SERVICE: iyas-gateway (LoadBalancer)                        │ │
│ │ ├─ External IP: 172.31.20.240                                           │ │
│ │ └─ Port: 80 (HTTP)                                                      │ │
│ │                                                                          │ │
│ │ This service is the entry point for all external traffic                │ │
│ └──────────────────┬──────────────────────────────────────────────────────┘ │
│                    │ (Forwards traffic internally)                          │
│                    ▼                                                         │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ KUBERNETES GATEWAY API (event-gateway)                                   │ │
│ │ ├─ apiVersion: gateway.networking.k8s.io/v1                            │ │
│ │ ├─ kind: Gateway                                                        │ │
│ │ ├─ metadata.name: event-gateway                                         │ │
│ │ └─ spec:                                                                │ │
│ │    ├─ gatewayClassName: kgateway  ← Controller that processes this     │ │
│ │    └─ listeners:                                                        │ │
│ │       ├─ name: http                                                     │ │
│ │       ├─ protocol: HTTP                                                 │ │
│ │       └─ port: 80                                                       │ │
│ │                                                                          │ │
│ │ PURPOSE: Defines the gateway configuration & listening rules            │ │
│ └──────────────────┬──────────────────────────────────────────────────────┘ │
│                    │                                                         │
│                    │ "kgateway controller, please route these HTTP requests"│
│                    ▼                                                         │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ KGATEWAY CONTROLLER (Implementation)                                     │ │
│ │ ├─ Watches for Gateway & HTTPRoute resources                            │ │
│ │ ├─ Processes routing rules                                              │ │
│ │ ├─ Manages LoadBalancer service (iyas-gateway)                          │ │
│ │ └─ Forwards traffic to services based on HTTPRoutes                     │ │
│ │                                                                          │ │
│ │ This is the actual controller that executes the routing logic           │ │
│ └──────────────────┬──────────────────────────────────────────────────────┘ │
│                    │                                                         │
│                    │ "Based on HTTPRoutes, route to the right service"     │
│                    ▼                                                         │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ HTTPROUTES (Routing Rules) - Define how requests are routed             │ │
│ ├──────────────────────────────────────────────────────────────────────────┤ │
│ │                                                                          │ │
│ │ Request: GET /api/users/login                                           │ │
│ │ ├─ HTTPRoute: users-route                                               │ │
│ │ ├─ Match: PathPrefix: /api/users                                        │ │
│ │ ├─ Rewrite: /api/users → / (strip /api/users)                           │ │
│ │ └─ Backend: users-service:8001 ──────┐                                  │ │
│ │                                        │                                │ │
│ │ Request: GET /api/events                                                │ │
│ │ ├─ HTTPRoute: events-route                                              │ │
│ │ ├─ Match: PathPrefix: /api/events                                       │ │
│ │ ├─ Rewrite: /api/events → /                                             │ │
│ │ └─ Backend: events-service:8002 ──────┐                                 │ │
│ │                                        │                                │ │
│ │ Request: POST /api/bookings                                             │ │
│ │ ├─ HTTPRoute: bookings-route                                            │ │
│ │ ├─ Match: PathPrefix: /api/bookings                                     │ │
│ │ ├─ Rewrite: /api/bookings → /                                           │ │
│ │ └─ Backend: booking-service:8003 ────┐                                  │ │
│ │                                       │                                 │ │
│ │ Request: POST /api/payment                                              │ │
│ │ ├─ HTTPRoute: payment-route                                             │ │
│ │ └─ Backend: payment-service:8004 ────┐                                  │ │
│ │                                       │                                 │ │
│ │ Request: GET /api/tickets                                               │ │
│ │ ├─ HTTPRoute: tickets-route                                             │ │
│ │ └─ Backend: ticket-service:8005 ─────┐                                  │ │
│ │                                       │                                 │ │
│ │ Request: WebSocket /api/notifications                                   │ │
│ │ ├─ HTTPRoute: notifications-route                                       │ │
│ │ └─ Backend: notification-service:8006 ┐                                 │ │
│ │                                        │                                │ │
│ │ Request: POST /api/ai/generate                                          │ │
│ │ ├─ HTTPRoute: ai-route                                                  │ │
│ │ └─ Backend: ai-service:8007          ┐                                  │ │
│ │                                       │                                 │ │
│ │ Request: GET /api/admin/analytics                                       │ │
│ │ ├─ HTTPRoute: admin-route                                               │ │
│ │ └─ Backend: admin-service:8008       ┐                                  │ │
│ │                                       │                                 │ │
│ │ Request: GET /                                                          │ │
│ │ ├─ HTTPRoute: frontend-route                                            │ │
│ │ └─ Backend: frontend-service:80      ┐                                  │ │
│ │                                       │                                 │ │
│ └──────────────────────────────────────┼──────────────────────────────────┘ │
│                                         │                                   │
└─────────────────────────────────────────┼───────────────────────────────────┘
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    │                     │                     │
                    ▼                     ▼                     ▼
         ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
         │  Service Layer   │   │  Service Layer   │   │  Service Layer   │
         │                  │   │                  │   │                  │
         │ USERS SERVICE    │   │ EVENTS SERVICE   │   │BOOKING SERVICE   │
         │ :8001            │   │ :8002            │   │ :8003            │
         │                  │   │                  │   │                  │
         │ ┌──────────────┐ │   │ ┌──────────────┐ │   │ ┌──────────────┐ │
         │ │ FastAPI App  │ │   │ │ FastAPI App  │ │   │ │ FastAPI App  │ │
         │ ├──────────────┤ │   │ ├──────────────┤ │   │ ├──────────────┤ │
         │ │ POST /login  │ │   │ │ GET /events  │ │   │ │POST /bookings│ │
         │ │ POST /users  │ │   │ │ POST /events │ │   │ │ GET /booking │ │
         │ │ GET /profile │ │   │ │ GET /events/ │ │   │ │              │ │
         │ │              │ │   │ │  search      │ │   │ │→RabbitMQ:57  │ │
         │ └──────┬───────┘ │   │ └──────┬───────┘ │   │ └──────┬───────┘ │
         └────────┼─────────┘   └────────┼────────┘   └────────┼────────┘
                  │MongoDB        │        │Connection       │ (HTTP) │
                  │Connection     │        │                 │        │
                  │               ▼        ▼                 ▼        │
     ┌────────────▼────────────┐ │   ┌──────────────────┐   │   ┌────▼────────────┐
     │ PostgreSQL (Users DB)   │ │   │ MongoDB          │   │   │ RabbitMQ        │
     │ users_db                │ │   │ (events_db)      │   │   │ (:5672)         │
     │ ├─ users table          │ │   │ ├─ events coll  │   │   │ ├─ booking_queue│
     │ ├─ roles table          │ │   │ │   - title     │   │   │ ├─ payment_queue│
     │ └─ permissions          │ │   │ │   - date      │   │   │ └─ ticket_queue │
     └─────────────────────────┘ │   │ │   - capacity  │   │   └─────────────────┘
                                 │   │ └─ events coll  │   │
                      ┌──────────▼───┐         │       │   │
                      │ PostgreSQL   │         │       │   │
                      │(Users/Booking│    ┌────▼──────┐│   │
                      │ /Payment dbs)│    │StatefulSet││   │
                      └──────────────┘    │MongoDB:27 ││   │
                                         │017        ││   │
                                         │ events-mb-│┘   │
                                         │0          │    │
                                         └────┬──────┘    │
                                              │           │
                                              │MongoDB    │
                                              │Storage    │
                                              │(PVC:2Gi)  │
                                              ▼           │
                      ┌───────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┬──────────────┬──────────────┐
        │             │             │              │              │
        ▼             ▼             ▼              ▼              ▼
  ┌──────────┐ ┌──────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
  │ PAYMENT  │ │ TICKET   │ │NOTIFICATION│ │    AI      │ │   ADMIN    │
  │ SERVICE  │ │ SERVICE  │ │ SERVICE    │ │  SERVICE   │ │  SERVICE   │
  │ :8004    │ │ :8005    │ │ :8006      │ │  :8007     │ │  :8008     │
  │          │ │          │ │            │ │            │ │            │
  │(HTTP)→   │ │(HTTP) →  │ │ Socket.io  │ │ (HTTP) →   │ │ (HTTP) →   │
  │PostgreSQL│ │PostgreSQL│ │ Redis      │ │ Google API │ │ All other  │
  │payment_db│ │ticket_db │ │ (:6379)    │ │ (Gemini)   │ │ services   │
  └──────────┘ └──────────┘ └────────────┘ └────────────┘ └────────────┘
        │             │             │              │              │
        └─────────────┼─────────────┴──────────────┴──────────────┘
                      │
                      │ All responses sent back through
                      │ API Gateway → kgateway → LoadBalancer
                      │
                      ▼
            ┌──────────────────────┐
            │ Response to Browser  │
            │ JSON/WebSocket msg   │
            │ ✓ Status 200         │
            │ ✓ Data received      │
            └──────────────────────┘

```

---

## 6.2 Complete Connection Reference Table

```
┌────────────────────────────────────────────────────────────────────────────┐
│                   ALL CONNECTIONS IN THE SYSTEM                           │
├──────────┬──────────────┬──────────────┬───────────────┬──────────────────┤
│  #  │ FROM              │ TO                │ METHOD    │ DESCRIPTION      │
├─────┼───────────────────┼──────────────────┼───────────┼──────────────────┤
│  1  │ Browser           │ iyas-gateway      │ HTTP      │ External entry   │
│     │ (Client)          │ Port 80           │ Request   │ point            │
├─────┼───────────────────┼──────────────────┼───────────┼──────────────────┤
│  2  │ iyas-gateway      │ kgateway          │ K8s Svc   │ Routes to        │
│     │ (LoadBalancer)    │ Controller        │ Selection │ controller       │
├─────┼───────────────────┼──────────────────┼───────────┼──────────────────┤
│  3  │ kgateway          │ HTTPRoutes        │ Config    │ Checks routing   │
│     │ Controller        │ (yaml)            │ Lookup    │ rules            │
├─────┼───────────────────┼──────────────────┼───────────┼──────────────────┤
│  4  │ kgateway          │ users-service     │ HTTP      │ /api/users/* →   │
│     │                   │ (:8001)           │ Forward   │ users-service    │
├─────┼───────────────────┼──────────────────┼───────────┼──────────────────┤
│  5  │ kgateway          │ events-service    │ HTTP      │ /api/events/* →  │
│     │                   │ (:8002)           │ Forward   │ events-service   │
├─────┼───────────────────┼──────────────────┼───────────┼──────────────────┤
│  6  │ kgateway          │ booking-service   │ HTTP      │ /api/bookings/*→ │
│     │                   │ (:8003)           │ Forward   │ booking-service  │
├─────┼───────────────────┼──────────────────┼───────────┼──────────────────┤
│  7  │ kgateway          │ payment-service   │ HTTP      │ /api/payment/* →  │
│     │                   │ (:8004)           │ Forward   │ payment-service  │
├─────┼───────────────────┼──────────────────┼───────────┼──────────────────┤
│  8  │ kgateway          │ ticket-service    │ HTTP      │ /api/tickets/* →  │
│     │                   │ (:8005)           │ Forward   │ ticket-service   │
├─────┼───────────────────┼──────────────────┼───────────┼──────────────────┤
│  9  │ kgateway          │ notification-svc  │ WebSocket │ /api/notifications│
│     │                   │ (:8006)           │ Upgrade   │ → notification   │
├─────┼───────────────────┼──────────────────┼───────────┼──────────────────┤
│ 10  │ kgateway          │ ai-service        │ HTTP      │ /api/ai/* →      │
│     │                   │ (:8007)           │ Forward   │ ai-service       │
├─────┼───────────────────┼──────────────────┼───────────┼──────────────────┤
│ 11  │ kgateway          │ admin-service     │ HTTP      │ /api/admin/* →   │
│     │                   │ (:8008)           │ Forward   │ admin-service    │
├─────┼───────────────────┼──────────────────┼───────────┼──────────────────┤
│ 12  │ kgateway          │ frontend-service  │ HTTP      │ / → frontend     │
│     │                   │ (:80)             │ Forward   │ (React app)      │
├─────┼───────────────────┼──────────────────┼───────────┼──────────────────┤
│ 13  │ users-service     │ PostgreSQL        │ SQL       │ User data        │
│     │ (:8001)           │ users_db:5432     │ Query     │ storage          │
├─────┼───────────────────┼──────────────────┼───────────┼──────────────────┤
│ 14  │ events-service    │ MongoDB           │ Mongo DB  │ Event data       │
│     │ (:8002)           │ :27017            │ Protocol  │ storage          │
├─────┼───────────────────┼──────────────────┼───────────┼──────────────────┤
│ 15  │ booking-service   │ PostgreSQL        │ SQL       │ Booking data     │
│     │ (:8003)           │ booking_db:5432   │ Query     │ storage          │
├─────┼───────────────────┼──────────────────┼───────────┼──────────────────┤
│ 16  │ booking-service   │ RabbitMQ          │ AMQP      │ Publish booking  │
│     │ (:8003)           │ (:5672)           │ Message   │ events           │
├─────┼───────────────────┼──────────────────┼───────────┼──────────────────┤
│ 17  │ payment-service   │ PostgreSQL        │ SQL       │ Payment data     │
│     │ (:8004)           │ payment_db:5432   │ Query     │ storage          │
├─────┼───────────────────┼──────────────────┼───────────┼──────────────────┤
│ 18  │ payment-service   │ booking-service   │ HTTP      │ Update booking   │
│     │ (:8004)           │ (:8003)           │ REST call │ status           │
├─────┼───────────────────┼──────────────────┼───────────┼──────────────────┤
│ 19  │ payment-service   │ ticket-service    │ HTTP      │ Create ticket    │
│     │ (:8004)           │ (:8005)           │ REST call │ after payment    │
├─────┼───────────────────┼──────────────────┼───────────┼──────────────────┤
│ 20  │ ticket-service    │ PostgreSQL        │ SQL       │ Ticket data      │
│     │ (:8005)           │ ticket_db:5432    │ Query     │ storage          │
├─────┼───────────────────┼──────────────────┼───────────┼──────────────────┤
│ 21  │ ticket-service    │ notification-svc  │ HTTP      │ Notify user of   │
│     │ (:8005)           │ (:8006)           │ REST call │ new ticket       │
├─────┼───────────────────┼──────────────────┼───────────┼──────────────────┤
│ 22  │ notification-svc  │ Redis             │ Key-Value │ Cache sessions & │
│     │ (:8006)           │ (:6379)           │ Store     │ notification data│
├─────┼───────────────────┼──────────────────┼───────────┼──────────────────┤
│ 23  │ notification-svc  │ Browser           │ WebSocket │ Emit real-time   │
│     │ (:8006)           │ (Client)          │ Message   │ notifications    │
├─────┼───────────────────┼──────────────────┼───────────┼──────────────────┤
│ 24  │ ai-service        │ Google Gemini API │ HTTPS     │ AI event gen     │
│     │ (:8007)           │ (External)        │ REST call │ from keywords    │
├─────┼───────────────────┼──────────────────┼───────────┼──────────────────┤
│ 25  │ admin-service     │ events-service    │ HTTP      │ Fetch analytics  │
│     │ (:8008)           │ (:8002)           │ REST call │ from all services│
├─────┼───────────────────┼──────────────────┼───────────┼──────────────────┤
│ 26  │ admin-service     │ booking-service   │ HTTP      │ Fetch booking    │
│     │ (:8008)           │ (:8003)           │ REST call │ analytics        │
├─────┼───────────────────┼──────────────────┼───────────┼──────────────────┤
│ 27  │ Browser           │ notification-svc  │ WebSocket │ Monitor live     │
│     │ (Frontend)        │ (Socket.io)       │ Listen    │ events           │
└─────┴───────────────────┴──────────────────┴───────────┴──────────────────┘
```

---

## 6.3 Key Concepts Explained

### **Three-Layer Routing System**

```
LAYER 1: External Entry
┌─────────────────────────┐
│ iyas-gateway Service    │
│ (LoadBalancer)          │
│ Exposes: 172.31.20.240:80
└────────────┬────────────┘
             │ K8s routes to
             ▼
LAYER 2: Gateway Controller
┌─────────────────────────┐
│ kgateway                │
│ (Implementation that    │
│  processes Gateway      │
│  resources)             │
└────────────┬────────────┘
             │ Reads routing rules from
             ▼
LAYER 3: Routing Rules
┌─────────────────────────┐
│ HTTPRoutes (YAML)       │
│ ├─ users-route          │
│ ├─ events-route         │
│ ├─ bookings-route       │
│ └─ ... 8 total routes   │
└─────────────────────────┘
```

### **Path Rewriting Example**

```
Client Request:    GET /api/events/events?search=tech
               ↓
HTTPRoute Match:   /api/events/*  ✓ Match!
               ↓
Path Rewrite:      /api/events → / (strip prefix)
               ↓
Forward to:        events-service:8002/events?search=tech
               ↓
Service Handler:   FastAPI route: GET /events
```

---

## Key Takeaways

```
┌─────────────────────────────────────────────────────────────┐
│ TRAFFIC FLOW SUMMARY                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Browser → LoadBalancer (iyas-gateway)                      │
│ ↓                                                           │
│ kgateway Controller (processes routing)                    │
│ ↓                                                           │
│ HTTPRoutes (defines where to send each path)              │
│ ↓                                                           │
│ 8 Microservices (processes business logic)                 │
│ ↓                                                           │
│ Databases (store & retrieve data)                         │
│ ↓                                                           │
│ Response → Gateway → LoadBalancer → Browser ✓             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Points

✅ **iyas-gateway** = LoadBalancer service (external IP)  
✅ **kgateway** = Controller that implements routing logic  
✅ **Gateway API** = Standard Kubernetes resource type  
✅ **HTTPRoutes** = Define where each path goes  
✅ **27 connections** between all components  
✅ **Databases** handle persistence  
✅ **RabbitMQ** handles async processing  
✅ **Redis** caches & stores sessions  
✅ **WebSocket** enables real-time updates  

---

## Key Points Summary

### **Communication Protocols**
- **HTTP/REST**: Service-to-service API calls
- **WebSocket (Socket.io)**: Real-time notifications
- **MongoDB Protocol**: Direct database protocol
- **AMQP**: RabbitMQ message queue

### **Request Flow**
1. Frontend → API Gateway (80)
2. API Gateway routes to microservices (8001-8008)
3. Microservices communicate with databases
4. Real-time updates via WebSocket

### **Data Storage**
- **Relational Data**: PostgreSQL (normalized)
- **Document Data**: MongoDB (flexible schema)
- **Cache/Sessions**: Redis (fast access)

### **Scalability**
- Multiple service replicas in K8s
- Load balancing via API Gateway
- Database connections pooled
- RabbitMQ for async processing

---

## File Locations in Project
- **Frontend**: `/frontend/`
- **Services**: `/[service-name]/`
- **Kubernetes**: `/k8s/`
  - Gateway: `/k8s/gateway/`
  - MongoDB: `/k8s/mongodb/`
- **Docker Compose**: `/docker-compose.yml` (development)
