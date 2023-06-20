# Backup database in CronJob Mode
oc process -f ./backup-cronjob-2.6.1.yaml \
JOB_NAME=zeva-db-backup \
JOB_PERSISTENT_STORAGE_NAME=backup \
SCHEDULE="0 8 * * *" \
TAG_NAME=2.6.1 \
DATABASE_SERVICE_NAME=<spilo-readonly-service> \
DATABASE_DEFAULT_PORT=5432 \
DATABASE_NAME=zeva \
DATABASE_DEPLOYMENT_NAME=zeva-patroni-app \
DATABASE_USER_KEY_NAME=app-db-username \
DATABASE_PASSWORD_KEY_NAME=app-db-password \
BACKUP_STRATEGY=rolling \
BACKUP_DIR=/backups/backups-by-cron/ \
DAILY_BACKUPS=30 \
WEEKLY_BACKUPS=8 \
MONTHLY_BACKUPS=2 | oc apply -f -n <namespace>


oc process -f ./backup-cronjob-2.6.1.yaml \
JOB_NAME=zeva-db-backup \
JOB_PERSISTENT_STORAGE_NAME=backup \
SCHEDULE="0 8 * * *" \
TAG_NAME=2.6.1 \
DATABASE_SERVICE_NAME=zeva-spilo-test-readonly \
DATABASE_DEFAULT_PORT=5432 \
DATABASE_NAME=zeva \
DATABASE_DEPLOYMENT_NAME=zeva-patroni-app \
DATABASE_USER_KEY_NAME=app-db-username \
DATABASE_PASSWORD_KEY_NAME=app-db-password \
BACKUP_STRATEGY=rolling \
BACKUP_DIR=/backups-by-cronjob/ \
DAILY_BACKUPS=30 \
WEEKLY_BACKUPS=8 \
MONTHLY_BACKUPS=2 | oc apply -f -n e52f12-test