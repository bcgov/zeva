import axios from 'axios'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import moment from 'moment-timezone'

import Button from '../../app/components/Button'
import AutocompleteInput from '../../app/components/AutocompleteInput'
import ExcelFileDrop from '../../app/components/FileDrop'
import Loading from '../../app/components/Loading'
import Modal from '../../app/components/Modal'
import TextInput from '../../app/components/TextInput'
import ROUTES_VEHICLES from '../../app/routes/Vehicles'
import getFileSize from '../../app/utilities/getFileSize'
import VehicleFormDropdown from './VehicleFormDropdown'
import VehicleAlert from './VehicleAlert'
import Comment from '../../app/components/Comment'

const VehicleForm = (props) => {
  const {
    deleteFiles,
    errorFields,
    fields,
    files,
    formTitle,
    handleInputChange,
    handleSubmit,
    loading,
    makes,
    progressBars,
    setDeleteFiles,
    setFields,
    setUploadFiles,
    setUploadRangeResults,
    showProgressBars,
    status,
    vehicleClasses,
    vehicleComment,
    vehicleTypes,
    vehicleYears,
    newVehicle,
    requestStateChange,
    uploadRangeResults
  } = props
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('')
  const eligibleWeight = fields.weightKg <= 4536
  const modalText =
    fields && fields.hasPassedUs06Test
      ? 'Submit vehicle model and range test results to Government of B.C.'
      : 'Submit ZEV model to Government of B.C.?'

  let modalProps
  switch (modalType) {
    case 'submit':
      modalProps = {
        confirmLabel: ' Submit',
        handleSubmit: (event) => {
          handleSubmit(event, 'SUBMITTED')
          setShowModal(false)
        },
        buttonClass: 'button primary',
        modalText
      }
      break
    case 'delete':
      modalProps = {
        confirmLabel: 'Delete',
        modalText: 'Delete the ZEV model?',
        handleSubmit: () => {
          requestStateChange('DELETED')
        },
        buttonClass: 'btn-outline-danger'
      }
      break
    default:
      modalProps = {
        confirmLabel: '',
        buttonClass: '',
        modalText: '',
        handleSubmit: () => {}
      }
      break
  }
  const spaces = () => {
    return (
      <div>
        <br />
        <br />
      </div>
    )
  }

  const modal = (
    <Modal
      confirmLabel={modalProps.confirmLabel}
      handleCancel={() => {
        setShowModal(false)
      }}
      handleSubmit={modalProps.handleSubmit}
      modalClass="w-75"
      showModal={showModal}
      confirmClass={modalProps.buttonClass}
      title={modalProps.title ? modalProps.title : 'Confirm'}
    >
      <div>
        {spaces()}
        <h3 className="d-inline">{modalProps.modalText}</h3>
        {spaces()}
      </div>
    </Modal>
  )

  const deleteFile = (attachmentId) => {
    setDeleteFiles([...deleteFiles, attachmentId])
  }

  const removeFile = (removedFile) => {
    const found = files.findIndex((file) => file === removedFile)
    files.splice(found, 1)

    setUploadFiles([...files])
  }

  if (loading) {
    return <Loading />
  }
  const selectedZevType =
    fields.vehicleZevType.vehicleZevCode || fields.vehicleZevType
  return (
    <div id="form" className="page">
      <div className="row mb-2">
        <div className="col-12">
          <h2>{formTitle}</h2>
          {status && !newVehicle && (
            <VehicleAlert
              status={status}
              user={fields.user}
              date={moment(fields.updateTimestamp).format('MMM D, YYYY')}
            />
          )}
          {status === 'CHANGES_REQUESTED' && vehicleComment && (
            <Comment commentArray={[vehicleComment]} />
          )}
        </div>
      </div>

      <form onSubmit={(event) => handleSubmit(event)}>
        <div className="row">
          <div className="col-xl-6 col-lg-12">
            <fieldset>
              <VehicleFormDropdown
                accessor={(model) => model.name}
                dropdownName="Model Year"
                dropdownData={vehicleYears}
                errorMessage={
                  'modelYear' in errorFields && 'Please select a Model Year'
                }
                fieldName="modelYear"
                handleInputChange={handleInputChange}
                selectedOption={fields.modelYear.name || fields.modelYear}
              />
              <AutocompleteInput
                label="Make"
                id="make"
                name="make"
                defaultValue={fields.make}
                errorMessage={'make' in errorFields && errorFields.make}
                handleInputChange={handleInputChange}
                mandatory
                possibleChoicesList={makes}
                setFields={setFields}
                fields={fields}
              />
              <TextInput
                defaultValue={fields.modelName}
                errorMessage={
                  ('modelName' in errorFields && errorFields.modelName) ||
                  ('nonFieldErrors' in errorFields &&
                    errorFields.nonFieldErrors.replace(/_/g, ' '))
                }
                handleInputChange={handleInputChange}
                id="modelName"
                label="Model"
                mandatory
                name="modelName"
              />
              <VehicleFormDropdown
                accessor={(zevType) => zevType.vehicleZevCode}
                className="mb-0"
                dropdownName="ZEV Type"
                dropdownData={vehicleTypes}
                errorMessage={
                  'vehicleZevType' in errorFields && 'Please select a ZEV Type'
                }
                fieldName="vehicleZevType"
                handleInputChange={handleInputChange}
                selectedOption={selectedZevType}
              />
              <div className="form-group row mt-0 pt-0 text-blue">
                <span className="col-sm-4" htmlFor="hasPassedUs06Test">
                  Claim Additional US06 0.2 credit
                </span>
                <div
                  className={`col-sm-8 ${
                    ['EREV', 'PHEV'].indexOf(selectedZevType) < 0
                      ? 'disabled'
                      : ''
                  }`}
                >
                  <input
                    checked={fields.hasPassedUs06Test}
                    disabled={['EREV', 'PHEV'].indexOf(selectedZevType) < 0}
                    name="hasPassedUs06Test"
                    onChange={handleInputChange}
                    type="checkbox"
                  />
                  (requires certificate upload)
                </div>
              </div>
              <TextInput
                additionalClasses="mb-0"
                defaultValue={fields.range}
                errorMessage={'range' in errorFields && errorFields.range}
                handleInputChange={handleInputChange}
                id="range"
                label="Electric EPA Range (km)"
                mandatory
                name="range"
              />
              <div className="form-group row mt-0 pt-0 text-blue">
                <span className="col-sm-4" htmlFor="uploadRangeResults">
                  Upload Proof of Range and Range Test Results
                </span>
                <div className={"col-sm-8"}>
                  <input
                    checked={uploadRangeResults}
                    name="uploadRangeResults"
                    onChange={(event) => {
                      setUploadRangeResults(event.target.checked)
                    }}
                    type="checkbox"
                  />
                </div>
              </div>
              <VehicleFormDropdown
                accessor={(classCode) => classCode.vehicleClassCode}
                dropdownName="Body Type"
                dropdownData={vehicleClasses}
                errorMessage={
                  'vehicleClassCode' in errorFields &&
                  'Please select a Body Type'
                }
                fieldName="vehicleClassCode"
                handleInputChange={handleInputChange}
                selectedOption={
                  fields.vehicleClassCode.vehicleClassCode ||
                  fields.vehicleClassCode
                }
              />
              <TextInput
                defaultValue={fields.weightKg}
                errorMessage={'weightKg' in errorFields && errorFields.weightKg}
                handleInputChange={handleInputChange}
                id="weightKg"
                label="GVWR (kg)"
                mandatory
                maxnum={4536}
                name="weightKg"
                num
              />
            </fieldset>
          </div>

          {(fields.hasPassedUs06Test || uploadRangeResults ||
            (status === 'CHANGES_REQUESTED' && setUploadFiles)) && (
            <div className="col-xl-6 col-lg-12 mt-2 mt-xl-0">
              <h3 className="font-weight-bold mb-2">
                Upload Files
              </h3>
              <fieldset>
                <div className="form-group row">
                  <label
                    className="col-sm-3 col-form-label"
                    htmlFor="file-upload"
                  >
                    File Upload
                  </label>
                  <div className="col-sm-9">
                    <ExcelFileDrop
                      setFiles={setUploadFiles}
                      maxFiles={100000}
                    />
                  </div>
                </div>

                <div className="form-group mt-4 row">
                  <div className="col-12 text-blue">
                    <strong>Files</strong> (doc, docx, xls, xlsx, pdf, jpg, png)
                  </div>
                </div>
                {(files.length > 0 ||
                  (fields.attachments && fields.attachments.length > 0)) && (
                  <div className="form-group uploader-files mt-3">
                    <div className="row">
                      <div className="col-8 filename header">Filename</div>
                      <div className="col-3 size header">Size</div>
                      <div className="col-1 actions header" />
                    </div>
                    {fields.attachments &&
                      fields.attachments
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
                                  deleteFile(attachment.id)
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
                        {!showProgressBars && [
                          <div className="col-3 size" key="size">
                            {getFileSize(file.size)}
                          </div>,
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
                        ]}
                        {showProgressBars && index in progressBars && (
                          <div className="col-4">
                            <div className="progress">
                              <div
                                aria-valuemax="100"
                                aria-valuemin="0"
                                aria-valuenow={progressBars[index]}
                                className="progress-bar"
                                role="progressbar"
                                style={{
                                  width: `${progressBars[index]}%`
                                }}
                              >
                                {progressBars[index]}%
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </fieldset>
            </div>
          )}
        </div>

        <div className="row">
          <div className="col-12">
            <div className="action-bar form-group row">
              <span className="left-content">
                <Button
                  buttonType="back"
                  locationRoute={ROUTES_VEHICLES.LIST}
                />
                {status &&
                  !newVehicle &&
                  (status === 'CHANGES_REQUESTED' || status === 'DRAFT') && (
                    <Button
                      buttonType="delete"
                      action={() => {
                        setModalType('delete')
                        setShowModal(true)
                      }}
                    />
                )}
              </span>

              <span className="right-content">
                <Button
                  buttonType="save"
                  optionalText="Save Draft"
                  action={(e) => {
                    handleSubmit(e)
                  }}
                />
                <Button
                  buttonType="submit"
                  disabled={
                    !eligibleWeight ||
                    (fields.hasPassedUs06Test &&
                      files.length === 0 &&
                      (!fields.attachments ||
                        fields.attachments.length <= deleteFiles.length))
                  }
                  action={() => {
                    setModalType('submit')
                    setShowModal(true)
                  }}
                />
              </span>
            </div>
            {modal}
          </div>
        </div>
      </form>
    </div>
  )
}

VehicleForm.defaultProps = {
  deleteFiles: [],
  errorFields: {},
  files: [],
  progressBars: {},
  setDeleteFiles: null,
  setUploadFiles: null,
  showProgressBars: false,
  status: undefined,
  vehicleComment: {}
}

VehicleForm.propTypes = {
  deleteFiles: PropTypes.arrayOf(PropTypes.number),
  errorFields: PropTypes.shape(),
  fields: PropTypes.shape().isRequired,
  files: PropTypes.arrayOf(PropTypes.shape()),
  formTitle: PropTypes.string.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  makes: PropTypes.arrayOf(PropTypes.string).isRequired,
  progressBars: PropTypes.shape(),
  setDeleteFiles: PropTypes.func,
  setFields: PropTypes.func.isRequired,
  setUploadFiles: PropTypes.func,
  setUploadRangeResults: PropTypes.func.isRequired,
  showProgressBars: PropTypes.bool,
  status: PropTypes.string,
  uploadRangeResults: PropTypes.bool.isRequired,
  vehicleTypes: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  vehicleYears: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  vehicleClasses: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  vehicleComment: PropTypes.shape()
}

export default VehicleForm
