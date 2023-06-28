import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import axios from 'axios'
import ExcelFileDrop from '../../app/components/FileDrop'
import getFileSize from '../../app/utilities/getFileSize'

const UploadEvidence = (props) => {
  const { details, setUploadFiles, files, setDeleteFiles, deleteFiles } = props

  const removeFile = (removedFile) => {
    const found = files.findIndex((file) => file === removedFile)
    files.splice(found, 1)
    setUploadFiles([...files])
  }

  return (
    <>
      <div className="row mt-3 mb-2">
        <div className="col-12 text-blue">
          <h3 className="mb-2">
            Attachments<span> (optional)</span>
          </h3>
          <p>Upload evidence supporting any of the changes made above.</p>
        </div>
      </div>
      <div className="bordered mt-1">
        <div className="col-12 content p-3">
          <ExcelFileDrop setFiles={setUploadFiles} maxFiles={100000} />
        </div>
      </div>
      {(files.length > 0 ||
        (details.attachments && details.attachments.length > 0)) && (
        <div className="form-group uploader-files mt-3">
          <div className="row">
            <div className="col-8 filename header">Filename</div>
            <div className="col-3 size header">Size</div>
            <div className="col-1 actions header" />
          </div>
          {details.attachments &&
            details.attachments
              .filter((attachment) => deleteFiles.indexOf(attachment.id) < 0)
              .map((attachment) => (
                <div className="row" key={attachment.id}>
                  <div className="col-8 filename">
                    <button
                      className="link"
                      onClick={() => {
                        axios
                          .get(attachment.url, {
                            responseType: 'blob',
                            headers: {
                              Authorization: null
                            }
                          })
                          .then((response) => {
                            const objectURL = window.URL.createObjectURL(
                              new Blob([response.data])
                            )
                            const link = document.createElement('a')
                            link.href = objectURL
                            link.setAttribute('download', attachment.filename)
                            document.body.appendChild(link)
                            link.click()
                          })
                      }}
                      type="button"
                    >
                      {attachment.filename}
                    </button>
                  </div>
                  <div className="col-3 size">
                    {getFileSize(attachment.size)}
                  </div>
                  <div className="col-1 actions">
                    <button
                      className="delete"
                      onClick={() => {
                        setDeleteFiles([...deleteFiles, attachment.id])
                      }}
                      type="button"
                    >
                      <FontAwesomeIcon icon="trash" />
                    </button>
                  </div>
                </div>
              ))}
          {files.map((file, index) => (
            <div className="row" key={file.name}>
              <div className="col-8 filename">{file.name}</div>
              <div className="col-3 size" key="size">
                {getFileSize(file.size)}
              </div>
              <div className="col-1 actions" key="actions">
                <button
                  className="delete"
                  onClick={() => {
                    removeFile(file)
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
    </>
  )
}

export default UploadEvidence
