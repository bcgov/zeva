import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ROUTES_SALES from '../../app/routes/Sales';
import download from '../../app/utilities/download';

import CustomPropTypes from '../../app/utilities/props';
import ExcelFileDrop from './ExcelFileDrop';

const SalesSubmissionPage = (props) => {
  const {
    upload,
    setUploadFile,
    uploadReady,
    years,
  } = props;

  const [selectedYear, setSelectedYear] = useState(null);

  const actionbar = (
    <div className="row">
      <div className="col-sm-12">
        <div className="action-bar">
          <span className="left-content">
              Step 1 of 3
          </span>
          <span className="right-content">
            <button
              disabled={!uploadReady}
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
      <div>
        <div>
          <h2>Submit ZEV Sales for Credit Request</h2>
          <p>
            Download an Excel template containing all active ZEV models to submit sales.
          </p>

          <div className="well">
            <select
              onChange={(e) => {
                setSelectedYear(e.target.value);
              }}
              defaultValue="Select a model year"
            >
              <option>Select a model year</option>
              {years.map((y) => (<option key={y.name} value={y.name}>{y.name}</option>))}
            </select>
            <button
              className="button"
              disabled={selectedYear === null || selectedYear === 'Select a model year'}
              onClick={(e) => {
                const element = e.target;
                const original = element.innerHTML;

                element.firstChild.textContent = ' Downloading...';

                return download(ROUTES_SALES.TEMPLATE.replace(':yearName', selectedYear), {}).then(() => {
                  element.innerHTML = original;
                });
              }}
              type="button"
            >
              <FontAwesomeIcon icon="download" /> Download Excel Sales Template
            </button>
          </div>
        </div>
      </div>

      <div
        className="row"
      >
        <div
          className="col-sm-12"
        >
          <h2>Upload ZEV Sales Information</h2>

          <div className="panel panel-default">
            <ExcelFileDrop setFiles={setUploadFile} />
          </div>
        </div>
      </div>

      {actionbar}
    </div>
  );
};

SalesSubmissionPage.defaultProps = {};

SalesSubmissionPage.propTypes = {
  upload: PropTypes.func.isRequired,
  setUploadFile: PropTypes.func.isRequired,
  uploadReady: PropTypes.bool.isRequired,
  years: CustomPropTypes.years.isRequired,
};

export default SalesSubmissionPage;
