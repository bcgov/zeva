### Files included
* keycloak-secret.yaml includes keycloak secrets

### Create Secret keycloak-secret.yaml in tools, dev, test and prod env. The value for tools and dev should be same
oc process -f config/keycloak-secret.yaml KEYCLOAK_SA_CLIENT_SECRET=[Clients->sa client->Client Authenticator] \
clientId=[sa client] clientSecret=[same value of KEYCLOAK_SA_CLIENT_SECRET] \
zevaPublic=[public client] realmId=[realmId] ssoHost=[sso host name] \
| oc create -f - -n tbiwaq-xxx --dry-run=true
Notes: in keycload, there are two clients: once is sa client, the other one is public client