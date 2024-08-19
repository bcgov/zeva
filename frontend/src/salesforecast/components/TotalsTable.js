import React, { useState, useEffect } from "react";
import axios from "axios";
import TextInput from "../../app/components/TextInput";
import FORECAST_ROUTES from "../constants/routes";

const TotalsTable = ({
  currentModelYear,
  modelYearReportId,
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

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(FORECAST_ROUTES.TOTALS.replace(/:id/g, modelYearReportId))
      .then((response) => {
        const retrievedTotals = response.data;
        setTotals(retrievedTotals);
        setLoading(false);
      });
  }, []);

  const handleInputChange = (event) => {
    const totalName = event.target.name;
    let totalValue = event.target.value;
    if (totalValue === "") {
      totalValue = null;
    }
    const totalsToSet = { ...totals };
    totalsToSet[totalName] = totalValue;
    setTotals(totalsToSet);
  };

  const getTotalCells = (row) => {
    const result = [];
    for (const totalName of row) {
      const cell = (
        <td key={totalName}>
          <TextInput
            id={totalName}
            label={""}
            name={totalName}
            num={true}
            defaultValue={
              totals[totalName] === null ? undefined : totals[totalName]
            }
            handleInputChange={handleInputChange}
            readonly={readOnly}
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
    const headerCell = <td key={header}>{header}</td>;
    headerCells.push(headerCell);

    let sum = 0;
    for (const totalName of column) {
      sum = sum + (totals[totalName] ? parseInt(totals[totalName]) : 0);
    }
    const sumCell = <td key={header}>{sum}</td>;
    sumCells.push(sumCell);
  }

  if (loading) {
    return null;
  }

  return (
    <table>
      <tbody>
        <tr>
          <td>Total Sales</td>
          {headerCells}
        </tr>
        <tr>
          <td>ICE Vehicle Sales</td>
          {getTotalCells(rows[0])}
        </tr>
        <tr>
          <td>ZEV Sales</td>
          {getTotalCells(rows[1])}
        </tr>
        <tr>
          <td>Total Vehicle Sales</td>
          {sumCells}
        </tr>
      </tbody>
    </table>
  );
};

export default TotalsTable;
