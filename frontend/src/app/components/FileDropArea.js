import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import PropTypes from 'prop-types';
import FileDrop from './FileDrop';
import FileDropEvidence from './FileDropEvidence';
import getFileSize from '../utilities/getFileSize';

const FileDropArea = (props) => {
  const {
    errorMessage,
    evidenceDeleteList,
    files,
    progressBars,
    setErrorMessage,
    setEvidenceDeleteList,
    setUploadFiles,
    showProgressBars,
    submission,
    type,
  } = props;
  const removeFile = (removedFile) => {
    const found = files.findIndex((file) => (file === removedFile));
    const newList = files.splice(found, 1);
    setErrorMessage('');
    setUploadFiles([...newList]);
    if (type === 'pdf') {
      const uploadedIds = submission.evidence.map((each) => each.id);
      if (uploadedIds.includes(removedFile.id)) {
        setEvidenceDeleteList([...evidenceDeleteList, removedFile.id]);
      }
    }
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
              && <FileDrop setErrorMessage={setErrorMessage} setFiles={setUploadFiles} maxFiles={1} />}
              {type === 'pdf'
          && (
          <>
            <FileDropEvidence
              getExistingFilesCount={() => (submission && submission.evidence ? (submission.evidence.length - evidenceDeleteList.length) : 0)}
              setErrorMessage={setErrorMessage}
              files={files}
              setFiles={setUploadFiles}
              maxFiles={5}
              allowedFileTypes="image/png, image/gif, image/jpg,image/jpeg, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            />
            <div className="form-group mt-4 row">
              <div className="col-12 text-blue">
                <div>
                  <strong>Limit of 5 files</strong>
                </div>
                <strong>Files</strong> (doc, docx, pdf, jpg, png, gif)
              </div>
            </div>
          </>
          )}

            </div>
            {(files.length > 0
            || (type === 'excel' && submission && submission.filename)
            || (type === 'pdf' && submission && (submission.evidence && submission.evidence.length > 0)))
            && (
            <div className="files px-3">
              <div className="row pb-1">
                <div className="col-8 header">Filename</div>
                <div className="col-3 size header">Size</div>
                <div className="col-1 actions header" />
              </div>
              {type === 'excel' && submission.filename && files.length === 0
              && (
              <div>{submission.filename}</div>
              )}
              {type === 'pdf' && submission && submission.evidence && submission.evidence
                .filter((submissionFile) => !evidenceDeleteList.includes(submissionFile.id))
                .map((submissionFile) => (
                  <div className="row py-1" key={`submission-${submissionFile.id}`}>
                    <div className="col-8 filename">{submissionFile.filename || submissionFile.name}</div>
                    {!showProgressBars && [
                      <div className="col-3 size">{getFileSize(submissionFile.size)}</div>,
                      <div className="col-1 actions">
                        <button
                          className="delete"
                          onClick={() => {
                            removeFile(submissionFile);
                          }}
                          type="button"
                        >
                          <FontAwesomeIcon icon="trash" />
                        </button>
                      </div>,
                    ]}
                  </div>
                ))}
              {files.map((file, index) => (
                <div className="row py-1" key={`file-${file.id}`}>
                  <div className="col-8 filename">{file.filename || file.name}</div>
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

FileDropArea.defaultProps = {
  errorMessage: '',
  evidenceDeleteList: [],
  files: [],
  progressBars: {},
  showProgressBars: false,
  submission: {},
  setEvidenceDeleteList: () => {},
};

FileDropArea.propTypes = {
  errorMessage: PropTypes.string,
  evidenceDeleteList: PropTypes.arrayOf(PropTypes.string),
  files: PropTypes.arrayOf(PropTypes.shape()),
  progressBars: PropTypes.shape(),
  setErrorMessage: PropTypes.func.isRequired,
  setEvidenceDeleteList: PropTypes.func,
  setUploadFiles: PropTypes.func.isRequired,
  showProgressBars: PropTypes.bool,
  submission: PropTypes.shape(),
  type: PropTypes.string.isRequired,
};

export default FileDropArea;
