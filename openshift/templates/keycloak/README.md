### Files included
* keycloak-secret.yaml includes keycloak secrets

### Create Secret keycloak-secret.yaml in tools, dev, test and prod env. The value for tools and dev should be same
oc process -f keycloak-secret.yaml KEYCLOAK_SA_CLIENT_SECRET=[Clients->sa client->Client Authenticator] \
clientId=[sa client] clientSecret=[same value of KEYCLOAK_SA_CLIENT_SECRET] \
zevaPublic=[public client id, it is not Zeve, on sso console click Clients->zeva] realmId=[realmId] host=[sso host name] \
| oc create -f - -n e52f12-xxx --dry-run=client
Notes: in keycload, there are two clients: once is sa client, the other one is public client


oc process -f keycloak-secret.yaml KEYCLOAK_SA_CLIENT_SECRET=[] \
clientId=[zeva-django-sa] clientSecret=[] \
zevaPublic=[] realmId=[rzh2zkjq] host=[test.oidc.gov.bc.ca] \
| oc create -f - -n e52f12-test --dry-run=client
Notes: in keycload, there are two clients: once is sa client, the other one is public client