/*
 * Presentational component
 */
import PropTypes from 'prop-types'
import React from 'react'
import ReactTable from 'react-table'
import formatNumeric from '../../app/utilities/formatNumeric'
import calculateCreditBalance from '../../app/utilities/calculateCreditBalance'

const CreditBalanceTable = (props) => {
  const { balances, assessedBalances, backdatedTransactions } = props

  const { assessedDeficits, bCreditsInCaseOfDeficit, deficitAExists, deficitBExists, totalCredits } = calculateCreditBalance(balances, assessedBalances, backdatedTransactions)

  const getColumns = (keyColumnHeader, bColumnHeader) => {
    return [
      {
        accessor: (item) => (item.label),
        className: 'text-left',
        Header: keyColumnHeader,
        headerClassName: 'text-left',
        id: 'label'
      },
      {
        accessor: (item) => (item.A ? formatNumeric(item.A, 2, true) : '-'),
        className: 'text-right',
        Header: 'A',
        headerClassName: 'text-left',
        id: 'credit-class-A',
        maxWidth: 150
      },
      {
        accessor: (item) => (item.B ? formatNumeric(item.B, 2, true) : '-'),
        className: 'text-right',
        Header: bColumnHeader,
        id: 'credit-class-B',
        maxWidth: 150
      }
    ]
  }

  const getReactTable = (keyColumnHeader, bColumnHeader, data) => {
    const columns = getColumns(keyColumnHeader, bColumnHeader)
    const numberOfRows = Object.keys(data).length
    return (
      <ReactTable
        className="credit-balance-table"
        columns={columns}
        sortable={false}
        data={data}
        filterable={false}
        getTrProps={(state, rowInfo) => {
          if (rowInfo) {
            if (rowInfo.row.label.toLowerCase().includes('total')) {
              return {
                className: 'font-weight-bold'
              }
            }
          }
          return {}
        }}
        getTdProps={(state, rowInfo, column) => {
          if (rowInfo && column) {
            if ((rowInfo.original.A < 0 && column.Header === 'A') || (rowInfo.original.B < 0 && (column.Header === 'B' || column.Header === 'Unspecified'))) {
              return {
                className: 'background-danger'
              }
            }
          }
          return {}
        }}
        pageSize={numberOfRows > 0 ? numberOfRows : 1 }
        showPagination={false}
      />
    )
  }

  const getRows = (object, suffixForModelYears, reverse, removeZeroRows) => {
    const result = []
    for (const [key, structure] of Object.entries(object)) {
      if (removeZeroRows && !structure.A && !structure.B) {
        continue
      }
      let label = key
      if (!isNaN(parseInt(key))) {
        label = key + suffixForModelYears
      }
      result.push({ label, A: structure.A, B: structure.B })
    }
    if (reverse) {
      result.reverse()
    }
    return result
  }

  if (deficitAExists || deficitBExists) {
    return (
      <>
        {getReactTable('Your total balance cannot be calculated due to having an assessed deficit.', deficitBExists ? 'Unspecified' : 'B', getRows(assessedDeficits, ' Deficit', true, true).concat(getRows(bCreditsInCaseOfDeficit, ' Model Year Credits', true, true)))}
      </>
    )
  }

  return (
    <>
      {getReactTable('', 'B', getRows(totalCredits, ' Model Year Credits', true, true))}
    </>
  )
}

CreditBalanceTable.defaultProps = {}

CreditBalanceTable.propTypes = {
  balances: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  assessedBalances: PropTypes.shape({
    balances: PropTypes.arrayOf(PropTypes.shape()),
    deficits: PropTypes.arrayOf(PropTypes.shape())
  }).isRequired
}

export default CreditBalanceTable
