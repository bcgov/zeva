/*
 * Presentational component
 */
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import moment from 'moment-timezone'

import CustomReactTable from '../../app/components/ReactTable'
import ReactTable from 'react-table'
import formatNumeric from '../../app/utilities/formatNumeric'
import history from '../../app/History'
import ROUTES_CREDIT_REQUESTS from '../../app/routes/CreditRequests'
import ROUTES_CREDIT_AGREEMENTS from '../../app/routes/CreditAgreements'
import ROUTES_CREDIT_TRANSFERS from '../../app/routes/CreditTransfers'
import ROUTES_CREDITS from '../../app/routes/Credits'
import ROUTES_COMPLIANCE from '../../app/routes/Compliance'
import ROUTES_SUPPLEMENTARY from '../../app/routes/SupplementaryReport'
import { accordionItemClickHandler, Accordion } from '../../app/components/Accordion'
import getComplianceYear from '../../app/utilities/getComplianceYear'

const CreditTransactionListTable = (props) => {
  const { assessedSupplementalsMap, items, reports, availableComplianceYears, handleGetCreditTransactions } = props
  const [expandedComplianceYears, setExpandedComplianceYears] = useState(availableComplianceYears.length > 0 ? [availableComplianceYears[0]] : [])

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
            : transactions[found].creditsB
      }
    } else {
      transactions.push({
        creditsA: item.creditClass.creditClass === 'A' ? totalValue : 0,
        creditsB: item.creditClass.creditClass === 'B' ? totalValue : 0,
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
    }
  ]

  const getReactTable = (transactions) => {
    return (
      <CustomReactTable
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
                    if (assessedSupplementalsMap[item.foreignKey]) {
                      history.push(
                        ROUTES_SUPPLEMENTARY.SUPPLEMENTARY_DETAILS.replace(
                          /:id/g,
                          item.foreignKey
                        ).replace(
                          /:supplementaryId/g,
                          assessedSupplementalsMap[item.foreignKey]
                        ),
                        { href: ROUTES_CREDITS.LIST }
                      )
                    } else {
                      history.push(
                        ROUTES_COMPLIANCE.REPORT_ASSESSMENT.replace(
                          /:id/g,
                          item.foreignKey
                        ),
                        { href: ROUTES_CREDITS.LIST }
                      )
                    }
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

  const getLoadingReactTable = () => {
    return (
      <ReactTable
        className="credit-transaction-list-table"
        loading={true}
        columns={columns}
        pageSize={3}
        showPagination={false}
      />
    )
  }

  const handleTransactionsGroupClick = (complianceYear) => {
    if (!expandedComplianceYears.includes(complianceYear) && handleGetCreditTransactions) {
      handleGetCreditTransactions(complianceYear)
    }
    accordionItemClickHandler(expandedComplianceYears, setExpandedComplianceYears, complianceYear)
  }

  const transactionsByCompliancePeriod = {}

  transactions.forEach((transaction) => {
    const timestamp = transaction.transactionTimestamp
    if (timestamp) {
      const complianceYear = getComplianceYear(timestamp)
      if (!transactionsByCompliancePeriod[complianceYear]) {
        transactionsByCompliancePeriod[complianceYear] = []
      }
      transactionsByCompliancePeriod[complianceYear].push(transaction)
    }
  })

  const accordionItems = []

  for (const year of availableComplianceYears) {
    const item = {}
    item.key = year
    item.title = `Credit Transactions for the ${year} Compliance Period (Oct.1, ${year} - Sept.30, ${parseInt(year) + 1})`
    if (transactionsByCompliancePeriod[year]) {
      item.content = getReactTable(transactionsByCompliancePeriod[year])
    } else {
      item.content = getLoadingReactTable()
    }
    accordionItems.push(item)
  }

  return (
    <Accordion
      items={accordionItems}
      keysOfOpenItems={expandedComplianceYears}
      handleItemClick={handleTransactionsGroupClick}
    />
  )
}

CreditTransactionListTable.defaultProps = {}

CreditTransactionListTable.propTypes = {
  assessedSupplementalsMap: PropTypes.shape().isRequired,
  availableComplianceYears: PropTypes.arrayOf(PropTypes.number).isRequired,
  items: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  reports: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  handleGetCreditTransactions: PropTypes.func
}

export default CreditTransactionListTable
