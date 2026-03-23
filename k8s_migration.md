# Kubernetes Migration Checklist

To migrate this setup to Kubernetes, you need several key architectural changes.

### 1. Database Management
- **Managed Database**: Instead of a shared container, use a managed Postgres service (AWS RDS, Google Cloud SQL) or a K8s Operator (e.g., CloudNativePG).
- **Secrets**: Use K8s `Secrets` to store `DB_USER` and `DB_PASSWORD`.
  ```yaml
  apiVersion: v1
  kind: Secret
  metadata:
    name: db-credentials
  stringData:
    username: admin
    password: adminpass
  ```

### 2. Configuration & Networking
- **ConfigMaps**: Use `ConfigMaps` for non-sensitive values like `DB_HOST`, `DB_PORT`, and service URLs.
- **Internal Services**: Replace direct URLs (`http://events-service:8002`) with K8s internal `Service` names (e.g., `http://events-service`). K8s DNS handles the discovery.

### 3. Scaling & Persistence
- **StatefulSets**: If running Postgres inside K8s, use a `StatefulSet` with `PersistentVolumeClaims`.
- **Deployments**: Each microservice will be a `Deployment` with a specific `ImageTag`.

### 4. Ingress & Load Balancing
- **Ingress Controller**: Use Nginx Ingress or an ALB to expose the `frontend` and route `/api` calls.

### Immediate Action for Local Postgres
> [!IMPORTANT]
> To apply the **Postgres migration** locally right now:
> 1. Run `docker-compose up --build -d`
> 2. The databases will be created automatically via `init-db.sh`.
