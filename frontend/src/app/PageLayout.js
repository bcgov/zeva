import React from 'react';
import { hot } from 'react-hot-loader/root';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';

import { library } from '@fortawesome/fontawesome-svg-core';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';

import Disclaimer from './components/Disclaimer';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import CustomPropTypes from './utilities/props';

library.add(fab, far, fas);

const PageLayout = (props) => {
  const { children, user, keycloak, logout } = props;

  return (
    <>
      <div id="main" key="main">
        <Navbar user={user} keycloak={keycloak} logout={logout} />

        <div id="content">{children}</div>
      </div>
      {!user.isGovernment &&
        (props.location.pathname === '/compliance/calculator' ? (
          <div id="content">
            All Information is provided for your convenience and guidance only.
            This information does not replace or constitute legal advice, is not
            legally binding, and does not alter any obligations or requirements
            imposed under the <i>Zero-Emission Vehicles Act (“ZEV Act”)</i>.
            Users are responsible for ensuring compliance with the{' '}
            <i>ZEV Act</i> and the <i>Zero-Emission Vehicles Regulation</i>.
          </div>
        ) : (
          <Disclaimer />
        ))}
      <Footer key="footer" />
    </>
  );
};

PageLayout.defaultProps = {
  children: []
};

PageLayout.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]),
  keycloak: CustomPropTypes.keycloak.isRequired,
  user: CustomPropTypes.user.isRequired
};

export default hot(withRouter(PageLayout));
