## Setup Backup container
0. Tag the backup-container image from tools project to environment project
oc tag e52f12-tools/patroni-backup:2.3.2 e52f12-test/patroni-backup:test

Use backup container release 2.0.0 to run the backup, current folder is backup-container-2.0.0
1. Request netapp-file-backup storage as backup space
follow https://github.com/BCDevOps/provision-nfs-apb/blob/master/docs/usage-gui.md to request nfs-backup storage

2. Build patroni-backup image
oc -n e52f12-tools process -f ./templates/backup/backup-build.yaml \
-p NAME=patroni-backup GIT_REPO_URL=https://github.com/BCDevOps/backup-container.git GIT_REF=2.3.2 OUTPUT_IMAGE_TAG=2.3.2  \
| oc -n e52f12-tools apply -f -

3. add to ./config/backup.conf, 9pm run backup, 10pm run verification
patroni-master-prod:5432/zeva
0 21 * * * default ./backup.sh -s
0 22 * * * default ./backup.sh -s -v all

4. create backup-conf configmap
oc -n e52f12-test create configmap backup-conf --from-file=./config/backup.conf
oc -n e52f12-prod create configmap backup-conf --from-file=./config/backup.conf

5. mount the netapp-file-backup storage to frontend pod and create /patroni-backup, /minio-backup and /rabbitmq-backup. remove the mount later

6. create deployment config for backup container
6.1 for test
oc -n e52f12-test process -f ./backup-deploy-test.yaml \
  -p NAME=patroni-backup \
  -p SOURCE_IMAGE_NAME=patroni-backup \
  -p IMAGE_NAMESPACE=e52f12-test \
  -p TAG_NAME=test \
  -p TABLE_SCHEMA=public \
  -p BACKUP_STRATEGY=rolling \
  -p ENVIRONMENT_FRIENDLY_NAME='ZEVA Database Backup' \
  -p ENVIRONMENT_NAME=e52f12-test \
  -p BACKUP_DIR=/backups/patroni-backup/ \
  -p DAILY_BACKUPS=10 \
  -p WEEKLY_BACKUPS=12 \
  -p MONTHLY_BACKUPS=3 \
  -p CONFIG_MAP_NAME=backup-conf \
  -p CONFIG_MOUNT_PATH=/ \
  -p BACKUP_VOLUME_NAME=backup-zeva-test \
  -p VERIFICATION_VOLUME_NAME=backup-verification \
  -p VERIFICATION_VOLUME_MOUNT_PATH=/var/lib/pgsql/data \
  -p MINIO_DATA_VOLUME_NAME=zeva-minio-test | \
  oc apply -f - -n e52f12-test

6.2 for production
oc -n e52f12-prod process -f ./backup-deploy-prod.yaml \
  -p NAME=patroni-backup \
  -p SOURCE_IMAGE_NAME=patroni-backup \
  -p IMAGE_NAMESPACE=e52f12-prod \
  -p TAG_NAME=prod \
  -p TABLE_SCHEMA=public \
  -p BACKUP_STRATEGY=rolling \
  -p ENVIRONMENT_FRIENDLY_NAME='ZEVA Database Backup' \
  -p ENVIRONMENT_NAME=e52f12-prod \
  -p BACKUP_DIR=/backups/patroni-backup/ \
  -p DAILY_BACKUPS=10 \
  -p WEEKLY_BACKUPS=12 \
  -p MONTHLY_BACKUPS=3 \
  -p CONFIG_MAP_NAME=backup-conf \
  -p CONFIG_MOUNT_PATH=/ \
  -p BACKUP_VOLUME_NAME=backup-zeva-tesprodt \
  -p VERIFICATION_VOLUME_NAME=backup-verification \
  -p VERIFICATION_VOLUME_MOUNT_PATH=/var/lib/pgsql/data \
  -p MINIO_DATA_VOLUME_NAME=zeva-minio-prod | \
  oc apply -f - -n e52f12-prod