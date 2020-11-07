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

$namspace=e52f12-tools  

### 1.9 Environment Namspace

$namspace=e52f12-[environment name]  

### 1.10 KeyCloak

$namespace=devops-sso-dev 
app=sso-dev

$namespace=devops-sso-test
app=sso-test

Notes: prod may be not right, could be just devops-sso and sso
$namespace=devops-sso-prod
app=sso-prod


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

### 2.4 Backend -> KeyCloak

Source:   
    Backend  
Destination:  
    KeyCloa;  


### 2.5 Environment Namespace -> Openshift K8S Cluster API

Source:  
    Environment Namespace  
Destination:  
    Openshift Kubernets Cluster API  

### 2.6 Tools Namspace -> Openshift K8S Cluster API

Source:   
    Tools Namspace  
Destination:  
    Openshift K8S Cluster API  

### 2.7 Tools Namespace -> Interweb

Source:  
    Tools Namespace  
Destination:  
    Interweb  

