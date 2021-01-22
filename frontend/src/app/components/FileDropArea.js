import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import PropTypes from 'prop-types';

import Button from './Button';
import ROUTES_CREDIT_REQUESTS from '../routes/CreditRequests';
import download from '../utilities/download';
import FileDrop from './FileDrop';
import getFileSize from '../utilities/getFileSize';

const FileDropArea = (props) => {
  const {
    type,
    errorMessage,
    files,
    setErrorMessage,
    setUploadFiles,
    showProgressBars,
    progressBars,
  } = props;
  const removeFile = (removedFile) => {
    const found = files.findIndex((file) => (file === removedFile));
    files.splice(found, 1);
    setErrorMessage('');
    setUploadFiles([...files]);
  };

  return (
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
              {type === 'excel'
              && <FileDrop setErrorMessage={setErrorMessage} setFiles={setUploadFiles} maxFiles={100000} />}
              {type === 'pdf'
          && <FileDrop setErrorMessage={setErrorMessage} setFiles={setUploadFiles} maxFiles={5} allowedFileTypes="image/png, image/gif, image/jpg,image/jpeg, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document" />}
            </div>
            {files.length > 0 && (
            <div className="files px-3">
              <div className="row pb-1">
                <div className="col-8 header">Filename</div>
                <div className="col-3 size header">Size</div>
                <div className="col-1 actions header" />
              </div>
              {files.map((file, index) => (
                <div className="row py-1" key={file.id}>
                  <div className="col-8 filename">{file.name}</div>
                  {!showProgressBars && [
                    <div className="col-3 size">{getFileSize(file.size)}</div>,
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
                    </div>,
                  ]}
                  {showProgressBars && index in progressBars && (
                  <div className="col-4">
                    <div className="progress">
                      <div
                        aria-valuemax="100"
                        aria-valuemin="0"
                        aria-valuenow={progressBars[index]}
                        className="progress-bar"
                        role="progressbar"
                        style={{
                          width: `${progressBars[index]}%`,
                        }}
                      >
                        {progressBars[index]}%
                      </div>
                    </div>
                  </div>
                  )}
                </div>
              ))}
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileDropArea;
