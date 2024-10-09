import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import ReactTable from 'react-table'

const ZevSales = (props) => {
  const { addSalesRow, details, handleInputChange, salesRows, isEditable } =
    props

  const currentStatus = details.actualStatus
    ? details.actualStatus
    : details.status

  let modelYear = 0
  if (details && details.assessmentData && details.assessmentData.modelYear) {
    modelYear = Number(details.assessmentData.modelYear)
  }

  const columns = [
    {
      Cell: (item) => (
        <>
          <span className="mr-2">{item.original.oldData.sales}</span>
          <input
            id={`sales-${item.index}`}
            size="5"
            name="zevSales"
            defaultValue={
              item.original.newData.sales
                ? item.original.newData.sales
                : item.original.oldData.sales
            }
            onBlur={(event) => {
              event.persist()

              setTimeout(() => {
                handleInputChange(event, true)
              }, 100)
            }}
            onChange={(event) => {
              handleInputChange(event)

              const ele = document.getElementById(`sales-${item.index}`)
              if (
                Number(item.original.oldData.sales) ===
                Number(event.target.value)
              ) {
                const { className } = ele
                ele.className = className.replace(/highlight/g, '')
              } else {
                ele.className += ' highlight'
              }
            }}
            readOnly={!isEditable}
            className={`${!isEditable ? 'supplementary-input-disabled' : ''} ${
              item.original.newData.sales &&
              item.original.newData.sales !== item.original.oldData.sales
                ? 'highlight'
                : ''
            }`}
          />
        </>
      ),
      className: 'text-right',
      Header: modelYear < 2024 ? 'Sales' : 'ZEVs',
      headerClassName: 'font-weight-bold ',
      id: 'zevSales',
      sortable: false,
      minWidth: 125
    },
    {
      Cell: (item) => (
        <>
          <span className="mr-2">{item.original.oldData.modelYear}</span>
          <input
            name="zevSales"
            id={`modelYear-${item.index}`}
            onBlur={(event) => {
              event.persist()

              setTimeout(() => {
                handleInputChange(event, true)
              }, 100)
            }}
            onChange={(event) => {
              handleInputChange(event)

              const ele = document.getElementById(`modelYear-${item.index}`)
              if (
                Number(item.original.oldData.modelYear) ===
                Number(event.target.value)
              ) {
                const { className } = ele
                ele.className = className.replace(/highlight/g, '')
              } else {
                ele.className += ' highlight'
              }
            }}
            size="4"
            maxLength="4"
            defaultValue={
              item.original.newData.modelYear
                ? item.original.newData.modelYear
                : item.original.oldData.modelYear
            }
            readOnly={!isEditable}
            className={`${!isEditable ? 'supplementary-input-disabled' : ''} ${
              item.original.newData.modelYear &&
              item.original.newData.modelYear !==
                item.original.oldData.modelYear
                ? 'highlight'
                : ''
            }`}
          />
        </>
      ),
      className: 'text-right',
      Header: 'Model Year',
      headerClassName: 'font-weight-bold ',
      id: 'model-year',
      sortable: false,
      minWidth: 120
    },
    {
      Cell: (item) => (
        <>
          <span className="mr-2">{item.original.oldData.make}</span>
          <input
            size="8"
            name="zevSales"
            id={`make-${item.index}`}
            onBlur={(event) => {
              event.persist()

              setTimeout(() => {
                handleInputChange(event, true)
              }, 100)
            }}
            onChange={(event) => {
              handleInputChange(event)

              const ele = document.getElementById(`make-${item.index}`)
              if (item.original.oldData.make === event.target.value) {
                const { className } = ele
                ele.className = className.replace(/highlight/g, '')
              } else {
                ele.className += ' highlight'
              }
            }}
            defaultValue={
              item.original.newData.make
                ? item.original.newData.make
                : item.original.oldData.make
            }
            readOnly={!isEditable}
            className={`${!isEditable ? 'supplementary-input-disabled' : ''} ${
              item.original.newData.make &&
              item.original.newData.make !== item.original.oldData.make
                ? 'highlight'
                : ''
            }`}
          />
        </>
      ),
      className: 'text-right',
      Header: 'Make',
      headerClassName: 'font-weight-bold',
      id: 'make',
      sortable: false,
      minWidth: 190
    },
    {
      Cell: (item) => (
        <>
          <span className="mr-2">{item.original.oldData.model}</span>
          <input
            size="11"
            name="zevSales"
            id={`modelName-${item.index}`}
            onBlur={(event) => {
              event.persist()

              setTimeout(() => {
                handleInputChange(event, true)
              }, 100)
            }}
            onChange={(event) => {
              handleInputChange(event)

              const ele = document.getElementById(`modelName-${item.index}`)
              if (item.original.oldData.model === event.target.value) {
                const { className } = ele
                ele.className = className.replace(/highlight/g, '')
              } else {
                ele.className += ' highlight'
              }
            }}
            defaultValue={
              item.original.newData.modelName
                ? item.original.newData.modelName
                : item.original.oldData.model
            }
            readOnly={!isEditable}
            className={`${!isEditable ? 'supplementary-input-disabled' : ''} ${
              item.original.newData.modelName &&
              item.original.newData.modelName !== item.original.oldData.model
                ? 'highlight'
                : ''
            }`}
          />
        </>
      ),
      className: 'text-right',
      Header: 'Model',
      headerClassName: 'font-weight-bold',
      id: 'modelName',
      sortable: false,
      minWidth: 300
    },
    {
      Cell: (item) => (
        <>
          <span className="mr-2">{item.original.oldData.zevType}</span>
          <input
            size="5"
            name="zevSales"
            id={`vehicleZevType-${item.index}`}
            onBlur={(event) => {
              event.persist()

              setTimeout(() => {
                handleInputChange(event, true)
              }, 100)
            }}
            onChange={(event) => {
              handleInputChange(event)

              const ele = document.getElementById(
                `vehicleZevType-${item.index}`
              )
              if (item.original.oldData.zevType === event.target.value) {
                const { className } = ele
                ele.className = className.replace(/highlight/g, '')
              } else {
                ele.className += ' highlight'
              }
            }}
            defaultValue={
              item.original.newData.vehicleZevType
                ? item.original.newData.vehicleZevType
                : item.original.oldData.zevType
            }
            readOnly={!isEditable}
            className={`${!isEditable ? 'supplementary-input-disabled' : ''} ${
              item.original.newData.vehicleZevType &&
              item.original.newData.vehicleZevType !==
                item.original.oldData.zevType
                ? 'highlight'
                : ''
            }`}
          />
        </>
      ),
      className: 'text-right',
      Header: 'Type',
      headerClassName: 'font-weight-bold',
      id: 'type',
      sortable: false,
      minWidth: 120
    },
    {
      Cell: (item) => (
        <>
          <span className="mr-2">{item.original.oldData.range}</span>
          <input
            size="4"
            name="zevSales"
            id={`range-${item.index}`}
            onBlur={(event) => {
              event.persist()

              setTimeout(() => {
                handleInputChange(event, true)
              }, 100)
            }}
            onChange={(event) => {
              handleInputChange(event)

              const ele = document.getElementById(`range-${item.index}`)
              if (
                Number(item.original.oldData.range) ===
                Number(event.target.value)
              ) {
                const { className } = ele
                ele.className = className.replace(/highlight/g, '')
              } else {
                ele.className += ' highlight'
              }
            }}
            defaultValue={
              item.original.newData.range
                ? item.original.newData.range
                : item.original.oldData.range
            }
            readOnly={!isEditable}
            className={`${!isEditable ? 'supplementary-input-disabled' : ''} ${
              item.original.newData.range &&
              item.original.newData.range !== item.original.oldData.range
                ? 'highlight'
                : ''
            }`}
          />
        </>
      ),
      className: 'text-right',
      Header: 'Range (km)',
      headerClassName: 'font-weight-bold',
      id: 'range',
      sortable: false,
      minWidth: 150
    },
    {
      Cell: (item) => (
        <>
          <span className="mr-2">{item.original.oldData.zevClass}</span>
          <input
            maxLength="3"
            size="3"
            name="zevSales"
            id={`zevClass-${item.index}`}
            onBlur={(event) => {
              event.persist()

              setTimeout(() => {
                handleInputChange(event, true)
              }, 100)
            }}
            onChange={(event) => {
              handleInputChange(event)

              const ele = document.getElementById(`zevClass-${item.index}`)
              if (item.original.oldData.zevClass === event.target.value) {
                const { className } = ele
                ele.className = className.replace(/highlight/g, '')
              } else {
                ele.className += ' highlight'
              }
            }}
            defaultValue={
              item.original.newData.zevClass
                ? item.original.newData.zevClass
                : item.original.oldData.zevClass
            }
            readOnly={!isEditable}
            className={`${!isEditable ? 'supplementary-input-disabled' : ''} ${
              item.original.newData.zevClass &&
              item.original.newData.zevClass !== item.original.oldData.zevClass
                ? 'highlight'
                : ''
            }`}
          />
        </>
      ),
      className: 'text-right',
      Header: 'ZEV Class',
      headerClassName: 'font-weight-bold',
      id: 'zev-class',
      sortable: false,
      minWidth: 110
    }
  ]
  return (
    <>
      <h3>
        {details.assessmentData && details.assessmentData.modelYear}
        &nbsp; Model Year {modelYear < 2024 ? "Zero-Emission Vehicles Sales" : "ZEVs Supplied"}
      </h3>
      <div className="text-blue my-3">
        Provide additional details in the comment box at the bottom of this form
        if there are changes to the {modelYear < 2024 ? "consumer ZEV sales" : "ZEVs supplied and registered"} details.
      </div>
      <div className="my-4 sales-table-container">
        {salesRows && (
          <ReactTable
            className="sales-table"
            overflow="auto"
            columns={columns}
            data={salesRows}
            filterable={false}
            minRows={1}
            showPagination={false}
          />
        )}
        {currentStatus !== 'ASSESSED' && isEditable && (
          <button
            className="transfer-add-line m-2"
            onClick={() => {
              addSalesRow()
            }}
            type="button"
          >
            <FontAwesomeIcon icon="plus" /> Add another line for a new ZEV model
          </button>
        )}
      </div>
    </>
  )
}

ZevSales.propTypes = {
  addSalesRow: PropTypes.func.isRequired,
  details: PropTypes.shape().isRequired,
  handleInputChange: PropTypes.func.isRequired,
  salesRows: PropTypes.arrayOf(PropTypes.shape()).isRequired
}

export default ZevSales
