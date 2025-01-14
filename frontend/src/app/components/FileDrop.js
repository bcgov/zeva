import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

const FileDrop = ({
  setErrorMessage,
  setFiles,
  maxFiles,
  allowedFileTypes,
  currFileLength,
}) => {
  const [dropMessage, setDropMessage] = useState("");
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > maxFiles) {
      setDropMessage(
        `Please select only ${maxFiles} file${maxFiles !== 1 ? "s" : ""}.`,
      );
    } else {
      setDropMessage("");
      setErrorMessage("");
      setFiles(acceptedFiles);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: allowedFileTypes,
  });
  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />

      <div className={!currFileLength ? "file-upload" : "file-upload disabled"}>
        <FontAwesomeIcon icon="upload" />
        <br />
        Drag and Drop files here or <br />
        <button
          disabled={!!currFileLength}
          className={!currFileLength ? "link text-center" : "link-disabled"}
          type="button"
        >
          Browse to select a file from your machine to upload.
        </button>
        {dropMessage && <div id="danger-text">{dropMessage}</div>}
      </div>
    </div>
  );
};

FileDrop.defaultProps = {
  setErrorMessage: () => {},
  allowedFileTypes: null,
};

FileDrop.propTypes = {
  setErrorMessage: PropTypes.func,
  setFiles: PropTypes.func.isRequired,
  maxFiles: PropTypes.number.isRequired,
  allowedFileTypes: PropTypes.string,
};

export default FileDrop;
