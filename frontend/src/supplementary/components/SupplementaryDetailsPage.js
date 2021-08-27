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

const SupplementaryDetailsPage = (props) => {
  const {
    addSalesRow,
    checkboxConfirmed,
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
    user,
  } = props;
  if (loading) {
    return <Loading />;
  }
  const reportYear = details.assessmentData && details.assessmentData.modelYear;
  const supplierClass = details.assessmentData && details.assessmentData.supplierClass[0];
  const creditReductionSelection = details.assessmentData && details.assessmentData.creditReductionSelection;
  const newLdvSales = newData && newData.supplierInfo && newData.supplierInfo.ldvSales;

  return (
    <div id="supplementary" className="page">
      <div className="row mt-3">
        <div className="col">
          <h2 className="mb-2">{reportYear} Model Year Supplementary Report</h2>
        </div>
      </div>
      <div className="supplementary-form">
        <div className="mb-3">
          <SupplierInformation
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
