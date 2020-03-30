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
oc process -f ./rabbitmq/rabbitmq-prereq.yaml | oc create -f - -n tbiwaq-dev --dry-run=true
oc process -f ./rabbitmq/rabbitmq-prereq.yaml | oc create -f - -n tbiwaq-test --dry-run=true
oc process -f ./rabbitmq/rabbitmq-prereq.yaml | oc create -f - -n tbiwaq-prod --dry-run=true

## Patroni
oc process -f ./patroni/build.yaml -p GIT_URI=https://github.com/bcgov/zeva.git -p GIT_REF=patroni-2  | oc apply -f - -n tbiwaq-tools --dry-run=true
oc tag tbiwaq-tools/patroni:v10-latest tbiwaq-tools/patroni:v10-stable
oc tag tbiwaq-tools/patroni:v10-stable tbiwaq-dev/patroni:v10-stable
oc process -f ./patroni/secret-template.yaml | oc apply -f - -n tbiwaq-dev --dry-run=true
oc process -f ./patroni/secret-template.yaml | oc apply -f - -n tbiwaq-test --dry-run=true
oc process -f ./patroni/secret-template.yaml | oc apply -f - -n tbiwaq-prod --dry-run=true
oc process -f ./patroni/deployment-prereq.yaml | oc apply -f - -n tbiwaq-dev --dry-run=true

