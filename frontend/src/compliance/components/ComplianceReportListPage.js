import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import CustomPropTypes from '../../app/utilities/props'
import ComplianceReportsTable from './ComplianceReportsTable'
import ROUTES_COMPLIANCE from '../../app/routes/Compliance'
import Loading from '../../app/components/Loading'
import history from '../../app/History'

const ComplianceReportListPage = (props) => {
  const {
    availableYears,
    data,
    filtered,
    loading,
    ratios,
    setFiltered,
    showSupplier,
    user
  } = props

  let modelYearOfNewReport
  if (availableYears.length > 0) {
    // Use the most recent (highest) available year
    modelYearOfNewReport = availableYears[availableYears.length - 1]
  } else if (!user.organization.hasSubmittedReport) {
    modelYearOfNewReport = user.organization.firstModelYear
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div id="compliance-report-list" className="page">
      <div className="row mt-3 mb-2">
        <div className="col-md-8 d-flex align-items-end">
          <h2>Model Year Reports</h2>
        </div>
        {!user.isGovernment && modelYearOfNewReport && (
          <div className="col-md-4 text-right">
            <button
              className="btn button primary ml-3"
              onClick={() => {
                history.push(
                  `${ROUTES_COMPLIANCE.NEW}?year=${modelYearOfNewReport}`
                )
              }}
              type="button"
            >
              <FontAwesomeIcon icon="plus" /> New Report
            </button>
          </div>
        )}
      </div>
      {!user.isGovernment && (
        <div className="text-blue mt-4">
          Under section 17 (5) of the ZEV Act a model year report must include
          for the adjustment period ending September 30:
          <ul className="mt-2">
            <li>
              the number of credits issued or transferred or added to your
              balance
            </li>
            <li>
              the number of credits offset or transferred away from your balance
            </li>
          </ul>
          Only submit this Model Year Report if all relevant credit applications to be considered in this 
          compliance period have been submitted to the Director. Model Year Reports must be submitted on 
          or before October 20.
        </div>
      )}
      <div className="row mt-4">
        <div className="col-sm-12">
          <ComplianceReportsTable
            data={data}
            filtered={filtered}
            ratios={ratios}
            setFiltered={setFiltered}
            showSupplier={showSupplier}
            user={user}
          />
        </div>
      </div>
    </div>
  )
}

ComplianceReportListPage.defaultProps = {
  showSupplier: false
}

ComplianceReportListPage.propTypes = {
  availableYears: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  ).isRequired,
  user: CustomPropTypes.user.isRequired,
  data: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  filtered: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  loading: PropTypes.bool.isRequired,
  setFiltered: PropTypes.func.isRequired,
  showSupplier: PropTypes.bool
}
export default ComplianceReportListPage
