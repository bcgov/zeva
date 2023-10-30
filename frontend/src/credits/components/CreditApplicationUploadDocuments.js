import React, { useState } from 'react'
import FileDropArea from '../../app/components/FileDropArea'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const CreditApplicationUploadDocuments = (props) => {
  const { handleCancel, handleUpload } = props

  const [files, setFiles] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const [uploadInitiated, setUploadInitiated] = useState(false)

  const handleUploadClick = () => {
    setUploadInitiated(true)
    handleUpload(files)
  }

  return (
    <div id="sales-edit">
      <FileDropArea
        type="pdf"
        files={files}
        setUploadFiles={setFiles}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
      />
      <div className="action-bar">
        <span className="left-content">
          <button
            className='button'
            onClick={handleCancel}
          >
                Cancel
          </button>
        </span>

        <span className="right-content">
          <button
            disabled={files.length === 0 || uploadInitiated}
            className="button primary"
            onClick={handleUploadClick}
            type="button"
          >
            <FontAwesomeIcon icon="upload" />
            {uploadInitiated ? 'Uploading...' : 'Upload'}
          </button>
        </span>
      </div>
    </div>
  )
}

export default CreditApplicationUploadDocuments
