import React from "react";
import PropTypes from "prop-types";
import Button from "../../app/components/Button";
import FileDropArea from "../../app/components/FileDropArea";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ConsumerSalesForecastTable from "./ConsumerSalesForecastTable";

const ConsumerSalesForecast = (props) => {
  const {
    files,
    setFiles,
    errorMessage,
    setErrorMessage,
    handleUploadForecastRecords,
    handleDownloadForecastTemplate,
  } = props;

  return (
    <div className='row my-1'>
      <div className='col-12'>
        <div className='p-3 consumer-sales'>
          <h3>Sales Forecast</h3>
          <div className='ldv-zev-models mt-2'>
            <b>
              Download an excel template for Sales Forecast for proper
              completion and successful uploading.
            </b>
            <div className='my-3'>
              <Button
                buttonType='download'
                optionalText='Download Excel Template'
                optionalClassname='button'
                action={(e) => {
                  handleDownloadForecastTemplate();
                }}
              />
            </div>
            <div className='ldv-zev-models mt-2'>
              <b>Upload Sales Forecast here (Maximum 2,000 rows)</b>
              <FileDropArea
                type='excel'
                files={files}
                setUploadFiles={setFiles}
                errorMessage={errorMessage}
                setErrorMessage={setErrorMessage}
              />
              <button
                disabled={files.length === 0}
                className='button primary my-3'
                onClick={() => {
                  handleUploadForecastRecords();
                }}
                type='button'
              >
                <FontAwesomeIcon icon='upload' />
                Upload
              </button>
            </div>
          </div>
        </div>
        <div className='p-3 consumer-sales'>
          {/* <ConsumerSalesForecastTable data={[{}]} /> */}
        </div>
      </div>
    </div>
  );
};

ConsumerSalesForecast.defaultProps = {
  errorMessage: "",
};

ConsumerSalesForecast.propTypes = {
  files: PropTypes.array.isRequired,
  setFiles: PropTypes.func.isRequired,
  errorMessage: PropTypes.string,
  setErrorMessage: PropTypes.func.isRequired,
};

export default ConsumerSalesForecast;
