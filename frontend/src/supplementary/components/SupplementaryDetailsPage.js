import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import Loading from '../../app/components/Loading';
import SupplementaryAlert from './SupplementaryAlert';
import Button from '../../app/components/Button';
import ZevSales from './ZevSales';
import SupplierInformation from './SupplierInformation';
import CreditActivity from './CreditActivity';
import UploadEvidence from './UploadEvidence';
import CommentInput from '../../app/components/CommentInput';
import ROUTES_COMPLIANCE from '../../app/routes/Compliance';
import DisplayComment from '../../app/components/DisplayComment';
import Comment from '../../app/components/Comment';

const SupplementaryDetailsPage = (props) => {
  const {
    addSalesRow,
    checkboxConfirmed,
    commentArray,
    deleteFiles,
    analystAction,
    directorAction,
    details,
    files,
    handleCheckboxClick,
    handleCommentChange,
    handleAddIdirComment,
    handleCommentChangeIdir,
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
    user,
    radioDescriptions,
  } = props;
  if (loading) {
    return <Loading />;
  }
  const reportYear = details.assessmentData && details.assessmentData.modelYear;
  const supplierClass = details.assessmentData && details.assessmentData.supplierClass[0];
  const creditReductionSelection = details.assessmentData && details.assessmentData.creditReductionSelection;
  const newLdvSales = newData && newData.supplierInfo && newData.supplierInfo.ldvSales;
  const userType = {
    //need to add to condition to account for whether it is reassessment or supplemental report for analyst or bceid
    isReassessment: user.isGovernment && user.hasPermission('RECOMMEND_COMPLIANCE_REPORT'),
    isBceid: !user.isGovernment,
    isAnalyst: user.isGovernment && user.hasPermission('RECOMMEND_COMPLIANCE_REPORT'),
  };

  //const assessmentDecision = details.assessment.decision && details.assessment.decision.description ? details.assessment.decision.description.replace(/{user.organization.name}/g, 'Tesla').replace(/{modelYear}/g, 2020) : '';
  const showDescription = (each) => (
    <div className="mb-3" key={each.id}>
      <input
        //defaultChecked={details.assessment.decision.description === each.description}
        className="mr-3"
        type="radio"
        name="assessment"
        disabled={!analystAction || ['RECOMMENDED', 'ASSESSED'].indexOf(details.status) >= 0}
        onChange={() => {
          setDetails({
            ...details,
            assessment: {
              ...details.assessment,
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
          .replace(/{user.organization.name}/g, 'Tesla')
          .replace(/{modelYear}/g, 2020)}
      </label>
      )}
    </div>
  );

  return (
    <div id="supplementary" className="page">
      <div className="row mt-3">
        <div className="col">
          <h2 className="mb-2">{userType.isReassessment ? `${reportYear} Model Year Report Reassessment` : `${reportYear} Model Year Supplementary Report`}</h2>
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
        {userType.isReassessment
        && (
        <div className="supplementary-form my-3">
         {commentArray && commentArray.length > 0
         && (
         <DisplayComment
           commentArray={commentArray}
         />
         )}
         <div id="comment-input">
           <CommentInput
             defaultComment={details && details.comments && details.comments.length > 0 ? details.comments[0] : ''}
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
            userType={userType}
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
        {!user.isGovernment && details.status === 'DRAFT' && <CommentInput
            defaultComment={details && details.comments && details.comments.length > 0 ? details.comments[0] : ''}
            handleCommentChange={handleCommentChange}
            title="Provide details in the comment box below for any changes above."
          />}
        </div>
        {!user.isGovernment && details.status === 'DRAFT' && <UploadEvidence
          details={details}
          deleteFiles={deleteFiles}
          files={files}
          setDeleteFiles={setDeleteFiles}
          setUploadFiles={setUploadFiles}
        />}
      </div>
      {(analystAction || directorAction) && <div className="row mb-3">
            <div className="col-12">
              <div className="grey-border-area  p-3 mt-2">
                <div>
                  {['RECOMMENDED'].indexOf(details.status) < 0 && (
                  <>
                    {radioDescriptions.map((each) => (
                      (each.displayOrder === 0) && showDescription(each)
                    ))}
                    <div className="text-blue mt-3 ml-3 mb-1">
                      &nbsp;&nbsp; {} has not complied with section 10 (2) of the
                      Zero-Emission Vehicles Act for the {2020} adjustment period.
                    </div>
                    {radioDescriptions.map((each) => (
                      (each.displayOrder > 0) && showDescription(each)
                    ))}
                    <label className="d-inline" htmlFor="penalty-radio">
                      <div>
                        <input
                          disabled={directorAction}
                          type="text"
                          className="ml-4 mr-1"
                          //defaultValue={details.assessment.assessmentPenalty}
                          name="penalty-amount"
                          onChange={(e) => {
                            setDetails({
                              ...details,
                              assessment: {
                                ...details.assessment,
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
                   {(analystAction || directorAction) && <div id="comment-input">
                    <CommentInput
                      //disable={details.assessment.validationStatus === 'ASSESSED'}
                      //defaultComment={details.bceidComment}
                      //handleAddComment={handleAddBceidComment}
                      //handleCommentChange={handleCommentChangeBceid}
                      title="Assessment Message to the Supplier: "
                    />
                    </div>
                   } 
                </div>
              </div>
            </div>
        </div>}
      {!user.isGovernment && user.hasPermission('SUBMIT_COMPLIANCE_REPORT') && details.status === 'DRAFT'
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
              {details.status === 'DRAFT'
              && (
              <Button
                buttonType="delete"
                action={() => handleSubmit('DELETED')}
              />
              )}
              {details.status === 'SUBMITTED' &&
                <button
                    className="button text-danger"
                    onClick={() => {
                      handleSubmit('RETURNED');
                    }}
                    type="button"
                  >
                    Return to Vehicle Supplier
                </button>
              }
            </span>
            <span className="right-content">
              {(details.status !== 'SUBMITTED' && !user.isGovernment) &&
                <Button
                  buttonType="save"
                  action={() => handleSubmit('')}
                />
              }
              {analystAction && (
                  <Button
                    buttonType="submit"
                    optionalClassname="button primary"
                    optionalText="Recommend Reassessment"
                    action={() => {
                      handleSubmit('RECOMMENDED');
                    }}
                  />
              )}
              {!user.isGovernment && details.status === 'DRAFT' && user.hasPermission('SUBMIT_COMPLIANCE_REPORT')
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
    </div>
  );
};

SupplementaryDetailsPage.propTypes = {}

export default SupplementaryDetailsPage;
