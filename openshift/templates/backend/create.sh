
### build backend
oc process -f ./backend-bc.yaml NAME=zeva SUFFIX=-dev-96 VERSION=1.0.0-96 GIT_URL=https://github.com/bcgov/zeva.git GIT_REF=refs/pull/96/head | oc apply -f - -n tbiwaq-tools --dry-run=true

### tag dev image
oc tag tbiwaq-tools/backend:pipeline-release4 tbiwaq-dev/backend:dev
oc tag tbiwaq-tools/frontend:pipeline-release4 tbiwaq-dev/frontend:dev
oc tag tbiwaq-tools/envoy:pipeline-release4 tbiwaq-dev/envoy:dev

### deploy dev image
oc process -f ./backend-dc-release.yaml ENV_NAME=dev CPU_REQUEST=100m CPU_LIMIT=500m MEMORY_REQUEST=512Mi MEMORY_LIMIT=2Gi | oc apply -f - -n tbiwaq-dev --dry-run=true



oc process -f ./backend-bc-copy.yaml NAME=zeva SUFFIX=-dev-96 VERSION=1.0.0-96 GIT_URL=https://github.com/bcgov/zeva.git GIT_REF=refs/pull/96/head | oc apply -f - -n tbiwaq-tools --dry-run=true
