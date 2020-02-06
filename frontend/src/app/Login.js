import React from 'react';
import CONFIG from './config';

const Login = (props) => {
  const { keycloak } = props;

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

              {/* eslint-disable-next-line react/prop-types */}
              <a href="#" onClick={() => keycloak.login({ idpHint: 'bceid' })} id="link-bceid" className="button">
                <span className="text"> Login with </span>
                <span className="display-name"> BCeID </span>
              </a>
            </div>

            <hr className="divider" />

            <div className="section">
              Government

              {/* eslint-disable-next-line react/prop-types */}
              <a href="#" onClick={() => keycloak.login({ idpHint: 'idir' })} id="link-idir" className="button">
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
