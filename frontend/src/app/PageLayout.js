import React from 'react';
import { hot } from 'react-hot-loader/root';
import './css/App.scss';
import { withRouter } from 'react-router';
import { withKeycloak } from 'react-keycloak';
import PropTypes from 'prop-types';

const PageLayout = (props) => {
  const { children, keycloak } = props;

  return (
    <div>
      {keycloak.authenticated && <span>Authenticated</span>}
      {keycloak.authenticated || (
        <div>
          <span>Not Authenticated</span>
          <button
            onClick={() => props.keycloak.login()}
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
  keycloak: PropTypes.shape().isRequired,
};

export default hot(withRouter(withKeycloak(PageLayout)));
