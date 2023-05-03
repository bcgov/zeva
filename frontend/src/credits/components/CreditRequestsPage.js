import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import PropTypes from 'prop-types'
import React from 'react'

import history from '../../app/History'
import CustomPropTypes from '../../app/utilities/props'
import ROUTES_CREDIT_REQUESTS from '../../app/routes/CreditRequests'
import CreditRequestListTable from './CreditRequestListTable'

const CreditRequestsPage = (props) => {
  const {
    handleClear,
    page,
    setPage,
    pageSize,
    setPageSize,
    filters,
    setFilters,
    setApplyFiltersCount,
    sorts,
    setSorts,
    submissions,
    submissionsCount,
    loading,
    user
  } = props

  return (
    <div id="credit-requests-list" className="page">
      <div className="row mt-3 mb-2">
        <div className="col-md-8 d-flex align-items-end">
          <h2>Application for Credits for Consumer Sales</h2>
        </div>

        <div className="col-md-4 text-right">
          <button
            type="button"
            className="button"
            onClick={handleClear}
            disabled={filters.length === 0 && sorts.length === 0}
          >
            Clear Filters
          </button>
          {!user.isGovernment &&
            typeof user.hasPermission === 'function' &&
            user.hasPermission('CREATE_SALES') && (
              <button
                className="button primary ml-3"
                onClick={() => {
                  history.push(ROUTES_CREDIT_REQUESTS.NEW)
                }}
                type="button"
              >
                <FontAwesomeIcon icon="plus" /> New Credit Application
              </button>
          )}
        </div>
      </div>
      <div className="row">
        <div className="col-sm-12">
          <CreditRequestListTable
            page={page}
            setPage={setPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            filters={filters}
            setFilters={setFilters}
            setApplyFiltersCount={setApplyFiltersCount}
            sorts={sorts}
            setSorts={setSorts}
            items={submissions}
            itemsCount={submissionsCount}
            loading={loading}
            user={user}
          />
        </div>
      </div>
    </div>
  )
}

CreditRequestsPage.propTypes = {
  handleClear: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  setPage: PropTypes.func.isRequired,
  pageSize: PropTypes.number.isRequired,
  setPageSize: PropTypes.func.isRequired,
  filters: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  setFilters: PropTypes.func.isRequired,
  setApplyFiltersCount: PropTypes.func.isRequired,
  sorts: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  setSorts: PropTypes.func.isRequired,
  submissions: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  submissionsCount: PropTypes.number.isRequired,
  loading: PropTypes.bool.isRequired,
  user: CustomPropTypes.user.isRequired
}

export default CreditRequestsPage
