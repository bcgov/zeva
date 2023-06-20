import PropTypes from 'prop-types'
import React from 'react'

import CreditBalanceTable from './CreditBalanceTable'
import CreditTransactionListTable from './CreditTransactionListTable'

const CreditTransactions = (props) => {
  const { balances, assessedBalances, items, reports, user } = props

  return (
    <div id="credit-transaction" className="page">
      <div className="row my-3">
        <div className="col-sm-9">
          <h2 className="mb-2">Detailed Credit Balance</h2>
          <CreditBalanceTable balances={balances} assessedBalances={assessedBalances}/>
        </div>
      </div>

      <div className="row mt-5">
        <div className="col-sm-12">
          <h2 className="mb-2">Credit Transactions</h2>
          <CreditTransactionListTable
            items={items}
            reports={reports}
            user={user}
          />
        </div>
      </div>
    </div>
  )
}

CreditTransactions.propTypes = {
  balances: PropTypes.shape({}).isRequired,
  assessedBalances:PropTypes.shape({}).isRequired,
  items: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  reports: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  user: PropTypes.shape({
    isGovernment: PropTypes.bool,
    organization: PropTypes.shape()
  }).isRequired
}

export default CreditTransactions
