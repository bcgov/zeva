/*
 * Presentational component
 */
import PropTypes from 'prop-types'
import React from 'react'

import CustomPropTypes from '../../app/utilities/props'
import ReactTable from 'react-table'
import formatNumeric from '../../app/utilities/formatNumeric'
import formatStatus from '../../app/utilities/formatStatus'
import history from '../../app/History'
import ROUTES_CREDIT_REQUESTS from '../../app/routes/CreditRequests'
import calculateNumberOfPages from '../../app/utilities/calculateNumberOfPages'

const CreditRequestListTable = (props) => {
  const {
    page,
    setPage,
    pageSize,
    setPageSize,
    filters,
    setFilters,
    sorts,
    setSorts,
    items,
    itemsCount,
    loading,
    user
  } = props

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
      Cell: (item) => <span>CA-{item.original.id}</span>
    },
    {
      accessor: 'submissionHistory',
      className: 'text-center',
      Header: 'Date',
      maxWidth: 150,
      filterable: false,
      sortable: false
    },
    {
      accessor: (item) =>
        item.organization ? item.organization.shortName : '',
      className: 'text-center',
      Header: 'Supplier',
      id: 'supplier',
      show: user.isGovernment,
      maxWidth: 200
    },
    {
      accessor: (item) => {
        if (['DRAFT', 'SUBMITTED'].indexOf(item.validationStatus) >= 0) {
          const totals = item.totals.vins + item.unselected
          return totals > 0 ? totals : '-'
        }

        return item.totals.vins > 0 ? item.totals.vins : '-'
      },
      className: 'text-right',
      Header: 'Total Eligible Sales',
      maxWidth: 150,
      id: 'total-sales',
      filterable: false,
      sortable: false
    },
    {
      accessor: (item) => (item.totalWarnings > 0 ? item.totalWarnings : '-'),
      className: 'text-right',
      Header: 'Not Eligible for Credits',
      id: 'warnings',
      maxWidth: 250,
      filterable: false,
      sortable: false
    },
    {
      accessor: (item) =>
        item.totalCredits && item.totalCredits.a > 0
          ? formatNumeric(item.totalCredits.a)
          : '-',
      className: 'text-right',
      Header: 'A-Credits',
      id: 'credits-a',
      maxWidth: 150,
      filterable: false,
      sortable: false
    },
    {
      accessor: (item) =>
        item.totalCredits && item.totalCredits.b > 0
          ? formatNumeric(item.totalCredits.b)
          : '-',
      className: 'text-right',
      Header: 'B-Credits',
      id: 'credits-b',
      maxWidth: 150,
      filterable: false,
      sortable: false
    },
    {
      accessor: (item) => {
        const { validationStatus } = item
        const status = formatStatus(validationStatus)

        if (status === 'checked') {
          return 'validated'
        }

        if (status === 'validated') {
          return 'issued'
        }

        if (status === 'recommend approval') {
          return 'recommend issuance'
        }

        return status
      },
      className: 'text-center text-capitalize',
      Header: 'Status',
      id: 'status',
      maxWidth: 250,
      filterable: false,
      sortable: false
    }
  ]

  return (
    <ReactTable
      manual
      columns={columns}
      data={items}
      loading={loading}
      filterable={true}
      pageSizeOptions={[10, 20]}
      page={page - 1}
      pages={calculateNumberOfPages(itemsCount, pageSize)}
      pageSize={pageSize}
      sorted={sorts}
      filtered={filters}
      onPageChange={(pageIndex) => {
        setPage(pageIndex + 1)
      }}
      onPageSizeChange={(pageSize) => {
        setPage(1)
        setPageSize(pageSize)
      }}
      onSortedChange={(newSorted) => {
        setPage(1)
        setSorts(newSorted)
      }}
      onFilteredChange={(filtered) => {
        setPage(1)
        setFilters(filtered)
      }}
      getTrProps={(state, row) => {
        if (row && row.original) {
          return {
            onClick: () => {
              const { id } = row.original
              history.push(
                ROUTES_CREDIT_REQUESTS.DETAILS.replace(/:id/g, id),
                {
                  page,
                  pageSize,
                  filters,
                  sorts
                }
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

CreditRequestListTable.propTypes = {
  page: PropTypes.number.isRequired,
  setPage: PropTypes.func.isRequired,
  pageSize: PropTypes.number.isRequired,
  setPageSize: PropTypes.func.isRequired,
  filters: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  setFilters: PropTypes.func.isRequired,
  sorts: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  setSorts: PropTypes.func.isRequired,
  items: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  itemsCount: PropTypes.number.isRequired,
  loading: PropTypes.bool.isRequired,
  user: CustomPropTypes.user.isRequired
}

export default CreditRequestListTable
