# Kubernetes ConfigMap & Secret Data Blocks

These are the exact `data` (for ConfigMaps) and `stringData` (for Secrets) blocks you should copy into your respective Kubernetes YAML files. Because your Python code is now updated, these granular variables will be correctly re-assembled into connection strings inside the containers exactly as you want!

> **Note:** Just make sure your Deployment files (`deployment.yaml`) use `envFrom` to pull in both the config map and the secret for the respective service. The Python code will do all the heavy lifting of piecing them together!

---

## 🐇 Shared Infrastructure (RabbitMQ)
Since all services connect to RabbitMQ, you can define one shared config and secret for it, and then mount it (`envFrom`) across all deployments.

### `rabbitmq-configmap.yaml`
```yaml
data:
  RABBITMQ_HOST: "rabbitmq"
  RABBITMQ_PORT: "5672"
```

### `rabbitmq-secret.yaml`
```yaml
stringData:
  RABBITMQ_USER: "guest"
  RABBITMQ_PASSWORD: "guest"
```

---

## 1. 📅 Events Service
### `events-configmap.yaml`
```yaml
data:
  PORT: "8002"
  MONGO_HOST: "events-db"
  MONGO_PORT: "27017"
```

### `events-secret.yaml`
```yaml
stringData:
  MONGO_USER: "root"
  MONGO_PASSWORD: "password"
  MONGO_INITDB_ROOT_USERNAME: "root"
  MONGO_INITDB_ROOT_PASSWORD: "password"
```

---

## 2. 🏨 Booking Service
### `booking-configmap.yaml`
```yaml
data:
  PORT: "8003"
  DB_HOST: "booking-db"
  DB_PORT: "3306"
  DB_NAME: "booking_db"
  EVENTS_SERVICE_URL: "http://events-service:8002"
```

### `booking-secret.yaml`
```yaml
stringData:
  DB_USER: "root"
  DB_PASSWORD: "password"
```

---

## 3. 💳 Payment Service
### `payment-configmap.yaml`
```yaml
data:
  PORT: "8004"
  DB_HOST: "payment-db"
  DB_PORT: "5432"
  DB_NAME: "payment_db"
  BOOKING_SERVICE_URL: "http://booking-service:8003"
  TICKET_SERVICE_URL: "http://ticket-service:8005"
```

### `payment-secret.yaml`
```yaml
stringData:
  DB_USER: "user"
  DB_PASSWORD: "password"
```

---

## 4. 🎟️ Ticket Service
### `ticket-configmap.yaml`
```yaml
data:
  PORT: "8005"
  DB_HOST: "ticket-db"
  DB_PORT: "5432"
  DB_NAME: "ticket_db"
  NOTIFICATION_SERVICE_URL: "http://notification-service:8006"
```

### `ticket-secret.yaml`
```yaml
stringData:
  DB_USER: "user"
  DB_PASSWORD: "password"
```

---

## 5. 👥 Users Service
### `users-configmap.yaml`
```yaml
data:
  PORT: "8001"
  DB_HOST: "users-db"
  DB_PORT: "5432"
  DB_NAME: "users_db"
```

### `users-secret.yaml`
```yaml
stringData:
  DB_USER: "user"
  DB_PASSWORD: "password"
  SECRET_KEY: "supersecretkey"  # Explicitly defining JWT secret key
```

---

## 6. 🔔 Notification Service
### `notification-configmap.yaml`
```yaml
data:
  PORT: "8006"
  REDIS_HOST: "notification-redis"
  REDIS_PORT: "6379"
  DB_HOST: "notification-db"
  DB_PORT: "5432"
  DB_NAME: "notification_db"
```

### `notification-secret.yaml`
```yaml
stringData:
  DB_USER: "user"
  DB_PASSWORD: "password"
```

---

## 7. 🤖 AI Service
### `ai-configmap.yaml`
```yaml
data:
  PORT: "8007"
  GEMINI_MODEL: "gemini-flash-latest"
```

### `ai-secret.yaml`
```yaml
stringData:
  GOOGLE_API_KEY: "your_real_gemini_api_key"
```

---

## 8. 🛠️ Admin Service
### `admin-configmap.yaml`
```yaml
data:
  PORT: "8008"
  BOOKING_SERVICE_URL: "http://booking-service:8003"
  EVENTS_SERVICE_URL: "http://events-service:8002"
```

### `admin-secret.yaml`
```yaml
stringData:   # Usually empty unless admin has specific secrets, but attach rabbitmq-secret via envFrom!
```
