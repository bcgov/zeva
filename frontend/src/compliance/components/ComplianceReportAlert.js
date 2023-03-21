import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment-timezone'
import Alert from '../../app/components/Alert'

const ComplianceReportAlert = (props) => {
  const { next, report, status, type } = props

  const { history, validationStatus } = report
  let message = ''
  let title
  let classname

  const icon = 'exclamation-circle'
  let confirmedBy = {}

  const statusFilter = (transferStatus) =>
    history
      .filter((each) => each.validationStatus === transferStatus)
      .reverse()[0]

  let date
  let userName

  if (validationStatus && history.length > 0) {
    const found = statusFilter(validationStatus)
    if (found) {
      date = moment(found.createTimestamp).format('MMM D, YYYY')
      userName = found.createUser.displayName

      if (validationStatus === 'ASSESSED') {
        confirmedBy = {
          date: moment(statusFilter('SUBMITTED').createTimestamp).format(
            'MMM D, YYYY'
          ),
          user: statusFilter('SUBMITTED').createUser.displayName
        }
      }
      if (validationStatus === 'RETURNED' || validationStatus === 'RECOMMENDED') {
        // if the status is returned or recommended, we now want to see the user
        // who submitted originally, so if we ever change our minds and want to see
        // the actual alert information (ie the director that returned or the analyst
        // that recommended),this needs to be updated
        date = moment(statusFilter('SUBMITTED').createTimestamp).format(
          'MMM D, YYYY'
        )
        userName = statusFilter('SUBMITTED').createUser.displayName
      }
    }
  }

  if (status && status.confirmedBy) {
    confirmedBy = {
      date: moment(status.confirmedBy.createTimestamp).format('MMM D, YYYY'),
      user: status.confirmedBy.createUser.displayName
    }
  }

  if (type === 'Report Summary') {
    switch (status && status.status) {
      case 'UNSAVED':
        title = 'Model Year Report Draft'
        message =
          'All previous confirmation checkboxes must be confirmed to submit the report to government. You must have the Signing Authority role to submit the report to government.'
        classname = 'alert-warning'
        break

      case 'SAVED':
      case 'CONFIRMED':
        title = 'Model Year Report Draft'
        message =
          'The confirmation checkbox must be confirmed to submit the report to government. You must have the Signing Authority role to submit the report to government.'
        classname = 'alert-primary'
        if (type === 'Report Summary') {
          classname = 'alert-warning'
        }
        break

      case 'SUBMITTED':
      case 'RETURNED':
      case 'RECOMMENDED':
        title = 'Model Year Report Submitted'
        message = `Model Year Report Submitted ${date} by ${userName}`
        classname = 'alert-primary'
        break

      case 'ASSESSED':
        title = 'Model Year Report Assessed'
        message = `Model Year Report Assessed ${date} by Government of B.C. — ${type} submitted ${confirmedBy.date} by ${confirmedBy.user}`
        classname = 'alert-success'
        break

      default:
        title = ''
    }

    return (
      <Alert
        title={title}
        icon={icon}
        classname={classname}
        message={message}
      />
    )
  }
  switch (status && status.status) {
    case 'UNSAVED':
      title = 'Model Year Report Draft'
      message = `${type} unsaved, click Save to proceed to ${next}. The confirmation checkbox must be confirmed to submit the report to government.`
      classname = 'alert-warning'
      break

    case 'SAVED':
      title = 'Model Year Report Draft'
      message = `${type} saved, click Next to proceed to ${next}. The confirmation checkbox must be confirmed to submit the report to government.`
      classname = 'alert-warning'
      break

    case 'CONFIRMED':
      title = 'Model Year Report Draft'
      message = `${type} confirmed ${confirmedBy.date} by ${confirmedBy.user}, click Next to proceed to ${next}. Click Edit if you need to make further updates.`
      classname = 'alert-primary'
      break

    case 'SUBMITTED':
    case 'RETURNED':
    case 'RECOMMENDED':
      title = 'Model Year Report Submitted'
      message = `${type} confirmed ${confirmedBy.date} by ${confirmedBy.user}`
      classname = 'alert-primary'
      break

    case 'ASSESSED':
      title = 'Model Year Report Assessed'
      message = `Model Year Report Assessed ${date} by Government of B.C. — ${type} confirmed ${confirmedBy.date} by ${confirmedBy.user}`
      classname = 'alert-success'
      break

    default:
      title = ''
  }

  return (
    <Alert title={title} icon={icon} classname={classname} message={message} />
  )
}

ComplianceReportAlert.defaultProps = {
  next: ''
}

ComplianceReportAlert.propTypes = {
  report: PropTypes.shape().isRequired,
  status: PropTypes.shape().isRequired,
  type: PropTypes.string.isRequired,
  next: PropTypes.string
}

export default ComplianceReportAlert
