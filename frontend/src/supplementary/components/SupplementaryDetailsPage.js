import axios from 'axios';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import parse from 'html-react-parser';
import Loading from '../../app/components/Loading';
import Modal from '../../app/components/Modal';
import Button from '../../app/components/Button';
import ZevSales from './ZevSales';
import SupplierInformation from './SupplierInformation';
import CreditActivity from './CreditActivity';
import UploadEvidence from './UploadEvidence';
import CommentInput from '../../app/components/CommentInput';
import ROUTES_COMPLIANCE from '../../app/routes/Compliance';
import ROUTES_SUPPLEMENTARY from '../../app/routes/SupplementaryReport';
import DisplayComment from '../../app/components/DisplayComment';
import formatNumeric from '../../app/utilities/formatNumeric';
import CustomPropTypes from '../../app/utilities/props';
import ComplianceHistory from '../../compliance/components/ComplianceHistory';
import CONFIG from '../../app/config';
import ReassessmentDetailsPage from './ReassessmentDetailsPage';
import SupplementaryTab from './SupplementaryTab';
import ReactTooltip from 'react-tooltip';

const SupplementaryDetailsPage = (props) => {
  const {
    addSalesRow,
    analystAction,
    checkboxConfirmed,
    commentArray,
    deleteFiles,
    details,
    directorAction,
    files,
    handleAddIdirComment,
    handleCheckboxClick,
    handleCommentChange,
    handleCommentChangeBceid,
    handleCommentChangeIdir,
    handleInputChange,
    handleSubmit,
    handleSupplementalChange,
    id,
    ldvSales,
    loading,
    newBalances,
    obligationDetails,
    radioDescriptions,
    ratios,
    salesRows,
    setDeleteFiles,
    setSupplementaryAssessmentData,
    setUploadFiles,
    supplementaryAssessmentData,
    user,
    newReport,
    query
  } = props;

  let { newData } = props;
  let { reassessment } = details;

  if (loading) {
    return <Loading />;
  }
  // if user is bceid then only draft is editable
  // if user is idir then draft or submitted is editable
  const [showModal, setShowModal] = useState(false);
  const [showModalDraft, setShowModalDraft] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const reportYear = details.assessmentData && details.assessmentData.modelYear;
  const supplierClass =
    details.assessmentData && details.assessmentData.supplierClass[0];
  const creditReductionSelection =
    details.assessmentData && details.assessmentData.creditReductionSelection;
  const newLdvSales =
    newData && newData.supplierInfo && newData.supplierInfo.ldvSales;
  let currentStatus = details.actualStatus
    ? details.actualStatus
    : details.status;
  if (currentStatus === 'ASSESSED' && newReport) {
    currentStatus = 'DRAFT';
  }

  const isGovernment = user.isGovernment
  const isDirector = isGovernment && user.roles.some((r) => r.roleCode === 'Director');
  const newReassessment = query && query.reassessment === 'Y'

  if (newReassessment) {
    reassessment = {
      isReassessment: true,
      supplementaryReportId: details.id
    };
  }

  if (newReport && !isGovernment) {
    reassessment = {
      isReassessment: false
    };
    details.actualStatus = 'DRAFT';
    newData = { zevSales: [], creditActivity: [], supplierInfo: {} };
  }

  const isAssessed = currentStatus === 'ASSESSED' ||
    currentStatus === 'REASSESSED'

  const tabNames = ['supplemental', 'recommendation', 'reassessment']
  const selectedTab = query?.tab ? query.tab : isAssessed ? tabNames[2] :
    (isGovernment ? tabNames[1] : tabNames[0])

  const isReassessment = reassessment?.isReassessment
  const reassessmentStatus = reassessment?.status ? reassessment.status : details.status
  const supplementaryReportId = reassessment?.supplementaryReportId ? reassessment?.supplementaryReportId : 
    (newReassessment ? details.id : null)
  const reassessmentReportId = reassessment?.reassessmentReportId ? reassessment?.reassessmentReportId : details.id
  const supplementaryReportIsReassessment = reassessment?.supplementaryReportIsReassessment
  console.log(currentStatus)

  let isEditable =
    ['DRAFT', 'RETURNED'].indexOf(details.status) >= 0 ||
    (isReassessment &&
      isGovernment &&
      currentStatus !== 'ASSESSED' &&
      (analystAction || directorAction)) &&
    newReport;
  
  if (selectedTab == tabNames[0] && currentStatus == 'SUBMITTED') {
    isEditable = false
  }
  if (selectedTab == tabNames[1] && currentStatus == 'SUBMITTED') {
    isEditable = true
  }

  const formattedPenalty = details.assessment
    ? formatNumeric(details.assessment.assessmentPenalty, 0)
    : 0;
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
      : '';
  const showDescription = (each) => {
    const selectedId =
      supplementaryAssessmentData &&
      supplementaryAssessmentData.supplementaryAssessment &&
      supplementaryAssessmentData.supplementaryAssessment.decision &&
      supplementaryAssessmentData.supplementaryAssessment.decision.id;

    return (
      <div className="mb-3" key={each.id}>
        <input
          defaultChecked={selectedId === each.id}
          className="mr-3"
          type="radio"
          name="assessment"
          disabled={
            !analystAction ||
            (['RECOMMENDED', 'ASSESSED'].indexOf(currentStatus) >= 0 &&
              !newReport)
          }
          onChange={() => {
            setSupplementaryAssessmentData({
              ...supplementaryAssessmentData,
              supplementaryAssessment: {
                ...supplementaryAssessmentData.supplementaryAssessment,
                decision: {
                  description: each.description,
                  id: each.id
                }
              }
            });
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
              .replace(/{penalty}/g, `$${formattedPenalty} CAD`)}
          </label>
        )}
      </div>
    );
  };

  const handleGovSubmitDraft = (status) => {
    if (newReport) {
      setShowModalDraft(true);
    } else {
      handleSubmit(status, newReport);
    }
  };

  const modal = (
    <Modal
      cancelLabel="No"
      confirmLabel="Yes"
      handleCancel={() => {
        setShowModal(false);
      }}
      handleSubmit={() => {
        setShowModal(false);
        handleSubmit('RECOMMENDED', newReport);
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
  );

  const modalDelete = (
    <Modal
      cancelLabel="No"
      confirmLabel="Yes"
      handleCancel={() => {
        setShowModalDelete(false);
      }}
      handleSubmit={() => {
        setShowModalDelete(false);
        if(!newReport) {
          handleSubmit('DELETED');
        }
      }}
      modalClass="w-75"
      showModal={showModalDelete}
      confirmClass="button primary"
    >
      <div className="my-3">
        <h3>Are you sure you want to delete this?</h3>
      </div>
    </Modal>
  );

  const modalDraft = (
    <Modal
      cancelLabel="No"
      confirmLabel="Yes"
      handleCancel={() => {
        setShowModalDraft(false);
      }}
      handleSubmit={() => {
        setShowModalDraft(false);
        handleSubmit(currentStatus, newReport);
      }}
      modalClass="w-75"
      showModal={showModalDraft}
      confirmClass="button primary"
    >
      <div className="my-3">
        {isGovernment && (
          <h3>
            {isReassessment
              ? 'This will create a reassessment report'
              : 'This will create a reassessment report from the supplementary report'}
          </h3>
        )}
      </div>
    </Modal>
  );

  let disabledRecommendBtn = false;
  let recommendTooltip = '';

  if (!assessmentDecision) {
    disabledRecommendBtn = true;
    recommendTooltip =
      'Please select an Analyst Recommendation before recommending this assessment.';
  }

  const tabUrl = (supplementalId, tabName) => {
    return ROUTES_SUPPLEMENTARY.SUPPLEMENTARY_DETAILS.replace(':id', id)
      .replace(':supplementaryId', supplementalId) +
        `?tab=${tabName}${newReassessment ? '&reassessment=Y' : ''}`
  }

  const renderTabs = () => {
    return (
      
      <ul
        className="nav nav-pills nav-justified supplementary-report-tabs"
        key="tabs"
        role="tablist"
      >
        <ReactTooltip/>
        <SupplementaryTab
          selected={selectedTab == tabNames[0]}
          title={'Supplementary Details'}
          url={tabUrl(supplementaryReportId, tabNames[0])}
          disabled={supplementaryReportId == null}
          tooltip={'No supplementary report found. Analyst initiated reassessment.'}
          status={reassessmentStatus}
          assessed={isAssessed}
        />
        {isGovernment &&
          <SupplementaryTab
            selected={selectedTab == tabNames[1]}
            title={'Reassessment Recommendation'}
            url={tabUrl(newReport ? supplementaryReportId : reassessmentReportId, tabNames[1])}
            disabled={false}
            tooltip={'No supplementary report found. Analyst initiated reassessment.'}
            status={reassessmentStatus}
            assessed={isAssessed}
          />
        }
        <SupplementaryTab
          selected={selectedTab == tabNames[2]}
          title={'Reassessment'}
          url={tabUrl(reassessmentReportId, tabNames[2])}
          disabled={!isAssessed}
          tooltip={'Reassessment visible once a director approves the recommendation.'}
          status={reassessmentStatus}
          assessed={isAssessed}
        />
      </ul>
    )
  }

  return (
    <div id="supplementary" className="page">
      {CONFIG.FEATURES.SUPPLEMENTAL_REPORT.ENABLED && !newReport && (
        <ComplianceHistory
          activePage="supplementary"
          id={id}
          newReassessment={newReassessment}
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
      )}
      <div className="row">
        <div className="col">
          <h2 className="mb-2 mt-3">
            {isReassessment
              ? `${reportYear} Model Year Report Reassessment`
              : `${reportYear} Model Year Supplementary Report`}
          </h2>
        </div>
      </div>

      {renderTabs()}

      {isEditable && isGovernment && (
        <div className="supplementary-form my-3">
          {commentArray &&
            commentArray.idirComment &&
            commentArray.idirComment.length > 0 && (
              <DisplayComment commentArray={commentArray.idirComment} />
            )}

          <div id="comment-input">
            <CommentInput
              handleCommentChange={handleCommentChangeIdir}
              title={
                analystAction
                  ? 'Add comment to director: '
                  : 'Add comment to the analyst'
              }
              buttonText="Add Comment"
              handleAddComment={handleAddIdirComment}
              tooltip="Please save the report first, before adding comments"
            />
          </div>
        </div>
      )}
      <div className="supplementary-form mt-2">
        <Button
          buttonType="button"
          optionalClassname="ml-2 mr-2 button btn float-right d-print-none"
          optionalText="Print Page"
          action={() => {
            window.print();
          }}
        />
        <div>
          {isReassessment &&
          currentStatus === 'ASSESSED' &&
          isDirector ? (
            <ReassessmentDetailsPage
              details={details}
              ldvSales={ldvSales}
              newBalances={newBalances}
              newData={newData}
              obligationDetails={obligationDetails}
              ratios={ratios}
              user={user}
            />
          ) : (
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
                newLdvSales={newLdvSales || ldvSales}
                obligationDetails={obligationDetails}
                ratios={ratios}
                supplierClass={supplierClass}
                isEditable={isEditable && currentStatus !== 'RECOMMENDED'}
              />
            </>
          )}
        </div>
        <div id="comment-input">
          {!isGovernment && (currentStatus === 'DRAFT' || newReport) && (
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
          )}
        </div>
        {!isGovernment && (currentStatus === 'DRAFT' || newReport) && (
          <UploadEvidence
            details={details}
            deleteFiles={deleteFiles}
            files={files}
            setDeleteFiles={setDeleteFiles}
            setUploadFiles={setUploadFiles}
          />
        )}
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
                    <h4>Supplementary Report Attachments</h4>
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
                                      );
                                    const link = document.createElement('a');
                                    link.href = objectURL;
                                    link.setAttribute(
                                      'download',
                                      attachment.filename
                                    );
                                    document.body.appendChild(link);
                                    link.click();
                                  });
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
      {supplementaryAssessmentData.supplementaryAssessment &&
        supplementaryAssessmentData.supplementaryAssessment.decision &&
        supplementaryAssessmentData.supplementaryAssessment.decision
          .description &&
        (!isGovernment ||
          (isGovernment &&
            ['ASSESSED', 'RECOMMENDED'].indexOf(currentStatus) >= 0)) &&
        !newReport && (
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
      {isEditable && isGovernment && (
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
                            disabled={
                              (directorAction &&
                                currentStatus == 'RECOMMENDED') ||
                              assessmentDecision.indexOf(
                                'Section 10 (3) applies'
                              ) < 0
                            }
                            type="number"
                            className="ml-4 mr-1"
                            defaultValue={
                              supplementaryAssessmentData
                                .supplementaryAssessment.assessmentPenalty
                            }
                            name="penalty-amount"
                            onChange={(e) => {
                              setSupplementaryAssessmentData({
                                ...supplementaryAssessmentData,
                                supplementaryAssessment: {
                                  ...supplementaryAssessmentData.supplementaryAssessment,
                                  assessmentPenalty: e.target.value
                                }
                              });
                            }}
                          />
                          <label className="text-grey" htmlFor="penalty-amount">
                            $5,000 CAD x ZEV unit deficit
                          </label>
                        </div>
                      </label>
                    </>
                  )}
                  {(analystAction || directorAction) && (
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
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {!isGovernment &&
        user.hasPermission('SUBMIT_COMPLIANCE_REPORT') &&
        (['DRAFT', 'RETURNED'].indexOf(currentStatus) >= 0 || newReport) && (
          <div className="mt-3">
            <input
              defaultChecked={checkboxConfirmed}
              className="mr-2"
              id="supplier-confirm-checkbox"
              name="confirmations"
              onChange={(event) => {
                handleCheckboxClick(event);
              }}
              type="checkbox"
            />
            <label htmlFor="supplier-confirm-checkbox">
              On behalf of {details.assessmentData.legalName} I confirm the
              information included in the this Supplementary Report is complete
              and correct.
            </label>
          </div>
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
                isEditable &&
                ['DRAFT', 'RETURNED'].indexOf(currentStatus) >= 0 && !isDirector && (
                  <Button
                    buttonType="delete"
                    action={() => setShowModalDelete(true)}
                    disabled={newReport}
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
              {CONFIG.FEATURES.SUPPLEMENTAL_REPORT.ENABLED &&
                selectedTab == tabNames[2] &&
                (isEditable ||
                  ['SUBMITTED', 'RECOMMENDED'].indexOf(details.status) >= 0) &&
                isGovernment &&
                (((currentStatus === 'SUBMITTED' ||
                  currentStatus === 'RETURNED') &&
                  analystAction &&
                  details &&
                  details.reassessment &&
                  !details.reassessment.isReassessment) ||
                  (currentStatus === 'RECOMMENDED' &&
                    directorAction &&
                    details &&
                    details.reassessment &&
                    details.reassessment.isReassessment)) && (
                  <button
                    className="button text-danger"
                    onClick={() => {
                      if (currentStatus === 'SUBMITTED') {
                        handleSubmit('RETURNED');
                      } else {
                        handleSubmit('DRAFT');
                      }
                    }}
                    type="button"
                  >
                    {currentStatus === 'SUBMITTED' ||
                    currentStatus === 'RETURNED'
                      ? 'Return to Vehicle Supplier'
                      : 'Return to Analyst'}
                  </button>
                )}
            </span>
            <span className="right-content">
              {CONFIG.FEATURES.SUPPLEMENTAL_REPORT.ENABLED &&
                isEditable &&
                (['DRAFT', 'RETURNED'].indexOf(currentStatus) >= 0 ||
                  newReport ||
                  (['SUBMITTED'].indexOf(currentStatus) >= 0 &&
                    isGovernment)) && (
                  <Button
                    buttonType="save"
                    action={
                      isGovernment
                        ? () => {
                            handleGovSubmitDraft(currentStatus);
                          }
                        : () => {
                            handleSubmit('DRAFT', newReport);
                          }
                    }
                  />
                )}
              {CONFIG.FEATURES.SUPPLEMENTAL_REPORT.ENABLED &&
                isEditable &&
                analystAction &&
                (['RECOMMENDED', 'ASSESSED'].indexOf(currentStatus) < 0 ||
                  currentStatus === 'RETURNED' ||
                  newReport) && (
                  <Button
                    buttonTooltip={recommendTooltip}
                    buttonType="submit"
                    optionalClassname="button primary"
                    optionalText="Recommend Reassessment"
                    disabled={disabledRecommendBtn}
                    action={() => {
                      if (newReport) {
                        setShowModal(true);
                      } else {
                        handleSubmit('RECOMMENDED');
                      }
                    }}
                  />
                )}
              {CONFIG.FEATURES.SUPPLEMENTAL_REPORT.ENABLED &&
                directorAction &&
                currentStatus === 'RECOMMENDED' && (
                  <Button
                    buttonType="submit"
                    optionalClassname="button primary"
                    optionalText="Issue Assessment"
                    action={() => handleSubmit('ASSESSED')}
                  />
                )}
              {CONFIG.FEATURES.SUPPLEMENTAL_REPORT.ENABLED &&
                !isGovernment &&
                (['DRAFT', 'RETURNED'].indexOf(currentStatus) >= 0 ||
                  newReport) &&
                user.hasPermission('SUBMIT_COMPLIANCE_REPORT') && (
                  <Button
                    disabled={!checkboxConfirmed}
                    buttonType="submit"
                    action={() => handleSubmit('SUBMITTED')}
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
  );
};

SupplementaryDetailsPage.defaultProps = {
  isReassessment: undefined,
  ldvSales: undefined,
  newReport: false,
  obligationDetails: [],
  query: {},
  ratios: {}
};

SupplementaryDetailsPage.propTypes = {
  addSalesRow: PropTypes.func.isRequired,
  analystAction: PropTypes.bool.isRequired,
  checkboxConfirmed: PropTypes.bool.isRequired,
  commentArray: PropTypes.shape().isRequired,
  deleteFiles: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  details: PropTypes.shape().isRequired,
  directorAction: PropTypes.bool.isRequired,
  files: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  handleAddIdirComment: PropTypes.func.isRequired,
  handleCheckboxClick: PropTypes.func.isRequired,
  handleCommentChange: PropTypes.func.isRequired,
  handleCommentChangeBceid: PropTypes.func.isRequired,
  handleCommentChangeIdir: PropTypes.func.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  handleSupplementalChange: PropTypes.func.isRequired,
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  isReassessment: PropTypes.bool,
  ldvSales: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  loading: PropTypes.bool.isRequired,
  newBalances: PropTypes.shape().isRequired,
  newData: PropTypes.shape().isRequired,
  newReport: PropTypes.bool,
  obligationDetails: PropTypes.arrayOf(PropTypes.shape()),
  query: PropTypes.shape(),
  radioDescriptions: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  ratios: PropTypes.shape(),
  salesRows: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  setDeleteFiles: PropTypes.func.isRequired,
  setSupplementaryAssessmentData: PropTypes.func.isRequired,
  setUploadFiles: PropTypes.func.isRequired,
  supplementaryAssessmentData: PropTypes.shape().isRequired,
  user: CustomPropTypes.user.isRequired
};

export default SupplementaryDetailsPage;
