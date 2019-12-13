import React from 'react';
import { hot } from 'react-hot-loader/root';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';

const PageLayout = (props) => {
  const { children, keycloak } = props;

  return (
    <div>
      {keycloak.authenticated && (
        <div>
          <strong>Authenticated</strong>
          <ul>
            {keycloak.realmAccess.roles.map((role) => (
              <li>{role}</li>
            ))}
          </ul>
        </div>
      )}
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
    realmAccess: PropTypes.shape({
      roles: PropTypes.arrayOf(PropTypes.string),
    }),
  }).isRequired,
};

export default hot(withRouter(PageLayout));
