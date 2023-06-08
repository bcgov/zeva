/*
 * Presentational component
 */
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import moment from 'moment-timezone'

import ReactTable from '../../app/components/ReactTable'
import formatNumeric from '../../app/utilities/formatNumeric'
import history from '../../app/History'
import ROUTES_CREDIT_REQUESTS from '../../app/routes/CreditRequests'
import ROUTES_CREDIT_AGREEMENTS from '../../app/routes/CreditAgreements'
import ROUTES_CREDIT_TRANSFERS from '../../app/routes/CreditTransfers'
import ROUTES_CREDITS from '../../app/routes/Credits'
import ROUTES_COMPLIANCE from '../../app/routes/Compliance'
import { accordionItemClickHandler, Accordion } from '../../app/components/Accordion'

const CreditTransactionListTable = (props) => {
  const { items, reports } = props

  const getInitialExpandedModelYears = () => {
    let latestModelYear = 0
    items.forEach((item) => {
      const modelYear = item.modelYear?.name
      if (modelYear && parseInt(modelYear) > parseInt(latestModelYear)) {
        latestModelYear = modelYear
      }
    })
    if (latestModelYear) {
      return [latestModelYear]
    }
    return []
  }

  const [expandedModelYears, setExpandedModelYears] = useState(getInitialExpandedModelYears())

  const translateTransactionType = (item) => {
    if (!item.transactionType) {
      return false
    }
    const { transactionType } = item.transactionType

    let name = ''

    if (transactionType.toLowerCase() === 'reduction') {
      const report = reports.find(
        (each) => Number(each.id) === item.foreignKey
      )

      if (report) {
        ({ name } = report.modelYear)
      }
    }

    switch (transactionType.toLowerCase()) {
      case 'validation':
        return 'Credit Application'
      case 'credit adjustment validation':
        if (item.detailTransactionType) {
          return item.detailTransactionType
        }
        return 'Initiative Agreement'
      case 'credit adjustment reduction':
        if (item.detailTransactionType) {
          return item.detailTransactionType
        }
        return 'Administrative Credit Reduction'
      case 'reduction':
        return `${name} Model Year Report Credit Reduction`
      default:
        return transactionType
    }
  }

  const abbreviateTransactionType = (item) => {
    if (!item.transactionType) {
      return false
    }

    const { transactionType } = item.transactionType

    switch (transactionType.toLowerCase()) {
      case 'validation':
        return 'CA'
      case 'credit transfer':
        return 'CT'
      case 'credit adjustment validation':
        if (item.detailTransactionType === 'Automatic Administrative Penalty') {
          return 'AP'
        }

        if (item.detailTransactionType === 'Purchase Agreement') {
          return 'PA'
        }

        if (item.detailTransactionType === 'Administrative Credit Allocation') {
          return 'AA'
        }
        if (item.detailTransactionType === 'Reassessment Allocation') {
          return 'RA'
        }

        return 'IA'
      case 'credit adjustment reduction':
        if (item.detailTransactionType === 'Administrative Credit Reduction') {
          return 'AR'
        }
        if (item.detailTransactionType === 'Reassessment Reduction') {
          return 'RR'
        }
        break
      case 'reduction':
        return 'CR'
      default:
        return transactionType
    }
  }

  let totalA = 0
  let totalB = 0

  const transactions = []

  items.sort((a, b) => {
    if (a.transactionTimestamp < b.transactionTimestamp) {
      return -1
    }

    if (a.transactionTimestamp > b.transactionTimestamp) {
      return 1
    }

    return 0
  })

  // for items  with the same date in transactionTimestamp, if item transactionType is 'Reduction' then it should be considered last in the list
  items.sort((a, b) => {
    if (moment(a.transactionTimestamp).format('YYYY-MM-DD') === moment(b.transactionTimestamp).format('YYYY-MM-DD')) {
      if (a.transactionType.transactionType === 'Reduction') {
        return 1
      }

      if (b.transactionType.transactionType === 'Reduction') {
        return -1
      }
    }

    return 0
  })

  items.forEach((item) => {
    const totalValue =
      Math.round((item.totalValue + Number.EPSILON) * 100) / 100

    if (item.creditClass.creditClass === 'A') {
      totalA += parseFloat(totalValue)
    }

    if (item.creditClass.creditClass === 'B') {
      totalB += parseFloat(totalValue)
    }

    const found = transactions.findIndex(
      (transaction) =>
        transaction.foreignKey === item.foreignKey &&
        transaction.transactionType &&
        item.transactionType &&
        transaction.transactionType.transactionType ===
          item.transactionType.transactionType
    )

    if (found >= 0) {
      transactions[found] = {
        ...transactions[found],
        creditsA:
          item.creditClass.creditClass === 'A'
            ? transactions[found].creditsA + totalValue
            : transactions[found].creditsA,
        creditsB:
          item.creditClass.creditClass === 'B'
            ? transactions[found].creditsB + totalValue
            : transactions[found].creditsB,
        displayTotalA:
          item.creditClass.creditClass === 'A'
            ? transactions[found].displayTotalA + totalValue
            : transactions[found].displayTotalA,
        displayTotalB:
          item.creditClass.creditClass === 'B'
            ? transactions[found].displayTotalB + totalValue
            : transactions[found].displayTotalB
      }
    } else {
      transactions.push({
        creditsA: item.creditClass.creditClass === 'A' ? totalValue : 0,
        creditsB: item.creditClass.creditClass === 'B' ? totalValue : 0,
        displayTotalA: totalA,
        displayTotalB: totalB,
        foreignKey: item.foreignKey,
        transactionTimestamp: item.transactionTimestamp,
        modelYear: item.modelYear,
        transactionType: item.transactionType,
        detailTransactionType: item.detailTransactionType
      })
    }
  })
  transactions.sort((a, b) => {
    if (moment(a.transactionTimestamp).format('YYYY-MM-DD') === moment(b.transactionTimestamp).format('YYYY-MM-DD')) {
      if (a.transactionType.transactionType === 'Reduction') {
        return -1
      }

      if (b.transactionType.transactionType === 'Reduction') {
        return 1
      }
    }

    if (a.transactionTimestamp > b.transactionTimestamp) {
      return -1
    }

    if (a.transactionTimestamp < b.transactionTimestamp) {
      return 1
    }

    return 0
  })

  const columns = [
    {
      Header: '',
      headerClassName: 'header-group',
      columns: [
        {
          accessor: (item) => {
            if (
              item.transactionType.transactionType === 'Reduction' &&
              !item.foreignKey
            ) {
              return 'AR'
            }

            return `${abbreviateTransactionType(item)}-${item.foreignKey}`
          },
          className: 'text-center',
          Header: 'Transaction ID',
          id: 'id',
          maxWidth: 150
        }
      ]
    },
    {
      Header: '',
      headerClassName: 'header-group date',
      columns: [
        {
          accessor: (item) =>
            moment(item.transactionTimestamp).format('YYYY-MM-DD'),
          className: 'text-center date',
          Header: 'Date',
          headerClassName: 'date',
          id: 'date',
          maxWidth: 200
        }
      ]
    },
    {
      Header: '',
      headerClassName: 'header-group transaction',
      columns: [
        {
          accessor: (item) => translateTransactionType(item),
          className: 'text-left transaction',
          Header: 'Transaction',
          headerClassName: 'text-left transaction',
          id: 'transaction'
        }
      ]
    },
    {
      Header: 'Credits',
      headerClassName: 'header-group credits-left',
      columns: [
        {
          accessor: (item) =>
            item.creditsA ? formatNumeric(item.creditsA, 2) : '-',
          className: 'text-right credits-left',
          Header: 'A',
          Cell: (item) => (
            <span className={item.original.creditsA < 0 ? 'text-danger' : ''}>
              {item.value}
            </span>
          ),
          headerClassName: 'credits-left',
          id: 'credit-class-a',
          maxWidth: 175
        },
        {
          accessor: (item) =>
            item.creditsB ? formatNumeric(item.creditsB, 2) : '-',
          className: 'text-right',
          Cell: (item) => (
            <span className={item.original.creditsB < 0 ? 'text-danger' : ''}>
              {item.value}
            </span>
          ),
          Header: 'B',
          id: 'credit-class-b',
          maxWidth: 175
        }
      ]
    },
    {
      Header: 'Balance',
      headerClassName: 'header-group balance-left',
      columns: [
        {
          accessor: (item) =>
            item.displayTotalA
              ? formatNumeric(item.displayTotalA, 2, true)
              : '-',
          className: 'text-right balance-left',
          Cell: (item) => (
            <span className={item.value < 0 ? 'text-danger' : ''}>
              {item.value}
            </span>
          ),
          Header: 'A',
          headerClassName: 'balance-left',
          id: 'credit-balance-a',
          maxWidth: 175
        },
        {
          accessor: (item) =>
            item.displayTotalB
              ? formatNumeric(item.displayTotalB, 2, true)
              : '-',
          className: 'text-right',
          Cell: (item) => (
            <span className={item.value < 0 ? 'text-danger' : ''}>
              {item.value}
            </span>
          ),
          Header: 'B',
          id: 'credit-balance-b',
          maxWidth: 175
        }
      ]
    }
  ]

  const getReactTable = (transactions) => {
    return (
      <ReactTable
      className="credit-transaction-list-table"
      columns={columns}
      data={transactions}
      defaultSorted={[]}
      sortable={false}
      filterable={false}
      getTrProps={(state, row) => {
        if (row && row.original) {
          return {
            onClick: () => {
              if (!row.original.transactionType) {
                return false
              }

              const item = row.original

              const { transactionType } = item.transactionType
              switch (transactionType.toLowerCase()) {
                case 'credit transfer':
                  history.push(
                    ROUTES_CREDIT_TRANSFERS.DETAILS.replace(
                      /:id/g,
                      item.foreignKey
                    ),
                    { href: ROUTES_CREDITS.LIST }
                  )
                  break
                case 'validation':
                  history.push(
                    ROUTES_CREDIT_REQUESTS.DETAILS.replace(
                      /:id/g,
                      item.foreignKey
                    ),
                    { href: ROUTES_CREDITS.LIST }
                  )
                  break
                case 'credit adjustment validation':
                  history.push(
                    ROUTES_CREDIT_AGREEMENTS.DETAILS.replace(
                      /:id/g,
                      item.foreignKey
                    ),
                    { href: ROUTES_CREDITS.LIST }
                  )
                  break
                case 'reduction':
                  history.push(
                    ROUTES_COMPLIANCE.REPORT_ASSESSMENT.replace(
                      /:id/g,
                      item.foreignKey
                    ),
                    { href: ROUTES_CREDITS.LIST }
                  )
                  break
                case 'credit adjustment reduction':
                  history.push(
                    ROUTES_CREDIT_AGREEMENTS.DETAILS.replace(
                      /:id/g,
                      item.foreignKey
                    ),
                    { href: ROUTES_CREDITS.LIST }
                  )
                  break
                default:
              }

              return false
            },
            className: 'clickable'
          }
        }

        return {}
      }}
    />
    )
  }

  const handleTransactionsGroupClick = (modelYear) => {
    accordionItemClickHandler(expandedModelYears, setExpandedModelYears, modelYear)
  }

  const transactionsByModelYear = {}

  transactions.forEach((transaction) => {
    const modelYear = transaction.modelYear?.name
    if (modelYear) {
      if (!transactionsByModelYear[modelYear]) {
        transactionsByModelYear[modelYear] = []
      }
      transactionsByModelYear[modelYear].push(transaction)
    }
  })

  const accordionItems = []

  for (const [year, transactionGroup] of Object.entries(transactionsByModelYear)) {
    const item = {}
    item.key = year
    item.title = `Credit Transactions for the ${year} Compliance Period (Oct.1, ${year} - Sept.30, ${parseInt(year) + parseInt(1)})`
    item.content = getReactTable(transactionGroup)
    accordionItems.push(item)
  }

  return (
    <Accordion
      items={accordionItems}
      keysOfOpenItems={expandedModelYears}
      handleItemClick={handleTransactionsGroupClick}    
    />
  )
}

CreditTransactionListTable.defaultProps = {}

CreditTransactionListTable.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  reports: PropTypes.arrayOf(PropTypes.shape({})).isRequired
}

export default CreditTransactionListTable
