import React from 'react'
import PropTypes from 'prop-types'

import Button from '../../app/components/Button'
import CustomPropTypes from '../../app/utilities/props'
import Loading from '../../app/components/Loading'
import CreditTransactions from '../../credits/components/CreditTransactions'
import ROUTES_ORGANIZATIONS from '../../app/routes/Organizations'

const VehicleSupplierSalesListPage = (props) => {
  const { availableComplianceYears, loading, locationState, user, items, handleGetCreditTransactions, reports, balances, assessedBalances } = props

  if (loading) {
    return <Loading />
  }

  return (
    <div className="page">
      <div className="row">
        <div className="col-sm-12">
          <CreditTransactions
            availableComplianceYears={availableComplianceYears}
            balances={balances}
            assessedBalances={assessedBalances}
            reports={reports}
            items={items}
            handleGetCreditTransactions={handleGetCreditTransactions}
            user={user}
          />
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="action-bar">
            <span className="left-content">
              <Button
                buttonType="back"
                locationRoute={ROUTES_ORGANIZATIONS.LIST}
                locationState={locationState}
              />
            </span>
            <span className="right-content" />
          </div>
        </div>
      </div>
    </div>
  )
}

VehicleSupplierSalesListPage.defaultProps = {
  locationState: undefined
}

VehicleSupplierSalesListPage.propTypes = {
  availableComplianceYears: PropTypes.arrayOf(PropTypes.number).isRequired,
  balances: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  assessedBalances: PropTypes.shape({}).isRequired,
  items: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  loading: PropTypes.bool.isRequired,
  locationState: PropTypes.arrayOf(PropTypes.shape()),
  reports: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  user: CustomPropTypes.user.isRequired,
  handleGetCreditTransactions: PropTypes.func
}

export default VehicleSupplierSalesListPage
