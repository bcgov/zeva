import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import CustomPropTypes from '../../app/utilities/props';
import ComplianceReportsTable from './ComplianceReportsTable';
import ROUTES_COMPLIANCE from '../../app/routes/Compliance';
import Loading from '../../app/components/Loading';
import history from '../../app/History';

const ComplianceReportListPage = (props) => {
  const {
    user,
    data,
    loading,
    collapsed,
    collapseDropdown,
    availableYears,
    showSupplier,
    filtered,
    setFiltered,
  } = props;

  if (loading) {
    return <Loading />;
  }

  return (
    <div id="compliance-report-list" className="page">
      <div className="row mt-3 mb-2">
        <div className="col-md-8 d-flex align-items-end">
          <h2>Model Year Reports</h2>
        </div>
        {availableYears.length > 0 && !user.isGovernment && (
          <div className="col-md-4 text-right">
            <div className="btn-group">
              <button
                className="btn button primary ml-3"
                onClick={() => {
                  history.push(`${ROUTES_COMPLIANCE.NEW}?year=${availableYears[0]}`);
                }}
                type="button"
              >
                <FontAwesomeIcon icon="plus" /> New Report
              </button>
              <button
                aria-expanded="false"
                aria-haspopup="true"
                className="btn button primary dropdown-toggle dropdown-toggle-split"
                data-toggle="dropdown"
                onClick={() => {
                  collapseDropdown();
                }}
                type="button"
              >
                <span className="sr-only">Toggle Dropdown</span>
              </button>
              <div
                aria-labelledby="navbarDropdown"
                className={`dropdown-menu p-0 ${collapsed ? 'd-none' : 'd-block'}`}
              >
                {availableYears.map((year) => (
                  <Link
                    className="py-2 px-3"
                    key={year}
                    to={`${ROUTES_COMPLIANCE.NEW}?year=${year}`}
                  >
                    {year}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      {!user.isGovernment && (
        <div className="text-blue mt-4">
          Under section 17 (5) of the ZEV Act a model year report must include for
          the adjustment period ending September 30:
          <ul className="mt-2">
            <li>
              the number of credits issued or transferred or added to your balance
            </li>
            <li>
              the number of credits offset or transferred away from your balance
            </li>
          </ul>
          Consumer sales of zero-emission vehicles made prior to October 1 must be
          included in a submitted credit application prior to completing your
          model year report. Model year reports must be submitted on or before
          October 20.
        </div>
      )}
      <div className="row mt-4">
        <div className="col-sm-12">
          <ComplianceReportsTable
            data={data}
            user={user}
            showSupplier={showSupplier}
            filtered={filtered}
            setFiltered={setFiltered}
          />
        </div>
      </div>
    </div>
  );
};

ComplianceReportListPage.defaultProps = {
  showSupplier: false,
};

ComplianceReportListPage.propTypes = {
  availableYears: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ])).isRequired,
  user: CustomPropTypes.user.isRequired,
  data: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  loading: PropTypes.bool.isRequired,
  collapsed: PropTypes.bool.isRequired,
  collapseDropdown: PropTypes.func.isRequired,
  showSupplier: PropTypes.bool,
};
export default ComplianceReportListPage;
