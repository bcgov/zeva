import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import PropTypes from 'prop-types';
import history from '../../app/History';

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

  const removeFile = (removedFile) => {
    const found = files.findIndex((file) => (file === removedFile));
    files.splice(found, 1);

    setUploadFiles([...files]);
  };

  return (
    <div id="sales-edit" className="page">
      <h2>Application for Credits for Consumer Sales</h2>
      <h5 className="sales-upload-grey">
        Download an Excel template containing all active ZEV models to submit consumer sales
      </h5>

      <div className="compact w-50">
        <div className="content">
          <button
            className="button"
            onClick={(e) => {
              const element = e.target;
              const original = element.innerHTML;

              element.firstChild.textContent = ' Downloading...';

              return download(ROUTES_SALES.TEMPLATE, {}).then(() => {
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
      <p>
        Credits can be issued for active ZEV sales made prior to May 31, 2020.
      </p>
      <div className="compact w-50">
        <div className="bordered">
          <div className="content">
            {errorMessage && (
            <div className="alert alert-danger" role="alert">
              <h4 className="alert-heading mb-4">We&apos;re sorry.</h4>
              {errorMessage}
            </div>
            )}

            <div className="panel panel-default">
              <ExcelFileDrop setFiles={setUploadFiles} maxFiles={100000} />
              {files.length > 0 && (
              <div className="files">
                <div className="row">
                  <div className="col-8 header">Filename</div>
                  <div className="col-3 size header">Size</div>
                  <div className="col-1 actions header" />
                </div>
                {files.map((file) => (
                  <div className="row" key={file.name}>
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

      <div className="clearfix" />

      <div className="action-bar">
        <span className="left-content">
          <button
            className="button"
            onClick={() => {
              history.push(ROUTES_SALES.LIST);
            }}
            type="button"
          >
            <FontAwesomeIcon icon="arrow-left" /> Back
          </button>
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
