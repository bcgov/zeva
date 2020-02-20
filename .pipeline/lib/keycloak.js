"use strict";
const axios = require("axios");
const _ = require("lodash");
//code reference https://github.com/bcgov/HMCR/blob/0.7/.pipeline/lib/keycloak.js
module.exports = class KeyCloakClient {
    constructor(settings, oc) {
        this.phases = settings.phases;
        this.options = settings.options;
        this.oc = oc;
        this.zevaHost = this.phases.dev.host;
    }

    async init() {

        this.getSecrets();


        this.apiTokenPath = `/auth/realms/${this.realmId}/protocol/openid-connect/token`;
        this.zevaPublicClientPath = `auth/admin/realms/${this.realmId}/clients/${this.zevaClientId}`;
        this.api = axios.create({
            baseURL: `https://${this.ssoHost}`
        });
        console.log("this.api=", this.api);

        const token = await this.getAccessToken();
        console.log("token=", token);

        this.api.defaults.headers.common = {
            Authorization: `Bearer ${token}`
        };
    }

    getSecrets() {
        const keycloakSecret = this.oc.raw("get", [
            "secret",
            "zeva-keycloak",
            "-o",
            "json"
        ]);
        const secret = JSON.parse(keycloakSecret.stdout).data;
        console.log(secret);

        this.clientId = Buffer.from(secret.clientId, "base64").toString();
        this.clientSecret = Buffer.from(secret.clientSecret, "base64").toString();
        this.zevaClientId = Buffer.from(secret.zevaPublic, "base64").toString();
        this.realmId = Buffer.from(secret.realmId, "base64").toString();
        console.log(this.clientId);
        console.log(this.clientSecret);
        console.log(this.zevaClientId);
        console.log(this.realmId);

        this.ssoHost = Buffer.from(secret.host, "base64").toString();
        console.log(this.ssoHost);

        if (!this.clientId || !this.clientSecret || !this.zevaClientId)
            throw new Error(
                "Unable to retrieve Keycloak service account info from OpenShift"
            );
    }

    getAccessToken() {

        return this.api
            .post(this.apiTokenPath, "grant_type=client_credentials", {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                auth: {
                    username: this.clientId,
                    password: this.clientSecret
                }
            })
            .then(function(response) {
                if (!response.data.access_token)
                    throw new Error(
                        "Unable to retrieve Keycloak service account access token"
                    );

                return Promise.resolve(response.data.access_token);
            });
    }

    async getUris() {
        console.log("this.zevaPublicClientPath", this.zevaPublicClientPath );
        const response = await this.api.get(this.zevaPublicClientPath);
        console.log("---------response", response );

        const data = { ...response.data };
        const redirectUris = data.redirectUris;

        return { data, redirectUris };
    }

    async addUris() {
        await this.init();

        console.log("Attempting to add RedirectUri and WebOrigins");

        const { data, redirectUris} = await this.getUris();
        const putData = { id: data.id, clientId: data.clientId };

        const hasRedirectUris = redirectUris.find(item =>
            item.includes(this.zevaHost)
        );

        if (!hasRedirectUris) {
            redirectUris.push(`https://${this.zevaHost}/*`);
            putData.redirectUris = redirectUris;
        }

        if (!(hasRedirectUris)) {
            this.api
                .put(this.zevaPublicClientPath, putData)
                .then(() => console.log("RedirectUri and WebOrigins added."));
        } else {
            console.log("RedirectUri and WebOrigins add skipped.");
        }
    }

    async removeUris() {
        await this.init();

        console.log("Attempting to remove RedirectUri and WebOrigins");

        const { data, redirectUris } = await this.getUris();

        console.log(data);
        console.log(redirectUris);
        /*

        const putData = { id: data.id, clientId: data.clientId };

        const hasRedirectUris = redirectUris.find(item =>
            item.includes(this.zevaHost)
        );

        if (hasRedirectUris) {
            putData.redirectUris = redirectUris.filter(
                item => !item.includes(this.zevaHost)
            );
        }

        if (hasRedirectUris) {
            this.api
                .put(this.zevaPublicClientPath, putData)
                .then(() => console.log("RedirectUri and WebOrigins removed."));
        } else {
            console.log("RedirectUri and WebOrigins remove skipped.");
        }

         */
    }
};
