import axios from 'axios';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import parse from 'html-react-parser';

import Loading from '../../app/components/Loading';
import Modal from '../../app/components/Modal';
import SupplementaryAlert from './SupplementaryAlert';
import Button from '../../app/components/Button';
import ZevSales from './ZevSales';
import SupplierInformation from './SupplierInformation';
import CreditActivity from './CreditActivity';
import UploadEvidence from './UploadEvidence';
import CommentInput from '../../app/components/CommentInput';
import ROUTES_COMPLIANCE from '../../app/routes/Compliance';
import DisplayComment from '../../app/components/DisplayComment';
import formatNumeric from '../../app/utilities/formatNumeric';
import CustomPropTypes from '../../app/utilities/props';

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
    isReassessment,
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
  } = props;

  if (loading) {
    return <Loading />;
  }

  const [showModal, setShowModal] = useState(false);
  const [showModalDraft, setShowModalDraft] = useState(false);
  const reportYear = details.assessmentData && details.assessmentData.modelYear;
  const supplierClass = details.assessmentData && details.assessmentData.supplierClass[0];
  const creditReductionSelection = details.assessmentData && details.assessmentData.creditReductionSelection;
  const newLdvSales = newData && newData.supplierInfo && newData.supplierInfo.ldvSales;
  const currentStatus = details.actualStatus ? details.actualStatus : details.status;

  const formattedPenalty = details.assessment ? formatNumeric(details.assessment.assessmentPenalty, 0) : 0;
  const assessmentDecision = supplementaryAssessmentData.supplementaryAssessment.decision && supplementaryAssessmentData.supplementaryAssessment.decision.description ? supplementaryAssessmentData.supplementaryAssessment.decision.description.replace(/{user.organization.name}/g, details.assessmentData.legalName).replace(/{modelYear}/g, details.assessmentData.modelYear).replace(/{penalty}/g, `$${formattedPenalty} CAD`) : '';
  const showDescription = (each) => (
    <div className="mb-3" key={each.id}>
      <input
        // defaultChecked={details.assessment.decision.description === each.description}
        className="mr-3"
        type="radio"
        name="assessment"
        disabled={!analystAction || ['RECOMMENDED', 'ASSESSED'].indexOf(currentStatus) >= 0}
        onChange={() => {
          setSupplementaryAssessmentData({
            ...supplementaryAssessmentData,
            supplementaryAssessment: {
              ...supplementaryAssessmentData.supplementaryAssessment,
              decision: {
                description: each.description,
                id: each.id,
              },
            },
          });
        }}
      />
      {each.description
      && (
      <label className="d-inline text-blue" htmlFor="complied">
        {each.description
          .replace(/{user.organization.name}/g, details.assessmentData.legalName)
          .replace(/{modelYear}/g, details.assessmentData.modelYear)}
      </label>
      )}
    </div>
  );

  const modal = (
    <Modal
      cancelLabel="No"
      confirmLabel="Yes"
      handleCancel={() => { setShowModal(false); }}
      handleSubmit={() => { setShowModal(false); handleSubmit('RECOMMENDED'); }}
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

  const modalDraft = (
    <Modal
      cancelLabel="No"
      confirmLabel="Yes"
      handleCancel={() => { setShowModalDraft(false); }}
      handleSubmit={() => { setShowModalDraft(false); handleSubmit(currentStatus); }}
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
  );

  let disabledRecommendBtn = false;
  let recommendTooltip = '';

  if (!assessmentDecision) {
    disabledRecommendBtn = true;
    recommendTooltip = 'Please select an Analyst Recommendation before recommending this assessment.';
  }

  return (
    <div id="supplementary" className="page">
      <div className="row mt-3">
        <div className="col">
          <h2 className="mb-2">{isReassessment ? `${reportYear} Model Year Report Reassessment` : `${reportYear} Model Year Supplementary Report`}</h2>
        </div>
      </div>
      <div className="supplementary-form">
        <div className="supplementary-alert mt-2">
          <SupplementaryAlert
            id={id}
            date={moment(details.updateTimestamp).format('MMM D, YYYY')}
            status={details.status}
            user={user.username}
          />
        </div>
        <div className="report-assessment-history">
          <h3 className="mb-2">Model Year Report Assessment History</h3>
          <div className="grey-border-area">
            <ul>
              <li><u>Notice of Assessment Oct. 11, 2021</u></li>
            </ul>
          </div>
        </div>
        {(isReassessment || (analystAction || directorAction))
        && currentStatus !== 'ASSESSED'
        && (
        <div className="supplementary-form my-3">
          {commentArray && commentArray.idirComment && commentArray.idirComment.length > 0
         && (
         <DisplayComment
           commentArray={commentArray.idirComment}
         />
         )}
          <div id="comment-input">
            <CommentInput
              handleCommentChange={handleCommentChangeIdir}
              title={analystAction ? 'Add comment to director: ' : 'Add comment to the analyst'}
              buttonText="Add Comment"
              handleAddComment={handleAddIdirComment}
              buttonDisable={!details.id}
            />
          </div>
        </div>
        )}
      </div>
      <div className="supplementary-form mt-2">
        <div className="mb-3">
          <SupplierInformation
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
          />
          <CreditActivity
            creditReductionSelection={creditReductionSelection}
            details={details}
            handleInputChange={handleInputChange}
            handleSupplementalChange={handleSupplementalChange}
            ldvSales={ldvSales}
            newBalances={newBalances}
            newData={newData}
            newLdvSales={newLdvSales}
            obligationDetails={obligationDetails}
            ratios={ratios}
            supplierClass={supplierClass}
          />
        </div>
        <div id="comment-input">
          {!user.isGovernment && currentStatus === 'DRAFT' && (
          <CommentInput
            defaultComment={details && details.comments && details.comments.length > 0 ? details.comments[0] : ''}
            handleCommentChange={handleCommentChange}
            title="Provide details in the comment box below for any changes above."
          />
          )}
        </div>
        {!user.isGovernment && currentStatus === 'DRAFT' && (
        <UploadEvidence
          details={details}
          deleteFiles={deleteFiles}
          files={files}
          setDeleteFiles={setDeleteFiles}
          setUploadFiles={setUploadFiles}
        />
        )}
        {user.isGovernment && details && currentStatus === 'SUBMITTED'
        && ((details.fromSupplierComments && details.fromSupplierComments.length > 0) || (details.attachments && details.attachments.length > 0))
        && (
        <div className="display-supplier-info grey-border-area mt-3">
          {details && details.fromSupplierComments && details.fromSupplierComments.length > 0
         && (
         <div className="supplier-comment">
           <h4>Supplier Comments</h4>
           <span className="text-blue">{parse(details.fromSupplierComments[0].comment)}</span>
         </div>
         )}
          {details && details.attachments && details.attachments.length > 0 && (
          <div className="supplier-attachment mt-2">
            <h4>Supplementary Report Attachments</h4>
            {details.attachments.filter((attachment) => (
              deleteFiles.indexOf(attachment.id) < 0
            )).map((attachment) => (
              <div className="row" key={attachment.id}>
                <div className="col-8 filename">
                  <button
                    className="link"
                    onClick={() => {
                      axios.get(attachment.url, {
                        responseType: 'blob',
                        headers: {
                          Authorization: null,
                        },
                      }).then((response) => {
                        const objectURL = window.URL.createObjectURL(
                          new Blob([response.data]),
                        );
                        const link = document.createElement('a');
                        link.href = objectURL;
                        link.setAttribute('download', attachment.filename);
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
      {(supplementaryAssessmentData.supplementaryAssessment && supplementaryAssessmentData.supplementaryAssessment.decision
        && supplementaryAssessmentData.supplementaryAssessment.decision.description)
        && (!user.isGovernment || (user.isGovernment && ['ASSESSED', 'RECOMMENDED'].indexOf(currentStatus) >= 0)) && (
          <>
            <h3 className="mt-4 mb-1">Director Reassessment</h3>
            <div className="row mb-3">
              <div className="col-12">
                <div className="grey-border-area comment-box p-3 mt-2">
                  <div className="text-blue">
                    <div>The Director has assessed that {assessmentDecision}
                    </div>
                    {commentArray.bceidComment && commentArray.bceidComment.comment
                    && <div className="mt-2">{parse(commentArray.bceidComment.comment)}</div>}
                  </div>
                </div>
              </div>
            </div>
          </>
      )}
      {(analystAction || directorAction) && ['ASSESSED'].indexOf(currentStatus) < 0
      && (
        <>
          {['RECOMMENDED'].indexOf(currentStatus) < 0 && (
          <h3 className="mt-4 mb-1">Analyst Recommended Director Assessment</h3>
          )}
          <div className="row mb-3">
            <div className="col-12">
              <div className="grey-border-area  p-3 mt-2">
                <div>
                  {['RECOMMENDED'].indexOf(currentStatus) < 0 && (
                  <>
                    {radioDescriptions && radioDescriptions.map((each) => (
                      (each.displayOrder === 0) && showDescription(each)
                    ))}
                    <div className="text-blue mt-3 ml-3 mb-1">
                      &nbsp;&nbsp; {details.assessmentData.legalName} has not complied with section 10 (2) of the
                      Zero-Emission Vehicles Act for the {details.assessmentData.modelYear} adjustment period.
                    </div>
                    {radioDescriptions && radioDescriptions.map((each) => (
                      (each.displayOrder > 0) && showDescription(each)
                    ))}
                    <label className="d-inline" htmlFor="penalty-radio">
                      <div>
                        <input
                          disabled={directorAction
                          || assessmentDecision.indexOf('Section 10 (3) applies') < 0}
                          type="text"
                          className="ml-4 mr-1"
                          defaultValue={supplementaryAssessmentData.supplementaryAssessment.assessmentPenalty}
                          name="penalty-amount"
                          onChange={(e) => {
                            setSupplementaryAssessmentData({
                              ...supplementaryAssessmentData,
                              supplementaryAssessment: {
                                ...supplementaryAssessmentData.supplementaryAssessment,
                                assessmentPenalty: e.target.value,
                              },
                            });
                          }}
                        />
                        <label className="text-grey" htmlFor="penalty-amount">$5,000 CAD x ZEV unit deficit</label>
                      </div>
                    </label>
                  </>
                  )}
                  {(analystAction || directorAction) && (
                  <div id="comment-input">
                    <CommentInput
                      // disable={details.assessment.validationStatus === 'ASSESSED'}
                      defaultComment={commentArray && commentArray.bceidComment ? commentArray.bceidComment : ''}
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
      {!user.isGovernment && user.hasPermission('SUBMIT_COMPLIANCE_REPORT') && currentStatus === 'DRAFT'
      && (
      <div className="mt-3">
        <input
          defaultChecked={checkboxConfirmed}
          className="mr-2"
          id="supplier-confirm-checkbox"
          name="confirmations"
          onChange={(event) => { handleCheckboxClick(event); }}
          type="checkbox"
        />
        <label htmlFor="supplier-confirm-checkbox">
          On behalf of {details.assessmentData.legalName} I confirm the information included in the this Model Year Report is complete and correct.
        </label>
      </div>
      )}
      <div className="row">
        <div className="col-12">
          <div className="action-bar">
            <span className="left-content">
              <Button
                buttonType="back"
                locationRoute={ROUTES_COMPLIANCE.REPORT_ASSESSMENT.replace(/:id/g, id)}
              />
              {currentStatus === 'DRAFT'
              && (
              <Button
                buttonType="delete"
                action={() => handleSubmit('DELETED')}
              />
              )}
              {user.isGovernment && (currentStatus === 'SUBMITTED' || currentStatus === 'RECOMMENDED')
                && (
                <button
                  className="button text-danger"
                  onClick={() => {
                    handleSubmit('RETURNED');
                  }}
                  type="button"
                >
                  {currentStatus === 'SUBMITTED' ? 'Return to Vehicle Supplier' : 'Return to Analyst'}
                </button>
                )}
            </span>
            <span className="right-content">
              {((!user.isGovernment && currentStatus === 'DRAFT')
              || ((currentStatus === 'SUBMITTED' || currentStatus === 'RECOMMENDED') && user.isGovernment)) && (
              <Button
                buttonType="save"
                action={() => {
                  setShowModalDraft(true);
                }}
              />
              )}
              {analystAction && (['RECOMMENDED', 'ASSESSED'].indexOf(currentStatus) < 0 || currentStatus === 'RETURNED') && (
              <Button
                buttonTooltip={recommendTooltip}
                buttonType="submit"
                optionalClassname="button primary"
                optionalText="Recommend Reassessment"
                disabled={disabledRecommendBtn}
                action={() => {
                  // handleSubmit('RECOMMENDED');
                  setShowModal(true);
                }}
              />
              )}
              {directorAction && currentStatus === 'RECOMMENDED' && (
              <Button
                buttonType="submit"
                optionalClassname="button primary"
                optionalText="Issue Assessment"
                action={() => handleSubmit('ASSESSED')}
              />
              )}
              {!user.isGovernment && currentStatus === 'DRAFT' && user.hasPermission('SUBMIT_COMPLIANCE_REPORT')
              && (
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
    </div>
  );
};

SupplementaryDetailsPage.defaultProps = {
  isReassessment: undefined,
  ldvSales: undefined,
  obligationDetails: [],
  ratios: {},
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
  id: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]).isRequired,
  isReassessment: PropTypes.bool,
  ldvSales: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]),
  loading: PropTypes.bool.isRequired,
  newBalances: PropTypes.shape().isRequired,
  newData: PropTypes.shape().isRequired,
  obligationDetails: PropTypes.arrayOf(PropTypes.shape()),
  radioDescriptions: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  ratios: PropTypes.shape(),
  salesRows: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  setDeleteFiles: PropTypes.func.isRequired,
  setSupplementaryAssessmentData: PropTypes.func.isRequired,
  setUploadFiles: PropTypes.func.isRequired,
  supplementaryAssessmentData: PropTypes.shape().isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default SupplementaryDetailsPage;
