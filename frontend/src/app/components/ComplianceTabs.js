import React from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

import CONFIG from '../config'
import ROUTES_COMPLIANCE from '../routes/Compliance'
import CustomPropTypes from '../utilities/props'

const ComplianceTabs = (props) => {
  const { active, user } = props

  return (
    <ul className="nav nav-tabs" key="tabs" role="tablist">
      {CONFIG.FEATURES.MODEL_YEAR_REPORT.ENABLED && (
        <li
          className={`nav-item ${active === 'reports' ? 'active' : ''}`}
          role="presentation"
        >
          <Link to={ROUTES_COMPLIANCE.REPORTS}>Model Year Reports</Link>
        </li>
      )}
      {CONFIG.FEATURES.COMPLIANCE_RATIOS.ENABLED && (
        <li
          className={`nav-item ${active === 'ratios' ? 'active' : ''}`}
          role="presentation"
        >
          <Link to={ROUTES_COMPLIANCE.RATIOS}>Compliance Ratios</Link>
        </li>
      )}
      {!user.isGovernment &&
        user.hasPermission('EDIT_SALES') &&
        CONFIG.FEATURES.COMPLIANCE_CALCULATOR.ENABLED && (
          <li
            className={`nav-item ${active === 'calculator' ? 'active' : ''}`}
            role="presentation"
          >
            <Link to={ROUTES_COMPLIANCE.CALCULATOR}>Compliance Calculator</Link>
          </li>
      )}
    </ul>
  )
}

ComplianceTabs.propTypes = {
  active: PropTypes.string.isRequired,
  user: CustomPropTypes.user.isRequired
}

export default ComplianceTabs
