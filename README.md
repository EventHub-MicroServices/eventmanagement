# Event Management System - Architecture & Migration Guide

## Overview

This document outlines the architectural migration of the Event Management system from a monolithic repository structure to a distributed, multi-repository organization. It details the setup of continuous integration and continuous deployment (CI/CD) pipelines, as well as the implementation of an Umbrella Helm Chart for infrastructure deployment.

---

## 1. Multi-Repository Architecture

The project is structured within a dedicated GitHub Organization to ensure strict separation of concerns. The architecture consists of ten distinct repositories:

*   **`eventmanagement-infra`**: Centralized repository for all infrastructure components, databases, and the API Gateway.
*   **Microservice Repositories**:
    *   `admin-service`
    *   `ai-service`
    *   `booking-service`
    *   `events-service`
    *   `frontend-service`
    *   `notification-service`
    *   `payment-service`
    *   `ticket-service`
    *   `users-service`

### 1.1 Microservice Repository Structure

Each microservice repository is entirely self-contained. The internal structure conforms to the following standard:

```text
/
├── src/                          # Application source code
├── helm/                         # Service-specific Helm chart
├── Dockerfile                    # Containerization instructions
├── .env.example                  # Environment variables specific to the service
└── .github/workflows/ci-cd.yaml  # Automated deployment pipeline
```

---

## 2. Infrastructure Management (Umbrella Helm Chart)

The infrastructure layer is orchestrated using an **Umbrella Helm Chart**. This pattern centralizes the management of all infrastructure components—third-party databases and custom API gateways—into a single deployable unit. 

### 2.1 The Bitnami Ecosystem Integration

**Why Bitnami Integration?** 
Provisioning stateful services (e.g., PostgreSQL, Redis, MongoDB) natively in Kubernetes requires complex and error-prone `StatefulSet`, `PersistentVolumeClaim`, and `Service` manifest definitions. Bitnami provides pre-packaged, securely curated, and continuously updated Helm charts for open-source software. Leveraging Bitnami charts eliminates the overhead of managing raw manifests and ensures alignment with industry security standards.

**Implementation Strategy:**
Instead of installing these databases individually, they are declared as dependencies within the `eventmanagement-infra` repository. During deployment, the Helm engine automatically fetches the Bitnami packages and provisions them based on centralized overrides defined in `values.yaml`.

### 2.2 Infrastructure Repository Structure

The `eventmanagement-infra` repository maps the dependencies effectively as follows:

```text
/ 
├── .github/
│   └── workflows/
│       └── infra-deploy.yaml   # Automated deployment pipeline for infrastructure
├── Chart.yaml                  # Declares PostgreSQL, MongoDB, and Redis Bitnami dependencies
├── values.yaml                 # Controls Bitnami configurations (e.g., setting replica count to 1)
├── README.md                   # Documentation specific to the infrastructure repository
└── templates/
    ├── gateway.yaml            # Custom API Gateway implementation
    └── httproutes.yaml         # Internal network traffic routing to microservices
```

### 2.3 Dependency Definitions (`Chart.yaml`)

The `Chart.yaml` file natively declares which specific versions of Bitnami data stores to utilize for the infrastructure stack.

```yaml
apiVersion: v2
name: eventmanagement-infra
description: Centralized infrastructure deployment for the Event Management System
type: application
version: 1.0.0
dependencies:
  - name: postgresql
    version: "15.x.x"
    repository: "https://charts.bitnami.com/bitnami"
  - name: mongodb
    version: "14.x.x"
    repository: "https://charts.bitnami.com/bitnami"
  - name: redis
    version: "18.x.x"
    repository: "https://charts.bitnami.com/bitnami"
```

### 2.4 Bitnami Execution Overrides (`values.yaml`)

By default, Bitnami charts attempt to provision highly available clusters. To optimize computational resources for this deployment, database dependencies are explicitly configured to execute as single, standalone replicas using the `architecture: standalone` parameter.

```yaml
# Bitnami PostgreSQL Configuration
postgresql:
  architecture: standalone
  auth:
    postgresPassword: "supersecretpassword"
    database: "users_db"

# Bitnami MongoDB Configuration
mongodb:
  architecture: standalone
  auth:
    rootPassword: "supersecretpassword"

# Bitnami Redis Configuration
redis:
  architecture: standalone
  auth:
    password: "supersecretpassword"
```
### 2.4 Infrastructure Deployment

The entire stack, including the API Gateway located in the `templates/` directory, is deployed concurrently via the Helm CLI:

```bash
helm dependency update .
helm install eventmanagement-infra .
```

---

## 3. Automation and CI/CD Pipeline

Each microservice implements a strict CI/CD pipeline utilizing GitHub Actions. The pipeline enforces code quality, automates containerization, and executes continuous deployment to the target Kubernetes environment.

### 3.1 Pipeline Stages

1.  **Static Application Security Testing (SAST)**: Pre-build code analysis using Semgrep.
2.  **Containerization**: Docker image build and push to Docker Hub, tagged via the Git commit SHA.
3.  **Software Composition Analysis (SCA)**: Post-build container vulnerability scanning using Trivy.
4.  **Continuous Deployment (CD)**: Automated Helm upgrades to the Kubernetes cluster.

### 3.2 Pipeline Definition

The following workflow is standardized in `.github/workflows/ci-cd.yaml` across all microservice repositories:

```yaml
name: Microservice Build and Release Pipeline

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

env:
  DOCKER_IMAGE: your-dockerhub-username/events-service
  HELM_RELEASE_NAME: events-service
  NAMESPACE: default

jobs:
  sast-code-scan:
    name: Code Security Analysis (SAST)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Execute Semgrep SAST
        uses: returntocorp/semgrep-action@v1
        with:
          generateSarif: "1"

  build-and-push:
    name: Container Build & Registry Push
    needs: sast-code-scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Authenticate with Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Build and Push Docker Image
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: |
            ${{ env.DOCKER_IMAGE }}:latest
            ${{ env.DOCKER_IMAGE }}:${{ github.sha }}

  sca-container-scan:
    name: Container Vulnerability Analysis (SCA)
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: Execute Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: '${{ env.DOCKER_IMAGE }}:${{ github.sha }}'
          format: 'table'
          exit-code: '1'
          severity: 'CRITICAL,HIGH'

  deploy-to-kubernetes:
    name: Helm Deployment
    needs: sca-container-scan
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3

      - name: Configure Kubernetes Context
        uses: azure/k8s-set-context@v3
        with:
          method: kubeconfig
          kubeconfig: ${{ secrets.KUBECONFIG }}

      - name: Execute Helm Upgrade
        run: |
          helm upgrade --install ${{ env.HELM_RELEASE_NAME }} ./helm \
            --namespace ${{ env.NAMESPACE }} \
            --set image.repository=${{ env.DOCKER_IMAGE }} \
            --set image.tag=${{ github.sha }}
```

### 3.3 Required Organizational Secrets

This pipeline requires the following secrets provisioned at the Organization or Repository level within GitHub:

*   `DOCKERHUB_USERNAME`: Docker registry authentication identity.
*   `DOCKERHUB_TOKEN`: Docker registry authentication token.
*   `KUBECONFIG`: Encoded administrative kubeconfig for Kubernetes cluster access.
