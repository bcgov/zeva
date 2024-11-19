import React from 'react'
import PropTypes from 'prop-types'
import Alert from '../../app/components/Alert'

const CreditAgreementsAlert = (props) => {
  const { status, date, isGovernment, id, transactionType, updateUser} = props

  let message = ''
  let title
  let classname
  let icon = 'exclamation-circle'
  let transaction = ''

  if (transactionType === 'Automatic Administrative Penalty') {
    transaction = 'AP'
  } else if (transactionType === 'Purchase Agreement') {
    transaction = 'PA'
  } else if (transactionType === 'Administrative Credit Allocation') {
    transaction = 'AA'
  } else if (transactionType === 'Administrative Credit Reduction') {
    transaction = 'AR'
  } else if (transactionType === 'Reassessment Reduction') {
    transaction = 'RR'
  } else if (transactionType === 'Reassessment Allocation') {
    transaction = 'RA'
  } else {
    transaction = 'IA'
  }

  switch (status) {
    case 'DRAFT':
      title = 'Draft'
      message = `saved, ${date} by ${updateUser.displayName}.`
      classname = 'alert-warning'
      break

    case 'RECOMMENDED':
      title = 'Recommended'
      message = `recommended for issuance, ${date} by ${updateUser.displayName}.`
      classname = 'alert-primary'
      break

    case 'RETURNED':
      title = 'Returned'
      message = `${transaction}-${id} returned ${date} by the Director`
      classname = 'alert-primary'
      break

    case 'ISSUED':
      title = 'Issued'
      classname = 'alert-success'
      icon = 'check-circle'
      if (isGovernment) {
        message = `${transaction}-${id} issued ${date} by the Director`
      } else {
        message = `${transaction}-${id} issued ${date} by the Government of B.C.`
      }
      break

    default:
      title = ''
  }

  return (
    <Alert title={title} icon={icon} classname={classname} message={message} />
  )
}

CreditAgreementsAlert.defaultProps = {
  isGovernment: false
}

CreditAgreementsAlert.propTypes = {
  date: PropTypes.string.isRequired,
  updateUser: PropTypes.shape().isRequired,
  status: PropTypes.string.isRequired,
  transactionType: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  isGovernment: PropTypes.bool
}

export default CreditAgreementsAlert
