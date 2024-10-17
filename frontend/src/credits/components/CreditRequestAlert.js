import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment-timezone'
import Alert from '../../app/components/Alert'
import isLegacySubmission from '../../app/utilities/isLegacySubmission'

const CreditRequestAlert = (props) => {
  const { isGovernment, submission, icbcDate, invalidSubmission } = props
  const { content, validationStatus, history, filename, id } = submission

  let message = ''
  let title
  let classname
  let historyMessage
  let icon = 'exclamation-circle'
  let ineligible = 0

  content.forEach((item) => {
    if (!item.vehicle || !item.vehicle.id || item.vehicle.modelName === '') {
      ineligible += item.sales
    }
  })

  const statusFilter = (status) =>
    history.filter((each) => each.validationStatus === status)[0]

  if (
    !history.some((each) =>
      [
        'DRAFT',
        'SUBMITTED',
        'VALIDATED',
        'RECOMMEND_APPROVAL',
        'CHECKED',
        'REJECTED'
      ].includes(each.validationStatus)
    )
  ) {
    return false
  }
  // later we might put in a flag to check if submission has gone back and forth between
  // analyst and director and have a new alert type
  let excelUploadMessage = ''

  // additional check just in case for some reason draft status couldn't be found
  if (history.find((each) => each.validationStatus === 'DRAFT')) {
    excelUploadMessage = `Excel template ${filename} uploaded and auto-saved, ${moment(
      statusFilter('DRAFT').createTimestamp
    ).format('MMM D, YYYY')} by ${
      statusFilter('DRAFT').createUser.displayName
    }`
  }
  let submissionMessage
  if (history.find((each) => each.validationStatus === 'SUBMITTED')) {submissionMessage = `Application submitted to Government of B.C. ${moment(
        statusFilter('SUBMITTED').createTimestamp
      ).format('MMM D, YYYY')} by ${
        statusFilter('SUBMITTED').createUser.displayName
      }`
    }
  switch (validationStatus) {
    case 'DRAFT':
      if (invalidSubmission) {
        title = 'Errors found'
        classname = 'alert-danger'
        message = `You cannot submit this application. ${ineligible} records are not eligible for credits. Delete this application, correct the errors and re-upload the Excel file.`
        break
      }
      title = 'Draft'
      message = `CA-${id} ${excelUploadMessage}, awaiting submission to Government of B.C. `
      classname = 'alert-warning'
      break
    case 'SUBMITTED':
      message = `CA-${id} submitted to Government of B.C. ${moment(
        statusFilter('SUBMITTED').createTimestamp
      ).format('MMM D, YYYY')}, by ${
        statusFilter('SUBMITTED').createUser.displayName
      }. Awaiting review by Government of B.C.`
      title = 'Submitted'
      if (isGovernment) {
        classname = 'alert-warning'
      } else {
        classname = 'alert-primary'
      }
      if (excelUploadMessage) {
        historyMessage = `${excelUploadMessage}. `
      }
      break
    case 'VALIDATED':
      title = 'Issued'
      classname = 'alert-success'
      icon = 'check-circle'
      if (isGovernment) {
        message = `CA-${id} issued ${moment(
          statusFilter('VALIDATED').createTimestamp
        ).format('MMM D, YYYY')} by ${
          statusFilter('VALIDATED').createUser.displayName
        }.`
      } else {
        message = `CA-${id} issued ${moment(
          statusFilter('VALIDATED').createTimestamp
        ).format('MMM D, YYYY')} by Government of B.C.`
      }
      if (excelUploadMessage) {
        historyMessage = `${excelUploadMessage}. ` + submissionMessage
      } else {
        historyMessage = `${submissionMessage}`
      }
      break
    case 'REJECTED':
      title = 'Rejected'
      classname = 'alert-danger'
      if (!isGovernment) {
        message = `CA-${id}  rejected ${moment(
          statusFilter('REJECTED').createTimestamp
        ).format('MMM D, YYYY')} by Government of B.C.`
      } else {
        message = `CA-${id}  rejected ${moment(
          statusFilter('REJECTED').createTimestamp
        ).format('MMM D, YYYY')} by ${
          statusFilter('REJECTED').createUser.displayName
        }.`
      }
      if (excelUploadMessage) {
        historyMessage = `${excelUploadMessage}. `
      }
      break
    case 'RECOMMEND_APPROVAL':
      if (isGovernment) {
        title = 'Recommended'
        message = `CA-${id} Application reviewed and recommended to Director ${moment(
          statusFilter('RECOMMEND_APPROVAL').createTimestamp
        ).format('MMM D, YYYY')} by ${
          statusFilter('RECOMMEND_APPROVAL').createUser.displayName
        }.  ICBC data used was current to ${icbcDate}.`
        classname = 'alert-warning'
      }
      if (excelUploadMessage) {
        historyMessage = `${excelUploadMessage}. ${submissionMessage}`
      }
      break
    case 'CHECKED':
      title = 'Validated'
      message = `CA-${id} ${isLegacySubmission(submission) ? "Sales " : ''}checked against ICBC registration data ${moment(
        statusFilter('CHECKED').createTimestamp
      ).format('MMM D, YYYY')} by ${
        statusFilter('CHECKED').createUser.displayName
      }. ICBC data used was current to: ${icbcDate}`
      classname = 'alert-warning'
      if (excelUploadMessage) {
        historyMessage = `${excelUploadMessage}.  ${submissionMessage}`
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
        historyMessage={historyMessage}
      />
    </>
  )
}

CreditRequestAlert.defaultProps = {
  submission: {
    history: [
      {
        createUser: { displayName: '' },
        createTimestamp: '',
        validationStatus: ''
      }
    ]
  },
  isGovernment: false,
  icbcDate: '',
  invalidSubmission: false
}
CreditRequestAlert.propTypes = {
  submission: PropTypes.shape(),
  isGovernment: PropTypes.bool,
  icbcDate: PropTypes.string,
  invalidSubmission: PropTypes.bool
}
export default CreditRequestAlert
