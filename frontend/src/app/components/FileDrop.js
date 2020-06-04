import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

const FileDrop = (props) => {
  const { setFiles, maxFiles } = props;
  const [dropMessage, setDropMessage] = useState('Drop file here, or click to open file selection dialog');
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > maxFiles) {
      setDropMessage(`File upload is limited to ${maxFiles}. Please select again`);
    } else {
      setFiles(acceptedFiles);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });
  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />

      <div className="file-upload">
        <FontAwesomeIcon icon="upload" />
        <br />
        {dropMessage}
      </div>
    </div>
  );
};

FileDrop.propTypes = {
  setFiles: PropTypes.func.isRequired,
  maxFiles: PropTypes.number.isRequired,
};

export default FileDrop;
