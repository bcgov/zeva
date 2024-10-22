import PropTypes from 'prop-types'
import React from 'react'
import ReactTable from '../../app/components/ReactTable'

const ConsumerSalesLDVModalTable = (props) => {
  const { vehicles, modelYear } = props
  let totalPendingSales
  let totalSalesIssued
  if (vehicles.length > 0) {
    totalSalesIssued = vehicles.map(v => v.salesIssued).reduce((a, b) => a + b)
    totalPendingSales = vehicles.map(v => v.pendingSales).reduce((a, b) => a + b)
  }

  const columns = [
    {
      accessor: (item) => item.pendingSales,
      className: 'text-center',
      Header: modelYear < 2024 ? '*Sales Submitted' : 'ZEVs Submitted',
      headerClassName: 'font-weight-bold ',
      id: 'pending-sales',
      maxWidth: 200,
      Footer: (
        <span>
          <b>{totalPendingSales}</b>
        </span>
      )
    },
    {
      accessor: (item) => item.salesIssued,
      className: 'text-center',
      Header: modelYear < 2024 ? 'Sales Issued' : 'ZEVs Issued',
      headerClassName: 'font-weight-bold ',
      id: 'sales-issued',
      maxWidth: 200,
      Footer: (
        <span>
          <b>{totalSalesIssued}</b>
        </span>
      )
    },
    {
      accessor: (item) => item.modelYear,
      className: 'text-center',
      Header: 'Model Year',
      headerClassName: 'font-weight-bold',
      id: 'model-year',
      maxWidth: 200
    },
    {
      accessor: (item) => item.make,
      className: 'text-center',
      Header: 'Make',
      headerClassName: 'font-weight-bold',
      id: 'make',
      maxWidth: 200
    },
    {
      accessor: (item) => item.modelName,
      className: 'text-center',
      Header: 'Model',
      headerClassName: 'font-weight-bold',
      id: 'model',
      maxWidth: 200
    },
    {
      accessor: (item) => item.vehicleZevType,
      className: 'text-center',
      Header: 'Type',
      headerClassName: 'font-weight-bold',
      id: 'type',
      maxWidth: 200
    },
    {
      accessor: (item) => item.range,
      className: 'text-center',
      Header: 'Range(km)',
      headerClassName: 'font-weight-bold',
      id: 'range',
      maxWidth: 200
    },
    {
      accessor: (item) => item.zevClass,
      className: 'text-center',
      Header: 'ZEV Class',
      headerClassName: 'font-weight-bold',
      id: 'zev-class',
      maxWidth: 200
    }
  ]

  return (
    <ReactTable
      className="compliance-reports-table"
      columns={columns}
      data={vehicles}
      filterable={false}
    />
  )
}

ConsumerSalesLDVModalTable.defaultProps = {}

ConsumerSalesLDVModalTable.propTypes = {
  vehicles: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  modelYear: PropTypes.number.isRequired
}

export default ConsumerSalesLDVModalTable
