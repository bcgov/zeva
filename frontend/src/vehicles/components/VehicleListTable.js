/*
 * Presentational component
 */
import PropTypes from 'prop-types'
import React from 'react'
import history from '../../app/History'
import ReactTable from '../../app/components/ReactTable'
import ROUTES_VEHICLES from '../../app/routes/Vehicles'
import formatNumeric from '../../app/utilities/formatNumeric'
import formatStatus from '../../app/utilities/formatStatus'

const VehicleListTable = (props) => {
  const { items, user, filtered, setFiltered, showSupplier } = props
  const toComma = (value) => {
    let newValue = value
    if (typeof newValue === 'number') {
      newValue = newValue.toString()
    }
    newValue = newValue.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    return newValue
  }
  const columns = [
    {
      accessor: (row) => {
        if (row.organization) {
          return row.organization.shortName || row.organization.name
        }
        return ''
      },
      Header: 'Supplier',
      id: 'col-supplier',
      show: showSupplier,
      width: 200
    },
    {
      accessor: (row) => formatStatus(row.validationStatus),
      className: 'text-center text-capitalize',
      Header: 'Status',
      id: 'col-status',
      width: 175
    },
    {
      accessor: (row) => formatNumeric(row.creditValue, 2),
      className: 'text-right',
      Header: 'Credit Entitlement',
      id: 'col-credit',
      width: 125
    },
    {
      accessor: 'creditClass',
      className: 'text-center',
      Header: 'ZEV Class',
      id: 'col-class',
      width: 125
    },
    {
      accessor: (row) => row.modelYear,
      className: 'text-center',
      Header: 'Model Year',
      id: 'col-my',
      width: 125
    },
    {
      accessor: (row) => (row.modelName ? row.modelName : ''),
      Header: 'Model',
      id: 'model'
    },
    {
      accessor: (row) => (row.make ? row.make : ''),
      Header: 'Make',
      id: 'make',
      width: 150
    },
    {
      accessor: 'range',
      Cell: (row) => toComma(row.row.range),
      className: 'text-right',
      Header: 'Range (km)',
      id: 'range',
      width: 125
    },
    {
      accessor: (row) => row.vehicleZevType,
      className: 'text-center',
      Header: 'ZEV Type',
      id: 'zev-type',
      width: 100
    },
    {
      accessor: (row) => (row.salesIssued ? row.salesIssued : '-'),
      className: 'text-center',
      Header: 'Sales',
      id: 'sales',
      width: 100
    },
    {
      accessor: (row) => {
        if (row.validationStatus !== 'VALIDATED') {
          return '-'
        }

        return row.isActive === true ? 'Yes' : 'No'
      },
      className: 'text-center',
      Header: 'Active',
      id: 'is-active',
      width: 100
    }
  ]

  return (
    <ReactTable
      columns={columns}
      filtered={filtered}
      data={items}
      defaultSorted={[
        {
          id: user.isGovernment ? 'col-supplier' : 'make'
        }
      ]}
      getTrProps={(state, row) => {
        if (row && row.original && user) {
          return {
            onClick: () => {
              const { id, validationStatus } = row.original

              if (
                ['CHANGES_REQUESTED', 'DRAFT'].indexOf(validationStatus) >= 0 &&
                !user.isGovernment
              ) {
                history.push(
                  ROUTES_VEHICLES.EDIT.replace(/:id/g, id),
                  filtered
                )
              } else {
                history.push(
                  ROUTES_VEHICLES.DETAILS.replace(/:id/g, id),
                  filtered
                )
              }
            },
            className: 'clickable'
          }
        }

        return {}
      }}
      setFiltered={setFiltered}
    />
  )
}

VehicleListTable.defaultProps = {
  filtered: undefined,
  setFiltered: undefined,
  showSupplier: false
}

VehicleListTable.propTypes = {
  filtered: PropTypes.arrayOf(PropTypes.object),
  setFiltered: PropTypes.func,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number
    })
  ).isRequired,
  showSupplier: PropTypes.bool,
  user: PropTypes.shape({
    isGovernment: PropTypes.bool
  }).isRequired
}

export default VehicleListTable
