import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ReactTooltip from 'react-tooltip';
import axios from 'axios';
import Button from '../../app/components/Button';
import Modal from '../../app/components/Modal';
import Alert from '../../app/components/Alert';
import formatNumeric from '../../app/utilities/formatNumeric';
import DisplayComment from '../../app/components/DisplayComment';
import CommentInput from '../../app/components/CommentInput';
import ExcelFileDrop from '../../app/components/FileDrop';
import FormDropdown from '../../credits/components/FormDropdown';
import TextInput from '../../app/components/TextInput';
import getFileSize from '../../app/utilities/getFileSize';

const CreditAgreementsForm = (props) => {
  const {
    agreementDetails,
    analystAction,
    creditRows,
    id,
    user,
    bceidComment,
    files,
    idirComment,
    handleAddIdirComment,
    handleChangeDetails,
    handleChangeRow,
    handleCommentChangeIdir,
    handleCommentChangeBceid,
    handleSubmit,
    errorMessage,
    setErrorMessage,
    setUploadFiles,
    upload,
    addRow,
    suppliers,
    transactionTypes,
    years,
    handleDeleteRow,
  } = props;
  return (
    <div id="credit-agreements-form" className="page">
      <div className="row mt-3 mb-2">
        <div className="col-sm-12">
          <h2>Credit Agreements &amp; Adjustments</h2>
        </div>
      </div>
      {user.isGovernment
          && (
          <div className="assessment-credit-adjustment">
            <div className="grey-border-area p-3 comment-box mt-2" id="comment-input">
              {agreementDetails.idirComment && agreementDetails.idirComment.length > 0 && (
              <DisplayComment
                commentArray={agreementDetails.idirComment}
              />
              )}
              <div>
                <CommentInput
                  handleAddComment={handleAddIdirComment}
                  handleCommentChange={handleCommentChangeIdir}
                  title={analystAction ? 'Add comment to director: ' : 'Add comment to the analyst'}
                  buttonText="Add Comment"
                />
              </div>
            </div>
            <div className="mt-4">
              <h4>Agreement Attachments (optional)</h4>
              <div className="grey-border-area p-3 mt-1">
                <div className="col-12">
                  <ExcelFileDrop
                    setFiles={setUploadFiles}
                    maxFiles={5}
                  />
                </div>
                <div className="form-group mt-4 row">
                  <div className="col-12 text-blue">
                    <strong>Files</strong> (doc, docx, xls, xlsx, pdf, jpg, png)
                  </div>
                </div>
                {(files.length > 0 || (agreementDetails.attachments && agreementDetails.attachments.length > 0)) && (
                  <div className="form-group uploader-files mt-3">
                    <div className="row">
                      <div className="col-8 filename header">Filename</div>
                      <div className="col-3 size header">Size</div>
                      <div className="col-1 actions header" />
                    </div>
                    {agreementDetails.attachments && agreementDetails.attachments.map((attachment) => (
                      <div className="row" key={attachment.id}>
                        <div className="col-8 filename">
                          <button
                            className="link"
                            onClick={() => {
                              axios.get(attachment.url, {
                                responseType: 'blob',
                                headers: {
                                  Authorization: null,
                                },
                              }).then((response) => {
                                const objectURL = window.URL.createObjectURL(
                                  new Blob([response.data]),
                                );
                                const link = document.createElement('a');
                                link.href = objectURL;
                                link.setAttribute('download', attachment.filename);
                                document.body.appendChild(link);
                                link.click();
                              });
                            }}
                            type="button"
                          >
                            {attachment.filename}
                          </button>
                        </div>
                        <div className="col-3 size">{getFileSize(attachment.size)}</div>
                        <div className="col-1 actions">
                          <button
                            className="delete"
                            onClick={() => {
                              console.log('delete');
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
                        <div className="col-3 size" key="size">{getFileSize(file.size)}</div>
                        <div className="col-1 actions" key="actions">
                          <button
                            className="delete"
                            onClick={() => {
                              console.log('delete');
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
                    handleChangeDetails(event.target.value, 'vehicleSupplier');
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
                    handleChangeDetails(event.target.value, 'transactionType');
                  }}
                  fieldName="transactionType"
                  accessor={(transactionType) => transactionType.name}
                  selectedOption={agreementDetails.transactionType || '--'}
                  labelClassname="d-inline-block col-2"
                  inputClassname="d-inline-block agreement-input"
                  rowClassname=""
                />
              </div>
              <div className="credit-agreement-form-row">
                <TextInput
                  label="Agreement ID (optional)"
                  id="agreementID"
                  name="quantity"
                  defaultValue={agreementDetails.agreementID}
                  handleInputChange={(event) => {
                    handleChangeDetails(event.target.value, 'agreementID');
                  }}
                  labelSize="d-inline-block col-sm-2"
                  inputSize="d-inline-block align-middle agreement-input"
                  rowSize=""
                />
              </div>
              <div className="credit-agreement-form-row">
                <label
                  htmlFor="transaction-date"
                  className="d-inline-block col-2"
                >Transaction Date
                </label>
                <input
                  className="d-inline-block"
                  type="date"
                  id="transaction-date"
                  name="transaction-date"
                  onChange={(event) => {
                    handleChangeDetails(event.target.value, 'transactionDate');
                  }}
                />

              </div>

              {creditRows && creditRows.map((creditRow, index) => (
                <div className="credit-agreement-form-row" key={index}>
                  <div className="d-inline-block align-middle mr-5 text-blue">
                    Credits
                  </div>
                  <div className="d-inline-block align-middle mr-5">
                    <div className="mb-2 d-flex flex-column">
                      <div>
                        <input
                          id={`agreement-${index}-credit-type-A`}
                          name={`agreement-${index}`}
                          type="radio"
                          value="A"
                          onChange={(event) => { handleChangeRow(event.target.value, 'creditClass', index); }}
                        />
                        <label className="ml-2" htmlFor={`agreement-${index}-credit-type-A`}>A credits</label>
                      </div>
                      <div>
                        <input
                          id={`agreement-${index}-credit-type-B`}
                          name={`agreement-${index}`}
                          type="radio"
                          value="B"
                          onChange={(event) => { handleChangeRow(event.target.value, 'creditClass', index); }}
                        />
                        <label className="ml-2" htmlFor={`agreement-${index}-credit-type-B`}>B credits</label>
                      </div>
                    </div>
                  </div>
                  <FormDropdown
                    dropdownData={years}
                    dropdownName="model year"
                    handleInputChange={(event) => {
                      handleChangeRow(event.target.value, 'modelYear', index);
                    }}
                    fieldName="modelYear"
                    accessor={(year) => year.name}
                    selectedOption={creditRow.modelYear || '--'}
                    labelClassname="mr-2 d-inline-block"
                    inputClassname="d-inline-block"
                    rowClassname="mr-5 d-inline-block align-middle"
                  />
                  <TextInput
                    label="quantity of credits"
                    id="quantityOfCredits"
                    name="quantity"
                    defaultValue={creditRow.quantity}
                    handleInputChange={(event) => {
                      handleChangeRow(event.target.value, 'quantity', index);
                    }}
                    labelSize="mr-2 col-form-label d-inline-block align-middle"
                    inputSize="d-inline-block align-middle transfer-input-width"
                    mandatory
                    rowSize="mr-5 d-inline-block align-middle"
                    num
                  />
                  <button
                    type="button"
                    className="transfer-row-x"
                    onClick={() => {
                      handleDeleteRow(index);
                    }}
                  >
                    <FontAwesomeIcon icon="times" />
                  </button>
                </div>
              ))}
              <button type="button" className="transfer-add-line my-2" onClick={() => { addRow(); }}>
                <h4><FontAwesomeIcon icon="plus" /> Add another line</h4>
              </button>
            </div>
            <div className="grey-border-area p-3 comment-box mt-4" id="comment-input">
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
          <div className="action-bar mt-0">
            {/* {directorAction && (
            <>
              <span className="left-content">
                <button
                  className="button text-danger"
                  onClick={() => {
                    handleSubmit('SUBMITTED');
                  }}
                  type="button"
                >
                  Return to Analyst
                </button>
              </span>

              <span className="right-content">
                <Button
                  buttonType="submit"
                  optionalClassname="button primary"
                  optionalText="Issue Assessment"
                  action={() => {
                    handleSubmit('ASSESSED');
                  }}
                />
              </span>
            </>
            )} */}
            {analystAction && (
            <>
              <span className="left-content" />
              <span className="right-content">
                <Button
                  buttonType="submit"
                  optionalClassname="button primary"
                  optionalText="Submit to Director"
                  action={() => {
                    handleSubmit('');
                  }}
                />
              </span>
            </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditAgreementsForm;
