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
import ROUTES_CREDIT_TRANSFERS from '../app/routes/CreditTransfers'
import ROUTES_SIGNING_AUTHORITY_ASSERTIONS from '../app/routes/SigningAuthorityAssertions'
import CustomPropTypes from '../app/utilities/props'
import CreditTransfersDetailsPage from './components/CreditTransfersDetailsPage'

const CreditTransfersDetailsContainer = (props) => {
  const { user, match } = props
  const [errorMessage, setErrorMessage] = useState([])
  const [assertions, setAssertions] = useState([])
  const [checkboxes, setCheckboxes] = useState([])
  const [sufficientCredit, setSufficientCredit] = useState(true)
  const { id } = match.params
  const [submission, setSubmission] = useState({})
  const [orgBalances, setOrgBalances] = useState({})
  const [loading, setLoading] = useState(true)

  const refreshDetails = () => {
    axios
      .all([
        axios.get(ROUTES_CREDIT_TRANSFERS.DETAILS.replace(':id', id)),
        axios.get(ROUTES_SIGNING_AUTHORITY_ASSERTIONS.LIST)
      ])
      .then(
        axios.spread((response, assertionsResponse) => {
          const filteredAssertions = assertionsResponse.data.filter(
            (data) => data.module === 'credit_transfer'
          )
          setAssertions(filteredAssertions)
          setSubmission(response.data)
          setSufficientCredit(response.data.sufficientCredits)

          setLoading(false)
        })
      )
  }

  useEffect(() => {
    refreshDetails()
  }, [id])

  useEffect(() => {
    if (user.isGovernment && submission.status === 'APPROVED') {
      axios.get(ROUTES_CREDIT_TRANSFERS.ORG_BALANCES.replace(':id', id)).then((response) => {
        setOrgBalances(response.data)
      })
    }
  }, [id, user, submission])

  const handleCheckboxClick = (event) => {
    if (!event.target.checked) {
      const checked = checkboxes.filter(
        (each) => Number(each) !== Number(event.target.id)
      )
      setCheckboxes(checked)
    }

    if (event.target.checked) {
      const checked = checkboxes.concat(event.target.id)
      setCheckboxes(checked)
    }
  }

  const handleSubmit = (status, comment = '') => {
    const submissionContent = { status }
    if (comment.length > 0) {
      submissionContent.creditTransferComment = { comment }
    }
    if (checkboxes.length > 0) {
      submissionContent.signingConfirmation = checkboxes
    }
    axios
      .patch(
        ROUTES_CREDIT_TRANSFERS.DETAILS.replace(':id', id),
        submissionContent
      )
      .then(() => {
        history.push(ROUTES_CREDIT_TRANSFERS.EDIT.replace(':id', id))
        if (status === 'RESCINDED' || status === 'DRAFT') {
          history.replace(ROUTES_CREDIT_TRANSFERS.EDIT.replace(':id', id))
        } else {
          history.replace(ROUTES_CREDIT_TRANSFERS.DETAILS.replace(':id', id))
        }
      })
      .catch((error) => {
        const { response } = error
        if (response.status === 400) {
          if (typeof response.data === 'object') {
            setErrorMessage(Object.values(response.data))
          } else {
            setErrorMessage(response.data.status)
          }
        }
      })
  }

  const handleInternalCommentEdit = (commentId, commentText) => {
    axios
    .patch(ROUTES_CREDIT_TRANSFERS.UPDATE_COMMENT.replace(':id', id), {
      commentId,
      commentText
    })
    .then((response) => {
      const updatedComment = response.data
      setSubmission((prev) => {
        const historyItemIndex = prev.history.findIndex(
          (item) => {
            if (item.comment) {
              return item.comment.id === updatedComment.id
            }
            return false
          }
        )
        const commentCopy = {...prev.history[historyItemIndex].comment}
        commentCopy.comment = updatedComment.comment
        commentCopy.updateTimestamp = updatedComment.updateTimestamp
        const historyItemCopy = {...prev.history[historyItemIndex]}
        historyItemCopy.comment = commentCopy
        const historyCopy = [...prev.history]
        historyCopy[historyItemIndex] = historyItemCopy
        const submissionCopy = {...prev}
        submissionCopy.history = historyCopy
        return submissionCopy
      })
    })
  }

  const handleInternalCommentDelete = (commentId) => {
    axios
    .patch(ROUTES_CREDIT_TRANSFERS.DELETE_COMMENT.replace(':id', id), {
      commentId
    })
    .then(() => {
      setSubmission((prev) => {
        const historyItemIndex = prev.history.findIndex(
          (item) => {
            if (item.comment) {
              return item.comment.id === commentId
            }
            return false
          }
        )
        const historyItemCopy = {...prev.history[historyItemIndex]}
        delete historyItemCopy.comment
        const historyCopy = [...prev.history]
        historyCopy[historyItemIndex] = historyItemCopy
        const submissionCopy = {...prev}
        submissionCopy.history = historyCopy
        return submissionCopy
      })
    })
  }

  if (loading) {
    return <Loading />
  }
  return [
    <CreditTransactionTabs active="credit-transfers" key="tabs" user={user} />,
    <CreditTransfersDetailsPage
      assertions={assertions}
      checkboxes={checkboxes}
      handleCheckboxClick={handleCheckboxClick}
      handleSubmit={handleSubmit}
      handleInternalCommentEdit={handleInternalCommentEdit}
      handleInternalCommentDelete={handleInternalCommentDelete}
      key="page"
      sufficientCredit={sufficientCredit}
      submission={submission}
      user={user}
      errorMessage={errorMessage}
      orgBalances={orgBalances}
    />
  ]
}

CreditTransfersDetailsContainer.defaultProps = {
  validatedOnly: false
}

CreditTransfersDetailsContainer.propTypes = {
  match: CustomPropTypes.routeMatch.isRequired,
  user: CustomPropTypes.user.isRequired,
  validatedOnly: PropTypes.bool
}

export default withRouter(CreditTransfersDetailsContainer)
