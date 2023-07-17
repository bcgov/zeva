/*
 * Presentational component
 */
import moment from 'moment-timezone'
import PropTypes from 'prop-types'
import React from 'react'
import history from '../../app/History'
import ReactTable from '../../app/components/ReactTable'
import CustomPropTypes from '../../app/utilities/props'
import formatNumeric from '../../app/utilities/formatNumeric'
import formatStatus from '../../app/utilities/formatStatus'
import ROUTES_CREDIT_TRANSFERS from '../../app/routes/CreditTransfers'

const CreditTransfersListTable = (props) => {
  const { user, filtered, setFiltered } = props
  let { items } = props
  const statusFilter = (item) =>
    item.history.filter((each) => each.status === item.status).reverse()[0]
  items = items.map((item) => {
    let totalCreditsA = 0
    let totalCreditsB = 0
    let totalTransferValue = 0

    if (item.creditTransferContent) {
      item.creditTransferContent.forEach((row) => {
        if (row.creditClass.creditClass === 'A') {
          totalCreditsA += parseFloat(row.creditValue)
        }
        if (row.creditClass.creditClass === 'B') {
          totalCreditsB += parseFloat(row.creditValue)
        }

        totalTransferValue += parseFloat(row.dollarValue) * row.creditValue
      })
    }

    return {
      ...item,
      totalCreditsA,
      totalCreditsB,
      totalTransferValue
    }
  })

  const columns = [
    {
      id: 'id',
      accessor: 'id',
      className: 'text-center',
      Header: 'ID',
      maxWidth: 100,
      sortMethod: (a, b) => {
        return b.id - a.id
      },
      Cell: (item) => <span>CT-{item.original.id}</span>
    },
    {
      accessor: (row) => moment(row.createTimestamp).format('YYYY-MM-DD'),
      className: 'text-center',
      Header: 'Date',
      id: 'date',
      maxWidth: 150
    },
    {
      accessor: 'debitFrom.shortName',
      className: 'text-left',
      Header: 'Seller',
      id: 'seller',
      maxWidth: 250
    },
    {
      accessor: 'creditTo.shortName',
      className: 'text-left',
      Header: 'Buyer',
      id: 'buyer',
      maxWidth: 250
    },
    {
      accessor: (row) =>
        row.totalCreditsA !== 0 ? formatNumeric(row.totalCreditsA) : '-',
      className: 'text-right',
      Header: 'A-Credits',
      id: 'credits-a',
      maxWidth: 150
    },
    {
      accessor: (row) =>
        row.totalCreditsB !== 0 ? formatNumeric(row.totalCreditsB) : '-',
      className: 'text-right',
      Header: 'B-Credits',
      id: 'credits-b',
      maxWidth: 150
    },
    {
      accessor: (row) => `$ ${formatNumeric(row.totalTransferValue, 2)}`,
      className: 'text-right',
      Header: 'Transfer Value',
      id: 'transfer-value',
      maxWidth: 150
    },
    {
      accessor: (item) => {
        const { status } = item
        const formattedStatus = formatStatus(status)

        if (formattedStatus === 'validated') {
          return 'recorded'
        }
        if (formattedStatus === 'recommend rejection') {
          return 'recommend rejection'
        }
        if (formattedStatus === 'recommend approval') {
          return 'recommend approval'
        }
        if (formattedStatus === 'approved') {
          return 'submitted to government'
        }
        if (formattedStatus === 'submitted') {
          return 'submitted to transfer partner'
        }
        if (
          formattedStatus === 'rescind pre approval' ||
          formattedStatus === 'rescinded'
        ) {
          const rescindorg = statusFilter(item).createUser.organization.name
          return `rescinded by ${rescindorg}`
        }
        if (formattedStatus === 'rejected') {
          return 'rejected by government'
        }
        if (formattedStatus === 'disapproved') {
          return 'rejected by transfer partner'
        }

        return formattedStatus
      },
      className: 'text-center text-capitalize',
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
      Header: 'Status',
      id: 'status',
      maxWidth: 250
    }
  ]

  // Default sort by items by id int value
  items.sort(function (a, b) {
    return b.id - a.id
  })

  return (
    <ReactTable
      columns={columns}
      data={items}
      showPagination={true}
      filtered={filtered}
      setFiltered={setFiltered}
      getTrProps={(state, row) => {
        if (row && row.original) {
          return {
            onClick: () => {
              const { id, status, debitFrom } = row.original
              if (
                (status === 'DRAFT' ||
                  status === 'RESCINDED' ||
                  status === 'RESCIND_PRE_APPROVAL') &&
                user.organization.id === debitFrom.id
              ) {
                history.push(ROUTES_CREDIT_TRANSFERS.EDIT.replace(/:id/g, id))
              } else {
                history.push(
                  ROUTES_CREDIT_TRANSFERS.DETAILS.replace(/:id/g, id),
                  filtered
                )
              }
            },
            className: 'clickable'
          }
        }

        return {}
      }}
    />
  )
}

CreditTransfersListTable.defaultProps = {
  filtered: undefined,
  setFiltered: undefined
}

CreditTransfersListTable.propTypes = {
  filtered: PropTypes.arrayOf(PropTypes.shape()),
  items: PropTypes.arrayOf(
    PropTypes.shape({
      creditTransactions: PropTypes.arrayOf(PropTypes.shape())
    })
  ).isRequired,
  setFiltered: PropTypes.func,
  user: CustomPropTypes.user.isRequired
}

export default CreditTransfersListTable
