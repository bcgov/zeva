import React from 'react';
import CONFIG from './config';

const Login = () => {
  let url = `${CONFIG.KEYCLOAK.URL}/realms/${CONFIG.KEYCLOAK.REALM}`;
  url += '/protocol/openid-connect/auth?response_type=token';
  url += `&client_id=${CONFIG.KEYCLOAK.CLIENT_ID}`;
  url += `&redirect_uri=${window.location.href}`;

  return (
    <div id="login">
      <div id="header">
        <div id="header-wrapper" className="login-zeva-page-header-text">Zero Emission Vehicle Reporting System</div>
      </div>
      <div className="login-zeva-page">
        <div className="login-zeva-brand" />
        <div className="card-zeva">
          <div className="buttons-section">
            <div className="oidc">
              <a href={`${url}&kc_idp_hint=bceid`} id="link-bceid" className="oidc">
                <span className="text"> Login with </span>
                <span className="display-name"> BCeID </span>
              </a>
            </div>
            <div className="oidc">
              <a href={`${url}&kc_idp_hint=idir`} id="link-idir" className="oidc">
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
