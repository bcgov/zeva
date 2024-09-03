import React, { useEffect, useState } from "react";
import axios from "axios";
import RecordsTableSimple from "./RecordsTableSimple";
import RecordsTableRefined from "./RecordsTableRefined";
import FORECAST_ROUTES from "../constants/routes";

const RecordsTable = ({ modelYearReportId, passedRecords = [] }) => {
  const hasPassedRecords = passedRecords.length !== 0;
  const pageSize = 8;

  const [savedRecordsLoading, setSavedRecordsLoading] =
    useState(!hasPassedRecords);
  const [savedRecords, setSavedRecords] = useState([]);
  const [savedRecordsCount, setSavedRecordsCount] = useState(0);
  const [savedRecordsPage, setSavedRecordsPage] = useState(1);

  useEffect(() => {
    if (!hasPassedRecords) {
      setSavedRecordsLoading(true);
      axios
        .get(
          FORECAST_ROUTES.RECORDS.replace(/:id/, modelYearReportId)
            .replace(/:pg_num/g, savedRecordsPage)
            .replace(/:pg_size/g, pageSize),
        )
        .then((response) => {
          setSavedRecords(response.data.results);
          setSavedRecordsCount(response.data.count);
          setSavedRecordsLoading(false);
        });
    }
  }, [hasPassedRecords, savedRecordsPage]);

  if (hasPassedRecords) {
    return <RecordsTableSimple items={passedRecords} pageSize={pageSize} />;
  }
  return (
          <RecordsTableRefined
        items={savedRecords}
        itemsCount={savedRecordsCount}
        loading={savedRecordsLoading}
        page={savedRecordsPage}
        pageSize={pageSize}
        setPage={setSavedRecordsPage}
      />
        );
};

export default RecordsTable;
