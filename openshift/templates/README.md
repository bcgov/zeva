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

## Patroni
Zeva uses bcgov patroni:v10-stable as base, updates post_init.sh to create postgresql extensions as they can be only created by super user.
oc process -f ./patroni/build.yaml -p GIT_URI=https://github.com/bcgov/zeva.git -p GIT_REF=******  | oc apply -f - -n tbiwaq-tools --dry-run=true
oc tag tbiwaq-tools/patroni:v10-latest tbiwaq-tools/patroni:v10-stable
oc tag tbiwaq-tools/patroni:v10-latest tbiwaq-dev/patroni:v10-stable
oc tag tbiwaq-tools/patroni:v10-latest tbiwaq-test/patroni:v10-stable
oc tag tbiwaq-tools/patroni:v10-latest tbiwaq-prod/patroni:v10-stable
oc process -f ./patroni/secret-template.yaml | oc apply -f - -n tbiwaq-dev --dry-run=true
oc process -f ./patroni/secret-template.yaml | oc apply -f - -n tbiwaq-test --dry-run=true
oc process -f ./patroni/secret-template.yaml | oc apply -f - -n tbiwaq-prod --dry-run=true

## Frontend
oc tag registry.access.redhat.com/rhscl/rhscl/nodejs-10-rhel7:1-28 tbiwaq-tools/nodejs:10-1-28

## Secrets
zeva-django-prod as-copy-of template.django-secret
patroni-prod as-copy-of template.patroni-patroni
zeva-rabbitmq as-copy-of template.rabbitmq-secret
patroni-backup for database backup 
ftp-secret for database backup 
zeva-django-prod for backend django framework
zeva-keycloak includes keycloak connection info
zeva-minio includes minio connection info
zeva-prod-rabbitmq-cluster-secret for rabbitmq cluster

## Production Deployment
* run nsp
oc process -f nsp/quickstart-nsp.yaml ENV_NAME=prod | oc create -f - -n tbiwaq-prod
* patroni
oc create imagestream patroni -n tbiwaq-prod
oc tag tbiwaq-tools/patroni:v10-latest tbiwaq-prod/patroni:v10-stable
oc process -f ./patroni/secret-template.yaml | oc create -f - -n tbiwaq-prod
* rabbitmq
oc create imagestream rabbitmq -n tbiwaq-prod
oc tag docker.io/rabbitmq:3.8.3-management tbiwaq-prod/rabbitmq:3.8.3-management
oc process -f ./rabbitmq/secret-template.yaml | oc create -f - -n tbiwaq-prod
rabbitmq/rabbitmq-web-route.yaml can be used to create rabbitmq web management route when needed
* create zeva-keycloak
oc process -f ./keycloak/keycloak-secret.yaml \
    KEYCLOAK_SA_CLIENT_SECRET=****** \
    clientId=******** \
    clientSecret=******** \
    zevaPublic=******** \
    realmId=******** \
    host=sso.pathfinder.gov.bc.ca | oc create -f - -n tbiwaq-prod --dry-run=true
* create zeva-minio secret
oc process -f ./minio/minio-secret.yaml | oc create -f - -n tbiwaq-prod
* create zeva-rabbitmq secret
oc process -f ./rabbitmq/zeva-rabbitmq-secret.yaml | oc create -f - -n tbiwaq-prod
* tag patroni image to prod
oc tag tbiwaq-tools/patroni:v10-latest tbiwaq-prod/patroni:v10-stable
* grant admin role to tbiwaq-tools/jenkins-prod
oc policy add-role-to-user admin system:serviceaccount:tbiwaq-tools:jenkins-prod --namespace=tbiwaq-prod
oc policy add-role-to-user system:image-puller system:serviceaccount:tbiwaq-prod:default --namespace=tbiwaq-tools



## Setup Nagios
nagios-base image is located in tbiwaq-tools project
nagios image is located in tbiwaq-test and tbiwaq-prod project
oc create imagestream nagios -n tbiwaq-prod
oc process -f ./nagios-secret.yaml | oc create -f - -n tbiwaq-prod
oc policy add-role-to-user system:image-puller system:serviceaccount:tbiwaq-prod:builder --namespace=tbiwaq-tools
oc policy add-role-to-user edit system:serviceaccount:tbiwaq-prod:nagios --namespace=tbiwaq-prod
oc process -f ./nagios-bc.yaml ENV_NAME=prod | oc create -f - -n tbiwaq-prod
oc tag tbiwaq-prod/nagios:latest tabiwaq-prod/nagios:prod
oc process -f ./nagios-dc.yaml ENV_NAME=prod NAGIOS_PVC_SIZE=2G | oc create -f - -n tbiwaq-prod


## unit test
oc process -f config/zeva-postgresql-init.yaml | oc create -f - -n tbiwaq-dev
oc process -f postgresql-dc-unittest.yaml NAME=zeva SUFFIX=-dev-999 ENV_NAME=dev | oc create -f - -n tbiwaq-dev