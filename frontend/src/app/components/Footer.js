import React from 'react';
import { NavLink } from 'react-router-dom';

/* global __VERSION__ */

const Footer = () => (
  <div id="footer">
    <div id="version">
      <a href="https://github.com/bcgov/zeva/releases" rel="noopener noreferrer" target="_blank">
        {`v${__VERSION__}`}
      </a>
    </div>

    <div className="links">
      <NavLink
        activeClassName="active"
        to="/"
      >
        Home
      </NavLink>
      |
      <NavLink
        activeClassName="active"
        to="/"
      >
        Disclaimer
      </NavLink>
      |
      <NavLink
        activeClassName="active"
        to="/"
      >
        Privacy
      </NavLink>
      |
      <NavLink
        activeClassName="active"
        to="/"
      >
        Accessibility
      </NavLink>
      |
      <NavLink
        activeClassName="active"
        to="/"
      >
        Copyright
      </NavLink>
      |
      <NavLink
        activeClassName="active"
        to="/"
      >
        Contact Us
      </NavLink>
      |
      <NavLink
          activeClassName="active"
          to="/"
      >
        Test-Sprint5-1
      </NavLink>
    </div>
  </div>
);

Footer.defaultProps = {
};

Footer.propTypes = {
};

export default Footer;
