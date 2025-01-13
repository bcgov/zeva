import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import PropTypes from "prop-types";
import FileDrop from "./FileDrop";
import FileDropEvidence from "./FileDropEvidence";
import getFileSize from "../utilities/getFileSize";
import Modal from "./Modal";

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
    wholePageWidth,
  } = props;
  const [showModal, setShowModal] = React.useState(false);
  const [activeFile, setActiveFile] = React.useState(undefined);
  const removeFile = (removedFile) => {
    const found = files.findIndex((file) => file === removedFile);
    files.splice(found, 1);
    setErrorMessage("");
    setUploadFiles([...files]);
    if (type === "pdf") {
      const uploadedIds = submission.evidence.map((each) => each.id);
      if (uploadedIds.includes(removedFile.id)) {
        setEvidenceDeleteList([...evidenceDeleteList, removedFile.id]);
      }
    }
  };
  const formattedErrorMessage = errorMessage
    ? errorMessage.split("|").map((msg, index) => <div key={index}>{msg}</div>)
    : null;
  return (
    <div className="row">
      <div
        className={wholePageWidth ? "col-12" : "col-md-12 col-lg-9 col-xl-6"}
      >
        <div className="bordered">
          {errorMessage && (
            <div className="alert alert-danger mb-2" role="alert">
              {formattedErrorMessage}
            </div>
          )}
          <div className="panel panel-default">
            <div className="content">
              {type === "excel" && (
                <FileDrop
                  setErrorMessage={setErrorMessage}
                  setFiles={setUploadFiles}
                  maxFiles={1}
                  currFileLength={files.length}
                />
              )}
              {type === "pdf" && (
                <>
                  <FileDropEvidence
                    getExistingFilesCount={() =>
                      submission && submission.evidence
                        ? submission.evidence.length - evidenceDeleteList.length
                        : 0
                    }
                    setErrorMessage={setErrorMessage}
                    files={files}
                    setFiles={setUploadFiles}
                    maxFiles={20}
                    allowedFileTypes="image/png, image/gif, image/jpg,image/jpeg, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  />
                  <div className="form-group mt-4 row">
                    <div className="col-12 text-blue">
                      <div>
                        <strong>Limit of 20 files</strong>
                      </div>
                      <strong>Files</strong> (doc, docx, pdf, jpg, png, gif)
                    </div>
                  </div>
                </>
              )}
            </div>
            {(files.length > 0 ||
              (type === "excel" && submission && submission.filename) ||
              (type === "pdf" &&
                submission &&
                submission.evidence &&
                submission.evidence.length > 0)) && (
              <div className="files px-3">
                <div className="row pb-1">
                  <div className="col-8 header">Filename</div>
                  <div className="col-3 size header">Size</div>
                  <div className="col-1 actions header">Delete</div>
                </div>
                {type === "excel" &&
                  submission.filename &&
                  files.length === 0 && <div>{submission.filename}</div>}
                {type === "pdf" &&
                  submission &&
                  submission.evidence &&
                  submission.evidence
                    .filter(
                      (submissionFile) =>
                        !evidenceDeleteList.includes(submissionFile.id),
                    )
                    .map((submissionFile) => (
                      <div
                        className="row py-1"
                        key={`submission-${submissionFile.id}-${submissionFile.filename}`}
                      >
                        <div className="col-8 filename">
                          {submissionFile.filename || submissionFile.name}
                        </div>
                        {!showProgressBars && [
                          <div className="col-3 size" key="filesize-key">
                            {getFileSize(submissionFile.size)}
                          </div>,
                          <div className="col-1 actions" key="file-key">
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
                  <div
                    className="row py-1"
                    key={`file-${file.id}-${file.filename}`}
                  >
                    <div className="col-8 filename">
                      {file.filename || file.name}
                    </div>
                    {!showProgressBars && [
                      <div className="col-3 size" key="filesize-key-delete">
                        {getFileSize(file.size)}
                      </div>,
                      <div className="col-1 actions" key="file-key-delete">
                        <FontAwesomeIcon
                          onClick={() => {
                            setShowModal(true);
                            setActiveFile(file);
                          }}
                          icon="trash"
                          className="delete-icon"
                        />
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
      <Modal
        handleCancel={() => setShowModal(false)}
        handleSubmit={() => {
          removeFile(activeFile);
          setShowModal(false);
        }}
        showModal={showModal}
        title="Confirm deletion"
      >
        Are you sure you want to delete your file?
      </Modal>
    </div>
  );
};

FileDropArea.defaultProps = {
  errorMessage: "",
  evidenceDeleteList: [],
  files: [],
  progressBars: {},
  showProgressBars: false,
  submission: {},
  setEvidenceDeleteList: () => {},
  wholePageWidth: false,
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
  wholePageWidth: PropTypes.bool,
};

export default FileDropArea;
