import React, { Component } from 'react';

class Login extends Component {
  render() {
    const CONFIG = {
      KEYCLOAK: {
        AUTHORITY: 'http://localhost:8888/auth/realms/zeva',
      },
    };

    return (
      <div id="login">
        <div id="header" className="login-tfrs-page-header">
          <div id="header-wrapper" className="login-tfrs-page-header-text">Transportation Fuels Reporting System</div>
        </div>
        <div className="login-tfrs-page">
          <div className="login-tfrs-brand" />
          <div className="card-tfrs">
            <div className="buttons-section">
              <div className="oidc">
                <a href={`${CONFIG.KEYCLOAK.AUTHORITY}/protocol/openid-connect/auth?response_type=token&client_id=${CONFIG.KEYCLOAK.CLIENT_ID}&redirect_uri=${this.redirectUri}&kc_idp_hint=bceid`} id="link-bceid" className="oidc">
                  <span className="text"> Login with </span>
                  <span className="display-name"> BCeID </span>
                </a>
              </div>
              <div className="oidc">
                <a href={`${CONFIG.KEYCLOAK.AUTHORITY}/protocol/openid-connect/auth?response_type=token&client_id=${CONFIG.KEYCLOAK.CLIENT_ID}&redirect_uri=${this.redirectUri}&kc_idp_hint=idir`} id="link-idir" className="oidc">
                  <span className="text">Login with</span>
                  <span className="display-name">IDIR</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Login;
