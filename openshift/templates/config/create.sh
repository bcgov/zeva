oc process -f configmap.yaml ENV_NAME=dev SSO_NAME=sso-dev KEYCLOAK_REALM=rzh2zkjq | oc apply -f - -n tbiwaq-dev --dry-run=true
oc process -f secrets.yaml | oc apply -f - -n tbiwaq-dev --dry-run=true
