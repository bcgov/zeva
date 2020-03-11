import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const ExcelFileDrop = (props) => {
  const { setFiles } = props;
  const onDrop = useCallback((acceptedFiles) => {
    setFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      <div className="well">
        <div className="file-upload">
          <FontAwesomeIcon icon="upload" />
          <br />
          Drop file here, or click to open file selection dialog
        </div>
      </div>
    </div>
  );
};

ExcelFileDrop.propTypes = {
  setFiles: PropTypes.func.isRequired,
};

export default ExcelFileDrop;
