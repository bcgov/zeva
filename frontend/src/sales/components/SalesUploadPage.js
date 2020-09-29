import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import PropTypes from 'prop-types';
import history from '../../app/History';
import Button from '../../app/components/Button';
import ROUTES_CREDITS from '../../app/routes/Credits';
import ROUTES_SALES from '../../app/routes/Sales';
import download from '../../app/utilities/download';
import ExcelFileDrop from '../../app/components/FileDrop';
import getFileSize from '../../app/utilities/getFileSize';

const SalesUploadPage = (props) => {
  const {
    errorMessage,
    files,
    setUploadFiles,
    upload,
  } = props;

  const downloadTemplate = (e) => {
    const element = e.target;
    const original = element.innerHTML;
    element.firstChild.textContent = ' Downloading...';
    return download(ROUTES_SALES.TEMPLATE, {}).then(() => {
      element.innerHTML = original;
    });
  };

  const removeFile = (removedFile) => {
    const found = files.findIndex((file) => (file === removedFile));
    files.splice(found, 1);

    setUploadFiles([...files]);
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
            Credits can be issued for active ZEV sales made prior to May 31, 2020.
          </p>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12 col-lg-9 col-xl-6">
          <div className="bordered">
            {errorMessage && (
            <div className="alert alert-danger mb-2" role="alert">
              {errorMessage}
            </div>
            )}

            <div className="panel panel-default">
              <div className="content p-3">
                <ExcelFileDrop setFiles={setUploadFiles} maxFiles={100000} />
              </div>
              {files.length > 0 && (
              <div className="files px-3">
                <div className="row pb-1">
                  <div className="col-8 header">Filename</div>
                  <div className="col-3 size header">Size</div>
                  <div className="col-1 actions header" />
                </div>
                {files.map((file) => (
                  <div className="row py-1" key={file.name}>
                    <div className="col-8 filename">{file.name}</div>
                    <div className="col-3 size">{getFileSize(file.size)}</div>
                    <div className="col-1 actions">
                      <button
                        className="delete"
                        onClick={() => {
                          removeFile(file);
                        }}
                        type="button"
                      >
                        <FontAwesomeIcon icon="trash" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="action-bar">
        <span className="left-content">
          <Button
            buttonType="back"
            locationRoute={ROUTES_CREDITS.CREDIT_REQUESTS}
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

SalesUploadPage.defaultProps = {
  errorMessage: '',
};

SalesUploadPage.propTypes = {
  errorMessage: PropTypes.string,
  files: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  setUploadFiles: PropTypes.func.isRequired,
  upload: PropTypes.func.isRequired,
};

export default SalesUploadPage;
