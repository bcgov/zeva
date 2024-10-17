/*
 * Presentational component
 */
import moment from 'moment-timezone'
import PropTypes from 'prop-types'
import React from 'react'
import ReactTable from 'react-table'
import CREDIT_ERROR_CODES from '../../app/constants/errorCodes'
import CustomPropTypes from '../../app/utilities/props'
import calculateNumberOfPages from '../../app/utilities/calculateNumberOfPages'
import CustomFilterComponent from '../../app/components/CustomFilterComponent'
import isLegacySubmission from '../../app/utilities/isLegacySubmission'

const VINListTable = (props) => {
  const {
    handleCheckboxClick,
    items,
    user,
    invalidatedList,
    handleChangeReason,
    modified,
    query,
    readOnly,
    reasons,
    tableLoading,
    itemsCount,
    page,
    setPage,
    pageSize,
    setPageSize,
    filters,
    setFilters,
    sorts,
    setSorts,
    applyFilters,
    submission
  } = props

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
        } else {
          if (errorCodes !== '' && CREDIT_ERROR_CODES[warning].errorCode) {
            errorCodes += ', '
          }
          errorCodes += CREDIT_ERROR_CODES[warning].errorCode
        }
      }
    })
    return errorCodes
  }

  const filterPlaceholderText = 'Press "Enter" to search'

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
          width: 75,
          Placeholder: filterPlaceholderText,
          applyFilters
        },
        {
          accessor: 'xlsMake',
          Header: 'Make',
          id: 'xls_make',
          width: 100,
          Placeholder: filterPlaceholderText,
          applyFilters
        },
        {
          accessor: 'xlsModel',
          Header: 'Model',
          id: 'xls_model',
          width: 200,
          Placeholder: filterPlaceholderText,
          applyFilters
        },
        {
          accessor: (row) =>
            moment(row.salesDate).format('YYYY-MM-DD') !== 'Invalid date'
              ? moment(row.salesDate).format('YYYY-MM-DD')
              : row.salesDate,
          className: 'text-center sales-date',
          filterable: false,
          Header: isLegacySubmission(submission) ? 'Retail Sale' : 'Supplied for Consumer Sale',
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
          width: 175,
          Placeholder: filterPlaceholderText,
          applyFilters
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
          width: 75,
          Placeholder: filterPlaceholderText,
          applyFilters
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
          width: 100,
          Placeholder: filterPlaceholderText,
          applyFilters
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
          width: 200,
          Placeholder: filterPlaceholderText,
          applyFilters
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
          width: 150,
          Placeholder: filterPlaceholderText,
          applyFilters
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
                    'EXPIRED_REGISTRATION_DATE',
                    'WRONG_MODEL_YEAR'
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
                disabled={readOnly}
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
                    'EXPIRED_REGISTRATION_DATE',
                    'WRONG_MODEL_YEAR'
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
      manual
      columns={columns}
      data={items}
      loading={tableLoading}
      filterable={true}
      pageSizeOptions={[5, 10, 20, 25, 50, 100]}
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
        setFilters(filtered)
      }}
      FilterComponent={CustomFilterComponent}
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
    />
  )
}

VINListTable.defaultProps = {
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
  modified: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  ),
  query: PropTypes.shape(),
  readOnly: PropTypes.bool,
  reasons: PropTypes.arrayOf(PropTypes.string),
  user: CustomPropTypes.user.isRequired,
  tableLoading: PropTypes.bool.isRequired,
  itemsCount: PropTypes.number.isRequired,
  page: PropTypes.number.isRequired,
  setPage: PropTypes.func.isRequired,
  pageSize: PropTypes.number.isRequired,
  setPageSize: PropTypes.func.isRequired,
  filters: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  setFilters: PropTypes.func.isRequired,
  sorts: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  setSorts: PropTypes.func.isRequired,
  applyFilters: PropTypes.func.isRequired,
  submission: PropTypes.shape().isRequired
}

export default VINListTable
