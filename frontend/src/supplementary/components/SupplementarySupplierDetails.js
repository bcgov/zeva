import axios from 'axios'
import React, { useState } from 'react'
import PropTypes from 'prop-types'

import parse from 'html-react-parser'
import Loading from '../../app/components/Loading'
import Modal from '../../app/components/Modal'
import Button from '../../app/components/Button'
import ZevSales from './ZevSales'
import SupplierInformation from './SupplierInformation'
import CreditActivity from './CreditActivity'
import UploadEvidence from './UploadEvidence'
import CommentInput from '../../app/components/CommentInput'
import ROUTES_COMPLIANCE from '../../app/routes/Compliance'
import ROUTES_SUPPLEMENTARY from '../../app/routes/SupplementaryReport'
import formatNumeric from '../../app/utilities/formatNumeric'
import CustomPropTypes from '../../app/utilities/props'
import ComplianceHistory from '../../compliance/components/ComplianceHistory'
import CONFIG from '../../app/config'
import SupplementaryTab from './SupplementaryTab'
import ReactTooltip from 'react-tooltip'
import ReassessmentDetailsPage from './ReassessmentDetailsPage'
import CreateReassessmentHeader from '../../compliance/components/CreateReassessmentHeader'

const SupplementarySupplierDetails = (props) => {
  const {
    addSalesRow,
    checkboxConfirmed,
    commentArray,
    deleteFiles,
    details,
    files,
    handleCheckboxClick,
    handleCommentChange,
    handleInputChange,
    handleSubmit,
    handleSupplementalChange,
    id,
    ldvSales,
    loading,
    newBalances,
    newData,
    obligationDetails,
    ratios,
    salesRows,
    setDeleteFiles,
    setUploadFiles,
    supplementaryAssessmentData,
    user,
    query,
    isReassessment,
    reassessmentStatus,
    supplementaryReportId,
    reassessmentReportId,
    supplementaryReportIsReassessment
  } = props

  if (loading) {
    return <Loading />
  }
  // if user is bceid then only draft is editable
  // if user is idir then draft or submitted is editable
  const [showModal, setShowModal] = useState(false)
  const [showModalDelete, setShowModalDelete] = useState(false)

  const reportYear = details.assessmentData && details.assessmentData.modelYear

  const supplierClass =
    details.assessmentData && details.assessmentData.supplierClass[0]

  const creditReductionSelection =
    details.assessmentData && details.assessmentData.creditReductionSelection

  const currentStatus = details.actualStatus
    ? details.actualStatus
    : details.status

  const isAssessed = currentStatus === 'ASSESSED' ||
    currentStatus === 'REASSESSED'

  const tabNames = ['supplemental', 'recommendation', 'reassessment']
  const selectedTab = query?.tab ? query.tab : isAssessed ? tabNames[2] : tabNames[0]
  const isEditable = ['DRAFT', 'RETURNED'].indexOf(currentStatus) >= 0

  const formattedPenalty = details.assessment
    ? formatNumeric(details.assessment.assessmentPenalty, 0)
    : 0

  const assessmentDecision =
    supplementaryAssessmentData.supplementaryAssessment.decision &&
    supplementaryAssessmentData.supplementaryAssessment.decision.description
      ? supplementaryAssessmentData.supplementaryAssessment.decision.description
        .replace(
          /{user.organization.name}/g,
          details.assessmentData.legalName
        )
        .replace(/{modelYear}/g, details.assessmentData.modelYear)
        .replace(/{penalty}/g, `$${formattedPenalty} CAD`)
      : ''

  const modal = (
    <Modal
      cancelLabel="No"
      confirmLabel="Yes"
      handleCancel={() => {
        setShowModal(false)
      }}
      handleSubmit={() => {
        setShowModal(false)
        handleSubmit('RECOMMENDED', false)
      }}
      modalClass="w-75"
      showModal={showModal}
      confirmClass="button primary"
    >
      <div className="my-3">
        <h3>
          {isReassessment
            ? 'Are you sure you want to recommend this?'
            : 'This will create a reassessment report from the supplementary report'}
        </h3>
      </div>
    </Modal>
  )

  const modalDelete = (
    <Modal
      cancelLabel="No"
      confirmLabel="Yes"
      handleCancel={() => {
        setShowModalDelete(false)
      }}
      handleSubmit={() => {
        setShowModalDelete(false)
        handleSubmit('DELETED')
      }}
      modalClass="w-75"
      showModal={showModalDelete}
      confirmClass="button primary"
    >
      <div className="my-3">
        <h3>Are you sure you want to delete this?</h3>
      </div>
    </Modal>
  )

  const tabUrl = (supplementalId, tabName) => {
    return ROUTES_SUPPLEMENTARY.SUPPLEMENTARY_DETAILS.replace(':id', id)
      .replace(':supplementaryId', supplementalId) +
        `?tab=${tabName}${isReassessment ? '&reassessment=Y' : ''}`
  }

  const renderTabs = () => {
    return (

      <ul
        className="nav nav-pills nav-justified supplementary-report-tabs"
        key="tabs"
        role="tablist"
      >
        <ReactTooltip/>
        {supplementaryReportId && (<SupplementaryTab
          selected={selectedTab === tabNames[0]}
          title={'Supplementary Report'}
          url={tabUrl(supplementaryReportId, tabNames[0])}
          disabled={supplementaryReportId === null}
          tooltip={'No supplementary report found. Analyst initiated reassessment.'}
          status={reassessmentStatus}
          assessed={isAssessed}
        />)}
        <SupplementaryTab
          selected={selectedTab === tabNames[2]}
          title={'Reassessment'}
          url={tabUrl(reassessmentReportId, tabNames[2])}
          disabled={!isAssessed}
          tooltip={null}
          status={reassessmentStatus}
          assessed={isAssessed}
        />
      </ul>
    )
  }

  return (
    <div id="supplementary" className="page">
        <CreateReassessmentHeader 
          user={user}
          id={id}
        />
        <ComplianceHistory
          activePage="supplementary"
          id={id}
          isReassessment={isReassessment}
          reportYear={reportYear}
          supplementaryId={
            isReassessment &&
            supplementaryReportId &&
            !supplementaryReportIsReassessment
              ? supplementaryReportId
              : details.id
          }
          user={user}
        />

      {renderTabs()}

      <div className="supplementary-form mt-2">
        <div>
          {isReassessment &&
            (currentStatus === 'ASSESSED' || (isReassessment &&
            selectedTab === tabNames[2]))
            ? (
            <ReassessmentDetailsPage
              details={details}
              ldvSales={ldvSales}
              newBalances={newBalances}
              newData={newData}
              obligationDetails={obligationDetails}
              ratios={ratios}
              user={user}
            />
              )
            : (
            <>
          <SupplierInformation
            isEditable={isEditable && currentStatus !== 'RECOMMENDED'}
            user={user}
            details={details}
            handleInputChange={handleInputChange}
            loading={loading}
            newData={newData}
          />
          <ZevSales
            addSalesRow={addSalesRow}
            details={details}
            handleInputChange={handleInputChange}
            salesRows={salesRows}
            isEditable={isEditable && currentStatus !== 'RECOMMENDED'}
          />
          <CreditActivity
            creditReductionSelection={creditReductionSelection}
            details={details}
            handleInputChange={handleInputChange}
            handleSupplementalChange={handleSupplementalChange}
            ldvSales={ldvSales}
            newBalances={newBalances}
            newData={newData}
            obligationDetails={obligationDetails}
            ratios={ratios}
            supplierClass={supplierClass}
            isEditable={isEditable && currentStatus !== 'RECOMMENDED'}
          />
          </>
              )}
        </div>
        <div id="comment-input">
          {currentStatus === 'DRAFT' &&
            <CommentInput
              defaultComment={
                details &&
                details.fromSupplierComments &&
                details.fromSupplierComments.length > 0
                  ? details.fromSupplierComments[0]
                  : {}
              }
              handleCommentChange={handleCommentChange}
              title="Provide details in the comment box below for any changes above."
            />
          }
        </div>
        {currentStatus === 'DRAFT' &&
          <UploadEvidence
            details={details}
            deleteFiles={deleteFiles}
            files={files}
            setDeleteFiles={setDeleteFiles}
            setUploadFiles={setUploadFiles}
          />
        }
        {details &&
          details.status === 'SUBMITTED' &&
          ((details.fromSupplierComments &&
            details.fromSupplierComments.length > 0) ||
            (details.attachments && details.attachments.length > 0)) && (
            <div className="display-supplier-info grey-border-area mt-3">
              {details &&
                details.fromSupplierComments &&
                details.fromSupplierComments.length > 0 && (
                  <div className="supplier-comment">
                    <h4>Supplier Comments</h4>
                    <span className="text-blue">
                      {parse(details.fromSupplierComments[0].comment)}
                    </span>
                  </div>
              )}
              {details &&
                details.attachments &&
                details.attachments.length > 0 && (
                  <div className="supplier-attachment mt-2">
                    <h4>Attachments</h4>
                    {details.attachments
                      .filter(
                        (attachment) => deleteFiles.indexOf(attachment.id) < 0
                      )
                      .map((attachment) => (
                        <div className="row" key={attachment.id}>
                          <div className="col-8 filename">
                            <button
                              className="link"
                              onClick={() => {
                                axios
                                  .get(attachment.url, {
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
                                      attachment.filename
                                    )
                                    document.body.appendChild(link)
                                    link.click()
                                  })
                              }}
                              type="button"
                            >
                              {attachment.filename}
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
              )}
            </div>
        )}
      </div>
      {supplementaryAssessmentData.supplementaryAssessment?.decision?.description &&
        <>
          <h3 className="mt-4 mb-1">Director Reassessment</h3>
          <div className="row mb-3">
            <div className="col-12">
              <div className="grey-border-area comment-box p-3 mt-2">
                <div className="text-blue">
                  <div>
                    The Director has assessed that {assessmentDecision}
                  </div>
                  {commentArray.bceidComment &&
                    commentArray.bceidComment.comment && (
                      <div className="mt-2">
                        {parse(commentArray.bceidComment.comment)}
                      </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      }
      {user.hasPermission('SUBMIT_COMPLIANCE_REPORT') &&
        isEditable &&
          <div className="mt-3">
            <input
              defaultChecked={checkboxConfirmed}
              className="mr-2"
              id="supplier-confirm-checkbox"
              data-testid="supplier-confirm-checkbox"
              name="confirmations"
              onChange={(event) => {
                handleCheckboxClick(event)
              }}
              type="checkbox"
            />
            <label htmlFor="supplier-confirm-checkbox">
              On behalf of {details.assessmentData.legalName} I confirm the
              information included in the this Supplementary Report is complete
              and correct.
            </label>
          </div>
      }
      <div className="row d-print-none">
        <div className="col-12">
          <div className="action-bar">
            <span className="left-content">
              <Button
                buttonType="back"
                locationRoute={ROUTES_COMPLIANCE.REPORT_ASSESSMENT.replace(
                  /:id/g,
                  id
                )}
              />
              {CONFIG.FEATURES.SUPPLEMENTAL_REPORT.ENABLED &&
                isEditable && (
                  <Button
                    buttonType="delete"
                    action={() => setShowModalDelete(true)}
                    disabled={false}
                    buttonTooltip={'Delete is disabled until draft is saved.'}
                    optionalText={
                      details &&
                      details.reassessment &&
                      details.reassessment.isReassessment
                        ? 'Delete Reassessment'
                        : 'Delete'
                    }
                  />
              )}
            </span>
            <span className="right-content">
              {CONFIG.FEATURES.SUPPLEMENTAL_REPORT.ENABLED &&
                isEditable &&
                  <Button
                    buttonType="save"
                    action={() => {
                      handleSubmit('DRAFT', false)
                    }}
                  />
              }
              {CONFIG.FEATURES.SUPPLEMENTAL_REPORT.ENABLED &&
                isEditable && user.hasPermission('SUBMIT_COMPLIANCE_REPORT') &&
                  <Button
                    disabled={!checkboxConfirmed}
                    buttonType="submit"
                    action={() => handleSubmit('SUBMITTED')}
                  />
              }
            </span>
          </div>
        </div>
      </div>
      {modal}
      {/* {modalDraft} */}
      {modalDelete}
    </div>
  )
}

SupplementarySupplierDetails.defaultProps = {
  isReassessment: undefined,
  ldvSales: undefined,
  obligationDetails: [],
  query: {},
  ratios: {}
}

SupplementarySupplierDetails.propTypes = {
  addSalesRow: PropTypes.func.isRequired,
  checkboxConfirmed: PropTypes.bool.isRequired,
  commentArray: PropTypes.shape().isRequired,
  deleteFiles: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  details: PropTypes.shape().isRequired,
  files: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  handleCheckboxClick: PropTypes.func.isRequired,
  handleCommentChange: PropTypes.func.isRequired,
  handleCommentChangeBceid: PropTypes.func.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  handleSupplementalChange: PropTypes.func.isRequired,
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  isReassessment: PropTypes.bool,
  ldvSales: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  loading: PropTypes.bool.isRequired,
  newBalances: PropTypes.shape().isRequired,
  newData: PropTypes.shape().isRequired,
  obligationDetails: PropTypes.arrayOf(PropTypes.shape()),
  query: PropTypes.shape(),
  ratios: PropTypes.shape(),
  salesRows: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  setDeleteFiles: PropTypes.func.isRequired,
  setSupplementaryAssessmentData: PropTypes.func.isRequired,
  setUploadFiles: PropTypes.func.isRequired,
  supplementaryAssessmentData: PropTypes.shape().isRequired,
  user: CustomPropTypes.user.isRequired
}

export default SupplementarySupplierDetails
