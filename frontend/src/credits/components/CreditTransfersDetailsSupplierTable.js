import React from 'react'
import PropTypes from 'prop-types'
import ReactTable from '../../app/components/ReactTable'

import formatNumeric from '../../app/utilities/formatNumeric'
import getSupplierSummary from '../../app/utilities/getSupplierSummary'

const CreditTransfersDetailsSupplierTable = (props) => {
  const { submission } = props

  const tableText = (
    <div className="text-blue my-3">
      Issuing this transfer will result in the following credit balance change
      to each supplier.
    </div>
  )

  const supplierBalanceData = getSupplierSummary(submission)
  const supplierBalanceColumns = [
    {
      Header: 'Supplier',
      headerClassName: 'text-right',
      columns: [
        {
          id: 'supplier',
          accessor: (item) => item.supplierLabel,
          className: 'text-right',
          width: 250
        }
      ]
    },
    {
      Header: 'Current Balance',
      id: 'current-balance',
      headerClassName: 'font-weight-bold',
      className: 'text-center',
      columns: [
        {
          headerClassName: 'd-none',
          id: 'current-balance-a',
          accessor: (item) => `${formatNumeric(item.currentBalanceA)}-A`,
          className: 'text-right',
          width: 125
        },
        {
          headerClassName: 'd-none',
          id: 'current-balance-b',
          accessor: (item) => `${formatNumeric(item.currentBalanceB)}-B`,
          className: 'text-right',
          width: 125
        }
      ]
    },
    {
      Header: 'New Balance',
      headerClassName: 'font-weight-bold',
      id: 'new-balance',
      className: 'text-center',
      columns: [
        {
          headerClassName: 'd-none',
          id: 'newA',
          accessor: (item) => `${formatNumeric(item.newBalanceA)}-A`,
          width: 125,
          getProps: (state, rowInfo) => ({
            className: `text-right ${
              rowInfo.row.newA.slice(0, 2) < 0 ? 'text-danger' : ''
            }`
          })
        },
        {
          headerClassName: 'd-none',
          id: 'newB',
          accessor: (item) => `${formatNumeric(item.newBalanceB)}-B`,
          width: 125,
          getProps: (state, rowInfo) => ({
            className: `text-right ${
              rowInfo.row.newB.slice(0, 2) < 0 ? 'text-danger' : ''
            }`
          })
        }
      ]
    }
  ]
  return (
    <div className="row mb-4 mt-2">
      <div className="col-sm-11">
        <div className="form p-4">
          {tableText}
          <ReactTable
            className="transfer-summary-table"
            columns={supplierBalanceColumns}
            data={supplierBalanceData}
            filterable={false}
          />
        </div>
      </div>
    </div>
  )
}
CreditTransfersDetailsSupplierTable.propTypes = {
  submission: PropTypes.shape().isRequired
}
export default CreditTransfersDetailsSupplierTable
