import axios from 'axios'
import PropTypes from 'prop-types'
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import Button from '../../app/components/Button'
import CommentInput from '../../app/components/CommentInput'
import ExcelFileDrop from '../../app/components/FileDrop'
import FormDropdown from '../../credits/components/FormDropdown'
import TextInput from '../../app/components/TextInput'
import getFileSize from '../../app/utilities/getFileSize'
import CustomPropTypes from '../../app/utilities/props'

const CreditAgreementsForm = (props) => {
  const {
    addRow,
    agreementDetails,
    analystAction,
    creditRows,
    deleteFiles,
    files,
    handleChangeDetails,
    handleChangeRow,
    handleCommentChangeBceid,
    handleDeleteRow,
    handleSubmit,
    id,
    setDeleteFiles,
    setUploadFiles,
    suppliers,
    transactionTypes,
    user,
    years,
    modelYearReports
  } = props

  const removeFile = (removedFile) => {
    const found = files.findIndex((file) => file === removedFile)
    files.splice(found, 1)
    setUploadFiles([...files])
  }

  const displayModelYear =
    !!(agreementDetails.transactionType === 'Reassessment Allocation' ||
    agreementDetails.transactionType === 'Reassessment Reduction')

  const modelYearValues = () => {
    const supplierReports = []
    if (
      agreementDetails.vehicleSupplier &&
      (agreementDetails.transactionType === 'Reassessment Allocation' ||
        agreementDetails.transactionType === 'Reassessment Reduction')
    ) {
      for (const modelYearReport of modelYearReports) {
        if (
          modelYearReport.organizationId ===
          parseInt(agreementDetails.vehicleSupplier)
        ) {
          supplierReports.push(modelYearReport)
        }
      }
    }
    return supplierReports
  }

  return (
    <div id="credit-agreements-form" className="page">
      <div className="row mt-3 mb-2">
        <div className="col-sm-12">
          <h2>Credit Agreements &amp; Adjustments</h2>
        </div>
      </div>
      {user.isGovernment && (
        <div className="assessment-credit-adjustment">
          <div className="mt-4">
            <h4>Agreement Attachments (optional)</h4>
            <div className="grey-border-area p-3 mt-1">
              <div className="col-12">
                <ExcelFileDrop setFiles={setUploadFiles} maxFiles={5} />
              </div>
              <div className="form-group mt-4 row">
                <div className="col-12 text-blue">
                  <strong>Files</strong> (doc, docx, xls, xlsx, pdf, jpg, png)
                </div>
              </div>
              {(files.length > 0 ||
                (agreementDetails.attachments &&
                  agreementDetails.attachments.length > 0)) && (
                <div className="form-group uploader-files mt-3">
                  <div className="row">
                    <div className="col-8 filename header">Filename</div>
                    <div className="col-3 size header">Size</div>
                    <div className="col-1 actions header" />
                  </div>
                  {agreementDetails.attachments &&
                    agreementDetails.attachments
                      .filter(
                        (attachment) => deleteFiles.indexOf(attachment.id) < 0
                      )
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
                                    const objectURL =
                                      window.URL.createObjectURL(
                                        new Blob([response.data])
                                      )
                                    const link = document.createElement('a')
                                    link.href = objectURL
                                    link.setAttribute(
                                      'download',
                                      attachment.filename
                                    )
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
            </div>
          </div>
          <div className="grey-border-area p-3 mt-4">
            <div className="credit-agreement-form-row">
              <FormDropdown
                dropdownData={suppliers}
                dropdownName="Vehicle Supplier"
                handleInputChange={(event) => {
                  handleChangeDetails(
                    event.target.value,
                    'vehicleSupplier',
                    true
                  )
                }}
                fieldName="vehicleSupplier"
                accessor={(supplier) => supplier.id}
                selectedOption={agreementDetails.vehicleSupplier || '--'}
                labelClassname="d-inline-block col-2"
                inputClassname="d-inline-block agreement-input"
                rowClassname=""
              />
            </div>
            <div className="credit-agreement-form-row">
              <FormDropdown
                dropdownData={transactionTypes}
                dropdownName="Transaction Type"
                handleInputChange={(event) => {
                  handleChangeDetails(
                    event.target.value,
                    'transactionType',
                    true
                  )
                }}
                fieldName="transactionType"
                accessor={(transactionType) => transactionType.name}
                selectedOption={agreementDetails.transactionType || '--'}
                labelClassname="d-inline-block col-2"
                inputClassname="d-inline-block agreement-input"
                rowClassname=""
              />
            </div>
            {displayModelYear && (
              <div className="credit-agreement-form-row">
                <FormDropdown
                  dropdownData={modelYearValues()}
                  dropdownName="Model Year"
                  handleInputChange={(event) => {
                    handleChangeDetails(
                      event.target.value,
                      'modelYearReportId'
                    )
                  }}
                  fieldName="modelYear"
                  accessor={(supplierReport) => supplierReport.id}
                  selectedOption={agreementDetails.modelYearReportId || '--'}
                  labelClassname="d-inline-block col-2"
                  inputClassname="d-inline-block agreement-input"
                  rowClassname=""
                />
              </div>
            )}
            {!displayModelYear && (
              <div className="credit-agreement-form-row">
                <TextInput
                  label="Agreement ID (optional)"
                  id="optionalAgreementID"
                  name="optionalAgreementID"
                  defaultValue={agreementDetails.optionalAgreementID}
                  handleInputChange={(event) => {
                    handleChangeDetails(
                      event.target.value,
                      'optionalAgreementID'
                    )
                  }}
                  labelSize="d-inline-block col-sm-2"
                  inputSize="d-inline-block align-middle agreement-input"
                  rowSize=""
                />
              </div>
            )}
            <div className="credit-agreement-form-row">
              <label
                htmlFor="transaction-date"
                className="d-inline-block col-2"
              >
                Transaction Date
              </label>
              <input
                className="d-inline-block"
                type="date"
                id="transaction-date"
                name="transaction-date"
                onChange={(event) => {
                  handleChangeDetails(event.target.value, 'effectiveDate')
                }}
                value={agreementDetails.effectiveDate}
              />
            </div>

            {creditRows &&
              creditRows.map((creditRow, index) => (
                <div className="credit-agreement-form-row" key={index}>
                  <div className="d-inline-block align-middle mr-5 text-blue">
                    Credits
                  </div>
                  <div className="d-inline-block align-middle mr-5">
                    <div className="mb-2 d-flex flex-column">
                      <div>
                        <input
                          checked={creditRow.creditClass === 'A'}
                          id={`agreement-${index}-credit-type-A`}
                          name={`agreement-${index}`}
                          onChange={(event) => {
                            handleChangeRow(
                              event.target.value,
                              'creditClass',
                              index
                            )
                          }}
                          type="radio"
                          value="A"
                        />
                        <label
                          className="ml-2"
                          htmlFor={`agreement-${index}-credit-type-A`}
                        >
                          A credits
                        </label>
                      </div>
                      <div>
                        <input
                          checked={creditRow.creditClass === 'B'}
                          id={`agreement-${index}-credit-type-B`}
                          name={`agreement-${index}`}
                          onChange={(event) => {
                            handleChangeRow(
                              event.target.value,
                              'creditClass',
                              index
                            )
                          }}
                          type="radio"
                          value="B"
                        />
                        <label
                          className="ml-2"
                          htmlFor={`agreement-${index}-credit-type-B`}
                        >
                          B credits
                        </label>
                      </div>
                    </div>
                  </div>
                  <FormDropdown
                    accessor={(year) => year.name}
                    dropdownData={years}
                    dropdownName="model year"
                    fieldName="modelYear"
                    handleInputChange={(event) => {
                      handleChangeRow(event.target.value, 'modelYear', index)
                    }}
                    inputClassname="d-inline-block"
                    labelClassname="mr-2 d-inline-block"
                    rowClassname="mr-5 d-inline-block align-middle"
                    selectedOption={creditRow.modelYear || '--'}
                  />
                  <TextInput
                    defaultValue={creditRow.quantity}
                    handleInputChange={(event) => {
                      handleChangeRow(event.target.value, 'quantity', index)
                    }}
                    id="quantityOfCredits"
                    inputSize="d-inline-block align-middle transfer-input-width"
                    label="quantity of credits"
                    labelSize="mr-2 col-form-label d-inline-block align-middle"
                    mandatory
                    name="quantity"
                    num
                    rowSize="mr-5 d-inline-block align-middle"
                  />
                  <button
                    type="button"
                    className="transfer-row-x"
                    onClick={() => {
                      handleDeleteRow(index)
                    }}
                  >
                    <FontAwesomeIcon icon="times" />
                  </button>
                </div>
              ))}
            <button
              type="button"
              className="transfer-add-line my-2"
              onClick={() => {
                addRow()
              }}
            >
              <h4>
                <FontAwesomeIcon icon="plus" /> Add another line
              </h4>
            </button>
          </div>
          <div
            className="grey-border-area p-3 comment-box mt-4"
            id="comment-input"
          >
            <div id="comment-input">
              <CommentInput
                defaultComment={agreementDetails.bceidComment}
                handleCommentChange={handleCommentChangeBceid}
                title="Message to the Supplier: "
              />
            </div>
          </div>
        </div>
      )}
      <div className="row">
        <div className="col-sm-12">
          <div className="action-bar mt-3">
            <span className="left-content">
              {id
                ? (
                <Button
                  buttonType="back"
                  locationRoute={`/credit-agreements/${id}`}
                />
                  )
                : (
                <Button buttonType="back" locationRoute="/credit-agreements/" />
                  )}
            </span>
            <span className="right-content">
              {analystAction && (
                <Button
                  buttonType="save"
                  optionalClassname="button primary"
                  optionalText="Save"
                  disabled={
                    !agreementDetails.vehicleSupplier ||
                    !agreementDetails.transactionType ||
                    !agreementDetails.effectiveDate
                  }
                  buttonTooltip={
                    `Please fill in all the required fields to enable the "Save" button.`
                  }
                  action={() => {
                    handleSubmit('')
                  }}
                />
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

CreditAgreementsForm.defaultProps = {
  id: null
}

CreditAgreementsForm.propTypes = {
  addRow: PropTypes.func.isRequired,
  agreementDetails: PropTypes.shape().isRequired,
  analystAction: PropTypes.bool.isRequired,
  creditRows: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  deleteFiles: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ).isRequired,
  files: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  handleChangeDetails: PropTypes.func.isRequired,
  handleChangeRow: PropTypes.func.isRequired,
  handleCommentChangeBceid: PropTypes.func.isRequired,
  handleDeleteRow: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  id: PropTypes.string,
  setDeleteFiles: PropTypes.func.isRequired,
  setUploadFiles: PropTypes.func.isRequired,
  suppliers: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  transactionTypes: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  user: CustomPropTypes.user.isRequired,
  years: PropTypes.arrayOf(PropTypes.shape()).isRequired
}

export default CreditAgreementsForm
