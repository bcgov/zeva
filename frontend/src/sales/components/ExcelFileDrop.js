import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useDropzone } from 'react-dropzone';
import React, { useCallback } from 'react';

function ExcelFileDrop() {
  const onDrop = useCallback((acceptedFiles) => {
    console.log(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      {
        <div className="well">
          <div className="file-upload">
            <FontAwesomeIcon icon="upload" />
            <br />
            Drop files here, or click to open file selection dialog
          </div>
        </div>
      }
    </div>
  );
}

export default ExcelFileDrop;
