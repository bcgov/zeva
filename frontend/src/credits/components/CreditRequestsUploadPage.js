import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import PropTypes from 'prop-types'
import Button from '../../app/components/Button'
import ROUTES_CREDIT_REQUESTS from '../../app/routes/CreditRequests'
import download from '../../app/utilities/download'
import FileDropArea from '../../app/components/FileDropArea'

const CreditRequestsUploadPage = (props) => {
  const {
    errorMessage,
    evidenceCheckbox,
    evidenceDeleteList,
    evidenceErrorMessage,
    files,
    icbcDate,
    progressBars,
    setEvidenceCheckbox,
    setEvidenceErrorMessage,
    setErrorMessage,
    setEvidenceDeleteList,
    setEvidenceUploadFiles,
    setUploadFiles,
    setUploadNewExcel,
    showProgressBars,
    submission,
    uploadEvidenceFiles,
    upload,
    uploadNewExcel
  } = props

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target
    if (name === 'evidence-upload-checkbox') {
      setEvidenceCheckbox(checked)
    } else {
      setUploadNewExcel(checked)
    }
  }

  const downloadTemplate = (e) => {
    const element = e.target
    const original = element.innerHTML
    element.firstChild.textContent = ' Downloading...'
    return download(ROUTES_CREDIT_REQUESTS.TEMPLATE, {}).then(() => {
      element.innerHTML = original
    })
  }

  const downloadSalesEvidenceTemplate = () => {
    window.open('/SalesEvidenceTemplate.docx')
  }

  return (
    <div id="sales-edit" className="page">
      <div className="row mt-3 mb-2">
        <div className="col-12">
          <h2 className="mb-2">Application for Credits for Consumer Sales</h2>
          <h3 className="sales-upload-grey">
            Download an Excel template containing all eligible ZEV models to
            submit consumer sales
          </h3>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="compact content p-3">
            <Button
              buttonType="download"
              optionalText="Download Excel Sales Template"
              action={(e) => {
                downloadTemplate(e)
              }}
            />
          </div>
        </div>
      </div>

      <div className="row mt-5 mb-2">
        <div className="col-12">
          <h2 className="mb-2">Upload ZEV Sales Information (Maximum 2,000 VIN per application)</h2>
          <p>
            Credits can be issued for active ZEV sales made prior to {icbcDate}.
          </p>
          {submission && submission.id && (
            <>
              <div className="mt-3 mx-3">
                <div>
                  Current file: <strong>{submission.filename}</strong>
                </div>
                <div>
                  <em>
                    To replace the current file, please check Upload new file
                  </em>
                </div>
              </div>
              <div>
                <input
                  defaultChecked={uploadNewExcel}
                  type="checkbox"
                  name="new-sales-upload-checkbox"
                  id="new-sales-upload-checkbox"
                  onChange={(event) => {
                    handleCheckboxChange(event)
                  }}
                  className="m-3"
                />
                <span className="text-blue">Upload new file</span>
              </div>
            </>
          )}
        </div>
      </div>
      {(!submission || uploadNewExcel) && (
        <FileDropArea
          type="excel"
          errorMessage={errorMessage}
          files={files}
          setErrorMessage={setErrorMessage}
          setUploadFiles={setUploadFiles}
        />
      )}
      <div className="row mt-5 mb-2">
        <div className="col-12">
          <h2 className="mb-2">Upload Sales Evidence</h2>
          <p>
            If you are reapplying for credits for VIN that were previously
            returned as errors you can upload additional sales evidence to
            support your credit application.
          </p>
          <div>
            <input
              type="checkbox"
              name="evidence-upload-checkbox"
              id="evidence-upload-checkbox"
              onChange={(event) => {
                handleCheckboxChange(event)
              }}
              defaultChecked={evidenceCheckbox}
              className="m-3"
            />
            <span className="text-blue">
              Upload sales evidence document (in addition to the Excel ZEV Sales
              Information above)
            </span>
          </div>
        </div>
      </div>
      {evidenceCheckbox && (
        <>
          <div className="row">
            <div className="col-12">
              <div className="compact content p-3">
                <Button
                  buttonType="download"
                  optionalText="Download Sales Evidence Template"
                  action={() => {
                    downloadSalesEvidenceTemplate()
                  }}
                />
              </div>
            </div>
          </div>

          <FileDropArea
            type="pdf"
            errorMessage={evidenceErrorMessage}
            files={uploadEvidenceFiles}
            setErrorMessage={setEvidenceErrorMessage}
            setUploadFiles={setEvidenceUploadFiles}
            showProgressBars={showProgressBars}
            progressBars={progressBars}
            submission={submission}
            evidenceDeleteList={evidenceDeleteList}
            setEvidenceDeleteList={setEvidenceDeleteList}
          />
        </>
      )}
      <div className="action-bar">
        <span className="left-content">
          <Button
            buttonType="back"
            locationRoute={ROUTES_CREDIT_REQUESTS.LIST}
          />
        </span>
        <span className="right-content">
          <button
            disabled={files.length === 0 && !submission.filename}
            className="button primary"
            onClick={() => upload()}
            type="button"
          >
            <FontAwesomeIcon icon="upload" /> Upload
          </button>
        </span>
      </div>
    </div>
  )
}

CreditRequestsUploadPage.defaultProps = {
  errorMessage: '',
  evidenceDeleteList: [],
  evidenceErrorMessage: '',
  icbcDate: '',
  progressBars: {},
  showProgressBars: false,
  submission: {},
  uploadNewExcel: false
}

CreditRequestsUploadPage.propTypes = {
  errorMessage: PropTypes.string,
  evidenceCheckbox: PropTypes.bool.isRequired,
  evidenceDeleteList: PropTypes.arrayOf(PropTypes.string),
  evidenceErrorMessage: PropTypes.string,
  files: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  icbcDate: PropTypes.string,
  progressBars: PropTypes.shape(),
  setErrorMessage: PropTypes.func.isRequired,
  setEvidenceCheckbox: PropTypes.func.isRequired,
  setEvidenceDeleteList: PropTypes.func.isRequired,
  setEvidenceErrorMessage: PropTypes.func.isRequired,
  setEvidenceUploadFiles: PropTypes.func.isRequired,
  setUploadNewExcel: PropTypes.func.isRequired,
  showProgressBars: PropTypes.bool,
  submission: PropTypes.shape(),
  setUploadFiles: PropTypes.func.isRequired,
  uploadEvidenceFiles: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.shape()])
  ).isRequired,
  upload: PropTypes.func.isRequired,
  uploadNewExcel: PropTypes.bool
}

export default CreditRequestsUploadPage
