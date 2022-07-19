import React from "react";

/* global __VERSION__ */

const Footer = () => (
  <div id="footer" className="no-print">
    <div id="version">
      <a
        href="https://github.com/bcgov/zeva/releases"
        rel="noopener noreferrer"
        target="_blank"
      >
        {`v${__VERSION__}`}
      </a>
    </div>

    <div className="links">
      <a href="http://www.gov.bc.ca/disclaimer">Disclaimer</a>|
      <a href="http://www.gov.bc.ca/privacy">Privacy</a>|
      <a href="http://www.gov.bc.ca/accessible-government">Accessibility</a>|
      <a href="http://www.gov.bc.ca/copyright">Copyright</a>|
      <a href="http://www.gov.bc.ca/contactus">Contact Us</a>
    </div>
  </div>
);

Footer.defaultProps = {};

Footer.propTypes = {};

export default Footer;
