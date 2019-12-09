import React from 'react';
import Keycloak from 'keycloak-js';
import { KeycloakProvider } from 'react-keycloak';

import Router from './router';

// Setup Keycloak instance as needed
const keycloak = new Keycloak({
  url: 'http://localhost:8888/auth',
  realm: 'zeva',
  clientId: 'zeva-app',
});

const App = () => (
  <KeycloakProvider keycloak={keycloak} initConfig={{ promiseType: 'native' }}>
    <Router />
  </KeycloakProvider>
);

export default App;
