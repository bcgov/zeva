import React from 'react';
import { hot } from 'react-hot-loader/root';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';

import './css/App.scss';

const PageLayout = (props) => {
  const { children, keycloak } = props;

  return (
    <div>
      {keycloak.authenticated && <span>Authenticated</span>}
      {keycloak.authenticated || (
        <div>
          <span>Not Authenticated</span>
          <button
            onClick={() => keycloak.login()}
            type="button"
          >
            Login
          </button>
        </div>
      )}
      {children}
    </div>
  );
};

PageLayout.defaultProps = {
  children: [],
};

PageLayout.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  keycloak: PropTypes.shape({
    authenticated: PropTypes.bool,
    login: PropTypes.func,
  }).isRequired,
};

export default hot(withRouter(PageLayout));
