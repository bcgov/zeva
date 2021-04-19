import PropTypes from 'prop-types';
import React from 'react';
import { Link, useParams } from 'react-router-dom';

import ROUTES_COMPLIANCE from '../../app/routes/Compliance';

const ComplianceReportTabs = (props) => {
  const { active, reportStatuses } = props;
  const { id } = useParams();

  const disableOtherTabs = reportStatuses.supplierInformation && reportStatuses.supplierInformation.status === 'UNSAVED';

  return (
    <ul
      className="nav nav-pills nav-justified compliance-report-tabs"
      key="tabs"
      role="tablist"
    >
      <li
        className={`nav-item ${(active === 'supplier-information') ? 'active' : ''} ${reportStatuses.supplierInformation ? reportStatuses.supplierInformation.status : ''}`}
        role="presentation"
      >
        <Link to={ROUTES_COMPLIANCE.REPORT_SUPPLIER_INFORMATION.replace(':id', id)}>Supplier Information</Link>
      </li>
      <li
        className={
          `nav-item
          ${(active === 'consumer-sales') ? ' active ' : ' '}
          ${reportStatuses.consumerSales ? reportStatuses.consumerSales.status : ''}
          `
        }
        role="presentation"
      >
        {disableOtherTabs && (
          <span className="disabled">Consumer Sales</span>
        )}
        {!disableOtherTabs && (
          <Link to={ROUTES_COMPLIANCE.REPORT_CONSUMER_SALES.replace(':id', id)}>Consumer Sales</Link>
        )}
      </li>
      <li
        className={
          `nav-item
          ${(active === 'credit-activity') ? ' active ' : ' '}
          ${reportStatuses.complianceObligation ? reportStatuses.complianceObligation.status : ''}
          `
        }
        role="presentation"
      >
        {disableOtherTabs && (
          <span className="disabled">Compliance Obligation</span>
        )}
        {!disableOtherTabs && (
          <Link to={ROUTES_COMPLIANCE.REPORT_CREDIT_ACTIVITY.replace(':id', id)}>Compliance Obligation</Link>
        )}
      </li>
      <li
        className={
          `nav-item
          ${(active === 'summary') ? ' active ' : ' '}
          ${reportStatuses.reportSummary ? reportStatuses.reportSummary.status : ''}
          `
      }
        role="presentation"
      >
        {disableOtherTabs && (
          <span className="disabled">Summary</span>
        )}
        {!disableOtherTabs && (
          <Link to={ROUTES_COMPLIANCE.REPORT_SUMMARY.replace(':id', id)}>Summary</Link>
        )}
      </li>
      <li
        className={
          `nav-item
          ${(active === 'assessment') ? ' active ' : ' '}
          ${reportStatuses.assessment ? reportStatuses.assessment.status : ''}
          `
        }
        role="presentation"
      >
        {disableOtherTabs && (
          <span className="disabled">Assessment</span>
        )}
        {!disableOtherTabs && (
          <Link to={ROUTES_COMPLIANCE.REPORT_ASSESSMENT}>Assessment</Link>
        )}
      </li>
    </ul>
  );
};

ComplianceReportTabs.defaultProps = {
  reportStatuses: {
    assessment: '',
    consumerSales: '',
    creditActivity: '',
    reportSummary: '',
    supplierInformation: '',
  },
};

ComplianceReportTabs.propTypes = {
  active: PropTypes.string.isRequired,
  reportStatuses: PropTypes.shape(),
};

export default ComplianceReportTabs;
