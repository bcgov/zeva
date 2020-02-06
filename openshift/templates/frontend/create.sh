oc process -f ./frontend-bc-release.yaml GIT_URL=https://github.com/bcgov/zeva.git GIT_REF=*** | oc apply -f - -n tbiwaq-tools --dry-run=true
oc tag tbiwaq-tools/frontend:pipeline-release4 tbiwaq-dev/frontend:dev
oc process -f ./frontend-dc-release.yaml CPU_REQUEST=100m CPU_LIMIT=500m MEMORY_REQUEST=1100M MEMORY_LIMIT=2G ENV_NAME=dev | oc apply -f - -n tbiwaq-dev --dry-run=true

