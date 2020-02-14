import React, { Component } from 'react';
import Keycloak from 'keycloak-js';

import Loading from './components/Loading';
import CONFIG from './config';
import Login from './Login';
import Router from './router';
import StatusInterceptor from './components/StatusInterceptor';

import 'react-table/react-table.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      authenticated: false,
      errorsOccurred: false,
      keycloak: null,
    };

    this.logout = this.logout.bind(this);
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
      flow: 'implicit',
    }).then((authenticated) => {
      this.setState({
        keycloak,
        authenticated,
      });
    });
  }

  componentDidCatch() {
    this.setState({ errorsOccurred: true });
  }

  logout() {
    this.setState({
      authenticated: false,
    });
  }

  render() {
    const { authenticated, errorsOccurred, keycloak } = this.state;

    if (errorsOccurred) {
      return <StatusInterceptor />;
    }

    if (!keycloak) {
      return <Loading />;
    }

    if (keycloak && !authenticated) {
      return <Login keycloak={keycloak} />;
    }

    return (
      <Router keycloak={keycloak} logout={this.logout} />
    );
  }
}

export default App;
