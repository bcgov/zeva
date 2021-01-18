import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import PropTypes from 'prop-types';

import Button from '../../app/components/Button';
import ROUTES_CREDIT_REQUESTS from '../../app/routes/CreditRequests';
import download from '../../app/utilities/download';
import FileDropArea from '../../app/components/FileDropArea';
import getFileSize from '../../app/utilities/getFileSize';

const CreditRequestsUploadPage = (props) => {
  const {
    errorMessage,
    files,
    setErrorMessage,
    setEvidenceErrorMessage,
    evidenceErrorMessage,
    setUploadFiles,
    upload,
    icbcDate,
    uploadEvidenceFiles,
    setEvidenceUploadFiles,
    evidenceCheckbox,
    setEvidenceCheckbox,
    showProgressBars
  } = props;
//
//
// PROGRESS BARS NEEED TO BE ADDED
//
//
  const handleCheckboxChange = (event) => {
    const { value, name } = event.target;
    if (event.target.checked) {
      setEvidenceCheckbox(true);
    } else {
      setEvidenceCheckbox(false);
    }
  };
  const downloadTemplate = (e) => {
    const element = e.target;
    const original = element.innerHTML;
    element.firstChild.textContent = ' Downloading...';
    return download(ROUTES_CREDIT_REQUESTS.TEMPLATE, {}).then(() => {
      element.innerHTML = original;
    });
  };

  return (
    <div id="sales-edit" className="page">
      <div className="row mt-3 mb-2">
        <div className="col-12">
          <h2 className="mb-2">Application for Credits for Consumer Sales</h2>
          <h3 className="sales-upload-grey">
            Download an Excel template containing all eligible ZEV models to submit consumer sales
          </h3>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="compact content p-3">
            <Button
              buttonType="download"
              optionalText="Download Excel Sales Template"
              action={(e) => { downloadTemplate(e); }}
            />
          </div>
        </div>
      </div>

      <div className="row mt-5 mb-2">
        <div className="col-12">
          <h2 className="mb-2">Upload ZEV Sales Information</h2>
          <p>
            Credits can be issued for active ZEV sales made prior to {icbcDate}.
          </p>
        </div>
      </div>
      <FileDropArea
        type="excel"
        errorMessage={errorMessage}
        files={files}
        setErrorMessage={setErrorMessage}
        setUploadFiles={setUploadFiles}
      />
      <div className="row mt-5 mb-2">
        <div className="col-12">
          <h2 className="mb-2">Upload Sales Evidence</h2>
          <p>
            If you are reapplying for credits for VIN that were previously returned as errors you can upload additional sales evidence to support your credit application.
          </p>
          <div>
            <input
              type="checkbox"
              name="evidence-upload-checkbox"
              id="evidence-upload-checkbox"
              onChange={(event) => { handleCheckboxChange(event); }}
              defaultChecked={evidenceCheckbox}
              className="m-3"
            />
            <span className="text-blue">
              Upload sales evidence document (in addition to the Excel ZEV Sales Information above)
            </span>
          </div>
        </div>
      </div>
      {evidenceCheckbox === true
      && (
      <FileDropArea
        type="pdf"
        errorMessage={evidenceErrorMessage}
        files={uploadEvidenceFiles}
        setErrorMessage={setEvidenceErrorMessage}
        setUploadFiles={setEvidenceUploadFiles}
      />
      )}
      <div className="action-bar">
        <span className="left-content">
          <Button
            buttonType="back"
            locationRoute={ROUTES_CREDIT_REQUESTS.LIST}
          />
        </span>
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

  );
};

CreditRequestsUploadPage.defaultProps = {
  errorMessage: '',
  icbcDate: '',
};

CreditRequestsUploadPage.propTypes = {
  errorMessage: PropTypes.string,
  files: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  icbcDate: PropTypes.string,
  setErrorMessage: PropTypes.func.isRequired,
  setUploadFiles: PropTypes.func.isRequired,
  upload: PropTypes.func.isRequired,
};

export default CreditRequestsUploadPage;
