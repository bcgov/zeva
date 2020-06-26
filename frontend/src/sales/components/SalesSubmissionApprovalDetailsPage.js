import React from 'react';
import PropTypes from 'prop-types';
import ButtonDelete from '../../app/components/ButtonDelete';
import ButtonDownload from '../../app/components/ButtonDownload';
import CustomPropTypes from '../../app/utilities/props';
import SalesSubmissionVehiclesTable from './SalesSubmissionVehiclesTable';

const SalesSubmissionApprovalDetailsPage = (props) => {
  const {
    handleDelete,
    handleDownload,
    routeParams,
    submission,
    user,
  } = props;
  return (
    <div id="sales-details" className="page">
      <div className="row">
        <div className="col-sm-12">
          <h1>Credit Request Submission (Report ZEV Sales)</h1>
          <b> {submission.records.length} VIN were rejected</b>
        </div>
      </div>

      <div className="action-bar">
        <ButtonDelete action={handleDelete} />
        <ButtonDownload action={handleDownload} buttonText="Download Rejected VIN as Excel" />
      </div>
      <div className="row">
        <div className="col-sm-12">
          <SalesSubmissionVehiclesTable
            routeParams={routeParams}
            submission={submission}
            user={user}
          />
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12">
          <div className="action-bar">
            <ButtonDelete action={handleDelete} />
            <ButtonDownload action={handleDownload} buttonText="Download Rejected VIN as Excel" />
          </div>
        </div>
      </div>

    </div>
  );
};

SalesSubmissionApprovalDetailsPage.defaultProps = {};

SalesSubmissionApprovalDetailsPage.propTypes = {
  handleDownload: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  routeParams: PropTypes.shape().isRequired,
  submission: PropTypes.shape().isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default SalesSubmissionApprovalDetailsPage;
