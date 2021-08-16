import React from 'react';
import PropTypes from 'prop-types';
import Loading from '../../app/components/Loading';
import Button from '../../app/components/Button';
import ZevSales from './ZevSales';
import SupplierInformation from './SupplierInformation';
import CreditActivity from './CreditActivity';
import CommentInput from '../../app/components/CommentInput';

const SupplementaryDetailsPage = (props) => {
  const {
    details, loading, handleAddComment, handleSubmit, handleInputChange, newData
  } = props;

  if (loading) {
    return <Loading />;
  }
  return (
    <div id="supplementary" className="page">
      <div className="row mt-3">
        <div className="col">
          <h2 className="mb-2">{details.assessmentData && details.assessmentData.modelYear} Model Year Supplementary Report</h2>
        </div>
      </div>
      <div className="supplementary-form">
        <SupplierInformation loading={loading} details={details} handleInputChange={handleInputChange} newData={newData} />
        <ZevSales details={details} handleInputChange={handleInputChange} />
        <CreditActivity details={details} handleInputChange={handleInputChange} />
        <div id="comment-input">

          <CommentInput
            handleAddComment={handleAddComment}
            title="Provide details in the comment box below for any changes above."
          />
        </div>
      </div>
      <div className="row">
        <div className="col-12">
          <div className="action-bar">
            <span className="left-content" />
            <span className="right-content">
              <Button
                buttonType="save"
                action={() => handleSubmit('DRAFT')}
              />
              <Button
                buttonType="submit"
                action={() => handleSubmit('SUBMITTED')}
              />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplementaryDetailsPage;
