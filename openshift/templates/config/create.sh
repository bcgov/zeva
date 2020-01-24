oc process -f configmap.yaml ENV_NAME=dev SSO_NAME=sso-dev KEYCLOAK_REALM=rzh2zkjq | oc apply -f - -n tbiwaq-dev --dry-run=true

## do not use apply otherwise secrets could be overrided when rerun the command
oc process -f secrets.yaml | oc create -f - -n tbiwaq-dev --dry-run=true

## apply nfs storage through Openshift service catalog

