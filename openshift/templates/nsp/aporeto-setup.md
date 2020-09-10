## 1. Identify Components

### 1.1 Frontend

app: zeva  
role: frontend  
env: {env_name}  

### 1.2 Backend

app: zeva  
role: backend  
env: {env_name}  

### 1.3 Patroni

app: zeva  
role: Patroni  
env: {env_name}  

### 1.4 Minio

app: zeva  
role: minio  
env: {env_name}  

### 1.5 Namspace Internal Network

int:network  

### 1.6 Interweb

ext:network=any  

### 1.7 Openshift K8S Cluster API

int:network=internal-cluster-api-endpoint  

### 1.8 Tools Namspace

$namspace=tbiwaq-tools  

### 1.9 Environment Namspace

$namspace=tbiwaq-[environment name]  

## 2. Zeva Aporeto Security Model

### 2.1 Interweb -> Frontend

Source: 
    Interweb
Destination:
    Frontend

### 2.2 Frontend -> Backend

Source:   
    Frontend  
Destination:    
    Backend  

### 2.3 Backend -> Patroni

Source:   
    Backend  
Destination:  
    Patroni  

### 2.3 Backend -> Interweb (covers Keycloak for now)

Source:   
    Backend  
Destination:  
    Interweb  

### 2.4 Environment Namespace -> Openshift K8S Cluster API

Source:  
    Environment Namespace  
Destination:  
    Openshift Kubernets Cluster API  

### 2.5 Tools Namspace -> Openshift K8S Cluster API

Source:   
    Tools Namspace  
Destination:  
    Openshift K8S Cluster API  

### 2.6 Tools Namespace -> Interweb

Source:  
    Tools Namespace  
Destination:  
    Interweb  

