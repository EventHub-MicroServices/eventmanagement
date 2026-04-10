# Infrastructure Platform (Umbrella Helm Chart)

This folder/repository (`eventmanagement-infra`) manages the complete infrastructure stack for the Event Management System. Instead of managing individual databases with raw Kubernetes manifests, this infrastructure is deployed as a single **Umbrella Helm Chart**.

## Core File Explanations

### 1. `Chart.yaml` (The Dependency Manager)
In Helm, `Chart.yaml` acts essentially like a `package.json` in Node or `requirements.txt` in Python. 
*   **What it does:** It tells Helm to reach out to the official Bitnami servers and download the exact, secure, production-tested charts for PostgreSQL, MongoDB, and Redis. It acts as the blueprint for what your infrastructure requires.

### 2. `values.yaml` (The Configuration Control Plane)
While `Chart.yaml` downloads the databases, `values.yaml` tells them how to behave. 
*   **What it does:** When Bitnami charts start up, they look for configuration overrides. Your `values.yaml` feeds them passwords, tells them to run as a single instance (`architecture: standalone`) instead of a massive cluster, and even contains your raw SQL initialization scripts.

### 3. `templates/` (Custom Manifests)
While Bitnami handles standard databases, your API Gateway routing is custom to your application.
*   **What it does:** This folder holds your custom Kubernetes YAMLs (like your Gateway `httproutes.yaml`). Helm will automatically take whatever is in this folder and deploy it alongside your databases seamlessly.

---

## Deployment Instructions

To deploy the entire infrastructure stack (Databases + Gateway) to your cluster concurrently:

1. **Download Dependencies:** Pull the Bitnami charts declared in `Chart.yaml` to your local environment.
   ```bash
   helm dependency update .
   ```

2. **Deploy the Chart:** Install the umbrella chart into Kubernetes.
   ```bash
   helm install eventmanagement-infra .
   ```

## Handling Database Initialization Scripts
Instead of managing a separate `init-db.sh` file and an external Kubernetes ConfigMap, Bitnami allows you to write your SQL directly into `values.yaml`. Bitnami will automatically handle generating the ConfigMap and passing it into Postgres for you!

```yaml
postgresql:
  primary:
    initdb:
      scripts:
        setup-databases.sql: |
          CREATE DATABASE booking_db;
          CREATE DATABASE events_db;
          CREATE DATABASE ai_db;
```
