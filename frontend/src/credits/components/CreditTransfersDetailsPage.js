import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom'
import parse from 'html-react-parser'
import React, { useState, useEffect } from 'react'
import moment from 'moment-timezone'
import ReactQuill from 'react-quill'
import axios from 'axios'
import DisplayComment from '../../app/components/DisplayComment'
import EditableCommentList from '../../app/components/EditableCommentList'
import CreditTransferSignoff from './CreditTransfersSignOff'
import CreditTransfersDetailsActionBar from './CreditTransfersDetailsActionBar'
import Modal from '../../app/components/Modal'
import history from '../../app/History'
import CustomPropTypes from '../../app/utilities/props'
import CreditTransfersDetailsTable from './CreditTransfersDetailsTable'
import CreditTransfersDetailsSupplierTable from './CreditTransfersDetailsSupplierTable'
import CreditTransfersAlert from './CreditTransfersAlert'
import Alert from '../../app/components/Alert'
import formatNumeric from '../../app/utilities/formatNumeric'
import ROUTES_CREDIT_TRANSFERS from '../../app/routes/CreditTransfers'
import 'react-quill/dist/quill.snow.css'

const CreditTransfersDetailsPage = (props) => {
  const {
    assertions,
    checkboxes,
    handleCheckboxClick,
    handleSubmit,
    handleInternalCommentEdit,
    handleInternalCommentDelete,
    sufficientCredit,
    submission,
    user,
    errorMessage,
    orgBalances
  } = props
  const { id } = useParams()
  const [comment, setComment] = useState('')
  const [allChecked, setAllChecked] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('')
  const transferRole = {
    rescindable:
      (user.organization.id === submission.debitFrom.id &&
        [
          'SUBMITTED',
          'APPROVED',
          'RECOMMEND_REJECTION',
          'RECOMMEND_APPROVAL'
        ].indexOf(submission.status) >= 0) ||
      (user.organization.id === submission.creditTo.id &&
        ['APPROVED', 'RECOMMEND_REJECTION', 'RECOMMEND_APPROVAL'].indexOf(
          submission.status
        ) >= 0),
    initiatingSupplier:
      user.organization.id === submission.debitFrom.id &&
      ['DRAFT', 'RESCINDED'].indexOf(submission.status) >= 0,
    tradePartner:
      user.organization.id === submission.creditTo.id &&
      submission.status === 'SUBMITTED',
    governmentAnalyst:
      user.hasPermission('RECOMMEND_CREDIT_TRANSFER') &&
      user.isGovernment &&
      submission.status === 'APPROVED',
    governmentDirector:
      user.hasPermission('SIGN_CREDIT_TRANSFERS') &&
      user.isGovernment &&
      (submission.status === 'RECOMMEND_APPROVAL' ||
        submission.status === 'RECOMMEND_REJECTION')
  }

  useEffect(() => {
    if (checkboxes.length >= assertions.length) {
      setAllChecked(true)
      setComment('')
    } else {
      setAllChecked(false)
    }
  })

  const transferCommentsIDIR = submission.history
    .filter(
      (each) =>
        (each.status === 'VALIDATED' ||
          each.status === 'RESCINDED' ||
          each.status === 'APPROVED' ||
          each.status === 'REJECTED' ||
          each.status === 'RECOMMEND_REJECTION' ||
          each.status === 'RECOMMEND_APPROVAL') &&
        each.comment
    )
    .map((item) => item.comment)
  const transferCommentsSupplier = submission.history
    .filter(
      (each) =>
        (each.status === 'VALIDATED' ||
          each.status === 'RESCINDED' ||
          each.status === 'SUBMITTED' ||
          each.status === 'DISAPPROVED' ||
          each.status === 'REJECTED' ||
          each.status === 'RESCIND_PRE_APPROVAL') &&
        each.comment
    )
    .map((item) => item.comment)

  const handleCommentChange = (content) => {
    setComment(content)
  }

  const handleAddComment = () => {
    const { status } = submission
    const submissionContent = { status }
    if (comment.length > 0) {
      submissionContent.creditTransferComment = { comment }
    }
    axios
      .patch(
        ROUTES_CREDIT_TRANSFERS.DETAILS.replace(':id', id),
        submissionContent
      )
      .then(() => {
        history.push(ROUTES_CREDIT_TRANSFERS.EDIT.replace(':id', id))
        const refreshed = true
        if (refreshed) {
          history.push(ROUTES_CREDIT_TRANSFERS.DETAILS.replace(':id', id))
        }
      })
  }

  let modalProps = {}
  switch (modalType) {
    case 'initiating-submit':
      modalProps = {
        confirmLabel: ' Submit',
        handleSubmit: () => {
          handleSubmit('SUBMITTED')
        },
        buttonClass: 'button primary',
        modalText: 'Submit credit transfer notice to trade partner?',
        icon: <FontAwesomeIcon icon="paper-plane" />
      }
      break

    case 'partner-reject':
      modalProps = {
        confirmLabel: ' Reject',
        handleSubmit: () => {
          handleSubmit('DISAPPROVED', comment)
        },
        buttonClass: 'btn-outline-danger',
        modalText: 'Reject notice?'
      }
      break
    case 'partner-accept':
      modalProps = {
        confirmLabel: ' Submit',
        handleSubmit: () => {
          handleSubmit('APPROVED')
        },
        buttonClass: 'button primary',
        modalText: 'Submit transfer to government of B.C. Director?',
        icon: <FontAwesomeIcon icon="paper-plane" />
      }
      break
    case 'return':
      modalProps = {
        confirmLabel: 'Return to Analyst',
        handleSubmit: () => {
          handleSubmit('APPROVED')
        },
        buttonClass: 'btn-outline-danger',
        modalText: 'Return submission to analyst?'
      }
      break
    case 'rescind':
      modalProps = {
        confirmLabel: ' Rescind',
        handleSubmit: () => {
          handleSubmit('RESCINDED', comment)
        },
        buttonClass: 'button primary',
        modalText: 'Rescind notice?'
      }
      break
    case 'recommend-reject':
      modalProps = {
        confirmLabel: ' Recommend Rejection',
        handleSubmit: () => {
          handleSubmit('RECOMMEND_REJECTION')
        },
        buttonClass: 'btn-outline-danger',
        modalText: 'Recommend the Director reject the transfer?'
      }
      break
    case 'recommend-transfer':
      modalProps = {
        confirmLabel: ' Recommend Transfer',
        handleSubmit: () => {
          setShowModal(false)
          handleSubmit('RECOMMEND_APPROVAL')
        },
        buttonClass: 'button primary',
        modalText: 'Recommend the Director record the Transfer?'
      }
      break
    case 'director-record':
      modalProps = {
        confirmLabel: ' Record Transfer',
        handleSubmit: () => {
          setShowModal(false)
          handleSubmit('VALIDATED', comment)
        },
        buttonClass: 'button primary',
        modalText: 'Record the transfer?'
      }
      break
    case 'director-reject':
      modalProps = {
        confirmLabel: ' Reject Transfer',
        handleSubmit: () => {
          setShowModal(false)
          handleSubmit('REJECTED', comment)
        },
        buttonClass: 'btn-outline-danger',
        modalText: 'Reject the transfer?'
      }
      break
    default:
      modalProps = {
        confirmLabel: '',
        handleSubmit: () => {},
        buttonClass: '',
        modalText: ''
      }
      break
  }

  const modal = (
    <Modal
      confirmLabel={modalProps.confirmLabel}
      handleCancel={() => {
        setShowModal(false)
      }}
      handleSubmit={modalProps.handleSubmit}
      modalClass="w-75"
      showModal={showModal}
      confirmClass={modalProps.buttonClass}
    >
      <div>
        <div>
          <br />
          <br />
        </div>
        <h3 className="d-inline">{modalProps.modalText}</h3>
        <div>
          <br />
          {comment && <p>Comment: {parse(comment)}</p>}
          <br />
        </div>
      </div>
    </Modal>
  )

  const rescindComment = (
    <>
      <label htmlFor="transfer-rescind-comment">
        <h4>
          If you need to rescind this transfer notice please enter a reason to
          your transfer partner.
        </h4>
      </label>
      <textarea
        name="transfer-rescind-comment"
        className="col-sm-11"
        rows="3"
        onChange={(event) => {
          const commentValue = `<p>${event.target.value}</p>`
          setComment(commentValue)
        }}
      />
    </>
  )
  const transferValue = (
    <div className="text-blue">
      for a total value of ${' '}
      {formatNumeric(
        submission.creditTransferContent.reduce(
          (a, v) => a + v.dollarValue * v.creditValue,
          0
        ),
        2
      )}{' '}
      Canadian dollars.
    </div>
  )
  let latestRescind = false
  let latestSubmit = false
  let latestApprove = false
  let showSubmissionConfirmation = true
  let showApproveConfirmation = true
  submission.history.forEach((history) => {
    if (
      history.status === 'RESCINDED' ||
      history.status === 'RESCIND_PRE_APPROVAL'
    ) {
      latestRescind = history
    }
    if (history.status === 'SUBMITTED') {
      latestSubmit = history
    }
    if (!history.createUser.isGovernment &&
      history.status === 'APPROVED') {
      latestApprove = history
    }
  })
  if (latestRescind && latestSubmit) {
    if (latestRescind.createTimestamp > latestSubmit.createTimestamp) {
      showSubmissionConfirmation = false
      showApproveConfirmation = false
    }
    if (latestApprove) {
      if (latestSubmit.createTimestamp > latestApprove.createTimestamp) {
        showApproveConfirmation = false
      }
    }
  }
  if (!latestApprove) {
    showApproveConfirmation = false
  }

  const signedSubmittedInfo = (
    <>
      {showSubmissionConfirmation && (
        <>
          {latestSubmit && (
            <div className="text-blue mb-0" data-testid="submit-signature">
              Signed and submitted by {latestSubmit.createUser.displayName}{' '}
              {latestSubmit.createUser.organization && 
              <>of&nbsp;{latestSubmit.createUser.organization.name}&nbsp;</>
              }
              {moment(latestSubmit.createTimestamp)
                .tz('America/Vancouver')
                .format('YYYY-MM-DD hh:mm:ss z')}
            </div>
          )}
          {showApproveConfirmation && (
            <div className="text-blue mt-0" data-testid="approve-signature">
              Signed and submitted by {latestApprove.createUser.displayName}{' '}
              of&nbsp;
              {latestApprove.createUser.organization.name}&nbsp;
              {moment(latestApprove.createTimestamp)
                .tz('America/Vancouver')
                .format('YYYY-MM-DD hh:mm:ss z')}
            </div>
          )}
        </>
      )}
    </>
  )
  const idirSignoff = (
    <div>
      <label className="mt-3" htmlFor="transfer-comment">
        <h4>
          {' '}
          Comment to vehicle suppliers (mandatory to Reject, optional to Record)
        </h4>
      </label>
      <textarea
        data-testid="transfer-comment-analyst"
        name="transfer-comment"
        className="col-sm-11"
        rows="3"
        onChange={(event) => {
          const commentValue = `<p>${event.target.value}</p>`
          setComment(commentValue)
        }}
      />
    </div>
  )
  const idirCommentSection = (
    <div className="text-editor mb-2 mt-2">
      <label className="mt-3" htmlFor="transfer-comment">
        <h4>
          {transferRole.governmentAnalyst
            ? 'Comment to director:'
            : 'Add Comment to analyst if returning submission:'}
        </h4>
      </label>
      <ReactQuill
        theme="snow"
        modules={{
          toolbar: [
            ['bold', 'italic'],
            [{ list: 'bullet' }, { list: 'ordered' }]
          ],
          keyboard: {
            bindings: { tab: false }
          }
        }}
        formats={['bold', 'italic', 'list', 'bullet']}
        onChange={handleCommentChange}
      />
      <button
        className="button mt-2"
        onClick={() => {
          handleAddComment()
        }}
        type="button"
      >
        Add Comment
      </button>
    </div>
  )
  const tradePartnerSignoff = (
    <div>
      <h4>
        If you agree to this notice of transfer please confirm the following
        statements and click Submit Notice to send to the Government of B.C.
        Director for the transfer to be recorded.
      </h4>
      <CreditTransferSignoff
        assertions={assertions}
        checkboxes={checkboxes}
        disableCheckboxes={
          !user.hasPermission('SUBMIT_CREDIT_TRANSFER_PROPOSAL')
        }
        handleCheckboxClick={handleCheckboxClick}
        user={user}
        hoverText={
          user.hasPermission('SUBMIT_CREDIT_TRANSFER_PROPOSAL')
            ? ''
            : 'You do not have permission to check the boxes.'
        }
      />
      <label htmlFor="transfer-comment">
        <h4>
          If you don&apos;t agree to this transfer enter a comment below to
          &nbsp;{submission.debitFrom.name} and click Reject Notice
        </h4>
      </label>
      <textarea
        data-testid="transfer-comment"
        name="transfer-comment"
        className="col-sm-11"
        rows="3"
        onChange={(event) => {
          const commentValue = `<p>${event.target.value}</p>`
          setComment(commentValue)
        }}
        disabled={allChecked}
      />
    </div>
  )
  return (
    <div id="credit-transfers-details" className="page">
      {modal}
      <div className="row mt-3 mb-2">
        <div className="col-sm-12">
          <h2>Light Duty Vehicle Credit Transfer</h2>
        </div>
      </div>
      {transferRole.governmentDirector && errorMessage.length > 0 && (
        <Alert
          title="Error"
          classname="alert-danger"
          message={`${submission.debitFrom.name} has insufficient credits to fulfil this transfer.`}
        />
      )}
      {transferRole.governmentAnalyst && !sufficientCredit && (
        <Alert
          title="Error"
          classname="alert-danger"
          message={`${submission.debitFrom.name} has insufficient credits to fulfil ${submission.pending} pending transfer(s).`}
        />
      )}
      {submission.status && (
        <CreditTransfersAlert
          user={user}
          errorMessage={errorMessage}
          submission={submission}
        />
      )}
      {(transferCommentsIDIR.length > 0 ||
        transferCommentsSupplier.length > 0 ||
        user.isGovernment) && (
        <div className="comment-box mt-2">
          {transferCommentsIDIR.length > 0 && user.isGovernment && (
            <EditableCommentList 
              comments={transferCommentsIDIR} 
              user={user}
              handleCommentEdit={handleInternalCommentEdit}
              handleCommentDelete={handleInternalCommentDelete}
              enableEditing={submission.status !== 'VALIDATED' && submission.status !== 'REJECTED'}
            />
          )}
          {transferCommentsSupplier.length > 0 && !user.isGovernment && (
            <DisplayComment commentArray={transferCommentsSupplier} />
          )}
          {(transferRole.governmentAnalyst ||
            transferRole.governmentDirector) &&
            idirCommentSection}
        </div>
      )}

      {transferRole.governmentAnalyst && Object.keys(orgBalances).length !== 0 && (
        <CreditTransfersDetailsSupplierTable
          submission={submission}
          orgBalances={orgBalances}
          tableType="supplierBalance"
        />
      )}
      <div className="row">
        <div className="col-sm-11 mt-2">
          <div className="form p-2">
            {submission.debitFrom && (
              <div className="my-2 px-2 pb-2">
                <CreditTransfersDetailsTable
                  submission={submission}
                  tableType="submissionSummary"
                />
                {transferValue}
                <div className="mb-3">{signedSubmittedInfo}</div>
                {transferRole.tradePartner && tradePartnerSignoff}
                {transferRole.rescindable && <>{rescindComment}</>}
                {transferRole.governmentDirector && idirSignoff}
                <CreditTransfersDetailsActionBar
                  allChecked={allChecked}
                  assertions={assertions}
                  checkboxes={checkboxes}
                  comment={comment}
                  existingComments={transferCommentsIDIR}
                  transferRole={transferRole}
                  setModalType={setModalType}
                  setShowModal={setShowModal}
                  user={user}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

CreditTransfersDetailsPage.defaultProps = {
  errorMessage: ''
}

CreditTransfersDetailsPage.propTypes = {
  assertions: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  checkboxes: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ).isRequired,
  handleCheckboxClick: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  handleInternalCommentEdit: PropTypes.func.isRequired,
  handleInternalCommentDelete: PropTypes.func.isRequired,
  sufficientCredit: PropTypes.bool.isRequired,
  user: CustomPropTypes.user.isRequired,
  submission: PropTypes.shape().isRequired,
  errorMessage: PropTypes.arrayOf(PropTypes.string),
  orgBalances: PropTypes.shape().isRequired
}

export default CreditTransfersDetailsPage
