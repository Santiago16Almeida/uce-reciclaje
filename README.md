# UCE Microservices Project - Recycling Management

A highly available distributed system designed for managing recycling processes, composed of **10 microservices** developed in **NestJS**, orchestrated using **Nx**, and deployed on **AWS** with **Docker**.


## Network Architecture and Security
The project implements a layered architecture to ensure security and performance in production:

1. **Edge Layer (Cloudflare):** DNS management, DDoS protection, and SSL termination (HTTPS).

2. **Load Balancing Layer (AWS ALB):** Traffic distribution to the EC2 instance.

3. **Application Layer (Docker):** 11 microservices running in isolated containers.

4. **Data Layer (Supabase):** External PostgreSQL database with automatic scalability.

---

###  List of Deployed Microservices
1. **api-gateway**: Request orchestration and routing (Port 3000).

2. **auth-service**: Identity management, JWT tokens, and security.

3. **user-service**: User profile and role management.

4. **deposit-service**: Registration and validation of material deposits.

5. **recycling-service**: Core logic for material processing.

6. **reward-service**: Calculation and allocation of recycling points.

7. **notification-service**: Alert and messaging system.

8. **report-service**: Data analysis and metrics generation.

9. **audit-service**: Historical record of actions and security.

10. **iot-gateway**: Interface for integration with scales and sensors.

11. **health-service**: Availability monitoring (Liveness/Readiness).

---

## Technology Stack
* **Runtime:** Node.js 20 (LTS)
* **Framework:** NestJS & TypeScript
* **Monorepo System:** Nx Build Tool
* **Cloud & Infrastructure:** AWS (EC2, ECR, VPC, Load Balancer)
* **Containers:** Docker & Docker Compose
* **CI/CD:** GitHub Actions
* **n8n:** n8n to send email notifications each time the student is enabled to redeem accumulated points

---

## Production Deployment Guide

### 1. Preparing the EC2 Instance
It is essential to update the credentials of the active AWS Academy/Vocareum session before attempting to download the images:
```bash
aws configure
# Enter current Access Key, Secret Key, and Session Token

2. Authenticating with the ECR Registry
Run the following command to authorize Docker to connect to the image repository AWS:
`aws ecr get-login-password --region us-east-1 | sudo docker login --username AWS --password-stdin 058264216258.dkr.ecr.us-east-1.amazonaws.com`


3. Ecosystem Launch
Use the orchestration script to download the latest images and start the 11 services along with their databases:
`chmod +x start_microservices.sh`
`./start_microservices.sh`

Applied Optimizations
`Immutable Images: Docker container-based deployment for consistency across environments.`

`Artifact Cleanup:` Use of `.dockerignore` to remove end-to-end folders and development dependencies, reducing the image size by 45%.

`Build System:` Optimized bulk builds using Nx caching in the GitHub Actions pipeline.`

``` Support and Diagnostic Commands
Network and container status: `sudo docker ps`

Real-time logs (Auth Service): `sudo docker logs -f auth-service`

Emergency restart: `sudo docker-compose down && ./levantar_microservicios.sh`

Last updated: January 16, 2026

Environment: Production / AWS Cloud