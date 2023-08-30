import axios from 'axios'
import React, { useState } from 'react'
import ReactQuill from 'react-quill'
import PropTypes from 'prop-types'

import Button from '../../app/components/Button'
import ROUTES_CREDIT_REQUESTS from '../../app/routes/CreditRequests'
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
    setContent,
    submission,
    user
  } = props

  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(false)
  const [pages, setPages] = useState(-1)
  const [reactTable, setReactTable] = useState(null)
  const [selectedOption, setSelectedOption] = useState('')

  const filterWarnings = (event) => {
    const { value } = event.target

    const index = filtered.findIndex((item) => item.id === 'warning')
    const filter = {
      id: 'warning',
      value
    }

    if (index >= 0) {
      filtered[index] = filter
    } else {
      filtered.push(filter)
    }

    setSelectedOption(value)
    setFiltered([...filtered, { id: 'warning', value }])
    reactTable.filterColumn(reactTable.state.columns[3].columns[0], value)
  }

  const refreshContent = (state, paramFilters = {}) => {
    const filters = paramFilters
    const sorted = []

    state.sorted.forEach((each) => {
      let value = each.id

      if (each.desc) {
        value = `-${value}`
      }

      sorted.push(value)
    })

    setLoading(true)

    if (!filters.warning) {
      filters.warning = '1'
      filters.include_overrides = true
    }

    axios
      .get(ROUTES_CREDIT_REQUESTS.CONTENT.replace(':id', submission.id), {
        params: {
          filters,
          page: state.page + 1, // page from front-end is zero index, but in the back-end we need the actual page number
          page_size: state.pageSize,
          sorted: sorted.join(',')
        }
      })
      .then((response) => {
        const { content: refreshedContent, pages: numPages } = response.data

        setContent(refreshedContent)
        setLoading(false)
        setPages(numPages)
      })
  }

  const clearFilters = () => {
    setSelectedOption('')
    setFiltered([])

    const state = reactTable.getResolvedState()

    refreshContent(state)
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
              onChange={filterWarnings}
              value={selectedOption}
            >
              <option value="">Filter by Error Type</option>
              <option value="1">1 - Show all warnings</option>
              <option value="11">11 - VIN not registered in B.C.</option>
              <option value="21">21 - VIN already issued credits</option>
              <option value="31">31 - Duplicate VIN</option>
              <option value="41">
                41 - Model year and/or make does not match
              </option>
              <option value="51">51 - Sale prior to Jan 2018</option>
              <option value="61">61 - Invalid date format</option>
              <option value="71">71 - Wrong model year</option>
            </select>
          </span>

          <button
            className="button d-inline-block align-middle"
            disabled={filtered.length === 0}
            onClick={() => {
              clearFilters()
            }}
            type="button"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12">
          <VINListTable
            filtered={filtered}
            invalidatedList={invalidatedList}
            items={content}
            loading={loading}
            pages={pages}
            readOnly
            refreshContent={refreshContent}
            setContent={setContent}
            setFiltered={setFiltered}
            setLoading={setLoading}
            setPages={setPages}
            setReactTable={setReactTable}
            user={user}
            preInitialize={true}
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
  setContent: PropTypes.func.isRequired,
  submission: PropTypes.shape().isRequired,
  user: CustomPropTypes.user.isRequired
}

export default CreditRequestValidatedDetailsPage
