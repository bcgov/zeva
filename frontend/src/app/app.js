import React, { Component } from 'react';
import Keycloak from 'keycloak-js';

import Login from './Login';
import Router from './router';

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
      url: 'http://localhost:8888/auth',
      realm: 'zeva',
      clientId: 'zeva-app',
    });

    keycloak.init({ onLoad: 'check-sso', checkLoginIframe: false, promiseType: 'native' }).then((authenticated) => {
      this.setState({
        keycloak,
        authenticated,
      });
    });
  }

  render() {
    const { authenticated, keycloak } = this.state;

    if (!keycloak) {
      return <div>Loading...</div>;
    }

    if (keycloak && !authenticated) {
      return <Login />;
    }

    return (
      <Router keycloak={keycloak} />
    );
  }
}

export default App;
