import axios from 'axios'
import React, { useState } from 'react'
import PropTypes from 'prop-types'

import Button from '../../app/components/Button'
import ROUTES_CREDIT_REQUESTS from '../../app/routes/CreditRequests'
import CustomPropTypes from '../../app/utilities/props'
import VINListTable from './VINListTable'

let refreshTimeout

const CreditRequestVINListPage = (props) => {
  const {
    content,
    reasonList,
    handleCheckboxClick,
    handleChangeReason,
    handleSubmit,
    modified,
    query,
    initialPageCount,
    reasons,
    setContent,
    setReasonList,
    submission,
    user,
    invalidatedList,
    errors
  } = props

  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(false)
  const [pages, setPages] = useState(initialPageCount)
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

  const refreshContent = async (state, filters = []) => {
    clearTimeout(refreshTimeout)
    refreshTimeout = await setTimeout(async () => {
      const sorted = []

      state.sorted.forEach((each) => {
        let value = each.id

        if (each.desc) {
          value = `-${value}`
        }
        sorted.push(value)
      })

      setLoading(true)

      const reset = query && query.reset

      await axios
        .get(ROUTES_CREDIT_REQUESTS.CONTENT.replace(':id', submission.id), {
          params: {
            filters,
            page: state.page + 1, // page from front-end is zero index, but in the back-end we need the actual page number
            page_size: state.pageSize,
            sorted: sorted.join(','),
            reset
          }
        })
        .then((response) => {
          const { content: refreshedContent, pages: numPages } = response.data

          refreshedContent.forEach((row, idx) => {
            const reasonIndex = reasonList.findIndex(
              (x) => Number(x.id) === Number(row.id)
            )

            // The reasonList stores any changes to reasons
            // a user has made. If the user filters or sorts, the content
            // value can be different when it comes back from the server
            // and their changes would be lost.
            // To account for this we set the refreshedContent reason value
            // to the value in the reasonList so we don't lose the user changes.
            if (reasonIndex >= 0) {
              refreshedContent[idx].reason = reasonList[reasonIndex].reason
            } else if (reasonIndex < 0) {
              // If the reason with id doesn't exist in the reasonList
              // then we add it here matching the content reason value
              reasonList.push({
                id: Number(row.id),
                reason: row.reason
              })
            }
          })

          setPages(numPages)
          setContent(refreshedContent)
          setReasonList(reasonList)
          setLoading(false)
        })
    }, 750)
  }

  const clearFilters = () => {
    setSelectedOption('')
    setFiltered([])

    const state = reactTable.getResolvedState()

    refreshContent(state)
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
            handleCheckboxClick={handleCheckboxClick}
            handleChangeReason={handleChangeReason}
            invalidatedList={invalidatedList}
            items={content}
            loading={loading}
            modified={modified}
            pages={pages}
            query={query}
            reasons={reasons}
            refreshContent={refreshContent}
            setContent={setContent}
            setFiltered={setFiltered}
            setLoading={setLoading}
            setPages={setPages}
            setReactTable={setReactTable}
            submission={submission}
            user={user}
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
  setContent: PropTypes.func.isRequired,
  setReasonList: PropTypes.func.isRequired,
  submission: PropTypes.shape().isRequired,
  user: CustomPropTypes.user.isRequired
}

export default CreditRequestVINListPage
