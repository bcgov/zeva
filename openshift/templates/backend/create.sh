oc process -f ./backend-bc-release.yaml GIT_URL=https://github.com/bcgov/zeva.git GIT_REF=release-pipeline | oc create -f - -n tbiwaq-tools --dry-run=true
oc process -f ./backend-dc-release.yaml ENV_NAME=dev DASH_ENV_NAME=-dev CPU_REQUEST=100m CPU_LIMIT=500m MEMORY_REQUEST=512Mi MEMORY_LIMIT=2Gi POSTGRESQL_USER=*** POSTGRESQL_PASSWORD=*** | oc create -f - -n tbiwaq-dev --dry-run=true
