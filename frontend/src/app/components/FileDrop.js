import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

const FileDrop = (props) => {
  const { setFiles, maxFiles } = props;
  const [dropMessage, setDropMessage] = useState(
    'Drag and Drop files here',
  );
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
        {dropMessage === 'Drag and Drop files here' && (
          <>
            {' or '}
            <br /> <button className="link" type="button">browse to select a file from your machine to upload</button>.
          </>
        )}
      </div>
    </div>
  );
};

FileDrop.propTypes = {
  setFiles: PropTypes.func.isRequired,
  maxFiles: PropTypes.number.isRequired,
};

export default FileDrop;
