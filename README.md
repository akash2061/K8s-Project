# K8s-Project: Automated Email Breach Checking Service

A fully automated DevOps pipeline for deploying an email breach checking service to Kubernetes using Docker, GitHub Actions, and Ansible.

[![CI/CD Pipeline](https://github.com/akash2061/K8s-Project/actions/workflows/CI_CD_Pipeline.yml/badge.svg)](https://github.com/akash2061/K8s-Project/actions/workflows/CI_CD_Pipeline.yml)

## 🚀 Project Overview

This project demonstrates a complete CI/CD pipeline that automatically builds, containerizes, and deploys a Next.js email breach checking application to a K3s cluster using modern DevOps practices.

### Architecture

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────────┐
│   GitHub    │───▶│ GitHub       │───▶│   Docker    │───▶│   K3s        │
│ Repository  │    │ Actions      │    │   Hub       │    │  Cluster     │
└─────────────┘    └──────────────┘    └─────────────┘    └──────────────┘
                          │                                       ▲
                          ▼                                       │
                   ┌──────────────┐                        ┌─────────────┐
                   │   Ansible    │───────────────────────▶│  Remote     │
                   │  Playbook    │         SSH            │  Server     │
                   └──────────────┘                        └─────────────┘
```

## 🛠️ Technology Stack

### Frontend & Application
- **Next.js 14** - React framework with TypeScript
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **Theme Support** - Light/Dark mode toggle

### DevOps & Infrastructure
- **Docker** - Containerization
- **Kubernetes (K3s)** - Container orchestration
- **GitHub Actions** - CI/CD pipeline
- **Ansible** - Configuration management
- **Docker Hub** - Container registry

### Monitoring & Scaling
- **Horizontal Pod Autoscaler (HPA)** - Auto-scaling based on CPU/Memory
- **Resource Limits** - CPU and memory management
- **Health Checks** - Readiness and liveness probes

## 📋 Features

### Application Features
- ✅ Email breach checking functionality
- ✅ Real-time breach status feedback
- ✅ Responsive design
- ✅ Dark/Light theme toggle
- ✅ Clean, modern UI
- ✅ Security-focused email analysis

### DevOps Features
- 🔄 **Automated CI/CD Pipeline**
- 🐳 **Docker containerization**
- ☸️ **Kubernetes deployment**
- 📊 **Auto-scaling capabilities**

## 🚀 Quick Start

### Prerequisites

- K3s cluster [light-weight] or Kubernetes cluster
- Docker Hub account
- GitHub repository with secrets configured
- Ansible installed on the deployment machine

### Required GitHub Secrets

```bash
DOCKER_USERNAME=my-dockerhub-username
DOCKER_PASSWORD=my-dockerhub-password
K3S_HOST=my-k3s-server-ip
K3S_USER=my-ssh-username
K3S_SSH_PRIVATE_KEY=my-ssh-private-key
```

### Manual Deployment

1. **Clone the repository**
   ```bash
   git clone https://github.com/akash2061/K8s-Project.git
   cd K8s-Project
   ```

2. **Build and push Docker image**
   ```bash
   docker build -t akash2061/email-check:latest ./App
   docker push akash2061/email-check:latest
   ```

3. **Deploy using Ansible**
   ```bash
   ansible-playbook -i ansible/inventory.yml ansible/deploy.yml \
     -e k3s_host=SERVER_IP \
     -e k3s_user=SSH_USER
   ```

4. **Access the application**
   ```
   http://SERVER_IP:30080
   ```

## 🔧 Configuration

### Kubernetes Resources

| Resource | Configuration |
|----------|---------------|
| **Deployment** | 1 replica, rolling updates |
| **Service** | NodePort (30080) |
| **HPA** | 1-2 replicas, CPU: 20%, Memory: 50% |
| **Resources** | Request: 250m CPU, 256Mi RAM |
| **Limits** | 500m CPU, 512Mi RAM |

### CI/CD Pipeline

The pipeline consists of two main jobs:

1. **Build Job**
   - Checkout code
   - Docker login
   - Build and push image to Docker Hub

2. **Deploy Job**
   - Install Ansible
   - Setup SSH connectivity
   - Deploy to K3s using Ansible playbook

### Ansible Deployment Strategy

- **Rolling updates** for zero-downtime deployments
- **Smart deployment** with change detection
- **Health checks** to ensure successful deployment
- **Resource monitoring** with HPA status verification

## 📊 Monitoring & Scaling

### Auto-scaling Configuration

```yaml
HPA Thresholds:
- CPU: 20% (Testing threshold)
- Memory: 50%
- Min Replicas: 1
- Max Replicas: 2
```

### Health Monitoring

```bash
# Check deployment status
kubectl get pods -l app=email-check

# Monitor HPA
kubectl get hpa email-check-hpa

# View service
kubectl get svc email-check-service
```

## 🛡️ Security Features

- **Non-root containers** - Security best practices
- **Resource limits** - Prevent resource exhaustion
- **SSH key authentication** - Secure server access
- **Private container registry** - Controlled image distribution
- **Email breach detection** - Core security functionality

## 📁 Project Structure

```
K8s-Project/
├── App/                          # Next.js email breach checking app
│   ├── components/              # React components
│   ├── app/                     # App router pages
│   └── Dockerfile              # Container configuration
├── k8s/
│   └── k8s.yml                 # Kubernetes manifests
├── ansible/
│   ├── deploy.yml              # Ansible playbook
│   └── inventory.yml           # Ansible inventory
├── .github/workflows/
│   └── CI_CD_Pipeline.yml      # GitHub Actions workflow
└── README.md                   # Project documentation
```

## 🔄 Deployment Workflow

1. **Code Push** → Triggers GitHub Actions
2. **Build Stage** → Docker image creation and push
3. **Deploy Stage** → Ansible deployment to K3s
4. **Health Check** → Verify deployment success
5. **Monitoring** → HPA and resource monitoring

## 🎯 Performance Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Deployment Time | < 2 minutes | ~1 minute |
| CPU Usage | < 20% | 0% (idle) |
| Memory Usage | < 50% | ~27% |
| Uptime | 99.9% | ✅ |
| Auto-scale Response | < 30s | ✅ |

## 🚨 Troubleshooting

### Common Issues

1. **HPA Metrics showing `<unknown>`**
   ```bash
   # Wait 2-3 minutes for metrics initialization
   kubectl describe hpa email-check-hpa
   ```

2. **Deployment stuck in pending**
   ```bash
   kubectl describe pod -l app=email-check
   ```

3. **Service not accessible**
   ```bash
   kubectl get svc email-check-service
   # Check NodePort and firewall rules
   ```

### Debug Commands

```bash
# Pod logs
kubectl logs -l app=email-check

# Deployment events
kubectl describe deployment email-check

# Node resources
kubectl top nodes

# Ansible verbose output
ansible-playbook -vvv -i ansible/inventory.yml ansible/deploy.yml
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test the deployment pipeline
5. Submit a pull request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🔗 Links

- **[GitHub](https://github.com/akash2061)**
- **[LinkedIn](https://www.linkedin.com/in/akash2061/)**
- **[Docker Hub](https://hub.docker.com/r/akash2061/email-check)**

---

**Built with ❤️ using Modern DevOps Practices**

*Automated • Scalable • Reliable*
