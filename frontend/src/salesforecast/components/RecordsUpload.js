import React, { useEffect, useState } from "react";
import axios from "axios";
import { read, utils } from "xlsx";
import Button from "../../app/components/Button";
import FileDropArea from "../../app/components/FileDropArea";
import FORECAST_ROUTES from "../constants/routes";
import download from "../../app/utilities/download";
import columnMapping from "../constants/columnMapping";
import { zevTypes, zevClasses, vehicleClasses } from "../constants/template_constants";

const RecordsUpload = ({ currentModelYear, setRecords, setTotals }) => {
  const [files, setFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const validateHeaders = (headers) => {
    for (const header of Object.keys(columnMapping)) {
      if (!headers.includes(header)) {
        throw new Error("The dataset is missing the column: " + header);
      }
    }
  }

  const getInternalRecords = (records) => {
    const result = [];
    for (const record of records) {
      const internalRecord = {};
      for (const [spreadsheetName, internalName] of Object.entries(
        columnMapping,
      )) {
        internalRecord[internalName] = record[spreadsheetName];
      }
      result.push(internalRecord);
    }
    return result;
  };

  const validateRecords = (records) => {
    records.forEach((record) => {
      if (!/^\d{4}$/.test(record.modelYear)) {
        throw new Error("Model year must be a 4-digit integer.");
      }
      if (
        typeof record.make !== "string" ||
        record.make === "" ||
        record.make.length > 250
      ) {
        throw new Error(
          "Make must be a non-empty string that is no more than 250 characters.",
        );
      }
      if (
        typeof record.modelName !== "string" ||
        record.modelName === "" ||
        record.modelName.length > 250
      ) {
        throw new Error(
          "Model must be a non-empty string that is no more than 250 characters.",
        );
      }
      if (!zevTypes.includes(record.type)) {
        throw new Error(
          `Type must be one of the following values: ${zevTypes.join(", ")}.`,
        );
      }
      if (
        typeof record.range !== "number" ||
        !/^\d+(\.\d{1,2})?$/.test(record.range.toString())
      ) {
        throw new Error(
          "Range must be a number with no more than 2 decimal places.",
        );
      }
      if (!zevClasses.includes(record.zevClass)) {
        throw new Error(`ZEV class must be one of the following values: ${zevClasses.join(", ")}.`,);
      }
      if (
        typeof record.vehicleClassInteriorVolume !== "string" ||
        record.vehicleClassInteriorVolume === "" ||
        record.vehicleClassInteriorVolume.length > 250
      ) {
        throw new Error(
          "Vehicle class and Interior Volume must be a non-empty string that is no more than 250 characters.",
        );
      }
      if (!Number.isInteger(record.totalSupplied)) {
        throw new Error("ZEVs Supply Forecast must be an integer.");
      }
    });
  };

  const getZevTotals = (records) => {
    const modelYear1 = currentModelYear + 1;
    const modelYear2 = currentModelYear + 2;
    const modelYear3 = currentModelYear + 3;
    let zevVehiclesOne = 0;
    let zevVehiclesTwo = 0;
    let zevVehiclesThree = 0;
    for (const record of records) {
      const modelYear = record.modelYear;
      const totalSupplied = record.totalSupplied;
      if (modelYear === modelYear1) {
        zevVehiclesOne = zevVehiclesOne + totalSupplied;
      } else if (modelYear === modelYear2) {
        zevVehiclesTwo = zevVehiclesTwo + totalSupplied;
      } else if (modelYear === modelYear3) {
        zevVehiclesThree = zevVehiclesThree + totalSupplied;
      }
    }
    return { zevVehiclesOne, zevVehiclesTwo, zevVehiclesThree };
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
              validateHeaders(Object.keys(records[0]))
              const internalRecords = getInternalRecords(records);
              validateRecords(internalRecords);
              setRecords(internalRecords);
              const zevTotals = getZevTotals(internalRecords);
              setTotals((prev) => {
                return { ...prev, ...zevTotals };
              });
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
      download(url, { headers: { Authorization: null } }, 'forecast_report_template.xlsx');
    });
  };

  return (
    <div className="row my-1">
      <div className="col-12">
        <div className="p-3 consumer-sales">
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
