import React from 'react';
import PropTypes from 'prop-types';
import Loading from '../../app/components/Loading';
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
    details,
    files,
    handleAddDirectorComment,
    handleCheckboxClick,
    handleCommentChange,
    handleDirectorCommentChange,
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
  return (
    <div id="supplementary" className="page">
      <div className="row mt-3">
        <div className="col">
          <h2 className="mb-2">{userType.isReassessment ? `${reportYear} Model Year Report Reassessment` : `${reportYear} Model Year Supplementary Report`}</h2>
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
             handleCommentChange={handleDirectorCommentChange}
             title="Add comment to the Director."
             buttonText="Add Comment"
             handleAddComment={handleAddDirectorComment}
             buttonDisable={!details.id}
           />
         </div>
       </div>
       )}
      <div className="supplementary-form">
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
          <CommentInput
            defaultComment={details && details.comments && details.comments.length > 0 ? details.comments[0] : ''}
            handleCommentChange={handleCommentChange}
            title="Provide details in the comment box below for any changes above."
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
            </span>
            {details.status === 'DRAFT'
            && (
            <span className="right-content">
              <Button
                buttonType="save"
                action={() => handleSubmit('DRAFT')}
              />
              {!user.isGovernment && user.hasPermission('SUBMIT_COMPLIANCE_REPORT')
              && (
              <Button
                disabled={!checkboxConfirmed}
                buttonType="submit"
                action={() => handleSubmit('SUBMITTED')}
              />
              )}
            </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplementaryDetailsPage;
