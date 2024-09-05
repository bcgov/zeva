import React, { useState, useEffect } from "react";
import axios from "axios";
import TextInput from "../../app/components/TextInput";
import FORECAST_ROUTES from "../constants/routes";

const TotalsTable = ({
  currentModelYear,
  modelYearReportId,
  passedRecords = [],
  totals = {},
  setTotals,
  readOnly = false,
}) => {
  const rows = [
    ["iceVehiclesOne", "iceVehiclesTwo", "iceVehiclesThree"],
    ["zevVehiclesOne", "zevVehiclesTwo", "zevVehiclesThree"],
  ];
  const columns = rows[0].map((cell, colIndex) => {
    return rows.map((row) => {
      return row[colIndex];
    });
  });

  const [savedZevTotals, setSavedZevTotals] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(FORECAST_ROUTES.TOTALS.replace(/:id/g, modelYearReportId))
      .then((response) => {
        const retrievedTotals = response.data;
        setSavedZevTotals({
          zevVehiclesOne: retrievedTotals.zevVehiclesOne,
          zevVehiclesTwo: retrievedTotals.zevVehiclesTwo,
          zevVehiclesThree: retrievedTotals.zevVehiclesThree,
        });
        setTotals(retrievedTotals);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (passedRecords.length === 0) {
      setTotals((prev) => {
        return { ...prev, ...savedZevTotals };
      });
    }
  }, [passedRecords, savedZevTotals]);

  const handleInputChange = (event) => {
    const totalName = event.target.name;
    let totalValue = event.target.value;
    if (totalValue === "") {
      totalValue = null;
    }
    setTotals((prev) => {
      return { ...prev, [totalName]: totalValue };
    });
  };

  const getTotalCells = (row, disabled = false) => {
    const result = [];
    for (const totalName of row) {
      const cell = (
        <td key={totalName}>
          <TextInput
            id={totalName}
            label={""}
            labelSize={""}
            name={totalName}
            num={true}
            defaultValue={
              totals[totalName] === null ? undefined : totals[totalName]
            }
            handleInputChange={handleInputChange}
            readonly={readOnly || disabled}
            additionalClasses={"center-horizontal-content"}
          />
        </td>
      );
      result.push(cell);
    }
    return result;
  };

  const headerCells = [];
  const sumCells = [];
  for (const [index, column] of columns.entries()) {
    const header = parseInt(currentModelYear) + index + 1;
    const headerCell = (
      <td key={header}>
        <div className="center-horizontal-content">{header}</div>
      </td>
    );
    headerCells.push(headerCell);

    let sum = 0;
    for (const totalName of column) {
      sum = sum + (totals[totalName] ? parseInt(totals[totalName]) : 0);
    }
    const sumCell = (
      <td key={header}>
        <div className="center-horizontal-content">{sum}</div>
      </td>
    );
    sumCells.push(sumCell);
  }

  if (loading) {
    return null;
  }

  return (
    <div className="row my-1">
      <div className="col-12">
        <div className="p-3 consumer-sales totals-table">
          <table>
            <tbody>
              <tr className="totals-header">
                <td>Total</td>
                {headerCells}
              </tr>
              <tr>
                <td>ICE Supply Forecast</td>
                {getTotalCells(rows[0])}
              </tr>
              <tr>
                <td>ZEV Supply Forecast</td>
                {getTotalCells(rows[1], true)}
              </tr>
              <tr>
                <td>Total Vehicle Supply Forecast</td>
                {sumCells}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TotalsTable;
