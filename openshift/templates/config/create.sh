## create configmap
oc process -f configmap.yaml ENV_NAME=dev SSO_NAME=sso-dev KEYCLOAK_REALM=rzh2zkjq | oc apply -f - -n tbiwaq-dev --dry-run=true

## Create secretes for rabbitmq

## create secrets for keycloak
## find the value for KEYCLOAK_SA_CLIENT_SECRET from keycloak consol
oc process -f keycloak-secret.yaml KEYCLOAK_SA_CLIENT_SECRET=*** | oc create -f - -n tbiwaq-dev --dry-run=true

## do not use oc apply otherwise secrets could be overrided when rerun the command
oc process -f secrets.yaml | oc create -f - -n tbiwaq-dev --dry-run=true


## apply nfs storage through Openshift service catalog

