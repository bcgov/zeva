import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useParams } from 'react-router-dom'
import parse from 'html-react-parser'
import ReactQuill from 'react-quill'
import axios from 'axios'
import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import moment from 'moment-timezone'
import 'react-quill/dist/quill.snow.css'

import CreditRequestAlert from './CreditRequestAlert'
import Button from '../../app/components/Button'
import Modal from '../../app/components/Modal'
import history from '../../app/History'
import ROUTES_CREDIT_REQUESTS from '../../app/routes/CreditRequests'
import download from '../../app/utilities/download'
import CustomPropTypes from '../../app/utilities/props'
import ModelListTable from './ModelListTable'
import CreditRequestSummaryTable from './CreditRequestSummaryTable'
import getFileSize from '../../app/utilities/getFileSize'
import DisplayComment from '../../app/components/DisplayComment'
import formatNumeric from '../../app/utilities/formatNumeric'
import DownloadAllSubmissionContentButton from './DownloadAllSubmissionContentButton'
import EditableCommentList from '../../app/components/EditableCommentList'
import ModelYearReportWarning from './ModelYearReportWarning'
import ROUTES_COMPLIANCE from '../../app/routes/Compliance'

const CreditRequestDetailsPage = (props) => {
  const {
    handleSubmit,
    locationState,
    submission,
    user,
    issueAsMY,
    handleCheckboxClick,
    handleInternalCommentEdit,
    handleInternalCommentDelete,
    showWarning,
    setShowWarning,
    setDisplayUploadPage
  } = props

  const { id } = useParams()
  const validatedOnly = submission.validationStatus === 'CHECKED'
  const submittedOnly = submission.validationStatus === 'SUBMITTED'
  const submittedOnlyTooltip =
    'You must verify once with ICBC data before reviewing details.'
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('')
  const [comment, setComment] = useState('')
  const [reports, setReports] = useState([])

  const fetchReports = () => {
    axios.get(`${ROUTES_COMPLIANCE.REPORTS}?organization_id=${submission.organization.id}`)
    .then(response => {
      setReports(response.data)

      if(response.data.some(report => ['SUBMITTED', 'RETURNED', 'RECOMMENDED'].includes(report.validationStatus))){
        setShowWarning(true)
      }
    })
  }

  useEffect(() => {
    fetchReports()
  }, [])

  const conflictingReport = () => {
    return reports.find(report => 
      ['SUBMITTED', 'RETURNED', 'RECOMMENDED'].includes(report.validationStatus)
    );
  }
  

  const serviceAddress = submission.organization.organizationAddress.find(
    (address) => address.addressType.addressType === 'Service'
  )
  const recordsAddress = submission.organization.organizationAddress.find(
    (address) => address.addressType.addressType === 'Records'
  )

  const downloadErrors = (e) => {
    const element = e.currentTarget
    const original = element.innerHTML

    element.innerText = 'Downloading...'
    element.disabled = true

    return download(
      ROUTES_CREDIT_REQUESTS.DOWNLOAD_ERRORS.replace(':id', submission.id),
      {}
    ).then(() => {
      element.innerHTML = original
      element.disabled = false
    })
  }

  let modalProps = {}

  const submissionCommentsIdirOnly =
    submission &&
    submission.salesSubmissionComment &&
    submission.salesSubmissionComment
      .filter((each) => each.toGovt === true && each.comment)
      .map((item) => item)

  const submissionCommentsToSupplier =
    submission &&
    submission.salesSubmissionComment &&
    submission.salesSubmissionComment
      .filter((each) => each.toGovt === false && each.comment)
      .map((item) => item)
  const handleCommentChange = (content) => {
    setComment(content)
  }
  const analystToSupplier = (
    <div>
      <label className="mt-3" htmlFor="reject-comment">
        <h4> Comment to vehicle suppliers (mandatory to Reject)</h4>
      </label>
      <textarea
        data-testid="reject-comment-analyst"
        name="reject-comment"
        className="col-sm-11"
        rows="3"
        onChange={(event) => {
          const commentValue = `<p>${event.target.value}</p>`
          setComment(commentValue)
        }}
      />
    </div>
  )

  const handleAddComment = () => {
    const submissionContent = {}
    if (comment.length > 0) {
      submissionContent.salesSubmissionComment = { comment }
      submissionContent.commentType = { govt: true }
    }
    axios
      .patch(
        ROUTES_CREDIT_REQUESTS.DETAILS.replace(':id', id),
        submissionContent
      )
      .then(() => {
        history.push(ROUTES_CREDIT_REQUESTS.EDIT.replace(':id', id))
        const refreshed = true
        if (refreshed) {
          history.push(ROUTES_CREDIT_REQUESTS.DETAILS.replace(':id', id))
        }
      })
  }

  const verifyWithICBCData = () => {
    let url = ROUTES_CREDIT_REQUESTS.VALIDATE.replace(/:id/g, submission.id)
    url = url + '?reset=Y' + ((showWarning && issueAsMY) ? "&include71Errors=Y" : "")
    history.push(url)
  }

  switch (modalType) {
    case 'submit':
      modalProps = {
        confirmLabel: ' Submit',
        handleSubmit: () => {
          handleSubmit('SUBMITTED')
        },
        buttonClass: 'button primary',
        modalText: 'Submit credit request to Government of B.C.?',
        icon: <FontAwesomeIcon icon="paper-plane" />
      }
      break
    case 'delete':
      modalProps = {
        confirmLabel: ' Delete',
        handleSubmit: () => {
          handleSubmit('DELETED')
        },
        buttonClass: 'btn-outline-danger',
        modalText: 'Delete submission? WARNING: this action cannot be undone',
        icon: <FontAwesomeIcon icon="trash" />
      }
      break
    case 'approve':
      modalProps = {
        confirmLabel: 'Recommend Issuance',
        handleSubmit: () => {
          handleSubmit('RECOMMEND_APPROVAL')
        },
        buttonClass: 'button primary',
        modalText: 'Recommend issuance of credits?',
      }
      break
    case 'return':
      modalProps = {
        confirmLabel: 'Return to Analyst',
        handleSubmit: () => {
          handleSubmit('CHECKED')
        },
        buttonClass: 'btn-outline-danger',
        modalText: 'Return submission to analyst?'
      }
      break
    case 'analyst-reject':
      modalProps = {
        confirmLabel: 'Reject Application',
        handleSubmit: () => {
          handleSubmit('REJECTED', comment)
        },
        buttonClass: 'btn-outline-danger',
        modalText: 'Reject the application?'
      }
      break
    case 'verify':
      modalProps = {
        confirmLabel: 'Verify with ICBC Data',
        handleSubmit: () => {
          verifyWithICBCData()
        },
        buttonClass: 'button primary',
        modalText: (
          <div>
            <h2 className="mb-2">Verify submission with ICBC Data?</h2>
            <p>
              This will clear all existing validation and re-calculate with the
              latest uploaded ICBC data.
            </p>
          </div>
        )
      }
      break
    default:
      modalProps = {
        confirmLabel: 'Issue Credits',
        buttonClass: 'button primary',
        modalText: 'Issue credits to vehicle supplier?',
        handleSubmit: () => {
          handleSubmit('VALIDATED', '')
        }
      }
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
  const directorAction =
    user.isGovernment &&
    ['RECOMMEND_APPROVAL', 'RECOMMEND_REJECTION'].indexOf(
      submission.validationStatus
    ) >= 0 &&
    user.hasPermission('SIGN_SALES')

  const analystAction =
    user.isGovernment &&
    ['CHECKED', 'SUBMITTED'].indexOf(submission.validationStatus) >= 0 &&
    user.hasPermission('RECOMMEND_SALES')

  const idirCommentSection = (
    <div className="text-editor mb-2 mt-2">
      <label className="mt-3" htmlFor="application-comment">
        <h4>
          {analystAction
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

  let totalEligibleCredits = 0

  submission.content.forEach((item) => {
    const { vehicle } = item

    if (submission.eligible) {
      const eligibleSales = submission.eligible.find(
        (eligible) => eligible.vehicleId === vehicle.id
      )

      if (
        eligibleSales &&
        vehicle &&
        vehicle.creditValue &&
        vehicle.creditValue !== 0
      ) {
        totalEligibleCredits += parseFloat(
          eligibleSales.vinCount * (Math.round((vehicle.creditValue + Number.EPSILON) * 100) / 100)
        )
      }
    }
  })

  const invalidSubmission = submission.content.some(
    (row) => !row.vehicle || !row.vehicle.id || row.vehicle.modelName === ''
  )

  return (
    <div id="credit-request-details" className="page">
      {modal}
      <div className="row mt-3 mb-2">
        <div className="col-sm-12">
          <h2>Application for Credits for Consumer Sales</h2>
        </div>
      </div>
      {analystAction && submission.icbcCurrentTo && (
        <div className="row my-1">
          <div className="col-sm-12">
            ICBC data current to:{' '}
            {moment(submission.icbcCurrentTo).format('MMM D, YYYY')}
          </div>
        </div>
      )}
      {submission && submission.history.length > 0 && (
        <div className="row mb-1">
          <div className="col-sm-12">
            <div className="m-0">
              <CreditRequestAlert
                isGovernment={user.isGovernment}
                submission={submission}
                date={moment(submission.updateTimestamp).format('MMM D, YYYY')}
                icbcDate={
                  submission.icbcCurrentTo
                    ? moment(submission.icbcCurrentTo).format('MMM D, YYYY')
                    : ''
                }
                invalidSubmission={invalidSubmission}
              />

              {((submissionCommentsIdirOnly &&
                submissionCommentsIdirOnly.length > 0) ||
                (submissionCommentsToSupplier &&
                  submissionCommentsToSupplier.length > 0) ||
                user.isGovernment) && (
                <div className="comment-box mt-2">
                  {submissionCommentsIdirOnly &&
                    submissionCommentsIdirOnly.length > 0 &&
                    user.isGovernment && (
                      <>
                        <b>Internal Comments</b>
                        <EditableCommentList
                          comments={submissionCommentsIdirOnly}
                          user={user}
                          handleCommentEdit={handleInternalCommentEdit}
                          handleCommentDelete={handleInternalCommentDelete}
                        />
                      </>
                  )}
                  {submissionCommentsToSupplier &&
                    submissionCommentsToSupplier.length > 0 && (
                      <>
                        <b>Comments to Supplier</b>
                        <DisplayComment
                          commentArray={submissionCommentsToSupplier}
                        />
                      </>
                  )}
                  {((analystAction && validatedOnly) || directorAction) &&
                    idirCommentSection}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!user.isGovernment && (
        <div className="row mb-1">
          <div className="col-sm-12">
            <div className="my-2 px-2 pb-2 address-summary-table">
              <h3 className="mt-2">
                {submission.organization && `${submission.organization.name} `}
              </h3>
              <div>
                <h4 className="d-inline-block sales-upload-grey my-2">
                  Service address:{' '}
                </h4>
                {serviceAddress && (
                  <h4 className="d-inline-block sales-upload-blue">
                    {serviceAddress.addressLine1} {serviceAddress.addressLine2}{' '}
                    {serviceAddress.city} {serviceAddress.state}{' '}
                    {serviceAddress.postalCode}
                  </h4>
                )}
                <br />
                <h4 className="d-inline-block sales-upload-grey mb-3">
                  Records address:{' '}
                </h4>
                {recordsAddress && (
                  <h4 className="d-inline-block sales-upload-blue">
                    {recordsAddress.addressLine1} {recordsAddress.addressLine2}{' '}
                    {recordsAddress.city} {recordsAddress.state}{' '}
                    {recordsAddress.postalCode}
                  </h4>
                )}
              </div>

              <CreditRequestSummaryTable
                submission={submission}
                user={user}
                validationStatus={submission.validationStatus}
              />
              {submission.evidence.length > 0 && (
                <div className="mt-4">
                  <h3 className="mt-3">Sales Evidence</h3>
                  <div id="sales-edit" className="mt-2 col-8 pl-0">
                    <div className="files px-3">
                      <div className="row pb-1">
                        <div className="col-9 header">
                          <h4>Filename</h4>
                        </div>
                        <div className="col-3 size header">
                          <h4>Size</h4>
                        </div>
                        <div className="col-1 actions header" />
                      </div>
                      {submission.evidence.map((file) => (
                        <div className="row py-1" key={file.id}>
                          <div className="col-9 filename pl-1">
                            <button
                              className="link"
                              onClick={() => {
                                axios
                                  .get(file.url, {
                                    responseType: 'blob',
                                    headers: {
                                      Authorization: null
                                    }
                                  })
                                  .then((response) => {
                                    const objectURL =
                                      window.URL.createObjectURL(
                                        new Blob([response.data])
                                      )
                                    const link = document.createElement('a')
                                    link.href = objectURL
                                    link.setAttribute(
                                      'download',
                                      file.filename
                                    )
                                    document.body.appendChild(link)
                                    link.click()
                                  })
                              }}
                              type="button"
                            >
                              {file.filename}
                            </button>
                          </div>
                          <div className="col-3 size">
                            {getFileSize(file.size)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {user.isGovernment && showWarning && reports.length > 0  && (
        <ModelYearReportWarning
          conflictingReport={conflictingReport()}
          submission={submission}
          user={user}
          handleCheckboxClick={handleCheckboxClick}
          issueAsMY={issueAsMY}
        />
      )}
                              
      <div className="row mb-2">
        <div className="col-sm-12">
          <ModelListTable
            submission={submission}
            user={user}
            handleCheckboxClick={handleCheckboxClick}
            issueAsMY={issueAsMY}
            setDisplayUploadPage={setDisplayUploadPage}
          />
        </div>
      </div>

      {[
        'CHECKED',
        'RECOMMEND_APPROVAL',
        'RECOMMEND_REJECTION',
        'VALIDATED'
      ].indexOf(submission.validationStatus) >= 0 &&
        user.isGovernment && (
          <div className="row my-4">
            <div className="col-sm-12">
              It is recommended that the Director issue a total of{' '}
              {formatNumeric(totalEligibleCredits, 2)} ZEV credits to{' '}
              {submission.organization.name} based on{' '}
              {formatNumeric(submission?.eligible?.map(e => e.vinCount).reduce((a, b) => a + b, 0))}{' '}
              eligible ZEV sales.
            </div>
          </div>
      )}
      {analystAction && analystToSupplier}

      <div className="row">
        <div className="col-sm-12">
          <div className="action-bar mt-1">
            <span className="left-content">
              <Button
                buttonType="back"
                locationRoute={
                  locationState && locationState.href
                    ? locationState.href
                    : ROUTES_CREDIT_REQUESTS.LIST
                }
                locationState={locationState}
              />
              {analystAction && (
                <Button
                  disabled={comment.length === 0}
                  testid="analyst-reject-application"
                  buttonType="reject"
                  optionalText="Reject Application"
                  action={() => {
                    setModalType('analyst-reject')
                    setShowModal(true)
                  }}
                />
              )}
              {(submission.validationStatus === 'DRAFT' ||
                submission.validationStatus === 'REJECTED') &&
                typeof user.hasPermission === 'function' &&
                user.hasPermission('EDIT_SALES') && (
                  <Button
                    buttonType="delete"
                    action={() => {
                      setModalType('delete')
                      setShowModal(true)
                    }}
                  />
              )}
              {directorAction && (
                <button
                  className="button text-danger"
                  onClick={() => {
                    setModalType('return')
                    setShowModal(true)
                  }}
                  type="button"
                >
                  Return to Analyst
                </button>
              )}
            </span>
            <span className="right-content">
              {analystAction && (
                <>
                  <button
                    className="button"
                    onClick={() => {
                      if (submittedOnly) {
                        verifyWithICBCData()
                      } else {
                        setModalType('verify')
                        setShowModal(true)
                      }
                    }}
                    type="button"
                  >
                    Verify with ICBC Data
                  </button>
                  <Button
                    optionalClassname={
                      validatedOnly ? 'button' : 'button primary'
                    }
                    buttonType="button"
                    optionalText="Review Details"
                    disabled={submittedOnly}
                    buttonTooltip={submittedOnlyTooltip}
                    action={(e) => {
                      const url = ROUTES_CREDIT_REQUESTS.VALIDATE.replace(
                        /:id/g,
                        submission.id
                      )
                      history.push(url)
                    }}
                  />
                  {validatedOnly && (
                    <button
                      className={validatedOnly ? 'button primary' : 'button'}
                      key="recommend-approval"
                      onClick={() => {
                        setModalType('approve')
                        setShowModal(true)
                      }}
                      type="button"
                      disabled={!issueAsMY}
                    >
                      Recommend Issuance
                    </button>
                  )}
                </>
              )}
              {directorAction && (
                <button
                  className="button primary"
                  disabled={comment.length > 0}
                  onClick={() => {
                    setModalType('issue')
                    setShowModal(true)
                  }}
                  type="button"
                >
                  Issue Credits
                </button>
              )}
              {user.isGovernment &&
                submission.validationStatus === 'VALIDATED' && (
                  <DownloadAllSubmissionContentButton submission={submission} />
              )}
              {!user.isGovernment && (
                <>
                  {submission.validationStatus === 'VALIDATED' && (
                    <Button
                      buttonType="download"
                      optionalText="Download Errors"
                      optionalClassname="button primary"
                      action={(e) => {
                        downloadErrors(e)
                      }}
                      disabled={submission.unselected === 0}
                    />
                  )}
                  {submission.validationStatus === 'DRAFT' &&
                    typeof user.hasPermission === 'function' &&
                    user.hasPermission('EDIT_SALES') && (
                      <button
                        className="button"
                        key="edit"
                        onClick={() => {
                          const url = ROUTES_CREDIT_REQUESTS.EDIT.replace(
                            /:id/g,
                            submission.id
                          )
                          history.push(url)
                        }}
                        type="button"
                      >
                        <FontAwesomeIcon icon="upload" /> Re-upload files
                      </button>
                  )}
                  {submission.validationStatus === 'DRAFT' &&
                    typeof user.hasPermission === 'function' &&
                    user.hasPermission('SUBMIT_SALES') && (
                      <Button
                        buttonType="submit"
                        action={() => {
                          setModalType('submit')
                          setShowModal(true)
                        }}
                        disabled={invalidSubmission}
                        key="submit"
                      />
                  )}
                </>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

CreditRequestDetailsPage.defaultProps = {
  locationState: undefined
}

CreditRequestDetailsPage.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  locationState: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.shape()),
    PropTypes.shape()
  ]),
  submission: PropTypes.shape().isRequired,
  uploadDate: PropTypes.shape({
    uploadDate: PropTypes.string,
    updateTimestamp: PropTypes.string
  }).isRequired,
  user: CustomPropTypes.user.isRequired,
  handleCheckboxClick: PropTypes.func.isRequired,
  issueAsMY: PropTypes.bool.isRequired,
  showWarning: PropTypes.bool.isRequired,
  setShowWarning: PropTypes.func.isRequired
}

export default CreditRequestDetailsPage
