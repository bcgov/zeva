/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import axios from 'axios'
import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import { withRouter } from 'react-router'

import CreditTransactionTabs from '../app/components/CreditTransactionTabs'
import Loading from '../app/components/Loading'
import history from '../app/History'
import ROUTES_CREDIT_REQUESTS from '../app/routes/CreditRequests'
import CustomPropTypes from '../app/utilities/props'
import CreditRequestDetailsPage from './components/CreditRequestDetailsPage'
import ROUTES_ICBCVERIFICATION from '../app/routes/ICBCVerification'

const CreditRequestDetailsContainer = (props) => {
  const { location, match, user, validatedOnly } = props

  const { state: locationState } = location
  const { id } = match.params

  const [submission, setSubmission] = useState([])
  const [loading, setLoading] = useState(true)
  const [nonValidated, setNonValidated] = useState([])
  const [ICBCUploadDate, setICBCUploadDate] = useState(null)
  const [issueAsMY, setIssueAsMY] = useState(true)

  const refreshDetails = () => {
    axios
      .all([
        axios.get(ROUTES_ICBCVERIFICATION.DATE),
        axios.get(ROUTES_CREDIT_REQUESTS.DETAILS.replace(':id', id))
      ])
      .then(
        axios.spread((dateResponse, submissionResponse) => {
          if (
            submissionResponse.data &&
            submissionResponse.data.partOfModelYearReport
          ) {
            setIssueAsMY(submissionResponse.data.partOfModelYearReport)
          }
          if (dateResponse.data) {
            setICBCUploadDate(dateResponse.data)
          }
          setSubmission(submissionResponse.data)
          setNonValidated(
            submissionResponse.data.content.filter((row) => row.recordOfSale)
          )
          setLoading(false)
        })
      )
  }

  const handleCheckboxClick = (event) => {
    setIssueAsMY(event.target.checked)
  }

  useEffect(() => {
    refreshDetails()
  }, [id])

  const handleSubmit = (validationStatus, comment = '') => {
    const submissionContent = { validationStatus }
    submissionContent.issueAsModelYearReport = issueAsMY
    if (comment.length > 0) {
      submissionContent.salesSubmissionComment = { comment }
      submissionContent.commentType = { govt: false }
    }
    axios
      .patch(
        ROUTES_CREDIT_REQUESTS.DETAILS.replace(':id', id),
        submissionContent
      )
      .then(() => {
        if (validationStatus === 'SUBMITTED') {
          window.location.reload()
        } else if (validationStatus === 'VALIDATED') {
          window.location.reload()
        } else {
          history.push(ROUTES_CREDIT_REQUESTS.LIST)
        }
      })
  }

  const handleInternalCommentEdit = (commentId, commentText) => {
    axios
      .patch(ROUTES_CREDIT_REQUESTS.UPDATE_COMMENT.replace(':id', commentId), {
        comment: commentText
      })
      .then((response) => {
        const updatedComment = response.data
        setSubmission((prev) => {
          const commentIndex = prev.salesSubmissionComment.findIndex(
            (comment) => {
              return comment.id === updatedComment.id
            }
          )
          const comment = prev.salesSubmissionComment[commentIndex]
          const commentCopy = { ...comment }
          commentCopy.comment = updatedComment.comment
          commentCopy.updateTimestamp = updatedComment.updateTimestamp

          const comments = prev.salesSubmissionComment
          const commentsCopy = [...comments]
          commentsCopy[commentIndex] = commentCopy

          const submissionCopy = { ...prev }
          submissionCopy.salesSubmissionComment = commentsCopy
          return submissionCopy
        })
      })
  }

  const handleInternalCommentDelete = (commentId) => {
    axios
      .patch(ROUTES_CREDIT_REQUESTS.DELETE_COMMENT.replace(':id', commentId))
      .then(() => {
        setSubmission((prev) => {
          const commentIndex = prev.salesSubmissionComment.findIndex(
            (comment) => {
              return comment.id === commentId
            }
          )
          const comments = prev.salesSubmissionComment
          const commentsCopy = [...comments]
          commentsCopy.splice(commentIndex, 1)

          const submissionCopy = { ...prev }
          submissionCopy.salesSubmissionComment = commentsCopy
          return submissionCopy
        })
      })
  }

  if (loading) {
    return <Loading />
  }

  return [
    <CreditTransactionTabs active="credit-requests" key="tabs" user={user} />,
    <CreditRequestDetailsPage
      handleSubmit={handleSubmit}
      key="page"
      locationState={locationState}
      nonValidated={nonValidated}
      submission={submission}
      uploadDate={ICBCUploadDate}
      user={user}
      validatedOnly={validatedOnly}
      handleCheckboxClick={handleCheckboxClick}
      issueAsMY={issueAsMY}
      handleInternalCommentEdit={handleInternalCommentEdit}
      handleInternalCommentDelete={handleInternalCommentDelete}
    />
  ]
}

CreditRequestDetailsContainer.defaultProps = {
  validatedOnly: false
}

CreditRequestDetailsContainer.propTypes = {
  match: CustomPropTypes.routeMatch.isRequired,
  user: CustomPropTypes.user.isRequired,
  validatedOnly: PropTypes.bool
}

export default withRouter(CreditRequestDetailsContainer)
