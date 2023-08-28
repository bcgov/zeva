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
import EditableCommentList from '../../app/components/EditableCommentList'
import UploadEvidence from './UploadEvidence'
import CreateReassessmentHeader from '../../compliance/components/CreateReassessmentHeader'

const SupplementaryAnalystDetails = (props) => {
  const {
    addSalesRow,
    commentArray,
    deleteFiles,
    details,
    files,
    handleAddIdirComment,
    handleCommentChangeBceid,
    handleCommentChangeIdir,
    handleDeleteIdirComment,
    handleEditIdirComment,
    handleInputChange,
    handleSubmit,
    handleSupplementalChange,
    id,
    ldvSales,
    loading,
    newBalances,
    newData,
    obligationDetails,
    radioDescriptions,
    ratios,
    salesRows,
    setDeleteFiles,
    setSupplementaryAssessmentData,
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
  const [showModalDraft, setShowModalDraft] = useState(false)
  const [showModalDelete, setShowModalDelete] = useState(false)
  const reportYear = details.assessmentData && details.assessmentData.modelYear

  const supplierClass =
    details.assessmentData && details.assessmentData.supplierClass[0]

  const creditReductionSelection =
    details.assessmentData && details.assessmentData.creditReductionSelection

  const currentStatus = details.actualStatus
    ? details.actualStatus
    : details.status

  const { supplementaryAssessment } = supplementaryAssessmentData
  const isAssessed = currentStatus === 'ASSESSED' || currentStatus === 'REASSESSED'

  const tabNames = ['supplemental', 'recommendation', 'reassessment']
  const selectedTab = query?.tab ? query.tab : isAssessed ? tabNames[2] : tabNames[1]

  let isEditable = ['DRAFT', 'RETURNED'].indexOf(details.status) >= 0

  if (selectedTab === tabNames[0] && currentStatus === 'SUBMITTED') {
    isEditable = false
  }
  if (selectedTab === tabNames[1] && currentStatus === 'SUBMITTED') {
    isEditable = true
  }
  if (selectedTab === tabNames[2]) {
    isEditable = false
  }
  const assessmentDecision =
    supplementaryAssessment &&
    supplementaryAssessment.decision &&
    supplementaryAssessment.decision.description
      ? supplementaryAssessment.decision.description
        .replace(
          /{user.organization.name}/g,
          details.assessmentData.legalName
        )
        .replace(/{modelYear}/g, details.assessmentData.modelYear)
        .replace(/{penalty}/g, `$${formatNumeric(supplementaryAssessment.assessmentPenalty, 0) || 0} CAD`)
      : ''

  const showDescription = (each) => {
    const selectedId =
      supplementaryAssessment &&
      supplementaryAssessment.decision &&
      supplementaryAssessment.decision.id
    return (
      <div className="mb-3" key={each.id}>
        <input
          defaultChecked={selectedId === each.id}
          className="mr-3"
          type="radio"
          name="assessment"
          disabled={
            ['RECOMMENDED', 'ASSESSED'].indexOf(currentStatus) >= 0
          }
          data-testid={'recommendation-' + each.id}
          onChange={() => {
            setSupplementaryAssessmentData({
              ...supplementaryAssessmentData,
              supplementaryAssessment: {
                ...supplementaryAssessmentData.supplementaryAssessment,
                decision: {
                  description: each.description,
                  id: each.id
                },
                assessmentPenalty: ''
              }
            })
          }}
        />
        {each.description && (
          <label className="d-inline text-blue" htmlFor="complied">
            {each.description
              .replace(
                /{user.organization.name}/g,
                details.assessmentData.legalName
              )
              .replace(/{modelYear}/g, details.assessmentData.modelYear)
              .replace(/{penalty}/g, `$${formatNumeric(supplementaryAssessment.assessmentPenalty, 0) || 0} CAD`)}
          </label>
        )}
      </div>
    )
  }

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

  const modalDraft = (
    <Modal
      cancelLabel="No"
      confirmLabel="Yes"
      handleCancel={() => {
        setShowModalDraft(false)
      }}
      handleSubmit={() => {
        setShowModalDraft(false)
        handleSubmit(currentStatus, false)
      }}
      modalClass="w-75"
      showModal={showModalDraft}
      confirmClass="button primary"
    >
      <div className="my-3">
        <h3>
          {isReassessment
            ? 'This will create a reassessment report'
            : 'This will create a reassessment report from the supplementary report'}
        </h3>
      </div>
    </Modal>
  )

  let disabledRecommendBtn = false
  let recommendTooltip = ''

  if (!assessmentDecision) {
    disabledRecommendBtn = true
    recommendTooltip =
      'Please select an Analyst Recommendation before recommending this assessment.'
  }

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
          disabled={supplementaryReportId == null}
          tooltip={'No supplementary report found. Analyst initiated reassessment.'}
          status={reassessmentStatus}
          assessed={isAssessed}
        />)}
        <SupplementaryTab
          selected={selectedTab === tabNames[1]}
          title={'Reassessment Recommendation'}
          url={tabUrl(reassessmentReportId, tabNames[1])}
          disabled={false}
          tooltip={'No supplementary report found. Analyst initiated reassessment.'}
          status={reassessmentStatus}
          assessed={isAssessed}
        />
        <SupplementaryTab
          selected={selectedTab === tabNames[2]}
          title={'Reassessment'}
          url={tabUrl(reassessmentReportId, tabNames[2])}
          disabled={false}
          tooltip={''}
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
          tabName={selectedTab}
        />

      {renderTabs()}

      {selectedTab === tabNames[1] && (
        // analyst can see comments on the RECOMMENDATION tab in any status
        // and can leave/edit comments if its NOT Assessed or Recommended
        <>
          {commentArray &&
            commentArray.idirComment &&
            commentArray.idirComment.length > 0 && (
          <div className="supplementary-form my-3">
              <EditableCommentList
                enableEditing={!['ASSESSED', 'RECOMMENDED'].includes(currentStatus)}
                comments={commentArray.idirComment}
                user={user}
                handleCommentEdit={handleEditIdirComment}
                handleCommentDelete={handleDeleteIdirComment}
              />
            </div>
          )}
          {isEditable && (
          <div id="comment-input">
            <CommentInput
              handleCommentChange={handleCommentChangeIdir}
              title='Add comment to director: '
              buttonText="Add Comment"
              handleAddComment={handleAddIdirComment}
              tooltip="Please save the report first, before adding comments"
            />
          </div>
          )}
      </>
      )}
      <div className="supplementary-form mt-2">
        <div>
        {isReassessment &&
            selectedTab === tabNames[2]
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
        {details &&
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
      {supplementaryAssessment &&
        supplementaryAssessment.decision &&
        supplementaryAssessment.decision.description &&
          (['ASSESSED', 'RECOMMENDED'].indexOf(currentStatus) >= 0) && (
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
      )}
      {isEditable && (
        <>
          {['RECOMMENDED'].indexOf(currentStatus) < 0 && (
            <h3 className="mt-4 mb-1">
              Analyst Recommended Director Assessment
            </h3>
          )}
          <div className="row mb-3">
            <div className="col-12">
              <div className="grey-border-area  p-3 mt-2">
                <div>
                  {['RECOMMENDED'].indexOf(currentStatus) < 0 && (
                    <>
                      {radioDescriptions &&
                        radioDescriptions.map(
                          (each) =>
                            each.displayOrder === 0 && showDescription(each)
                        )}
                      {radioDescriptions &&
                        radioDescriptions.map(
                          (each) =>
                            each.displayOrder > 0 && showDescription(each)
                        )}
                      <label className="d-inline" htmlFor="penalty-radio">
                        <div>
                          <input
                            disabled= {
                              !assessmentDecision.includes(
                                'Section 10 (3) applies'
                              )
                            }
                            type="number"
                            className="ml-4 mr-1"
                            value={supplementaryAssessment.assessmentPenalty || ''}
                            name="penalty-amount"
                            onChange={(e) => {
                              setSupplementaryAssessmentData({
                                ...supplementaryAssessmentData,
                                supplementaryAssessment: {
                                  ...supplementaryAssessmentData.supplementaryAssessment,
                                  assessmentPenalty: e.target.value
                                }
                              })
                            }}
                          />
                          <label className="text-grey" htmlFor="penalty-amount">
                            $5,000 CAD x ZEV unit deficit
                          </label>
                        </div>
                      </label>
                    </>
                  )}
                  <div id="comment-input">
                    <CommentInput
                      // disable={details.assessment.validationStatus === 'ASSESSED'}
                      defaultComment={
                        commentArray && commentArray.bceidComment
                          ? commentArray.bceidComment
                          : {}
                      }
                      // handleAddComment={handleAddBceidComment}
                      handleCommentChange={handleCommentChangeBceid}
                      title="Assessment Message to the Supplier: "
                    />
                  </div>
                    <UploadEvidence
                      details={details}
                      deleteFiles={deleteFiles}
                      files={files}
                      setDeleteFiles={setDeleteFiles}
                      setUploadFiles={setUploadFiles}
                    />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
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
                isEditable && isReassessment && (
                  <Button
                    buttonType="delete"
                    action={() => setShowModalDelete(true)}
                    optionalText={
                      details &&
                      details.reassessment &&
                      details.reassessment.isReassessment
                        ? 'Delete Reassessment'
                        : 'Delete'
                    }
                  />
              )}
              {CONFIG.FEATURES.SUPPLEMENTAL_REPORT.ENABLED &&
                selectedTab === tabNames[1] &&
                ['DRAFT'].indexOf(details.status) < 0 &&
                supplementaryReportId !== null &&
                (isEditable ||
                  ['SUBMITTED'].indexOf(details.status) >= 0) &&
                    <button
                      className="button text-danger"
                      onClick={() => {
                        handleSubmit('DRAFT')
                      }}
                      type="button"
                      data-testid="return-button"
                    >
                      Return to Vehicle Supplier
                    </button>
              }
            </span>
            <span className="right-content">
              {CONFIG.FEATURES.SUPPLEMENTAL_REPORT.ENABLED &&
                isEditable && selectedTab === tabNames[1] && (
                  <Button
                    buttonType="save"
                    action={() => {
                      handleSubmit(currentStatus, false)
                    }}
                    testid="save-button"
                  />
              )}
              {CONFIG.FEATURES.SUPPLEMENTAL_REPORT.ENABLED &&
                isEditable &&
                ['DRAFT', 'SUBMITTED', 'RETURNED'].indexOf(details.status) >= 0 &&
                (
                  <Button
                    buttonTooltip={recommendTooltip}
                    buttonType="submit"
                    optionalClassname="button primary"
                    optionalText="Recommend Reassessment"
                    disabled={disabledRecommendBtn}
                    action={() => {
                      handleSubmit('RECOMMENDED')
                    }}
                    testid="recommend-button"
                  />
                )}

            </span>
          </div>
        </div>
      </div>

      {modal}
      {modalDraft}
      {modalDelete}

    </div>
  )
}

SupplementaryAnalystDetails.defaultProps = {
  isReassessment: undefined,
  ldvSales: undefined,
  obligationDetails: [],
  query: {},
  ratios: {}
}

SupplementaryAnalystDetails.propTypes = {
  addSalesRow: PropTypes.func.isRequired,
  commentArray: PropTypes.shape().isRequired,
  deleteFiles: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  details: PropTypes.shape().isRequired,
  handleAddIdirComment: PropTypes.func.isRequired,
  handleCommentChangeBceid: PropTypes.func.isRequired,
  handleCommentChangeIdir: PropTypes.func.isRequired,
  handleDeleteIdirComment: PropTypes.func.isRequired,
  handleEditIdirComment: PropTypes.func.isRequired,
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
  radioDescriptions: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  ratios: PropTypes.shape(),
  salesRows: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  setSupplementaryAssessmentData: PropTypes.func.isRequired,
  supplementaryAssessmentData: PropTypes.shape().isRequired,
  user: CustomPropTypes.user.isRequired
}

export default SupplementaryAnalystDetails
