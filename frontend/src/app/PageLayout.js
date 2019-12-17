import React from 'react';
import { hot } from 'react-hot-loader/root';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';

import { library } from '@fortawesome/fontawesome-svg-core';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';

import Footer from './components/Footer';
import Navbar from './components/Navbar';

library.add(fab, far, fas);

const PageLayout = (props) => {
  const { children, keycloak } = props;

  return ([
    <div id="main" key="main">
      <Navbar />
      {keycloak.authenticated && (
        <div>
          <strong>Authenticated</strong>
          <ul>
            {keycloak.realmAccess.roles.map((role) => (
              <li key={role}>{role}</li>
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
    </div>,
    <Footer key="footer" />,
  ]);
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
