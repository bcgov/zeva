import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ROUTES_SALES from '../../app/routes/Sales';
import download from '../../app/utilities/download';

import CustomPropTypes from '../../app/utilities/props';
import ExcelFileDrop from './ExcelFileDrop';

const SalesSubmissionPage = (props) => {
  const {
    files,
    setUploadFile,
    upload,
    years,
  } = props;

  const [selectedYear, setSelectedYear] = useState(null);

  const getFileSize = (bytes) => {
    if (bytes === 0) {
      return '0 bytes';
    }

    const k = 1000;
    const sizes = ['bytes', 'KB', 'MB', 'GB', 'TB'];
    let i = Math.floor(Math.log(bytes) / Math.log(k));

    if (i > 4) { // nothing bigger than a terrabyte
      i = 4;
    }

    const filesize = parseFloat((bytes / k ** i).toFixed(1));

    return `${filesize} ${sizes[i]}`;
  };

  return (
    <div id="sales-edit" className="page">
      <h2>Submit ZEV Sales for Credit Request</h2>
      <p>
        Download an Excel template containing all active ZEV models to submit sales.
      </p>

      <div className="compact">
        <div className="content">
          <select
            defaultValue="Select a model year"
            onChange={(e) => {
              setSelectedYear(e.target.value);
            }}
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

      <h2>Upload ZEV Sales Information</h2>

      <div className="compact">
        <div className="bordered">
          <div className="content">
            <div className="panel panel-default">
              <ExcelFileDrop setFiles={setUploadFile} />

              <div className="files">
                <div className="row">
                  <div className="col-8 header">Filename</div>
                  <div className="col-3 size header">Size</div>
                  <div className="col-1 actions header" />
                </div>
                {files.map((file) => (
                  <div className="row" key={file.name}>
                    <div className="col-8">{file.name}</div>
                    <div className="col-3 size">{getFileSize(file.size)}</div>
                    <div className="col-1 actions">
                      <button className="delete" type="button">
                        <FontAwesomeIcon icon="trash" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="action-bar">
                <span className="left-content" />

                <span className="right-content">
                  <button
                    disabled={files.length === 0}
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
        </div>
      </div>

      <div className="clearfix" />
    </div>
  );
};

SalesSubmissionPage.defaultProps = {};

SalesSubmissionPage.propTypes = {
  files: PropTypes.arrayOf(PropTypes.shape).isRequired,
  upload: PropTypes.func.isRequired,
  setUploadFile: PropTypes.func.isRequired,
  years: CustomPropTypes.years.isRequired,
};

export default SalesSubmissionPage;
