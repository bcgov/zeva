import React from 'react';
import CONFIG from './config';

const Login = () => {
  let url = `${CONFIG.KEYCLOAK.URL}/realms/${CONFIG.KEYCLOAK.REALM}`;
  url += '/protocol/openid-connect/auth?response_type=token';
  url += `&client_id=${CONFIG.KEYCLOAK.CLIENT_ID}`;
  url += `&redirect_uri=${window.location.href}`;

  return (
    <div id="login-page">
      <div id="header">
        <div className="text">Zero Emission Vehicle Reporting System</div>
      </div>
      <div id="main-content">
        <div className="flex-container">
          <div className="brand-logo" />

          <div className="buttons-section">
            <div className="section">
              Vehicle Suppliers

              <a href={`${url}&kc_idp_hint=bceid`} id="link-bceid" className="button">
                <span className="text"> Login with </span>
                <span className="display-name"> BCeID </span>
              </a>
            </div>

            <hr className="divider" />

            <div className="section">
              Government

              <a href={`${url}&kc_idp_hint=idir`} id="link-idir" className="button">
                <span className="text">Login with</span>
                <span className="display-name"> IDIR </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
