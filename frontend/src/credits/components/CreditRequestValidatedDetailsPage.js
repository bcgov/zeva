import React from 'react'
import ReactQuill from 'react-quill'
import PropTypes from 'prop-types'
import Button from '../../app/components/Button'
import CustomPropTypes from '../../app/utilities/props'
import VINListTable from './VINListTable'
import DisplayComment from '../../app/components/DisplayComment'
import DownloadAllSubmissionContentButton from './DownloadAllSubmissionContentButton'

const CreditRequestValidatedDetailsPage = (props) => {
  const {
    content,
    handleAddComment,
    handleCommentChange,
    invalidatedList,
    submission,
    user,
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
    <>
      <div className="action-bar">
        <span className="left-content">
          <Button buttonType="back" />
        </span>
        <span className="right-content" />
        {user.isGovernment && submission.validationStatus === 'VALIDATED' && (
          <DownloadAllSubmissionContentButton submission={submission} />
        )}
      </div>
    </>
  )

  const analystAction =
    user.isGovernment &&
    ['CHECKED', 'SUBMITTED'].indexOf(submission.validationStatus) >= 0 &&
    user.hasPermission('RECOMMEND_SALES')

  const validatedOnly = submission.validationStatus === 'CHECKED'

  const directorAction =
    user.isGovernment &&
    ['RECOMMEND_APPROVAL', 'RECOMMEND_REJECTION'].indexOf(
      submission.validationStatus
    ) >= 0 &&
    user.hasPermission('SIGN_SALES')

  return (
    <div id="sales-details" className="page">
      <div className="row">
        <div className="col-sm-12">
          <h1>
            {submission.organization && `${submission.organization.name} `}
          </h1>
          <h2 className="my-0 py-0">
            ZEV Sales Submission {submission.submissionDate}
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
              <option value="">Filter</option>
              <option value="1">Error 1 - Show all warnings</option>
              <option value="11">Error 11 - VIN not registered in B.C.</option>
              <option value="21">Error 21 - VIN already issued credits</option>
              <option value="31">Error 31 - Duplicate VIN</option>
              <option value="41">
                Error 41 - Model year and/or make does not match
              </option>
              <option value="51">Error 51 - Sale prior to Jan 2018</option>
              <option value="61">Error 61 - Invalid date format</option>
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
            invalidatedList={invalidatedList}
            items={content}
            readOnly
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
          />
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12">
          {user.isGovernment &&
            (submission.salesSubmissionComment ||
              (analystAction && validatedOnly) ||
              directorAction ||
              submission.validationStatus === 'ISSUED') && (
              <div className="comment-box mt-2">
                {submission.salesSubmissionComment && user.isGovernment && (
                  <DisplayComment
                    commentArray={submission.salesSubmissionComment}
                  />
                )}
                {((analystAction && validatedOnly) || directorAction) && (
                  <div className="text-editor mb-2 mt-2">
                    <label htmlFor="comment">
                      <b>
                        {analystAction
                          ? 'Add Comment'
                          : 'Add Comment to analyst if returning submission'}
                      </b>
                    </label>
                    <ReactQuill
                      theme="snow"
                      modules={{
                        toolbar: [
                          ['bold', 'italic'],
                          [{ list: 'bullet' }, { list: 'ordered' }]
                        ],
                        keyboard: {
                          bindings: { tab: false }
                        }
                      }}
                      formats={['bold', 'italic', 'list', 'bullet']}
                      onChange={handleCommentChange}
                    />
                    <button
                      className="button mt-2"
                      onClick={() => {
                        handleAddComment()
                      }}
                      type="button"
                    >
                      Add Comment
                    </button>
                  </div>
                )}
              </div>
          )}
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12">{actionBar}</div>
      </div>
    </div>
  )
}

CreditRequestValidatedDetailsPage.defaultProps = {}

CreditRequestValidatedDetailsPage.propTypes = {
  content: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  handleAddComment: PropTypes.func.isRequired,
  handleCommentChange: PropTypes.func.isRequired,
  invalidatedList: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  ).isRequired,
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
}

export default CreditRequestValidatedDetailsPage
