import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment-timezone'
import Alert from '../../app/components/Alert'

const CreditTransfersAlert = (props) => {
  const { user, submission } = props
  const { history, status, debitFrom, creditTo, id } = submission
  let message = ''
  let title
  let classname
  let icon = 'exclamation-circle'
  const statusFilter = (transferStatus) => {
    const filteredStatuses = history.filter((each) => each.status === transferStatus)
    if (transferStatus === 'APPROVED') {
      return filteredStatuses[0]
    }
    return filteredStatuses.reverse()[0]
  }
  const date = moment(statusFilter(status).createTimestamp).format(
    'MMM D, YYYY'
  )
  const statusOrg = statusFilter(status).createUser.organization.name
  const userName = statusFilter(status).createUser.displayName

  switch (status) {
    case 'DRAFT':
      title = 'Draft'
      message = `CT-${id} saved ${date} by ${userName}, awaiting submission to  ${creditTo.name} by your signing authority.`
      classname = 'alert-warning'
      break
    case 'RESCINDED':
      title = 'Rescinded'
      message = `CT-${id} rescinded ${date} by ${statusOrg}`
      classname = 'alert-danger'
      break
    case 'RESCIND_PRE_APPROVAL':
      title = 'Rescinded'
      message = `CT-${id} rescinded ${date} by ${statusOrg}`
      classname = 'alert-danger'
      break
    case 'SUBMITTED':
      if (user.organization.id === debitFrom.id) {
        // bceid initiator
        title = 'Submitted to Transfer Partner'
        message = `CT-${id} submitted ${date} by ${userName}, awaiting ${creditTo.name} acceptance.`
        classname = 'alert-warning'
      } else {
        // bceid receiver
        title = 'Submitted by Transfer Partner'
        message = `submitted ${date} by ${debitFrom.name}, awaiting your signing authority acceptance.`
        classname = 'alert-warning'
      }
      break

    case 'APPROVED':
      title = 'Submitted to Government'
      if (user.isGovernment) {
        classname = 'alert-warning'
        message = `CT-${id} submitted to the Government of B.C. ${date}, awaiting government analyst review and recommendation to the Director.`
      } else {
        message = `CT-${id} submitted to the Government of B.C. ${date}, awaiting government review.`
        classname = 'alert-primary'
      }

      break
    case 'DISAPPROVED':
      title = 'Rejected'
      message = `CT-${id}  rejected ${date} by ${statusOrg}.`
      classname = 'alert-danger'
      break
    case 'REJECTED':
      title = 'Rejected'
      classname = 'alert-danger'
      if (user.isGovernment) {
        message = `CT-${id} rejected ${date} by the Director.`
      } else {
        message = `CT-${id} rejected ${date} by the Government of B.C.`
      }
      break

    case 'RECOMMEND_APPROVAL':
      if (user.isGovernment) {
        title = 'Recommend Transfer'
        message = `CT-${id} recommended recording of transfer ${date} by ${userName}, awaiting Director action.`
        classname = 'alert-primary'
      }
      break
    case 'RECOMMEND_REJECTION':
      if (user.isGovernment) {
        title = 'Recommend Rejection'
        message = `CT-${id} recommended rejection of transfer ${date} by ${userName}, awaiting Director action.`
        classname = 'alert-danger'
      }
      break
    case 'VALIDATED':
      icon = 'check-circle'
      classname = 'alert-success'
      if (user.isGovernment) {
        message = `CT-${id} recorded ${date} by the Director, credit balances have been adjusted.`
      } else {
        message = `CT-${id} recorded ${date} by the Government of B.C, credit balances have been adjusted.`
      }
      break

    default:
      title = ''
  }

  return (
    <>
      <Alert
        title={title}
        icon={icon}
        classname={classname}
        message={message}
      />
    </>
  )
}

CreditTransfersAlert.defaultProps = {}
CreditTransfersAlert.propTypes = {
  submission: PropTypes.shape().isRequired,
  user: PropTypes.shape().isRequired
}
export default CreditTransfersAlert
