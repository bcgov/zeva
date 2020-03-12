## Tag Base Images

### Tag rhel7-atomic:77.371 from RedHat and build a new Jenkins image on top of it
oc tag registry.access.redhat.com/rhel7-atomic:7.7-371 tbiwaq-tools/rhel7-atomic:7.7-371
oc process -f jenkins/jenkins-bc.yaml | oc apply -f - -n tbiwaq-tools --dry-run=true
Update Jenkins build-master.yaml SOURCE_IMAGE_STREAM_NAMESPACE and SOURCE_IMAGE_STREAM_TAG and trigger .jenkins pipeline to build and deploy Jenkins

### Tag postgresql-10-rhel7:1-47 from RedHat
The image fixed database initialization issue. Zeva uses this image to create extension hstore and others.  
oc tag registry.access.redhat.com/rhscl/postgresql-10-rhel7:1-47 tbiwaq-tools/postgresql:10-1-47

### Tag python-36-rhel7:1-63 from RedHat 
It fixed issues when reload operational and test data. This image will be used by backend build
oc tag registry.access.redhat.com/rhscl/python-36-rhel7:1-63 tbiwaq-tools/python:3.6-1-63

### Tag Minio base image 7.7-481 and build Minio
oc tag registry.access.redhat.com/rhel7/rhel:7.7-481 tbiwaq-tools/rhel7:7.7-481  
oc process -f minio/minio-bc.yaml GIT_URL=https://github.com/bcgov/zeva.git GIT_REF=pipeline-6-7 | oc apply -f - -n tbiwaq-tools --dry-run=true  

## Create Secrets for dev, test and prod
oc process -f config/secrets.yaml | oc create -f - -n tbiwaq-dev --dry-run=true
oc process -f config/secrets.yaml | oc create -f - -n tbiwaq-test --dry-run=true
oc process -f config/secrets.yaml | oc create -f - -n tbiwaq-prod --dry-run=true

## Create Secret keycloak-secret.yaml in tools, dev, test and prod env. The value for tools and dev should be same
oc process -f config/keycloak-secret.yaml KEYCLOAK_SA_CLIENT_SECRET= clientId= clientSecret= zevaPublic= realmId= ssoHost= | oc create -f - -n tbiwaq-*** --dry-run=true

## Create database init settings which will be mounted in database
oc process -f config/zeva-postgresql-init.yaml | oc create -f - -n tbiwaq-dev --dry-run=true  
oc process -f config/zeva-postgresql-init.yaml | oc create -f - -n tbiwaq-test --dry-run=true  
oc process -f config/zeva-postgresql-init.yaml | oc create -f - -n tbiwaq-prod --dry-run=true  

## Rabbitmq 

### In tools project, create secrets rabbitmq-secret-dev, rabbitmq-secret-test and rabbitmq-secret-prod
oc process -f config/rabbitmq-secret.yaml ENV_NAME=dev | oc create -f - -n tbiwaq-tools --dry-run=true  
oc process -f config/rabbitmq-secret.yaml ENV_NAME=test | oc create -f - -n tbiwaq-tools --dry-run=true  
oc process -f config/rabbitmq-secret.yaml ENV_NAME=prod | oc create -f - -n tbiwaq-tools --dry-run=true  

### In dev, test and prod project, make sure the password passed in are same as above
oc process -f config/rabbitmq-secret-env.yaml ADMIN_PASSWORD=*** ZEVA_PASSWORD=*** | oc create -f - -n tbiwaq-dev --dry-run=true
oc process -f config/rabbitmq-secret-env.yaml ADMIN_PASSWORD=*** ZEVA_PASSWORD=*** | oc create -f - -n tbiwaq-test --dry-run=true
oc process -f config/rabbitmq-secret-env.yaml ADMIN_PASSWORD=*** ZEVA_PASSWORD=*** | oc create -f - -n tbiwaq-prod --dry-run=true

### In tools project, create build config rabbitmq-bc-dev, rabbitmq-bc-test and rabbitmq-bc-prod 
oc process -f rabbitmq/rabbitmq-bc.yaml ENV_NAME=dev GIT_REF=pipeline-7-1 | oc apply -f - -n tbiwaq-tools --dry-run=true  
oc process -f rabbitmq/rabbitmq-bc.yaml ENV_NAME=test GIT_REF=pipeline-7-1 | oc apply -f - -n tbiwaq-tools --dry-run=true  
oc process -f rabbitmq/rabbitmq-bc.yaml ENV_NAME=prod GIT_REF=pipeline-7-1 | oc apply -f - -n tbiwaq-tools --dry-run=true  

### Command to deploy Rabbitmq on dev, this can be done throught pipeline aws well
oc process -f rabbitmq/rabbitmq-dc.yaml NAME=zeva ENV_NAME=dev SUFFIX=-pr-900 CPU_REQUEST=100m CPU_LIMIT=1000m MEMORY_REQUEST=256Mi MEMORY_LIMIT=2Gi REPLICA_COUNT=2 RABBITMQ_PVC_SIZE=1Gi | \
oc apply -f - -n tbiwaq-dev --dry-run=true

## Pipeline

The rest will be build and deployed on pipeline.