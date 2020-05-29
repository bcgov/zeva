import React, { Component } from 'react';
import Keycloak from 'keycloak-js';

import Loading from './components/Loading';
import CONFIG from './config';
import Login from './Login';
import Router from './router';

import 'react-table/react-table.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      authenticated: false,
      keycloak: null,
    };
  }

  componentDidMount() {
    const keycloak = Keycloak({
      clientId: CONFIG.KEYCLOAK.CLIENT_ID,
      realm: CONFIG.KEYCLOAK.REALM,
      url: CONFIG.KEYCLOAK.URL,
    });

    keycloak.init({
      onLoad: 'check-sso',
      checkLoginIframe: false,
      promiseType: 'native',
      flow: 'hybrid',
    }).then((authenticated) => {
      this.setState({
        keycloak,
        authenticated,
      });
    });
  }

  render() {
    const { authenticated, keycloak } = this.state;

    if (!keycloak) {
      return <Loading />;
    }

    if (keycloak && !authenticated) {
      return <Login keycloak={keycloak} />;
    }

    return (
      <Router keycloak={keycloak} />
    );
  }
}

export default App;
