import React, { useEffect, useState } from "react";
import axios from "axios";
import { read, utils } from "xlsx";
import Button from "../../app/components/Button";
import FileDropArea from "../../app/components/FileDropArea";
import FORECAST_ROUTES from "../constants/routes";
import download from "../../app/utilities/download";

const RecordsUpload = ({ setRecords }) => {
  const [files, setFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const getInternalRecords = (records) => {
    //todo: this function should return a new array L of objects such that any object x in L
    //is a record with "internal keys" instead of "spreadsheet keys" (e.g. "modelYear" instead of "Model Year").
    return records;
  };

  const validateRecords = (records) => {
    //todo: validate internal records (see the python SalesForecastRecord model);
    //should throw an error with a message as soon as validation fails for any record
  };

  useEffect(() => {
    if (files.length === 0) {
      setRecords([]);
    } else {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const workbook = read(event.target.result, { type: "array" });
          const sheet = workbook.Sheets["Forecast Report"];
          const records = utils.sheet_to_json(sheet);
          if (!records || records.length === 0) {
            setErrorMessage("No records found");
          } else if (records.length > 2000) {
            setErrorMessage("No more than 2000 records allowed");
          } else {
            try {
              const internalRecords = getInternalRecords(records);
              validateRecords(internalRecords);
              setRecords(internalRecords);
            } catch (error) {
              setErrorMessage(error.message);
            }
          }
        } catch (error) {
          setErrorMessage("Could not parse uploaded file");
        }
      };
      reader.readAsArrayBuffer(file);
    }
  }, [files]);

  const handleDownloadTemplate = () => {
    axios.get(FORECAST_ROUTES.TEMPLATE).then((response) => {
      const url = response.data.url;
      download(url, { headers: { Authorization: null } });
    });
  };

  return (
    <div className="row my-1">
      <div className="col-12">
        <div className="p-3 consumer-sales">
          <h3>Forecast Report</h3>
          <div className="ldv-zev-models mt-2">
            <b>
              Download a "Forecast Report" Excel template for proper completion
              and successful uploading.
            </b>
            <div className="my-3">
              <Button
                buttonType="download"
                optionalText="Download Excel Template"
                optionalClassname="button"
                action={handleDownloadTemplate}
              />
            </div>
            <div className="ldv-zev-models mt-2">
              <b>Upload Forecast Report here (Maximum 2,000 rows)</b>
              <FileDropArea
                type="excel"
                files={files}
                setUploadFiles={setFiles}
                errorMessage={errorMessage}
                setErrorMessage={setErrorMessage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordsUpload;
