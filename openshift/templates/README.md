# ZEVA Openshift Setup

## 1. Network Security and Arifactory configuration

- Follow the instructions in openshift/templates/nsp/README.md
- Follow the instructions in https://developer.gov.bc.ca/Artifact-Repositories-(Artifactory) to setup artifactory required secrets.
  Currently there are two artifactories are being used for registry.redhat.io and artifacts.developer.gov.bc.ca/docker-remote

## 2. Jenkins setup on tools project

- openshift/jenkins/README.md
- install node packages
  .jenkins/.pipeline$ npm install
- Build jenkins and jenkins-slave-main image, create a pr such as 161
  .jenkins/.pipeline$ npm run build -- --pr=161 --env=build
- Deploy jenkins to tools project
  .jenkins/.pipeline$ npm run deploy -- --pr=161 --env=dev
  .jenkins/.pipeline$ npm run deploy -- --pr=161 --env=prod

Notes: for Jenkins, build, dev and prod are actually all on tools environment

## 3. Pipeline to deploy on dev, test and prod

### 3.1 Preparation for pipeline

- Create zeva artifactory service account zeva-artifactory-service-account, refer to https://developer.gov.bc.ca/Artifact-Repositories-(Artifactory)
- Create secret docker-artifactory-secret for docker artifactory
- openshift/templates/config/README.md [Before triggering pipeline]
- openshift/templates/keycloak/README.md
- openshift/templates/backend/README.md [Before triggering pipeline]
- openshift/templates/frontend/README.md [Before triggering pipeline]
- openshift/templates/minio/README.md [Before triggering pipeline]
- openshift/templates/patroni/README.md [Before triggering pipeline]
- openshift/templates/rabbitmq/README.md [Before triggering pipeline]

### 3.2 Run pipeline

For example the latest tracking pr is 199

- .pipeline$ npm run build -- --pr=199 --env=build
- .pipeline$ npm run deploy -- --pr=199 --env=dev
- .pipeline$ npm run deploy -- --pr=199 --env=test
- .pipeline$ npm run deploy -- --pr=199 --env=prod

### 3.3 Post pipeline

openshift/templates/backend/README.md [After pipeline completes]
openshift/templates/frontend/README.md [After pipeline completes]

## 4. Backup container

openshift/templates/backup-container-2.0.0/openshift/templates/backup/README.md

## 5. Nagios

openshift/templates/nagios/README.md

## 6. Database migration

- openshift/templates/patroni/README.md [Database Migration from Openshift v3 to Openshift 4]
