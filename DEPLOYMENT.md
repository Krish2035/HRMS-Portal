# HRMS Portal - Deployment & Operations Guide

## 1. Local Development (Docker Compose)

### 1.1 Start Database & Cache
```powershell
# Copy environment configuration
cp .env.example .env

# Start PostgreSQL 16 and Redis 7 in background
docker compose up -d postgres redis
```

### 1.2 Run Database Migrations & Seed
```powershell
cd backend
npm run db:migrate
npm run db:seed
```

### 1.3 Start Applications
```powershell
# In terminal 1 (Backend API - http://localhost:5000):
cd backend
npm run dev

# In terminal 2 (Employee Portal - http://localhost:3000):
cd frontend/employee-app
npm run dev

# In terminal 3 (Admin Portal - http://localhost:5173):
cd frontend/admin-app
npm run dev
```

---

## 2. Full Containerized Stack with NGINX Gateway

Run all services together behind the NGINX load balancer:
```powershell
docker compose up --build -d
```
- Gateway URL: `http://localhost:80`
- API Health Check: `http://localhost:80/health/readiness`
- Employee Portal: `http://localhost:80/`
- Admin Portal: `http://localhost:80/admin/`

---

## 3. Kubernetes Deployment

### 3.1 Prerequisites
- Kubernetes 1.28+ cluster (Minikube, Kind, EKS, or GKE)
- `kubectl` configured with cluster access
- NGINX Ingress Controller installed

### 3.2 Apply Manifests in Sequence
```bash
# 1. Create isolated namespace
kubectl apply -f infrastructure/k8s/namespace.yaml

# 2. Apply ConfigMap and Secrets
kubectl apply -f infrastructure/k8s/configmap.yaml
kubectl apply -f infrastructure/k8s/secrets.yaml

# 3. Deploy Backend and HPA
kubectl apply -f infrastructure/k8s/backend-deployment.yaml
kubectl apply -f infrastructure/k8s/backend-hpa.yaml

# 4. Deploy Frontends (Employee & Admin Portals)
kubectl apply -f infrastructure/k8s/frontend-deployments.yaml

# 5. Apply Ingress Controller Routing
kubectl apply -f infrastructure/k8s/ingress.yaml
```

### 3.3 Verify Deployment Status
```bash
kubectl get pods -n hrms-portal
kubectl get services -n hrms-portal
kubectl get hpa -n hrms-portal
```

---

## 4. Database Backup & Disaster Recovery Runbook

### 4.1 Scheduled Logical Backup (`pg_dump`)
Run a compressed backup of the authoritative PostgreSQL database:
```bash
docker exec -t hrms_postgres pg_dump -U postgres -F c -b -v -f /tmp/hrms_db_backup_$(date +%Y%m%d_%H%M%S).dump hrms_db
```

### 4.2 Restoring from Backup (`pg_restore`)
```bash
# 1. Copy backup file into container or database host
docker cp /path/to/backup.dump hrms_postgres:/tmp/restore.dump

# 2. Terminate existing connections and restore
docker exec -t hrms_postgres psql -U postgres -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'hrms_db' AND pid <> pg_backend_pid();"
docker exec -t hrms_postgres pg_restore -U postgres -d hrms_db --clean --if-exists /tmp/restore.dump
```

### 4.3 Disaster Recovery Verification
1. Check readiness endpoint: `curl http://localhost:5000/health/readiness`.
2. Verify active work session index:
   ```sql
   SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'work_sessions';
   ```
