import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import PropTypes from 'prop-types';

import Alert from '../../app/components/Alert';
import Button from '../../app/components/Button';
import ExcelFileDrop from '../../app/components/FileDrop';
import getFileSize from '../../app/utilities/getFileSize';

const UploadVerificationData = (props) => {
  const {
    title,
    files,
    setUploadFiles,
    upload,
    setDateCurrentTo,
    previousDateCurrentTo,
    alertMessage,
  } = props;

  const removeFile = (removedFile) => {
    const found = files.findIndex((file) => (file === removedFile));
    files.splice(found, 1);
    setUploadFiles([...files]);
  };

  const handleCalendarChange = (event) => {
    const { value } = event.target;
    setDateCurrentTo(value);
  };

  return (
    <div id="upload-verification-data" className="page">
      <div className="row mt-3 mb-2">
        <div className="col-12">
          <h2>{title}</h2>
          {alertMessage && (
            <div className="mt-2">
              <Alert optionalMessage={alertMessage} optionalClassname={alertMessage === 'upload successful' ? 'alert-success' : 'alert-danger'} />
            </div>
          )}
        </div>
      </div>

      <div className="row">
        <div className="col-md-12 col-lg-9 col-xl-6">
          <div className="mb-2">ICBC data current to: {previousDateCurrentTo}</div>

          <div className="bordered">
            <div className="panel panel-default">
              <div className="content p-3">
                <ExcelFileDrop setFiles={setUploadFiles} maxFiles={1} />
              </div>
              {files.length > 0 && (
              <div className="files px-3">
                <div className="row pb-1">
                  <div className="col-8 header"><label htmlFor="filename">Filename</label></div>
                  <div className="col-3 size header"><label htmlFor="filesize">Size</label></div>
                  <div className="col-1 actions header" />
                </div>
                {files.map((file) => (
                  <div className="row py-1" key={file.name}>
                    <div className="col-8">{file.name}</div>
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

          <div className="mt-2">
            <label id="date-label" htmlFor="current-to">Date current to:</label>

            <div>
              <input
                type="date"
                id="date-current-to"
                name="date-current-to"
                onChange={handleCalendarChange}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="action-bar">
        <span className="left-content">
          <Button buttonType="back" />
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

UploadVerificationData.defaultProps = {
  alertMessage: '',
  previousDateCurrentTo: '',
};

UploadVerificationData.propTypes = {
  files: PropTypes.arrayOf(PropTypes.shape).isRequired,
  setUploadFiles: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  upload: PropTypes.func.isRequired,
  setDateCurrentTo: PropTypes.func.isRequired,
  previousDateCurrentTo: PropTypes.string,
  alertMessage: PropTypes.string,
};

export default UploadVerificationData;
