import React, { Component } from 'react';
import Keycloak from 'keycloak-js';

import Loading from './components/Loading';
import CONFIG from './config';
import Login from './Login';
import Router from './router';

import 'toastr/build/toastr.min.css';
import 'react-table/react-table.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      authenticated: false,
      keycloak: null
    };

    this.logout = this.logout.bind(this);
  }

  componentDidMount() {
    const keycloak = Keycloak({
      clientId: CONFIG.KEYCLOAK.CLIENT_ID,
      realm: CONFIG.KEYCLOAK.REALM,
      url: CONFIG.KEYCLOAK.URL
    });

    keycloak
      .init({
        pkceMethod: 'S256',
        promiseType: 'native',
        redirectUri: CONFIG.KEYCLOAK.CALLBACK_URL,
        idpHint: 'idir'
      })
      .then((authenticated) => {
        this.setState({
          keycloak,
          authenticated
        });
      });
  }

  logout() {
    this.setState({
      authenticated: false
    });

    const { keycloak } = this.state;

    const kcLogoutUrl = keycloak.endpoints.logout() +
      '?post_logout_redirect_uri=' + CONFIG.KEYCLOAK.LOGOUT_URL +
      '&client_id=' + keycloak.clientId +
      '&id_token_hint=' + keycloak.idToken

    const url = CONFIG.KEYCLOAK.SITEMINDER_LOGOUT_URL + encodeURIComponent(kcLogoutUrl)

    window.location = url
  }

  render() {
    const { authenticated, keycloak } = this.state;

    if (!keycloak) {
      return <Loading />;
    }

    if (keycloak && !authenticated) {
      return <Login keycloak={keycloak} />;
    }

    return <Router keycloak={keycloak} logout={this.logout} />;
  }
}

export default App;
