/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'

import history from '../app/History'
import Loading from '../app/components/Loading'
import ROUTES_CREDIT_REQUESTS from '../app/routes/CreditRequests'
import CustomPropTypes from '../app/utilities/props'
import CreditRequestVINListPage from './components/CreditRequestVINListPage'

const qs = require('qs')

const CreditRequestVINListContainer = (props) => {
  const { location, match, user } = props
  const { id } = match.params

  const [content, setContent] = useState([])
  const [submission, setSubmission] = useState([])
  const [invalidatedList, setInvalidatedList] = useState([])
  const [reasons, setReasons] = useState([])
  const [modified, setModified] = useState([])
  const [reasonList, setReasonList] = useState([])
  const [errors, setError] = useState([])

  const [contentCount, setContentCount] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(100)
  const [filters, setFilters] = useState([])
  const [sorts, setSorts] = useState([{ id: 'xls_sale_date', desc: true }])

  const [initialLoading, setInitialLoading] = useState(true)
  const [tableLoading, setTableLoading] = useState(true)

  const query = qs.parse(location.search, { ignoreQueryPrefix: true })
  const reset = query && query.reset

  const refreshDetails = () => {
    axios
      .all([
        axios.get(ROUTES_CREDIT_REQUESTS.DETAILS.replace(':id', id)),
        axios.get(ROUTES_CREDIT_REQUESTS.UNSELECTED.replace(':id', id), {
          params: query
        }),
        axios.get(ROUTES_CREDIT_REQUESTS.REASONS)
      ])
      .then(
        axios.spread(
          (
            submissionResponse,
            unselectedResponse,
            reasonsResponse
          ) => {
            const { data: submissionData } = submissionResponse
            setSubmission(submissionData)
            const { data: unselected } = unselectedResponse
            setInvalidatedList(unselected)
            const { data: reasonsData } = reasonsResponse
            setReasons(reasonsData)
            setInitialLoading(false)
          }
        )
      )
  }

  useEffect(() => {
    refreshDetails()
  }, [id])

  useEffect(() => {
    setTableLoading(true)
    const data = {
      filters,
      sorts,
      pageSize,
      page,
      reset
    }
    axios.post(ROUTES_CREDIT_REQUESTS.CONTENT.replace(':id', id), data).then((response) => {
      // Initialize content and reason values
      const { content: contentListData, count, errors: errorDict } = response.data
      const reasonListData = []

      // Set content and reason values for each model row
      contentListData.forEach((row, idx) => {
        const subId = Number(row.id)
        const noMatch = row.warnings?.includes('NO_ICBC_MATCH')
        if (reset) {
          contentListData[idx].reason = noMatch ? reasons[0] : ''
          reasonListData.push({
            id: subId,
            reason: noMatch ? reasons[0] : ''
          })
        } else {
          reasonListData.push({
            id: subId,
            reason: row.reason
          })
        }
      })

      contentListData.forEach((row, idx) => {
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
          contentListData[idx].reason = reasonList[reasonIndex].reason
        } else if (reasonIndex < 0) {
          // If the reason with id doesn't exist in the reasonList
          // then we add it here matching the content reason value
          reasonList.push({
            id: Number(row.id),
            reason: row.reason
          })
        }
      })

      setContent(contentListData)
      setContentCount(count)
      setReasonList(reasonListData)
      setError(errorDict)
      setTableLoading(false)
    })
  }, [id, page, pageSize, filters, sorts])

  const handleChangeReason = (submissionId, value = false) => {
    const newContent = content
    const subId = Number(submissionId)
    const reasonIdx = reasonList.findIndex((r) => Number(r.id) === subId)
    const contentIdx = content.findIndex((c) => Number(c.id) === subId)

    if (reasonIdx >= 0) {
      reasonList[reasonIdx].reason = value
    } else {
      reasonList.push({
        id: Number(submissionId),
        reason: value
      })
    }
    if (contentIdx >= 0) {
      newContent[contentIdx].reason = value
    }

    setReasonList(reasonList)
    setContent(newContent)
  }

  // This could be refactored to only use the content list
  // rather than these 4 different change lists
  const handleCheckboxClick = (event) => {
    const { value: submissionId, checked } = event.target

    const subId = Number(submissionId)
    const contentIdx = content.findIndex((c) => Number(c.id) === subId)
    const noMatch = content[contentIdx].warnings?.includes('NO_ICBC_MATCH')

    updateInvalidated(checked, subId)
    updateContent(checked, noMatch, contentIdx)
    updateReasons(checked, noMatch, subId)
    updateModified(subId)
  }

  const updateInvalidated = (checked, subId) => {
    if (checked) {
      setInvalidatedList(invalidatedList.filter((i) => Number(i) !== subId))
    } else {
      setInvalidatedList(() => [...invalidatedList, subId])
    }
  }

  const updateContent = (checked, noMatch, idx) => {
    const newContent = content
    if (checked) {
      newContent[idx].reason = noMatch ? reasons[0] : ''
    } else {
      newContent[idx].reason = ''
    }
    setContent(newContent)
  }

  const updateReasons = (checked, noMatch, subId) => {
    const reasonIdx = reasonList.findIndex((r) => Number(r.id) === subId)
    if (checked) {
      if (reasonIdx >= 0) {
        reasonList[reasonIdx].reason = noMatch ? reasons[0] : ''
      } else {
        reasonList.push({
          id: subId,
          reason: noMatch ? reasons[0] : ''
        })
      }
    } else {
      if (reasonIdx >= 0) {
        reasonList[reasonIdx].reason = ''
      }
    }
    setReasonList(reasonList)
  }

  const updateModified = (id) => {
    const modifiedIdx = modified.findIndex((m) => Number(m) === id)
    modifiedIdx >= 0 ? modified.splice(modifiedIdx, 1) : modified.push(id)
    setModified(modified)
  }

  const handleSubmit = () => {
    setInitialLoading(true)

    axios
      .patch(ROUTES_CREDIT_REQUESTS.DETAILS.replace(':id', id), {
        invalidated: invalidatedList,
        validationStatus: 'CHECKED',
        reasons: reasonList,
        reset
      })
      .then(() => {
        const url = ROUTES_CREDIT_REQUESTS.VALIDATED.replace(
          /:id/g,
          submission.id
        )

        history.push(url)
      })
  }

  if (initialLoading) {
    return <Loading />
  }

  return (
    <CreditRequestVINListPage
      content={content}
      reasonList={reasonList}
      handleCheckboxClick={handleCheckboxClick}
      handleChangeReason={handleChangeReason}
      handleSubmit={handleSubmit}
      invalidatedList={invalidatedList}
      modified={modified}
      query={query}
      reasons={reasons}
      routeParams={match.params}
      setContent={setContent}
      setReasonList={setReasonList}
      submission={submission}
      user={user}
      errors={errors}
      tableLoading={tableLoading}
      itemsCount={contentCount}
      page={page}
      setPage={setPage}
      pageSize={pageSize}
      setPageSize={setPageSize}
      filters={filters}
      setFilters={setFilters}
      sorts={sorts}
      setSorts={setSorts}
    />
  )
}

CreditRequestVINListContainer.propTypes = {
  location: PropTypes.shape().isRequired,
  user: CustomPropTypes.user.isRequired,
  match: CustomPropTypes.routeMatch.isRequired
}

export default withRouter(CreditRequestVINListContainer)
