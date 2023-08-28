/*
 * Presentational component
 */
import moment from 'moment-timezone'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import ReactTable from 'react-table'

import CREDIT_ERROR_CODES from '../../app/constants/errorCodes'
import CustomPropTypes from '../../app/utilities/props'

const VINListTable = (props) => {
  const {
    handleCheckboxClick,
    items,
    user,
    invalidatedList,
    filtered,
    handleChangeReason,
    modified,
    loading,
    pages,
    query,
    readOnly,
    reasons,
    refreshContent,
    setFiltered,
    setReactTable,
    preInitialize
  } = props

  const [tableInitialized, setTableInitialized] = useState(false)
  const reset = query && query.reset

  const getErrorCodes = (item, fields = false) => {
    let errorCodes = ''

    if (!item.warnings) {
      return errorCodes
    }

    item.warnings.forEach((warning) => {
      if (CREDIT_ERROR_CODES[warning]) {
        if (fields) {
          errorCodes += ` ${CREDIT_ERROR_CODES[warning].errorField} `
        } else if (
          !errorCodes.includes(CREDIT_ERROR_CODES[warning].errorCode)
        ) {
          if (errorCodes !== '' && CREDIT_ERROR_CODES[warning].errorCode) {
            errorCodes += ', '
          }
          errorCodes += CREDIT_ERROR_CODES[warning].errorCode
        }
      }
    })

    return errorCodes
  }

  const columns = [
    {
      Header: 'Supplier Information',
      headerClassName: 'header-group header-margin',
      columns: [
        {
          accessor: (row) => {
            const { xlsModelYear } = row

            if (Number.isNaN(xlsModelYear)) {
              return xlsModelYear
            }

            return Math.trunc(row.xlsModelYear)
          },
          className: 'text-center',
          Header: 'MY',
          id: 'xls_model_year',
          width: 75
        },
        {
          accessor: 'xlsMake',
          Header: 'Make',
          id: 'xls_make',
          width: 100
        },
        {
          accessor: 'xlsModel',
          Header: 'Model',
          id: 'xls_model',
          width: 200
        },
        {
          accessor: (row) =>
            moment(row.salesDate).format('YYYY-MM-DD') !== 'Invalid date'
              ? moment(row.salesDate).format('YYYY-MM-DD')
              : row.salesDate,
          className: 'text-center sales-date',
          filterable: false,
          Header: 'Retail Sale',
          id: 'xls_sale_date',
          width: 100
        }
      ]
    },
    {
      Header: '',
      headerClassName: 'header-group header-margin',
      columns: [
        {
          accessor: 'xlsVin',
          className: 'vin',
          Header: 'VIN',
          headerClassName: 'vin',
          id: 'xls_vin',
          width: 175
        }
      ]
    },
    {
      Header: 'ICBC Registration',
      headerClassName: 'header-group header-margin',
      columns: [
        {
          accessor: (item) => {
            if (item.icbcVerification) {
              if (item.icbcVerification.icbcSnapshot) {
                return item.icbcVerification.icbcSnapshot.modelYear
              }

              return item.icbcVerification.icbcVehicle.modelYear.name
            }

            return '-'
          },
          className: 'icbc-model-year text-center',
          Header: 'MY',
          headerClassName: 'icbc-model-year',
          id: 'model_year.description',
          width: 75
        },
        {
          accessor: (item) => {
            if (item.icbcVerification) {
              if (item.icbcVerification.icbcSnapshot) {
                return item.icbcVerification.icbcSnapshot.make
              }

              return item.icbcVerification.icbcVehicle.make
            }

            return '-'
          },
          className: 'icbc-make',
          Header: 'Make',
          id: 'icbc_vehicle.make',
          width: 100
        },
        {
          accessor: (item) => {
            if (item.icbcVerification) {
              if (item.icbcVerification.icbcSnapshot) {
                return item.icbcVerification.icbcSnapshot.modelName
              }

              return item.icbcVerification.icbcVehicle.modelName
            }

            return '-'
          },
          className: 'icbc-model',
          Header: 'Model',
          id: 'icbc_vehicle.model_name',
          width: 200
        }
      ]
    },
    {
      Header: '',
      headerClassName: 'header-group header-margin',
      columns: [
        {
          accessor: (item) => getErrorCodes(item),
          className: 'warning text-right',
          Header: 'Warning',
          headerClassName: 'warning',
          id: 'warning',
          sortable: false,
          width: 150
        },
        {
          accessor: (row) => {
            if (
              row.warnings &&
              row.warnings.some(
                (warning) =>
                  [
                    'DUPLICATE_VIN',
                    'INVALID_MODEL',
                    'VIN_ALREADY_AWARDED',
                    'EXPIRED_REGISTRATION_DATE'
                  ].indexOf(warning) >= 0
              )
            ) {
              return false
            }

            return (
              <input
                checked={
                  invalidatedList.findIndex(
                    (item) => Number(item) === Number(row.id)
                  ) < 0
                }
                onChange={(event) => {
                  handleCheckboxClick(event)
                }}
                disabled={readOnly || row.warnings.includes('WRONG_MODEL_YEAR')}
                type="checkbox"
                value={row.id}
              />
            )
          },
          className: 'text-center validated',
          filterable: false,
          sortable: false,
          Header: 'Validated',
          id: 'validated',
          show: user.isGovernment,
          width: 100
        },
        {
          Cell: (data) => {
            const row = data.original
            if (
              row.warnings &&
              row.warnings.some(
                (warning) =>
                  [
                    'DUPLICATE_VIN',
                    'INVALID_MODEL',
                    'VIN_ALREADY_AWARDED',
                    'EXPIRED_REGISTRATION_DATE'
                  ].indexOf(warning) >= 0
              )
            ) {
              return false
            }

            // On re-verify, only show reasons on edited rows
            if (reset && !modified.includes(row.id)) {
              return false
            }

            if (
              !reset &&
              (!row.reason || row.reason === '') &&
              !modified.includes(row.id)
            ) {
              return false
            }

            if (row.reason && readOnly) {
              return <div className="text-left">{row.reason}</div>
            }

            return (
              <select
                defaultValue={row.reason}
                onChange={(event) => {
                  const { value } = event.target
                  handleChangeReason(row.id, value)
                }}
              >
                {reasons.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
                <option value=""> </option>
              </select>
            )
          },
          className: 'reason text-center',
          filterable: false,
          sortable: false,
          Header: 'Reason',
          id: 'reason'
        }
      ]
    }
  ]

  return (
    <ReactTable
      columns={columns}
      data={items}
      filtered={filtered}
      filterable
      defaultPageSize={100}
      onFilteredChange={(input) => {
        setFiltered(input)
      }}
      defaultSorted={[
        {
          id: 'xls_sale_date',
          desc: true
        }
      ]}
      getTrProps={(state, rowInfo) => {
        if (rowInfo) {
          const warnings = rowInfo.row.warning.split(', ')

          if (warnings.some((each) => ['21', '31', '51', '71'].includes(each))) {
            return {
              className: 'icbc-danger'
            }
          }

          if (warnings.some((each) => ['11', '41', '61'].includes(each))) {
            let className = 'icbc-warning'

            if (rowInfo.original.warnings.includes('INVALID_DATE', 'WRONG_MODEL_YEAR')) {
              className += ' warning-sales-date'
            }

            if (rowInfo.original.warnings.includes('MAKE_MISMATCHED')) {
              className += ' warning-icbc-make'
            }

            if (rowInfo.original.warnings.includes('MODEL_YEAR_MISMATCHED')) {
              className += ' warning-icbc-model-year'
            }

            if (rowInfo.original.warnings.includes('NO_ICBC_MATCH')) {
              className += ' warning-vin'
            }

            return {
              className
            }
          }
        }
        return {}
      }}
      loading={loading}
      manual
      onFetchData={(state) => {
        // onFetchData is called on component load (and on changes afterword)
        // which we want to avoid, so this tableInitialized
        // variable cancels out the first call to this method
        if (!tableInitialized && preInitialize) {
          setTableInitialized(true)
        } else if (!tableInitialized) {
          setTableInitialized(true)
          return
        }
        const filters = {}

        state.filtered.forEach((each) => {
          filters[each.id] = each.value
        })
        const sorted = []

        state.sorted.forEach((each) => {
          let value = each.id

          if (each.desc) {
            value = `-${value}`
          }

          sorted.push(value)
        })

        if (Object.keys(filters).length === 0 && sorted.length <= 0) {
          return
        }

        refreshContent(state, filters)
      }}
      pages={pages}
      ref={(ref) => {
        setReactTable(ref)
      }}
    />
  )
}

VINListTable.defaultProps = {
  filtered: undefined,
  setFiltered: undefined,
  modified: [],
  query: null,
  readOnly: false,
  reasons: [],
  handleCheckboxClick: undefined,
  handleChangeReason: undefined
}

VINListTable.propTypes = {
  handleCheckboxClick: PropTypes.func,
  handleChangeReason: PropTypes.func,
  items: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  invalidatedList: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  ).isRequired,
  filtered: PropTypes.arrayOf(PropTypes.shape()),
  loading: PropTypes.bool.isRequired,
  modified: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  ),
  pages: PropTypes.number.isRequired,
  query: PropTypes.shape(),
  readOnly: PropTypes.bool,
  reasons: PropTypes.arrayOf(PropTypes.string),
  refreshContent: PropTypes.func.isRequired,
  setFiltered: PropTypes.func,
  setLoading: PropTypes.func.isRequired,
  setReactTable: PropTypes.func.isRequired,
  user: CustomPropTypes.user.isRequired
}

export default VINListTable
