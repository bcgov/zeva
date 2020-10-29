import React from 'react';
import CustomPropTypes from './utilities/props';

const Login = (props) => {
  const { keycloak } = props;

  return (
    <div id="login-page">
      <div id="header">
        <div className="text">Zero-Emission Vehicles Reporting System</div>
      </div>
      <div id="main-content">
        <div className="flex-container">
          <div className="brand-logo" />

          <div className="buttons-section">
            <div className="section">
              Vehicle Suppliers

              <button type="button" onClick={() => keycloak.login({ idpHint: 'bceid' })} id="link-bceid" className="button">
                <span className="text"> Login with </span>
                <span className="display-name"> BCeID </span>
              </button>
            </div>

            <hr className="divider" />

            <div className="section">
              Government

              <button type="button" onClick={() => keycloak.login({ idpHint: 'idir' })} id="link-idir" className="button">
                <span className="text">Login with</span>
                <span className="display-name"> IDIR </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Login.propTypes = {
  keycloak: CustomPropTypes.keycloak.isRequired,
};

export default Login;
