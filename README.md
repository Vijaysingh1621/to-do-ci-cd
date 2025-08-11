# 🚀 Amazing Todo App - CI/CD Pipeline with Jenkins & AWS

A modern, feature-rich React TypeScript todo application with automated CI/CD pipeline using Jenkins and AWS deployment.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [CI/CD Pipeline](#cicd-pipeline)
- [AWS Deployment](#aws-deployment)
- [Setup Instructions](#setup-instructions)
- [Jenkins Configuration](#jenkins-configuration)
- [AWS Configuration](#aws-configuration)
- [Environment Variables](#environment-variables)
- [Monitoring & Logs](#monitoring--logs)

## ✨ Features

### Todo App Features

- **Advanced Task Management**: Create, edit, delete, and organize tasks with priorities
- **Smart Categorization**: Organize tasks by custom categories
- **Due Date Tracking**: Set and monitor task deadlines with overdue alerts
- **Priority System**: High, Medium, Low priority levels with visual indicators
- **Real-time Search**: Search through tasks and notes instantly
- **Drag & Drop**: Reorder tasks with intuitive drag and drop
- **Local Storage**: Automatic data persistence in browser
- **Statistics Dashboard**: Track completion rates and productivity metrics
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### CI/CD Features

- **Automated Testing**: Unit tests and linting on every commit
- **Multi-stage Pipeline**: Build, test, and deploy stages
- **Docker Containerization**: Consistent deployment across environments
- **AWS Integration**: Automated deployment to AWS ECS/EC2
- **Blue-Green Deployment**: Zero-downtime deployments
- **Rollback Capability**: Quick rollback to previous versions

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **Containerization**: Docker
- **CI/CD**: Jenkins
- **Cloud Platform**: AWS (ECS, ECR, ALB, CloudWatch)
- **Infrastructure**: Terraform (optional)

## 🔄 CI/CD Pipeline

Our Jenkins pipeline implements a robust CI/CD workflow with the following stages:

### 1. **Source Code Management**

- **Git Integration**: Automatic triggering on GitHub push/PR
- **Branch Protection**: Main branch requires PR approval
- **Webhook Configuration**: Real-time pipeline triggers

### 2. **Build Stage**

```bash
# Install dependencies
npm install

# Run type checking
npm run type-check

# Build production bundle
npm run build
```

### 3. **Test Stage**

```bash
# Run unit tests
npm run test

# Run linting
npm run lint

# Code coverage reports
npm run test:coverage
```

### 4. **Docker Build**

```bash
# Build Docker image
docker build -t todo-app:${BUILD_NUMBER} .

# Tag for AWS ECR
docker tag todo-app:${BUILD_NUMBER} ${ECR_REPO}:${BUILD_NUMBER}
```

### 5. **Security Scanning**

- **Vulnerability Scanning**: Docker image security analysis
- **Dependency Check**: NPM audit for known vulnerabilities
- **SAST**: Static Application Security Testing

### 6. **AWS Deployment**

```bash
# Push to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin ${ECR_REPO}
docker push ${ECR_REPO}:${BUILD_NUMBER}

# Update ECS service
aws ecs update-service --cluster todo-cluster --service todo-service --force-new-deployment
```

## ☁️ AWS Deployment Architecture

### Infrastructure Components

1. **Amazon ECR (Elastic Container Registry)**

   - Stores Docker images securely
   - Automatic image scanning for vulnerabilities
   - Lifecycle policies for image management

2. **Amazon ECS (Elastic Container Service)**

   - Container orchestration and management
   - Auto-scaling based on CPU/memory metrics
   - Health checks and automatic recovery

3. **Application Load Balancer (ALB)**

   - Traffic distribution across containers
   - SSL/TLS termination
   - Health checks and failover

4. **Amazon CloudWatch**

   - Application and infrastructure monitoring
   - Log aggregation and analysis
   - Custom metrics and alarms

5. **AWS IAM**
   - Secure access control
   - Service-to-service authentication
   - Least privilege principle

## 🚀 Setup Instructions

### Prerequisites

- Jenkins server (2.4+)
- AWS CLI configured
- Docker installed
- Node.js 18+
- Git

### Local Development

```bash
# Clone repository
git clone https://github.com/Vijaysingh1621/to-do-ci-cd.git
cd to-do-ci-cd

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Docker Setup

```bash
# Build Docker image
docker build -t todo-app .

# Run container locally
docker run -p 3000:80 todo-app

# Access application
open http://localhost:3000
```

## 🔧 Jenkins Configuration

### 1. **Pipeline Setup**

- Create new Pipeline job in Jenkins
- Configure GitHub webhook integration
- Set up SCM polling (optional backup)

### 2. **Required Plugins**

```
- Docker Pipeline
- AWS Steps
- Blue Ocean
- GitHub Integration
- NodeJS Plugin
- Pipeline Stage View
```

### 3. **Global Tool Configuration**

- Configure NodeJS installation
- Set up Docker installation
- Configure AWS CLI

### 4. **Environment Variables**

```bash
AWS_DEFAULT_REGION=us-east-1
ECR_REPO=123456789.dkr.ecr.us-east-1.amazonaws.com/todo-app
ECS_CLUSTER=todo-cluster
ECS_SERVICE=todo-service
```

## 🛡 AWS Configuration

### 1. **ECR Repository Setup**

```bash
# Create ECR repository
aws ecr create-repository --repository-name todo-app

# Configure lifecycle policy
aws ecr put-lifecycle-configuration --repository-name todo-app --lifecycle-policy-text file://lifecycle-policy.json
```

### 2. **ECS Cluster Configuration**

```bash
# Create ECS cluster
aws ecs create-cluster --cluster-name todo-cluster

# Create task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Create service
aws ecs create-service --cluster todo-cluster --service-name todo-service --task-definition todo-app:1
```

### 3. **Load Balancer Setup**

- Configure Application Load Balancer
- Set up target groups for ECS tasks
- Configure health check endpoints
- Set up SSL certificate (AWS Certificate Manager)

## 📊 Monitoring & Logs

### CloudWatch Integration

- **Application Logs**: Centralized logging from containers
- **Metrics**: Custom application metrics (task completion, user activity)
- **Alarms**: Automated alerts for errors and performance issues
- **Dashboards**: Real-time application health monitoring

### Performance Monitoring

- **Container Metrics**: CPU, memory, network utilization
- **Application Metrics**: Response times, error rates
- **Business Metrics**: User engagement, task completion rates

## 🔄 Deployment Strategies

### Blue-Green Deployment

1. Deploy new version to green environment
2. Run health checks and smoke tests
3. Switch traffic from blue to green
4. Monitor metrics and logs
5. Keep blue environment for quick rollback

### Rolling Updates

- Gradual replacement of containers
- Zero-downtime deployments
- Automatic rollback on health check failures

## 🔐 Security Best Practices

- **Container Security**: Regular image scanning and updates
- **Secrets Management**: AWS Secrets Manager for sensitive data
- **Network Security**: VPC configuration with private subnets
- **Access Control**: IAM roles with minimal permissions
- **Encryption**: Data encryption in transit and at rest

## 📈 Scaling & Performance

- **Auto Scaling**: Automatic scaling based on metrics
- **Load Testing**: Regular performance testing in pipeline
- **CDN Integration**: CloudFront for static asset delivery
- **Database Optimization**: Connection pooling and caching

This CI/CD pipeline ensures reliable, automated deployments with comprehensive monitoring and security, enabling rapid and safe delivery of new features to production.

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },

},
])

````

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
````
