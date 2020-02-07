
### build backend
oc process -f ./backend-bc-release.yaml ZEVA_RELEASE=pipeline-release4 | oc apply -f - -n tbiwaq-tools --dry-run=true

### tag dev image
oc tag tbiwaq-tools/backend:pipeline-release4 tbiwaq-dev/backend:dev
oc tag tbiwaq-tools/frontend:pipeline-release4 tbiwaq-dev/frontend:dev
oc tag tbiwaq-tools/envoy:pipeline-release4 tbiwaq-dev/envoy:dev

### deploy dev image
oc process -f ./backend-dc-release.yaml ENV_NAME=dev CPU_REQUEST=100m CPU_LIMIT=500m MEMORY_REQUEST=512Mi MEMORY_LIMIT=2Gi | oc apply -f - -n tbiwaq-dev --dry-run=true
