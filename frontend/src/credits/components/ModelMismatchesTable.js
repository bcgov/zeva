import React from "react";
import { useEffect, useMemo, useState } from "react";
import ReactTable from "../../app/components/ReactTable";
import axios from "axios";
import ROUTES_CREDIT_REQUESTS from "../../app/routes/CreditRequests";
import Loading from "../../app/components/Loading";

export const ModelMismatchesTable = ({ salesSubmissionId }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({});

  useEffect(() => {
    axios
      .get(
        ROUTES_CREDIT_REQUESTS.MODEL_MISMATCHES.replace(
          /:id/g,
          salesSubmissionId,
        ),
      )
      .then((response) => {
        const transformedData = [];
        const modelMismatchesMap = response.data;
        Object.entries(modelMismatchesMap).forEach(
          ([modelName, map], index) => {
            transformedData.push({ index, modelName, map });
          },
        );
        setData(transformedData);
        setLoading(false);
      });
  }, [salesSubmissionId]);

  const columns = useMemo(() => {
    return [
      {
        accessor: (item) => item.index + 1,
        id: "rowNumber",
        className: "text-center",
        filterable: false,
        sortable: false,
        width: 50,
      },
      {
        accessor: (item) => item.modelName,
        id: "modelName",
        Header: "Submitted Model Name",
        width: 300,
      },
      {
        accessor: (item) => Object.keys(item.map).join(", "),
        id: "icbcModelName",
        Header: "ICBC Model Name",
        width: 300,
        Cell: (cellProps) => (
          <ul>
            {Object.keys(cellProps.original.map).map((icbcModelName) => (
              <li key={icbcModelName}>{icbcModelName}</li>
            ))}
          </ul>
        ),
        sortable: false,
      },
      {
        accessor: (item) => Object.values(item.map).join(", "),
        id: "count",
        Header: "Count",
        width: 200,
        Cell: (cellProps) => (
          <ul>
            {Object.entries(cellProps.original.map).map(
              ([icbcModelName, count]) => (
                <li key={icbcModelName}>{count}</li>
              ),
            )}
          </ul>
        ),
        sortable: false,
      },
    ];
  }, []);

  if (loading) {
    return <Loading />;
  }
  return <ReactTable columns={columns} data={data} showPagination={true} />;
};
