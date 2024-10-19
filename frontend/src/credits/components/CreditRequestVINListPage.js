import React from 'react'
import PropTypes from 'prop-types'
import Button from '../../app/components/Button'
import CustomPropTypes from '../../app/utilities/props'
import VINListTable from './VINListTable'
import isLegacySubmission from '../../app/utilities/isLegacySubmission'

const CreditRequestVINListPage = (props) => {
  const {
    content,
    handleCheckboxClick,
    handleChangeReason,
    handleSubmit,
    modified,
    query,
    reasons,
    submission,
    user,
    invalidatedList,
    errors,
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
    setApplyFiltersCount
  } = props

  const handleSelect = (event) => {
    const { value } = event.target
    const filter = {
      id: 'warning',
      value
    }
    const filtersCopy = [...filters]
    const index = filtersCopy.findIndex((item) => item.id === 'warning')
    if (index >= 0) {
      filtersCopy[index] = filter
    } else {
      filtersCopy.push(filter)
    }

    setFilters(filtersCopy)
  }

  const applyFilters = () => {
    setPage(1)
    setApplyFiltersCount((prev) => {
      return prev + 1
    })
  }

  const clearFilters = () => {
    setFilters([])
  }

  const getSelectedWarning = () => {
    let result = ''
    for (const filter of filters) {
      if (filter.id === 'warning') {
        result = filter.value
        break
      }
    }
    return result
  }

  const actionBar = (
    <div className="action-bar">
      <span className="left-content">
        <Button buttonType="back" />
      </span>
      <span className="right-content">
        <Button
          buttonType="save"
          action={() => {
            handleSubmit()
          }}
          optionalClassname="button primary"
        />
      </span>
    </div>
  )

  return (
    <div id="sales-details" className="page">
      <div className="row">
        <div className="col-sm-12">
          <h1>
            {submission.organization && `${submission.organization.name} `}
          </h1>
          <h2 className="my-0 py-0">
            {isLegacySubmission(submission) ? 'ZEV Sales Submission' : 'VIN Submission'} {submission.submissionDate}
          </h2>
        </div>
      </div>

      <div className="row mb-2">
        <div className="col-sm-12 text-right">
          <span className="d-inline-block mr-3 align-middle">
            <select
              className="form-control h-auto py-2"
              onChange={handleSelect}
              value={getSelectedWarning()}
            >
              <option value="">Filter by Error Type</option>
              <option value="1">1 - Show all warnings ({errors.TOTAL ? errors.TOTAL : 0})</option>
              <option value="11">11 - VIN not registered in B.C. ({errors.NO_ICBC_MATCH ? errors.NO_ICBC_MATCH : 0})</option>
              <option value="21">21 - VIN already issued credits ({errors.VIN_ALREADY_AWARDED ? errors.VIN_ALREADY_AWARDED : 0})</option>
              <option value="31">31 - Duplicate VIN ({errors.DUPLICATE_VIN ? errors.DUPLICATE_VIN : 0})</option>
              <option value="41">
                41 - Model year and/or make does not match ({errors.ERROR41 ? errors.ERROR41 : 0})
              </option>
              <option value="51">51 - Sale prior to Jan 2018 ({errors.EXPIRED_REGISTRATION_DATE ? errors.EXPIRED_REGISTRATION_DATE : 0})</option>
              <option value="61">61 - Invalid date format ({errors.INVALID_DATE ? errors.INVALID_DATE : 0})</option>
              <option value="71">71 - Wrong model year for compliance report ({errors.WRONG_MODEL_YEAR ? errors.WRONG_MODEL_YEAR : 0})</option>
            </select>
          </span>

          <button
            className="button d-inline-block align-middle"
            disabled={filters.length === 0}
            onClick={() => {
              clearFilters()
            }}
            type="button"
          >
            Clear Filters
          </button>
          <button
            className="button d-inline-block align-middle"
            onClick={() => {
              applyFilters()
            }}
            type="button"
          >
            Apply
          </button>
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12">
          <VINListTable
            handleCheckboxClick={handleCheckboxClick}
            handleChangeReason={handleChangeReason}
            invalidatedList={invalidatedList}
            items={content}
            modified={modified}
            query={query}
            reasons={reasons}
            user={user}
            tableLoading={tableLoading}
            itemsCount={itemsCount}
            page={page}
            setPage={setPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            filters={filters}
            setFilters={setFilters}
            sorts={sorts}
            setSorts={setSorts}
            applyFilters={applyFilters}
            submission={submission}
          />
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12">{actionBar}</div>
      </div>
    </div>
  )
}

CreditRequestVINListPage.defaultProps = {
  query: null
}

CreditRequestVINListPage.propTypes = {
  content: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  reasonList: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  handleCheckboxClick: PropTypes.func.isRequired,
  handleChangeReason: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  invalidatedList: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  ).isRequired,
  modified: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  ).isRequired,
  query: PropTypes.shape(),
  reasons: PropTypes.arrayOf(PropTypes.string).isRequired,
  submission: PropTypes.shape().isRequired,
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
  setApplyFiltersCount: PropTypes.func.isRequired
}

export default CreditRequestVINListPage
