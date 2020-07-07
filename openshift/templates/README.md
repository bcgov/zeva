## Network Security

*  Followingthe instructions in openshift/templates/nsp/README.md

## 1. Jenkins setup on tools project

* openshift/jenkins/README.md
* Build jenkins and jenkins-slave-main image, create a pr such as 161
.jenkins/.pipeline$ npm run build -- --pr=161 --env=build
* Deploy jenkins to tools project
.jenkins/.pipeline$ npm run deploy -- --pr=161 --env=dev
.jenkins/.pipeline$ npm run deploy -- --pr=161 --env=prod

Notes: for Jenkins, build, dev and prod are actually all on tools environment

## 2. Pipeline to deploy on dev, test and prod

### 2.1 Preparation for pipeline

* openshift/templates/keycloak/README.md
* openshift/templates/backend/README.md [Before triggering pipeline]
* openshift/templates/frontend/README.md [Before triggering pipeline]
* openshift/templates/minio/README.md [Before triggering pipeline]
* openshift/templates/patroni/README.md [Before triggering pipeline]
* openshift/templates/rabbitmq/README.md [Before triggering pipeline]

### 2.2 Run pipeline

For example the latest tracking pr is 199

* .jenkins/.pipeline$ npm run build -- --pr=199 --env=build
* .jenkins/.pipeline$ npm run deploy -- --pr=199 --env=dev
* .jenkins/.pipeline$ npm run deploy -- --pr=199 --env=test
* .jenkins/.pipeline$ npm run deploy -- --pr=199 --env=prod

### 2.3 Post pipeline

openshift/templates/backend/README.md [After pipeline completes]
openshift/templates/frontend/README.md [After pipeline completes]

## 3. Backup container

openshift/templates/backup-container-2.0.0/openshift/templates/backup/README.md

## 4. Nagios

openshift/templates/nagios/README.md
