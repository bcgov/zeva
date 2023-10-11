import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import CreditAgreementsDetailsPage from './components/CreditAgreementsDetailsPage'
import Loading from '../app/components/Loading'
import ROUTES_CREDIT_AGREEMENTS from '../app/routes/CreditAgreements'
import CustomPropTypes from '../app/utilities/props'
import history from '../app/History'

const CreditAgreementsDetailsContainer = (props) => {
  const { keycloak, user } = props
  const [idirComment, setIdirComment] = useState([])
  const [bceidComment, setBceidComment] = useState([])
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [details, setDetails] = useState({})
  const directorAction =
    user.isGovernment && user.hasPermission('SIGN_INITIATIVE_AGREEMENTS')
  const analystAction =
    user.isGovernment && user.hasPermission('RECOMMEND_INITIATIVE_AGREEMENTS')

  const handleCommentChangeIdir = (text) => {
    setIdirComment(text)
  }
  const handleCommentChangeBceid = (text) => {
    setBceidComment(text)
  }
  const handleSubmit = (status) => {
    axios
      .patch(ROUTES_CREDIT_AGREEMENTS.DETAILS.replace(':id', id), {
        validationStatus: status
      })
      .then(() => {
        history.push(ROUTES_CREDIT_AGREEMENTS.LIST)

        if (status !== 'DELETED') {
          history.replace(ROUTES_CREDIT_AGREEMENTS.DETAILS.replace(':id', id))
        }
      })
  }
  const handleAddComment = (commentType) => {
    let comment = {}
    if (commentType === 'bceidComment') {
      comment = { comment: bceidComment, director: false }
    } else {
      comment = { comment: idirComment, director: true }
    }

    axios
      .post(ROUTES_CREDIT_AGREEMENTS.COMMENT_SAVE.replace(':id', id), comment)
      .then(() => {
        history.push(ROUTES_CREDIT_AGREEMENTS.LIST)
        history.replace(ROUTES_CREDIT_AGREEMENTS.DETAILS.replace(':id', id))
      })
  }

  const refreshDetails = () => {
    axios
      .get(ROUTES_CREDIT_AGREEMENTS.DETAILS.replace(':id', id))
      .then((response) => {
        const {
          comments,
          effectiveDate,
          optionalAgreementId,
          organization,
          transactionType,
          status,
          updateTimestamp,
          attachments,
          creditAgreementContent,
          updateUser
        } = response.data
        let filteredIdirComments
        let filteredBceidComments
        if (comments && comments.length > 0) {
          filteredIdirComments = comments.filter(
            (data) => data.toDirector === true
          )
          filteredBceidComments = comments.filter(
            (data) => data.toDirector === false
          )
        }

        setDetails({
          filteredIdirComments,
          filteredBceidComments,
          effectiveDate,
          optionalAgreementId,
          organization,
          transactionType,
          status,
          updateTimestamp,
          attachments,
          creditAgreementContent,
          updateUser
        })
        setLoading(false)
      })
  }

  useEffect(() => {
    refreshDetails()
  }, [keycloak.authenticated])
  if (loading) {
    return <Loading />
  }

  return (
    <CreditAgreementsDetailsPage
      id={id}
      user={user}
      analystAction={analystAction}
      directorAction={directorAction}
      handleAddComment={handleAddComment}
      handleCommentChangeIdir={handleCommentChangeIdir}
      handleCommentChangeBceid={handleCommentChangeBceid}
      details={details}
      handleSubmit={handleSubmit}
    />
  )
}

CreditAgreementsDetailsContainer.propTypes = {
  keycloak: CustomPropTypes.keycloak.isRequired,
  user: CustomPropTypes.user.isRequired
}

export default CreditAgreementsDetailsContainer
