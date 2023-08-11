/*
 * Presentational component
 */
import PropTypes from 'prop-types'
import React from 'react'
import ReactTable from '../../app/components/ReactTable'
import history from '../../app/History'
import ROUTES_CREDIT_AGREEMENTS from '../../app/routes/CreditAgreements'
import formatStatus from '../../app/utilities/formatStatus'
import formatNumeric from '../../app/utilities/formatNumeric'

const CreditAgreementsListTable = (props) => {
  const { items, filtered, setFiltered } = props
  const getCredits = (item, type) => {
    let totalCredits = 0
    item.creditAgreementContent.forEach((eachContent) => {
      if (eachContent.creditClass === type) {
        if (
          [
            'Administrative Credit Reduction',
            'Automatic Administrative Penalty',
            'Reassessment Reduction'
          ].includes(item.transactionType)
        ) {
          totalCredits -= parseFloat(eachContent.numberOfCredits)
        } else {
          totalCredits += parseFloat(eachContent.numberOfCredits)
        }
      }
    })
    return formatNumeric(totalCredits)
  }
  const COLUMNS = [
    {
      id: 'id',
      accessor: 'id',
      className: 'text-center',
      Header: 'ID',
      maxWidth: 100,
      sortMethod: (a, b) => {
        return b.id - a.id
      },
      Cell: (item) => {
        let transactionInitial = ''

        switch (item.original.transactionType) {
          case 'Initiative Agreement':
            transactionInitial = 'IA'
            break
          case 'Purchase Agreement':
            transactionInitial = 'PA'
            break
          case 'Administrative Credit Allocation':
            transactionInitial = 'AA'
            break
          case 'Administrative Credit Reduction':
            transactionInitial = 'AR'
            break
          case 'Automatic Administrative Penalty':
            transactionInitial = 'AP'
            break
          case 'Reassessment Allocation':
            transactionInitial = 'RA'
            break
          case 'Reassessment Reduction':
            transactionInitial = 'RR'
            break
          default:
            transactionInitial = ''
        }
        return <span>{transactionInitial.concat('-', item.original.id)}</span>
      }
    },
    {
      Header: 'Date',
      accessor: 'effectiveDate',
      id: 'col-transactionDate',
      className: 'text-center'
    },
    {
      Header: 'Supplier',
      accessor: (row) => row.organization.shortName,
      id: 'col-supplier',
      className: 'text-left'
    },
    {
      Header: 'Transaction',
      accessor: (row) => row.transactionType,
      id: 'col-transactionType',
      className: 'text-left'
    },
    {
      Header: 'A-Credits',
      accessor: (item) => getCredits(item, 'A'),
      id: 'colaCredits',
      getProps: (state, rowInfo) => ({
        className: rowInfo
          ? `text-right ${
              rowInfo.row.colaCredits.slice(0, 2) < 0 ? 'text-danger' : ''
            }`
          : ''
      })
    },
    {
      Header: 'B-Credits',
      accessor: (item) => getCredits(item, 'B'),
      id: 'colbCredits',
      getProps: (state, rowInfo) => ({
        className: rowInfo
          ? `text-right ${
              rowInfo.row.colbCredits.slice(0, 2) < 0 ? 'text-danger' : ''
            }`
          : ''
      })
    },
    {
      accessor: (row) => formatStatus(row.status),
      filterMethod: (filter, row) => {
        const filterValues = filter.value.split(',')

        let returnValue = false

        filterValues.forEach((filterValue) => {
          const value = filterValue.toLowerCase().trim()

          if (value !== '' && !returnValue) {
            returnValue = row[filter.id].toLowerCase().includes(value)
          }
        })

        return returnValue
      },
      className: 'text-center text-capitalize',
      Header: 'Status',
      id: 'col-status'
    }
  ]

  // Default sort by items by id int value
  items.sort(function (a, b) {
    return b.id - a.id
  })

  return (
    <ReactTable
      columns={COLUMNS}
      data={items}
      filtered={filtered}
      setFiltered={setFiltered}
      showPagination={true}
      getTrProps={(state, row) => {
        if (row && row.original) {
          return {
            onClick: () => {
              const { id } = row.original
              history.push(
                ROUTES_CREDIT_AGREEMENTS.DETAILS.replace(/:id/g, id),
                filtered
              )
            },
            className: 'clickable'
          }
        }

        return {}
      }}
    />
  )
}

CreditAgreementsListTable.propTypes = {
  filtered: PropTypes.arrayOf(PropTypes.object).isRequired,
  setFiltered: PropTypes.func.isRequired,
  items: PropTypes.arrayOf(PropTypes.shape).isRequired
}

export default CreditAgreementsListTable
