## Setup Backup container
Use backup container release 2.0.0 to run the backup, current folder is backup-container-2.0.0
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
oc -n tbiwaq-dev create configmap backup-conf --from-file=./config/backup.conf
oc -n tbiwaq-prod create configmap backup-conf --from-file=./config/backup.conf
5. mount the NFS storage to httpd pod and create /postgresql-backup, /minio-backup and /rabbitmq-backup
6. create deployment config for backup container
6.1 for dev
BACKUP_VOLUME_NAME is pvc name, don't have to be nfs
oc -n tbiwaq-dev process -f ./templates/backup/backup-deploy.json \
  -p NAME=patroni-backup \
  -p SOURCE_IMAGE_NAME=patroni-backup \
  -p IMAGE_NAMESPACE=tbiwaq-tools \
  -p TAG_NAME=2.0.0 \
  -p DATABASE_SERVICE_NAME=patroni-master-dev-257 \
  -p DATABASE_NAME=zeva \
  -p DATABASE_DEPLOYMENT_NAME=patroni-dev-257 \
  -p DATABASE_USER_KEY_NAME=app-db-username \
  -p DATABASE_PASSWORD_KEY_NAME=app-db-password \
  -p TABLE_SCHEMA=public \
  -p BACKUP_STRATEGY=rolling \
  -p DAILY_BACKUPS=31 \
  -p WEEKLY_BACKUPS=12 \
  -p MONTHLY_BACKUPS=3 \
  -p BACKUP_PERIOD=1d \
  -p BACKUP_VOLUME_NAME=zeva-backup-dev \
  -p VERIFICATION_VOLUME_NAME=backup-verification \
  -p VERIFICATION_VOLUME_SIZE=2G \
  -p VERIFICATION_VOLUME_CLASS=netapp-file-standard \
  -p ENVIRONMENT_FRIENDLY_NAME='ZEVA Database Backup' \
  -p ENVIRONMENT_NAME=zeva-dev \
  -p MINIO_DATA_VOLUME_NAME=zeva-minio-dev-257 | \
  oc create -f - -n tbiwaq-dev
6.2 for production
BACKUP_VOLUME_NAME is the nfs storage name, for example bk-tbiwaq-prod-s9fvzvwddd
oc -n tbiwaq-prod process -f ./backup-deploy.json \
  -p NAME=patroni-backup \
  -p SOURCE_IMAGE_NAME=patroni-backup \
  -p IMAGE_NAMESPACE=tbiwaq-tools \
  -p TAG_NAME=2.0.0 \
  -p DATABASE_SERVICE_NAME=patroni-master-prod \
  -p DATABASE_NAME=zeva \
  -p DATABASE_DEPLOYMENT_NAME=patroni-prod \
  -p DATABASE_USER_KEY_NAME=app-db-username \
  -p DATABASE_PASSWORD_KEY_NAME=app-db-password \
  -p TABLE_SCHEMA=public \
  -p BACKUP_STRATEGY=rolling \
  -p DAILY_BACKUPS=31 \
  -p WEEKLY_BACKUPS=12 \
  -p MONTHLY_BACKUPS=3 \
  -p BACKUP_PERIOD=1d \
  -p BACKUP_VOLUME_NAME=bk****** \
  -p VERIFICATION_VOLUME_NAME=backup-verification \
  -p VERIFICATION_VOLUME_SIZE=2G \
  -p VERIFICATION_VOLUME_CLASS=netapp-file-standard \
  -p ENVIRONMENT_FRIENDLY_NAME='ZEVA Database Backup' \
  -p ENVIRONMENT_NAME=zeva-prod \
  -p MINIO_DATA_VOLUME_NAME=zeva-minio-prod | \
  oc create -f - -n tbiwaq-prod
7. If need to remove, only keeps configmap/backup-conf and the the nfs storage
oc -n tbiwaq-prod delete secret/patroni-backup secret/ftp-secret dc/patroni-backup pvc/backup-verification 