## Create Environment needed staff

### Tag base images from RedHat repo

#### Tag postgresql-10-rhel7:1-47 from RedHat image repo to tools project
The image fixed database initialization issue. Zeva uses this image to create extension hstore and others.  
Command: oc tag registry.access.redhat.com/rhscl/postgresql-10-rhel7:1-47 tbiwaq-tools/postgresql:10-1-47

#### Tag python-36-rhel7:1-63 from RedHat image repo to tools project
It fixed issues when reload operational and test data
oc tag registry.access.redhat.com/rhscl/python-36-rhel7:1-63 tbiwaq-tools/python:3.6-1-63

#### Tag rhel7-atomic:77.371 from RedHat image repo to tools project
oc tag registry.access.redhat.com/rhel7-atomic:7.7-371 tbiwaq-tools/rhel7-atomic:7.7-371

### Tag Minio base image 7.7-481 from RedHat image repo to tools project
## Build minio image for zeva and tag it to environment
oc tag registry.access.redhat.com/rhel7/rhel:7.7-481 tbiwaq-tools/rhel7:7.7-481
oc process -f minio/minio-bc.yaml GIT_URL=https://github.com/bcgov/zeva.git GIT_REF=pipeline-6-7 | oc apply -f - -n tbiwaq-tools --dry-run=true
oc tag tbiwaq-tools/minio:latest tbiwaq-dev/minio:dev
oc tag tbiwaq-tools/minio:latest tbiwaq-test/minio:test
oc tag tbiwaq-tools/minio:latest tbiwaq-prod/minio:prod

### Update Jenkins build-master.yaml SOURCE_IMAGE_STREAM_NAMESPACE and SOURCE_IMAGE_STREAM_TAG
Trigger the .jenkins pipeline


### Create Secrets for dev, test and prod
oc process -f config/secrets.yaml | oc create -f - -n tbiwaq-dev --dry-run=true
oc process -f config/secrets.yaml | oc create -f - -n tbiwaq-test --dry-run=true
oc process -f config/secrets.yaml | oc create -f - -n tbiwaq-prod --dry-run=true

### Create Secret keycloak-secret.yaml in tools, dev, test and prod env. The value for tools and dev should be same
oc process -f config/keycloak-secret.yaml KEYCLOAK_SA_CLIENT_SECRET= clientId= clientSecret= zevaPublic= realmId= ssoHost= | oc create -f - -n tbiwaq-*** --dry-run=true

### Create ConfigMaps
#### Create database init settings which will be mounted in database
oc process -f config/zeva-postgresql-init.yaml | oc create -f - -n tbiwaq-dev --dry-run=true  
oc process -f config/zeva-postgresql-init.yaml | oc create -f - -n tbiwaq-test --dry-run=true  
oc process -f config/zeva-postgresql-init.yaml | oc create -f - -n tbiwaq-prod --dry-run=true  

### Deploy Rabbitmq ============

#### Create 3 Rabbitmq Secrets on tools
In tools project, create one rabbitmq-secret for each env, dev, test and prod. use oc create, don't override them.
* under config folder:  
oc process -f config/rabbitmq-secret.yaml ENV_NAME=dev | oc create -f - -n tbiwaq-tools --dry-run=true  
oc process -f config/rabbitmq-secret.yaml ENV_NAME=test | oc create -f - -n tbiwaq-tools --dry-run=true  
oc process -f config/rabbitmq-secret.yaml ENV_NAME=prod | oc create -f - -n tbiwaq-tools --dry-run=true  

#### Run Rabbitmq build on tools
Build one Rabbitmq image for each environment
* under rabbitmq folder:  
oc process -f rabbitmq/rabbitmq-bc.yaml ENV_NAME=dev ADMIN_PASSWORD=*** ZEVA_PASSWORD=*** | oc apply -f - -n tbiwaq-dev --dry-run=true  
oc process -f rabbitmq/rabbitmq-bc.yaml ENV_NAME=test ADMIN_PASSWORD=*** ZEVA_PASSWORD=*** | oc apply -f - -n tbiwaq-test --dry-run=true  
oc process -f rabbitmq/rabbitmq-bc.yaml ENV_NAME=prod ADMIN_PASSWORD=*** ZEVA_PASSWORD=*** | oc apply -f - -n tbiwaq-prod --dry-run=true  

#### Create Rabbitmq Secret on dev, test and prod
* under config folder: make sure the secret is same as the one under tools project
oc process -f config/rabbitmq-secret-env.yaml ADMIN_PASSWORD=*** ZEVA_PASSWORD=*** | oc create -f - -n tbiwaq-dev --dry-run=true
oc process -f config/rabbitmq-secret-env.yaml ADMIN_PASSWORD=*** ZEVA_PASSWORD=*** | oc create -f - -n tbiwaq-test --dry-run=true
oc process -f config/rabbitmq-secret-env.yaml ADMIN_PASSWORD=*** ZEVA_PASSWORD=*** | oc create -f - -n tbiwaq-prod --dry-run=true

#### Deploy Rabbitmq on dev, test and prod
* under rabbitmq folder:
oc process -f rabbitmq/rabbitmq-dc.yaml ENV_NAME=dev | oc apply -f - -n tbiwaq-dev --dry-run=true
oc process -f rabbitmq/rabbitmq-dc.yaml ENV_NAME=test | oc apply -f - -n tbiwaq-test --dry-run=true
oc process -f rabbitmq/rabbitmq-dc.yaml ENV_NAME=prod | oc apply -f - -n tbiwaq-prod --dry-run=true



