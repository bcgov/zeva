import axios from 'axios';
import PropTypes from 'prop-types';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import moment from 'moment-timezone';
import History from '../../app/History';
import AutocompleteInput from '../../app/components/AutocompleteInput';
import ExcelFileDrop from '../../app/components/FileDrop';
import Loading from '../../app/components/Loading';
import TextInput from '../../app/components/TextInput';
import getFileSize from '../../app/utilities/getFileSize';
import VehicleFormDropdown from './VehicleFormDropdown';

const VehicleForm = (props) => {
  const {
    deleteFiles,
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
    showProgressBars,
    vehicleClasses,
    vehicleTypes,
    vehicleYears,
  } = props;
  const deleteFile = (attachmentId) => {
    setDeleteFiles([...deleteFiles, attachmentId]);
  };

  const removeFile = (removedFile) => {
    const found = files.findIndex((file) => (file === removedFile));
    files.splice(found, 1);

    setUploadFiles([...files]);
  };

  if (loading) {
    return (<Loading />);
  }

  return (
    <div id="form" className="page">
      <div className="row">
        <div className="col-12">
          <h1>{formTitle}</h1>
          {fields.validationStatus === 'CHANGES_REQUESTED'
          && (
          <div>
            <h6 className="request-changes-vehicle">Range test results have been requested by government</h6>
            <h6>
              <b>Comment from {fields.updateUser.displayName}, {moment(fields.updateTimestamp).format('MMM d, YYYY')}: </b>
              {fields.vehicleComment}
            </h6>
          </div>
          )}
        </div>
      </div>

      <form onSubmit={(event) => handleSubmit(event)}>
        <div className="row">
          <div className="col-lg-6">
            <fieldset>
              <VehicleFormDropdown
                accessor={(model) => model.name}
                dropdownName="Model Year"
                dropdownData={vehicleYears}
                fieldName="modelYear"
                handleInputChange={handleInputChange}
                selectedOption={fields.modelYear.name}
              />
              <AutocompleteInput
                label="Make"
                id="make"
                name="make"
                defaultValue={fields.make}
                handleInputChange={handleInputChange}
                mandatory
                possibleChoicesList={makes}
                setFields={setFields}
                fields={fields}
              />
              <TextInput
                label="Model"
                id="modelName"
                name="modelName"
                defaultValue={fields.modelName}
                handleInputChange={handleInputChange}
                mandatory
              />
              <VehicleFormDropdown
                accessor={(zevType) => zevType.vehicleZevCode}
                dropdownName="ZEV Type"
                dropdownData={vehicleTypes}
                fieldName="vehicleZevType"
                handleInputChange={handleInputChange}
                selectedOption={fields.vehicleZevType.vehicleZevCode}
              />
              <TextInput
                label="Electric Range (km)"
                id="range"
                name="range"
                defaultValue={fields.range}
                handleInputChange={handleInputChange}
                mandatory
              />
              <VehicleFormDropdown
                accessor={(classCode) => classCode.vehicleClassCode}
                dropdownName="Vehicle Class"
                dropdownData={vehicleClasses}
                fieldName="vehicleClassCode"
                handleInputChange={handleInputChange}
                selectedOption={fields.vehicleClassCode.vehicleClassCode}
              />
              <TextInput
                num
                label="GVWR (kg)"
                id="weightKg"
                name="weightKg"
                defaultValue={fields.weightKg}
                handleInputChange={handleInputChange}
                mandatory
              />
            </fieldset>
          </div>

          {fields.validationStatus === 'CHANGES_REQUESTED' && setUploadFiles && (
            <div className="col-lg-6">
              <h3 className="font-weight-bold mt-2">Upload range test results</h3>
              <fieldset>
                <div className="form-group row">
                  <label className="col-sm-3 col-form-label" htmlFor="file-upload">
                    File Upload
                  </label>
                  <div className="col-sm-9">
                    <ExcelFileDrop setFiles={setUploadFiles} maxFiles={100000} />
                  </div>
                </div>

                <div className="form-group mt-4 row">
                  <div className="col-12 text-blue">
                    <strong>Files</strong> (doc, docx, xls, xlsx, pdf, jpg, png)
                  </div>
                </div>
                {(files.length > 0 || (fields.attachments && fields.attachments.length > 0)) && (
                  <div className="form-group uploader-files mt-3">
                    <div className="row">
                      <div className="col-8 filename header">Filename</div>
                      <div className="col-3 size header">Size</div>
                      <div className="col-1 actions header" />
                    </div>
                    {fields.attachments.filter((attachment) => (
                      deleteFiles.indexOf(attachment.id) < 0
                    )).map((attachment) => (
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
                              deleteFile(attachment.id);
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
                          <div className="col-3 size" key="size">{getFileSize(file.size)}</div>,
                          <div className="col-1 actions" key="actions">
                            <button
                              className="delete"
                              onClick={() => {
                                removeFile(file);
                              }}
                              type="button"
                            >
                              <FontAwesomeIcon icon="trash" />
                            </button>
                          </div>,
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
                                  width: `${progressBars[index]}%`,
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
                <button
                  className="button"
                  type="button"
                  onClick={() => {
                    History.goBack();
                  }}
                >
                  <FontAwesomeIcon icon="arrow-left" /> Back
                </button>
              </span>

              <span className="right-content">
                <button className="button primary" type="submit">
                  <FontAwesomeIcon icon="save" /> Save
                </button>
              </span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

VehicleForm.defaultProps = {
  deleteFiles: [],
  files: [],
  progressBars: {},
  setDeleteFiles: null,
  setUploadFiles: null,
  showProgressBars: false,
};

VehicleForm.propTypes = {
  deleteFiles: PropTypes.arrayOf(PropTypes.number),
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
  showProgressBars: PropTypes.bool,
  vehicleTypes: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  vehicleYears: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  vehicleClasses: PropTypes.arrayOf(PropTypes.shape()).isRequired,
};

export default VehicleForm;
