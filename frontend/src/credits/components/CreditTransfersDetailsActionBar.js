import React from 'react'
import PropTypes from 'prop-types'

import Button from '../../app/components/Button'
import CustomPropTypes from '../../app/utilities/props'

const CreditTransfersDetailsActionBar = (props) => {
  const {
    allChecked,
    assertions,
    checkboxes,
    comment,
    existingComments,
    setModalType,
    setShowModal,
    transferRole,
    user
  } = props

  let submitTooltip =
    'You must acknowledge the three confirmation checkboxes prior to submitting this transfer.'

  if (!user.hasPermission('SUBMIT_CREDIT_TRANSFER_PROPOSAL')) {
    submitTooltip = 'You do not have the permission to submit this transfer.'
  }

  const actionBar = (
    <div className="row">
      <div className="col-sm-12">
        <div className="action-bar">
          <span className="left-content">
            <Button buttonType="back" locationRoute="/credit-transfers" data-testid="back-to"/>
            {transferRole.tradePartner && (
              <Button
                data-testid="reject-transfer"
                buttonType="reject"
                optionalText="Reject Notice"
                disabled={comment.length === 0 || allChecked}
                action={() => {
                  setModalType('partner-reject')
                  setShowModal(true)
                }}
              />
            )}
            {transferRole.rescindable && (
              <Button
                buttonType="rescind"
                disabled={comment.length === 0}
                action={() => {
                  setModalType('rescind')
                  setShowModal(true)
                }}
              />
            )}
            {transferRole.governmentAnalyst && (
              <Button
                data-testid="recommend-reject-transfer"
                buttonType="reject"
                optionalText="Recommend Rejection"
                disabled={existingComments.length === 0}
                buttonTooltip="Please provide a comment for the director to enable this button."
                action={() => {
                  setModalType('recommend-reject')
                  setShowModal(true)
                }}
              />
            )}
            {transferRole.governmentDirector && (
              <Button
                data-testid="director-return-transfer"
                buttonType="reject"
                optionalText="Return to Analyst"
                action={() => {
                  setModalType('return')
                  setShowModal(true)
                }}
              />
            )}
          </span>
          <span className="right-content">
            {transferRole.initiatingSupplier &&
              user.hasPermission('SUBMIT_CREDIT_TRANSFER_PROPOSAL') && (
                <Button
                  data-testid="submit-to-partner"
                  buttonType="submit"
                  action={() => {
                    setModalType('initiating-submit')
                    setShowModal(true)
                  }}
                  optionalText="Submit Notice"
                  disabled={
                    !checkboxes.authority ||
                    !checkboxes.accurate ||
                    !checkboxes.consent ||
                    comment.length > 0
                  }
                />
            )}
            {transferRole.governmentAnalyst && (
              <Button
                testid="recommend-approve-transfer"
                buttonType="approve"
                optionalText="Recommend Transfer"
                disabled={existingComments.length === 0}
                buttonTooltip="Please provide a comment for the director to enable this button."
                action={() => {
                  setModalType('recommend-transfer')
                  setShowModal(true)
                }}
              />
            )}
            {transferRole.tradePartner && (
              <Button
                data-testid="submit-to-gov"
                buttonTooltip={submitTooltip}
                buttonType="submit"
                action={() => {
                  setModalType('partner-accept')
                  setShowModal(true)
                }}
                optionalText="Submit Notice"
                disabled={
                  checkboxes.length < assertions.length ||
                  !user.hasPermission('SUBMIT_CREDIT_TRANSFER_PROPOSAL')
                }
              />
            )}
            {transferRole.governmentDirector && (
              <Button
                disabled={comment.length === 0}
                testid="director-reject-transfer"
                buttonType="reject"
                optionalText="Reject Transfer"
                action={() => {
                  setModalType('director-reject')
                  setShowModal(true)
                }}
              />
            )}
            {transferRole.governmentDirector && (
              <Button
                testid="director-record"
                buttonType="approve"
                optionalText="Record Transfer"
                action={() => {
                  setModalType('director-record')
                  setShowModal(true)
                }}
              />
            )}
          </span>
        </div>
      </div>
    </div>
  )
  return <>{actionBar}</>
}
CreditTransfersDetailsActionBar.defaultProps = {
  assertions: [],
  comment: ''
}

CreditTransfersDetailsActionBar.propTypes = {
  allChecked: PropTypes.bool.isRequired,
  assertions: PropTypes.arrayOf(PropTypes.shape()),
  checkboxes: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ).isRequired,
  comment: PropTypes.string,
  transferRole: PropTypes.shape().isRequired,
  setModalType: PropTypes.func.isRequired,
  setShowModal: PropTypes.func.isRequired,
  user: CustomPropTypes.user.isRequired
}
export default CreditTransfersDetailsActionBar
