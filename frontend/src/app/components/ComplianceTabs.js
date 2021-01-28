import React from 'react';
import { Link } from 'react-router-dom';
import ROUTES_COMPLIANCE from '../routes/Compliance';
import PropTypes from 'prop-types';
import CustomPropTypes from '../utilities/props';

const ComplianceTabs = (props) => {
  const { active, user } = props;

  return (
    <ul
      className="nav nav-tabs"
      key="tabs"
      role="tablist"
    >
      <li
        className={`nav-item ${(active === 'reports') ? 'active' : ''}`}
        role="presentation"
      >
        <Link to={ROUTES_COMPLIANCE.REPORTS}>Compliance Reports</Link>
      </li>
      <li
        className={`nav-item ${(active === 'ratios') ? 'active' : ''}`}
        role="presentation"
      >
        <Link to={ROUTES_COMPLIANCE.RATIOS}>Compliance Ratios</Link>
      </li>
      <li
        className={`nav-item ${(active === 'calculator') ? 'active' : ''}`}
        role="presentation"
      >
        <Link to={ROUTES_COMPLIANCE.CALCULATOR}>Compliance Calculator</Link>
      </li>
    </ul>
  );
};

ComplianceTabs.propTypes = {
  active: PropTypes.string.isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default ComplianceTabs;
