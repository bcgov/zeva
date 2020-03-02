import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import PropTypes from 'prop-types';
import Dropzone from 'react-dropzone';

import CustomPropTypes from '../../app/utilities/props';
import history from '../../app/History';
import ExcelFileDrop from './ExcelFileDrop';

const SalesSubmissionPage = (props) => {
  const {
    mode,
    user,
    upload,
  } = props;

  const actionbar = (
    <div className="row">
      <div className="col-sm-12">
        <div className="action-bar">
          <span className="left-content">
              Step 1 of 3
          </span>
          <span className="right-content">
            <button
              className="button primary"
              onClick={() => upload()}
              type="button"
            >
              <FontAwesomeIcon icon="upload" /> Upload
            </button>
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div id="sales-edit" className="page">

      <div className="row">
        <div className="col-sm-12">
          <h1>{user.organization.name} Sales Submissions</h1>
          <p>
            Submit ZEV sales data to request early credits. Sales information submitted here
            will become part of your compliance report data.
          </p>
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12">
          <h2>ZEV Sales Excel Template</h2>
          <p>
            Download an Excel template to enter sales data: model year, vehicle,
            VIN, and sales date.
          </p>

          <div className="well">
            <button
              className="button"
              onClick={() => {
              }}
              type="button"
            >
              <FontAwesomeIcon icon="download" /> Download Excel Sales Template
            </button>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12">
          <h2>Upload ZEV Sales Information</h2>
          <p>
            One file per submission; all active ZEV models may be submitted in one file.
          </p>

          <div className="panel panel-default">
            <ExcelFileDrop />
          </div>
        </div>
      </div>

      {actionbar}
    </div>
  );
};

SalesSubmissionPage.defaultProps = {
  mode: 'edit',
};

SalesSubmissionPage.propTypes = {
  mode: PropTypes.oneOf(['add', 'edit']),
  upload: PropTypes.func.isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default SalesSubmissionPage;
