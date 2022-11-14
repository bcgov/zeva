FROM sleighzy/keycloak:16.1.0-arm64
COPY realm.json /tmp/realm.json
COPY themes/bcgov-with-login-form /opt/jboss/keycloak/themes/bcgov-with-login-form

ENV KEYCLOAK_USER admin
ENV KEYCLOAK_PASSWORD admin

ENV KEYCLOAK_IMPORT /tmp/realm.json

EXPOSE 8443
EXPOSE 8888
