/* eslint-disable react/no-array-index-key */
import React, { useState } from 'react'
import PropTypes from 'prop-types'
import parse from 'html-react-parser'
import Button from '../../app/components/Button'
import Loading from '../../app/components/Loading'
import history from '../../app/History'
import Modal from '../../app/components/Modal'
import CustomPropTypes from '../../app/utilities/props'
import ROUTES_COMPLIANCE from '../../app/routes/Compliance'
import ComplianceObligationAmountsTable from './ComplianceObligationAmountsTable'
import ComplianceReportTabs from './ComplianceReportTabs'
import formatNumeric from '../../app/utilities/formatNumeric'
import ComplianceObligationReductionOffsetTable from './ComplianceObligationReductionOffsetTable'
import ComplianceObligationTableCreditsIssued from './ComplianceObligationTableCreditsIssued'
import CommentInput from '../../app/components/CommentInput'
import ComplianceHistory from './ComplianceHistory'
import AssessmentEditableCommentList from './AssessmentEditableCommentList'
import AssessmentEditableCommentInput from './AssessmentEditableCommentInput'
import NoticeOfAssessmentSection from './NoticeOfAssessmentSection'
import CreateReassessmentHeader from './CreateReassessmentHeader'

const AssessmentDetailsPage = (props) => {
  const {
    creditActivityDetails,
    details,
    id,
    handleAddBceidComment,
    handleAddIdirComment,
    handleCommentChangeBceid,
    handleCommentChangeIdir,
    handleEditComment,
    handleDeleteComment,
    loading,
    makes,
    reportYear,
    radioDescriptions,
    statuses,
    user,
    sales,
    handleSubmit,
    directorAction,
    analystAction,
    setDetails,
    classAReductions,
    ratios,
    pendingBalanceExist,
    supplierClass,
    totalReduction,
    unspecifiedReductions,
    deductions,
    updatedBalances,
    createdByGov,
    handleCancelConfirmation,
  } = props

  const [showModal, setShowModal] = useState(false)
  const [showModalAssess, setShowModalAssess] = useState(false)
  const [editableComment, setEditableComment] = useState(null)
  const [editText, setEditText] = useState('')

  const formattedPenalty = formatNumeric(
    details.assessment.assessmentPenalty,
    0
  )

  const assessmentDecision =
    details.assessment.decision && details.assessment.decision.description
      ? details.assessment.decision.description
        .replace(/{user.organization.name}/g, details.organization.name)
        .replace(/{modelYear}/g, reportYear)
        .replace(/{penalty}/g, `$${formattedPenalty} CAD`)
      : ''
  const disabledInputs = false

  const modalReturn = (
    <Modal
      cancelLabel="Cancel"
      confirmLabel="Return to Supplier"
      handleCancel={() => {
        setShowModal(false)
      }}
      handleSubmit={() => {
        setShowModal(false)
        handleSubmit('DRAFT')
        handleCancelConfirmation()
      }}
      modalClass="w-75"
      showModal={showModal}
      confirmClass="button primary"
    >
      <div className="my-3">
        <h3>Do you wish to return this Model Year report to the supplier?</h3>
      </div>
    </Modal>
  )

  const modalIssueAssessment = (
    <Modal
      cancelLabel="Cancel"
      confirmLabel="Issue Assessment"
      handleCancel={() => {
        setShowModalAssess(false)
      }}
      handleSubmit={() => {
        setShowModalAssess(false)
        handleSubmit('ASSESSED')
      }}
      modalClass="w-75"
      showModal={showModalAssess}
      confirmClass="button primary"
    >
      <div className="my-3">
        <h3>Are you sure you want to issue this assessment?</h3>
      </div>
    </Modal>
  )
  const showDescription = (each) => (
    <div className="mb-3" key={each.id}>
      <input
        defaultChecked={
          details.assessment.decision.description === each.description
        }
        className="mr-3"
        type="radio"
        name="assessment"
        disabled={
          directorAction ||
          ['RECOMMENDED', 'ASSESSED'].indexOf(
            details.assessment.validationStatus
          ) >= 0
        }
        onChange={() => {
          setDetails({
            ...details,
            assessment: {
              ...details.assessment,
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
            .replace(/{user.organization.name}/g, details.organization.name)
            .replace(/{modelYear}/g, reportYear)}
        </label>
      )}
    </div>
  )
  let disabledRecommendBtn = false
  let recommendTooltip = ''

  if (!assessmentDecision) {
    disabledRecommendBtn = true
    recommendTooltip =
      'Please select an Analyst Recommendation before recommending this assessment.'
  }

  if (pendingBalanceExist) {
    disabledRecommendBtn = true
    recommendTooltip =
      'There are credit applications that must be issued prior to recommending this assessment.'
  }

  if (loading) {
    return <Loading />
  }

  const editComment = (comment) => {
    const text = comment.comment
    setEditableComment(comment)
    setEditText(text)
    handleCommentChangeBceid(text)
    handleCommentChangeIdir(text)
  }

  const updateEditableCommentText = (text) => {
    setEditText(text)
    handleCommentChangeBceid(text)
    handleCommentChangeIdir(text)
  }

  const saveEditableComment = () => {
    const comment = editableComment
    comment.comment = editText
    handleEditComment(comment)
  }

  const deleteEditableComment = () => {
    const comment = editableComment
    handleDeleteComment(comment)
  }

  const cancelEditableComment = () => {
    setEditText('')
    setEditableComment(null)
    handleCommentChangeIdir('')
    handleCommentChangeBceid('')
  }

  return (
    <div id="assessment-details" className="page">
      <CreateReassessmentHeader 
        user={user}
        id={id}
      />
      <ComplianceHistory
        user={user}
        id={id}
        activePage="assessment"
        reportYear={reportYear}
        supplementaryId={details.id}
        tabName={'supplemental'}
      />
      <div className="row">
        <div className="col-sm-12">
          <h2 className="mb-2 mt-3">{reportYear} Model Year Report</h2>
        </div>
      </div>

      <div className="row d-print-none">
        <div className="col-12">
          <ComplianceReportTabs
            active="assessment"
            reportStatuses={statuses}
            id={id}
            user={user}
            modelYear={reportYear}
          />
        </div>
      </div>
      <div className="row">
        <div className="col-12">
          {user.isGovernment && (
            <>
              {(details.changelog.ldvChanges ||
                details.idirComment.length > 0 ||
                statuses.assessment.status !== 'ASSESSED') && (
                <div className="grey-border-area p-3 comment-box mt-2">
                  {(details.changelog.ldvChanges ||
                    details.changelog.makesAdditions) &&
                    (Object.keys(details.changelog.makesAdditions) ||
                      details.changelog.ldvChanges > 0) && (
                      <>
                        <h3>Internal Record of Assessment</h3>
                        <div className="text-blue">
                          The analyst made the following adjustments:
                          {details.changelog.makesAdditions && (
                            <ul>
                              {details.changelog.makesAdditions.map(
                                (addition) => (
                                  <li key={addition.make}>
                                    added Make: {addition.make}
                                  </li>
                                )
                              )}
                              {/* {details.analystChanges.ldvChanges.map((change) => ( */}
                              {details.changelog.ldvChanges && (
                                <li>
                                  changed the{' '}
                                  {details.changelog.ldvChanges.year} Model Year
                                  LDV Sales\Leases total from{' '}
                                  {formatNumeric(
                                    details.changelog.ldvChanges.notFromGov,
                                    0
                                  )}{' '}
                                  to{' '}
                                  {formatNumeric(
                                    details.changelog.ldvChanges.fromGov,
                                    0
                                  )}
                                </li>
                              )}
                            </ul>
                          )}
                        </div>
                      </>
                  )}
                  {details.idirComment &&
                    details.idirComment.length > 0 &&
                    user.isGovernment && (
                      <AssessmentEditableCommentList
                        commentArray={details.idirComment}
                        editComment={editComment}
                        user={user}
                      />
                  )}
                  {statuses.assessment.status !== 'ASSESSED' && (
                    <AssessmentEditableCommentInput
                      handleAddComment={handleAddIdirComment}
                      handleCommentChange={updateEditableCommentText}
                      saveEditableComment={saveEditableComment}
                      cancelEditableComment={cancelEditableComment}
                      deleteEditableComment={deleteEditableComment}
                      editing={editableComment != null}
                      value={editText}
                      title={
                        editableComment
                          ? 'Editing comment:'
                          : analystAction
                            ? 'Add comment to director: '
                            : 'Add comment to the analyst'
                      }
                      buttonText={
                        editableComment ? 'Save Comment' : 'Add Comment'
                      }
                    />
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <div className="row mt-3">
        <div className="col-12">
          <div id="compliance-obligation-page">
            <span className="float-right d-print-none">
              {analystAction &&
                ['RETURNED', 'SUBMITTED', 'UNSAVED'].indexOf(
                  statuses.assessment.status
                ) >= 0 && (
                  <button
                    className="btn button primary"
                    onClick={() => {
                      history.push(
                        ROUTES_COMPLIANCE.ASSESSMENT_EDIT.replace(':id', id)
                      )
                    }}
                    type="button"
                  >
                    Edit
                  </button>
              )}
            </span>

            <NoticeOfAssessmentSection
              name={details.organization.name}
              addresses={details.organization.organizationAddress}
              makes={makes}
              supplierClass={supplierClass}
              disabledInputs={disabledInputs}
              modelYear={reportYear}
            />

            <div className="mt-4">
              <ComplianceObligationAmountsTable
                classAReductions={classAReductions}
                page="assessment"
                ratios={ratios}
                reportYear={reportYear}
                sales={sales}
                statuses={statuses}
                supplierClass={supplierClass}
                totalReduction={totalReduction}
                unspecifiedReductions={unspecifiedReductions}
              />
            </div>

            <div className="mt-4">
              <ComplianceObligationTableCreditsIssued
                pendingBalanceExist={pendingBalanceExist}
                reportYear={reportYear}
                reportDetails={creditActivityDetails}
              />
            </div>

            <h3 className="mt-4 mb-2">Credit Reduction</h3>
            {supplierClass === 'S' && <>Small volume suppliers have no compliance obligation or credit reduction.</>}

            <ComplianceObligationReductionOffsetTable
              assessment
              reportYear={reportYear}
              creditReductionSelection={details.creditReductionSelection}
              deductions={deductions}
              pendingBalanceExist={pendingBalanceExist}
              statuses={statuses}
              supplierClass={supplierClass}
              updatedBalances={updatedBalances}
              user={user}
            />
          </div>
        </div>
      </div>
      {details.assessment &&
        details.assessment.decision &&
        details.assessment.decision.description &&
        (!user.isGovernment ||
          (user.isGovernment &&
            ['ASSESSED', 'RECOMMENDED'].indexOf(statuses.assessment.status) >=
              0)) && (
          <>
            <h3 className="mt-4 mb-1">Director Assessment</h3>
            <div className="row mb-3">
              <div className="col-12">
                <div className="grey-border-area comment-box p-3 mt-2">
                  <div className="text-blue">
                    <div>
                      The Director has assessed that {assessmentDecision}
                    </div>
                    {details.bceidComment && details.bceidComment.comment && (
                      <div className="mt-2">
                        {parse(details.bceidComment.comment)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
      )}
      {(analystAction || directorAction) &&
        ['ASSESSED'].indexOf(statuses.assessment.status) < 0 && (
          <>
            {['RECOMMENDED'].indexOf(statuses.assessment.status) < 0 && (
              <h3 className="mt-4 mb-1 d-print-none">
                Analyst Recommended Director Assessment
              </h3>
            )}
            <div className="row mb-3 d-print-none">
              <div className="col-12">
                <div className="grey-border-area comment-box p-3 mt-2">
                  <div>
                    {['RECOMMENDED'].indexOf(statuses.assessment.status) <
                      0 && (
                      <>
                        {radioDescriptions.map(
                          (each) =>
                            each.displayOrder === 0 && showDescription(each)
                        )}
                        {radioDescriptions.map(
                          (each) =>
                            each.displayOrder > 0 && showDescription(each)
                        )}
                        <label className="d-inline" htmlFor="penalty-radio">
                          <div>
                            <input
                              disabled={
                                directorAction ||
                                ['RECOMMENDED', 'ASSESSED'].indexOf(
                                  details.assessment.validationStatus
                                ) >= 0 ||
                                assessmentDecision.indexOf(
                                  'Section 10 (3) applies'
                                ) < 0
                              }
                              type="number"
                              className="ml-4 mr-1"
                              value={details.assessment.assessmentPenalty || ''}
                              name="penalty-amount"
                              onChange={(e) => {
                                setDetails({
                                  ...details,
                                  assessment: {
                                    ...details.assessment,
                                    assessmentPenalty: e.target.value
                                  }
                                })
                              }}
                            />
                            <label
                              className="text-grey"
                              htmlFor="penalty-amount"
                            >
                              $5,000 CAD x ZEV unit deficit
                            </label>
                          </div>
                        </label>
                      </>
                    )}
                    {(analystAction || directorAction) && (
                      <CommentInput
                        disable={
                          details.assessment.validationStatus === 'ASSESSED'
                        }
                        defaultComment={details.bceidComment}
                        handleAddComment={handleAddBceidComment}
                        handleCommentChange={handleCommentChangeBceid}
                        title="Assessment Message to the Supplier: "
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
      )}

      <div className="row d-print-none">
        <div className="col-sm-12">
          <div className="action-bar mt-0">
            <span className="left-content">
              <Button buttonType="back" locationRoute="/compliance/reports" />

              {directorAction && (
                <button
                  className="button text-danger"
                  onClick={() => {
                    handleSubmit('RETURNED')
                  }}
                  type="button"
                >
                  Return to Analyst
                </button>
              )}
              {analystAction && !createdByGov && (
                <button
                  className="button text-danger"
                  onClick={() => {
                    setShowModal(true)
                  }}
                  type="button"
                >
                  Return to Vehicle Supplier
                </button>
              )}
            </span>

            <span className="right-content">
              {(directorAction || analystAction) && (
                <Button
                  buttonTooltip={recommendTooltip}
                  buttonType="button"
                  optionalClassname="button"
                  optionalText="Save"
                  disabled={disabledRecommendBtn}
                  action={() => {
                    handleSubmit(details.assessment.validationStatus)
                  }}
                />
              )}
              {analystAction && (
                <Button
                  buttonTooltip={recommendTooltip}
                  buttonType="submit"
                  optionalClassname="button primary"
                  optionalText="Recommend Assessment"
                  disabled={disabledRecommendBtn}
                  action={() => {
                    handleSubmit('RECOMMENDED')
                  }}
                />
              )}
              {directorAction && (
                <Button
                  buttonType="submit"
                  optionalClassname="button primary"
                  optionalText="Issue Assessment"
                  action={() => {
                    setShowModalAssess(true)
                  }}
                />
              )}
            </span>
          </div>
        </div>
      </div>
      {modalReturn}
      {modalIssueAssessment}
    </div>
  )
}

AssessmentDetailsPage.defaultProps = {
  pendingBalanceExist: false,
  sales: 0
}

AssessmentDetailsPage.propTypes = {
  creditActivityDetails: PropTypes.shape().isRequired,
  details: PropTypes.shape().isRequired,
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  loading: PropTypes.bool.isRequired,
  makes: PropTypes.arrayOf(PropTypes.string).isRequired,
  user: CustomPropTypes.user.isRequired,
  reportYear: PropTypes.number.isRequired,
  statuses: PropTypes.shape().isRequired,
  sales: PropTypes.number,
  handleSubmit: PropTypes.func.isRequired,
  directorAction: PropTypes.bool.isRequired,
  analystAction: PropTypes.bool.isRequired,
  handleAddBceidComment: PropTypes.func.isRequired,
  handleAddIdirComment: PropTypes.func.isRequired,
  handleCommentChangeBceid: PropTypes.func.isRequired,
  handleCommentChangeIdir: PropTypes.func.isRequired,
  handleEditComment: PropTypes.func.isRequired,
  handleDeleteComment: PropTypes.func.isRequired,
  radioDescriptions: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  setDetails: PropTypes.func.isRequired,
  classAReductions: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  ratios: PropTypes.shape().isRequired,
  pendingBalanceExist: PropTypes.bool,
  supplierClass: PropTypes.string.isRequired,
  totalReduction: PropTypes.shape().isRequired,
  unspecifiedReductions: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  deductions: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  updatedBalances: PropTypes.shape().isRequired,
  supplementaryStatus: PropTypes.string
}
export default AssessmentDetailsPage
