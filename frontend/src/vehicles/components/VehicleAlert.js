import React from 'react'
import PropTypes from 'prop-types'
import Alert from '../../app/components/Alert'

const VehicleAlert = (props) => {
  const { date, optionalMessage, optionalClassname, user, status, isActive } =
    props
  let message = optionalMessage
  let title
  let classname
  let icon = 'exclamation-circle'
  switch (status) {
    case 'CHANGES_REQUESTED':
      title = 'Changes Requested'
      message = `information or change requested by Government of B.C. ${date}, see comments. ${message}`
      classname = 'alert-warning'
      break
    case 'DRAFT':
      title = 'Draft'
      message = `saved ${date} by ${user}, awaiting submission to Government of B.C. ${message}`
      classname = 'alert-warning'
      break
    case 'SUBMITTED':
      message = `submitted to Government of B.C. ${date} by ${user}, awaiting validation by Government of B.C. ${message}`
      title = 'Submitted'
      classname = 'alert-primary'
      break
    case 'VALIDATED':
      title = 'Validated'
      message = `validated by Government of B.C. ${date}. Credits can be issued for ZEVs supplied of this model that have been registered.`
      classname = 'alert-success'
      icon = 'check-circle'
      break
    case 'REJECTED':
      title = 'Rejected'
      message = `rejected by Government of B.C. ${date}. Credits cannot be issued for sales of this model.`
      classname = 'alert-danger'
      break
    default:
      title = ''
      message = optionalMessage
      classname = optionalClassname
  }
  if (isActive === false) {
    title = 'Inactive'
    message =
      'This ZEV model has been made inactive and can no longer be submitted for credits for consumer sales. You can make this model active again if you have more sales to submit.'
    classname = 'alert-warning'
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

VehicleAlert.defaultProps = {
  date: '',
  user: '',
  status: '',
  optionalClassname: '',
  optionalMessage: '',
  isActive: true
}
VehicleAlert.propTypes = {
  date: PropTypes.string,
  user: PropTypes.string,
  status: PropTypes.string,
  optionalClassname: PropTypes.string,
  optionalMessage: PropTypes.string,
  isActive: PropTypes.bool
}
export default VehicleAlert
