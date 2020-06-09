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

## Setup Backup container
Use backup container release 2.0.0 to run the backup
1. Request NFS storage as backup space
follow https://github.com/BCDevOps/provision-nfs-apb/blob/master/docs/usage-gui.md to request nfs-backup storage
2. Build patroni-backup image
oc -n tbiwaq-tools process -f ./openshift/templates/backup/backup-build.json \
-p NAME=patroni-backup OUTPUT_IMAGE_TAG=2.0.0 GIT_REF=2.0.0 \
| oc -n tbiwaq-tools create -f -
3. add to ./config/backup.conf, 9pm run backup, 10pm run verification
patroni-master-prod:5432/zeva
0 21 * * * default ./backup.sh -s
0 22 * * * default ./backup.sh -s -v all
4. create backup-conf configmap
oc -n tbiwaq-prod create configmap backup-conf --from-file=../config/backup.conf
5. create deployment config for backup container
* use tmp-db-backup for now, should be replace by a NFS backup storage, applied already
  -p BACKUP_VOLUME_NAME=tmp-db-backup \
  -p BACKUP_VOLUME_SIZE=2G \
  -p BACKUP_VOLUME_CLASS=netapp-file-standard 
oc -n tbiwaq-prod process -f ./templates/backup/backup-deploy.json \
  -p NAME=patroni-backup \
  -p SOURCE_IMAGE_NAME=patroni-backup \
  -p IMAGE_NAMESPACE=tbiwaq-tools \
  -p TAG_NAME=2.0.0 \
  -p DATABASE_SERVICE_NAME=patroni-master-prod \
  -p DATABASE_NAME=zeva \
  -p DATABASE_DEPLOYMENT_NAME=patroni-prod \
  -p DATABASE_USER_KEY_NAME=app-db-username \
  -p DATABASE_PASSWORD_KEY_NAME=app-db-password \
  -p TABLE_SCHEMA=public -p BACKUP_STRATEGY=rolling \
  -p DAILY_BACKUPS=31 \
  -p WEEKLY_BACKUPS=12 \
  -p MONTHLY_BACKUPS=3 \
  -p BACKUP_PERIOD=1d \
  -p BACKUP_VOLUME_NAME=tmp-db-backup \
  -p BACKUP_VOLUME_SIZE=2G \
  -p BACKUP_VOLUME_CLASS=netapp-file-standard \
  -p VERIFICATION_VOLUME_NAME=backup-verification \
  -p VERIFICATION_VOLUME_SIZE=2G \
  -p VERIFICATION_VOLUME_CLASS=netapp-file-standard \
  -p ENVIRONMENT_FRIENDLY_NAME='ZEVA Database Backip' \
  -p ENVIRONMENT_NAME=zeva-prod | \
  oc create -f - -n tbiwaq-prod
5.1 If need to remove, only keeps configmap/backup-conf and the the nfs storage
oc -n tbiwaq-prod delete secret/patroni-backup secret/ftp-secret dc/patroni-backup pvc/backup-verification 

## Setup Nagios
nagios-base image is located in tbiwaq-tools project
nagios inage is located in tbiwaq-test and tbiwaq-prod project
oc policy add-role-to-user system:image-puller system:serviceaccount:tbiwaq-test:builder --namespace=tbiwaq-tools
oc policy add-role-to-user system:image-puller system:serviceaccount:tbiwaq-prod:builder --namespace=tbiwaq-tools