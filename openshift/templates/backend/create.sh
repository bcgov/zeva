oc process -f ./backend-bc-release.yaml GIT_URL=https://github.com/bcgov/zeva.git GIT_REF=pipeline-release2 | oc apply -f - -n tbiwaq-tools --dry-run=true
oc tag tbiwaq-tools/backend:pipeline-release2 tbiwaq-dev/backend:dev
oc process -f ./backend-dc-release.yaml ENV_NAME=dev CPU_REQUEST=100m CPU_LIMIT=500m MEMORY_REQUEST=512Mi MEMORY_LIMIT=2Gi | oc apply -f - -n tbiwaq-dev --dry-run=true
