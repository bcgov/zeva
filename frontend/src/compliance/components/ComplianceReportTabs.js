import PropTypes from 'prop-types'
import React from 'react'
import { Link, useParams } from 'react-router-dom'

import ROUTES_COMPLIANCE from '../../app/routes/Compliance'

const ComplianceReportTabs = (props) => {
  const { active, reportStatuses, user, modelYear } = props
  const { id } = useParams()
  const disableOtherTabs =
    reportStatuses.supplierInformation &&
    reportStatuses.supplierInformation.status === 'UNSAVED'
  const disableAssessment =
    (reportStatuses.reportSummary &&
      ['DRAFT'].indexOf(reportStatuses.reportSummary.status) >= 0 &&
      user.isGovernment) ||
    (reportStatuses.assessment &&
      reportStatuses.assessment.status !== 'ASSESSED' &&
      !user.isGovernment)

  return (
    <ul
      className="nav nav-pills nav-justified compliance-report-tabs d-print-none"
      key="tabs"
      role="tablist"
    >
      <li
        className={`nav-item ${
          active === 'supplier-information' ? 'active' : ''
        } ${
          reportStatuses.supplierInformation
            ? reportStatuses.supplierInformation.status
            : ''
        }`}
        role="presentation"
      >
        <Link
          to={ROUTES_COMPLIANCE.REPORT_SUPPLIER_INFORMATION.replace(':id', id)}
        >
          Supplier Information
        </Link>
      </li>
      <li
        className={`nav-item
          ${active === 'consumer-sales' ? ' active ' : ' '}
          ${
            reportStatuses.consumerSales
              ? reportStatuses.consumerSales.status
              : ''
          }
          `}
        role="presentation"
      >
        {disableOtherTabs && <span className="disabled">{modelYear < 2024 ? "Consumer Sales" : "ZEVs Supplied and Registered"}</span>}
        {!disableOtherTabs && (
          <Link to={ROUTES_COMPLIANCE.REPORT_CONSUMER_SALES.replace(':id', id)}>
            {modelYear < 2024 ? "Consumer ZEV Sales" : "ZEVs Supplied and Registered"}
          </Link>
        )}
      </li>
      <li
        className={`nav-item
          ${active === 'credit-activity' ? ' active ' : ' '}
          ${
            reportStatuses.complianceObligation
              ? reportStatuses.complianceObligation.status
              : ''
          }
          `}
        role="presentation"
      >
        {disableOtherTabs && (
          <span className="disabled">Compliance Obligation</span>
        )}
        {!disableOtherTabs && (
          <Link
            to={ROUTES_COMPLIANCE.REPORT_CREDIT_ACTIVITY.replace(':id', id)}
          >
            Compliance Obligation
          </Link>
        )}
      </li>
      <li
        className={`nav-item
          ${active === 'summary' ? ' active ' : ' '}
          ${
            reportStatuses.reportSummary
              ? reportStatuses.reportSummary.status
              : ''
          }
          ${reportStatuses.assessment ? reportStatuses.assessment.status : ''}
          `}
        role="presentation"
      >
        {disableOtherTabs && <span className="disabled">Summary</span>}
        {!disableOtherTabs && (
          <Link to={ROUTES_COMPLIANCE.REPORT_SUMMARY.replace(':id', id)}>
            Summary
          </Link>
        )}
      </li>
      <li
        className={`nav-item
          ${active === 'assessment' ? ' active ' : ' '}
          ${reportStatuses.assessment ? reportStatuses.assessment.status : ''}
          ${
            reportStatuses.assessment &&
            reportStatuses.assessment.status === 'UNSAVED'
              ? 'SAVED'
              : ''
          }
          `}
        role="presentation"
      >
        {(disableOtherTabs || disableAssessment) && (
          <span className="disabled">Assessment</span>
        )}
        {!disableOtherTabs && !disableAssessment && (
          <Link to={ROUTES_COMPLIANCE.REPORT_ASSESSMENT.replace(':id', id)}>
            Assessment
          </Link>
        )}
      </li>
    </ul>
  )
}

ComplianceReportTabs.defaultProps = {
  reportStatuses: {
    assessment: '',
    consumerSales: '',
    creditActivity: '',
    reportSummary: '',
    supplierInformation: ''
  }
}

ComplianceReportTabs.propTypes = {
  active: PropTypes.string.isRequired,
  reportStatuses: PropTypes.shape(),
  user: PropTypes.shape().isRequired,
  modelYear: PropTypes.number.isRequired
}

export default ComplianceReportTabs
