import PropTypes from 'prop-types';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import History from '../../app/History';
import Loading from '../../app/components/Loading';
import VehicleFormDropdown from './VehicleFormDropdown';
import TextInput from '../../app/components/TextInput';
import ExcelFileDrop from '../../app/components/FileDrop';
import getFileSize from '../../app/utilities/getFileSize';

const VehicleForm = (props) => {
  const {
    fields,
    files,
    formTitle,
    handleInputChange,
    handleSubmit,
    handleUpload,
    loading,
    progressBars,
    setUploadFiles,
    showProgressBars,
    vehicleClasses,
    vehicleTypes,
    vehicleYears,
  } = props;

  if (loading) {
    return (<Loading />);
  }

  return (
    <div id="form" className="page">
      <div className="row">
        <div className="col-md-12">
          <h1>{formTitle}</h1>
        </div>
      </div>

      <form onSubmit={(event) => handleSubmit(event)}>
        <div className="row">
          <div className="col-md-6">
            <fieldset>
              <VehicleFormDropdown
                accessor={(model) => model.name}
                dropdownName="Model Year"
                dropdownData={vehicleYears}
                fieldName="modelYear"
                handleInputChange={handleInputChange}
                selectedOption={fields.modelYear.name}
              />
              <TextInput
                label="Make"
                id="make"
                name="make"
                defaultValue={fields.make}
                handleInputChange={handleInputChange}
                mandatory
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

          <div className="col-md-6">
            <h3 className="font-weight-bold">Upload range test results</h3>
            <fieldset>
              <div className="form-group">
                <ExcelFileDrop setFiles={setUploadFiles} maxFiles={100000} />
              </div>

              <div className="form-group mt-3 text-blue">
                <strong>Files</strong> (doc, docx, xls, xlsx, pdf, jpg, png)
              </div>

              {files.length > 0 && (
                <div className="form-group uploader-files mt-3">
                  <div className="row">
                    <div className="col-8 filename header">Filename</div>
                    <div className="col-3 size header">Size</div>
                    <div className="col-1 actions header" />
                  </div>
                  {files.map((file, index) => (
                    <div className="row" key={file.name}>
                      <div className="col-8 filename">{file.name}</div>
                      {!showProgressBars && [
                        <div className="col-3 size" key="size">{getFileSize(file.size)}</div>,
                        <div className="col-1 actions" key="actions">
                          <button
                            className="delete"
                            onClick={() => {
                              // removeFile(file);
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
                <button
                  className="button primary"
                  onClick={() => {
                    handleUpload();
                  }}
                  type="button"
                >
                  <FontAwesomeIcon icon="save" /> Upload
                </button>
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
  files: [],
  handleUpload: () => {},
  progressBars: {},
  setUploadFiles: () => {},
};

VehicleForm.propTypes = {
  fields: PropTypes.shape().isRequired,
  files: PropTypes.arrayOf(PropTypes.shape()),
  formTitle: PropTypes.string.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  handleUpload: PropTypes.func,
  handleSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  progressBars: PropTypes.shape(),
  setUploadFiles: PropTypes.func,
  showProgressBars: PropTypes.bool.isRequired,
  vehicleTypes: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  vehicleYears: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  vehicleClasses: PropTypes.arrayOf(PropTypes.shape()).isRequired,
};

export default VehicleForm;
