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
import CreditRequestValidatedDetailsPage from './components/CreditRequestValidatedDetailsPage'

const qs = require('qs')

const CreditRequestValidatedDetailsContainer = (props) => {
  const { location, match, user } = props
  const { id } = match.params

  const [comment, setComment] = useState('')
  const [content, setContent] = useState([])
  const [submission, setSubmission] = useState([])
  const [invalidatedList, setInvalidatedList] = useState([])

  const [contentCount, setContentCount] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(100)
  const [filters, setFilters] = useState([])
  const [sorts, setSorts] = useState([{ id: 'xls_sale_date', desc: true }])

  const [initialLoading, setInitialLoading] = useState(true)
  const [tableLoading, setTableLoading] = useState(true)

  const query = qs.parse(location.search, { ignoreQueryPrefix: true })

  const refreshDetails = () => {
    axios
      .all([
        axios.get(ROUTES_CREDIT_REQUESTS.DETAILS.replace(':id', id)),
        axios.get(ROUTES_CREDIT_REQUESTS.UNSELECTED.replace(':id', id), {
          params: query
        })
      ])
      .then(
        axios.spread((submissionResponse, unselectedResponse) => {
          const { data: submissionData } = submissionResponse
          setSubmission(submissionData)

          const { data: unselected } = unselectedResponse
          setInvalidatedList(unselected)
          setInitialLoading(false)
          if (submissionData.validationStatus !== 'VALIDATED') {
            throw new Error("Credit Request hasn't been validated yet.")
          }
        })
      )
  }

  const handleCommentChange = (text) => {
    setComment(text)
  }

  const handleAddComment = () => {
    const submissionContent = {}
    if (comment.length > 0) {
      submissionContent.salesSubmissionComment = { comment }
    }
    axios
      .patch(
        ROUTES_CREDIT_REQUESTS.DETAILS.replace(':id', id),
        submissionContent
      )
      .then(() => {
        history.push(ROUTES_CREDIT_REQUESTS.DETAILS.replace(':id', id))
        const refreshed = true

        if (refreshed) {
          history.push(
            ROUTES_CREDIT_REQUESTS.VALIDATED_DETAILS.replace(':id', id)
          )
        }
      })
  }

  useEffect(() => {
    refreshDetails()
  }, [id])

  useEffect(() => {
    setTableLoading(true)
    let filtersToUse = filters
    if (filtersToUse.length === 0) {
      filtersToUse = [{id: 'warning', value: '1'}, {id: 'include_overrides', value: true}]
    }
    const data = {
      filters: filtersToUse,
      sorts,
      pageSize,
      page
    }
    axios.post(ROUTES_CREDIT_REQUESTS.CONTENT.replace(':id', id), data).then((response) => {
      const { content: contentData, count } = response.data
      setContent(contentData)
      setContentCount(count)
      setTableLoading(false)
    })
  }, [id, page, pageSize, filters, sorts])

  if (initialLoading) {
    return <Loading />
  }

  return (
    <CreditRequestValidatedDetailsPage
      content={content}
      handleAddComment={handleAddComment}
      handleCommentChange={handleCommentChange}
      invalidatedList={invalidatedList}
      submission={submission}
      user={user}
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

CreditRequestValidatedDetailsContainer.propTypes = {
  location: PropTypes.shape().isRequired,
  user: CustomPropTypes.user.isRequired,
  match: CustomPropTypes.routeMatch.isRequired
}

export default withRouter(CreditRequestValidatedDetailsContainer)
