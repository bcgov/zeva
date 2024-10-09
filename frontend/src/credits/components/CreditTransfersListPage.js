import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import PropTypes from 'prop-types'

import Loading from '../../app/components/Loading'
import history from '../../app/History'
import CustomPropTypes from '../../app/utilities/props'
import CreditTransfersListTable from './CreditTransfersListTable'
import ROUTES_CREDIT_TRANSFERS from '../../app/routes/CreditTransfers'

const CreditTransfersListPage = (props) => {
  const { creditTransfers, filtered, handleClear, loading, setFiltered, user } =
    props

  if (loading) {
    return <Loading />
  }

  return (
    <div className="page">
      <div className="row mt-3 mb-2">
        <div className="col-md-8 d-flex align-items-end">
          <h2>ZEV Credit Transfers</h2>
        </div>

        <div className="col-md-4 text-right">
          <button
            className="button"
            onClick={handleClear}
            type="button"
            disabled={filtered.length === 0}
          >
            Clear Filters
          </button>
          {!user.isGovernment &&
            typeof user.hasPermission === 'function' &&
            user.hasPermission('CREATE_CREDIT_TRANSFERS') && (
              <button
                className="button primary ml-3"
                onClick={() => {
                  history.push(ROUTES_CREDIT_TRANSFERS.NEW)
                }}
                type="button"
              >
                <FontAwesomeIcon icon="plus" /> New Credit Transfer
              </button>
          )}
        </div>
      </div>

      <div className="row">
        <div className="col-md-12">
          <CreditTransfersListTable
            items={creditTransfers}
            user={user}
            filtered={filtered}
            setFiltered={setFiltered}
          />
        </div>
      </div>
    </div>
  )
}

CreditTransfersListPage.defaultProps = {
  filtered: undefined,
  setFiltered: undefined
}

CreditTransfersListPage.propTypes = {
  creditTransfers: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  filtered: PropTypes.arrayOf(PropTypes.shape()),
  handleClear: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  setFiltered: PropTypes.func,
  user: CustomPropTypes.user.isRequired
}

export default CreditTransfersListPage
