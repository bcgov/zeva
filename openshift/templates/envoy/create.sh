
## build envoy image
oc process -f ./envoy-bc-release.yaml ENV_NAME=dev ZEVA_RELEASE=pipeline-release4 | oc apply -f - -n tbiwaq-tools --dry-run=true

oc process -f ./envoy-dc.yaml CPU_REQUEST=100m CPU_LIMIT=500m MEMORY_REQUEST=1100M MEMORY_LIMIT=2G ENV_NAME=dev | oc apply -f - -n tbiwaq-dev --dry-run=true

oc tag tbiwaq-tools/envoy:pipeline-release4 tbiwaq-dev/envoy:dev
