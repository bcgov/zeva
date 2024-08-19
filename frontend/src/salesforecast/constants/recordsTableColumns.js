const recordsTableColumns = [
  {
    accessor: (item) => item.modelYear,
    className: "text-center",
    Header: "Model Year",
    headerClassName: "font-weight-bold ",
    id: "model-year",
    maxWidth: 200,
  },
  {
    accessor: (item) => item.make,
    className: "text-center",
    Header: "Make",
    headerClassName: "font-weight-bold",
    id: "make",
    maxWidth: 200,
  },
  {
    accessor: (item) => item.modelName,
    className: "text-center",
    Header: "Model",
    headerClassName: "font-weight-bold",
    id: "model",
    maxWidth: 200,
  },
  {
    accessor: (item) => item.type,
    className: "text-center",
    Header: "Type",
    headerClassName: "font-weight-bold",
    id: "type",
    maxWidth: 200,
  },
  {
    accessor: (item) => item.range,
    className: "text-center",
    Header: "Range(km)",
    headerClassName: "font-weight-bold",
    id: "range",
    maxWidth: 200,
  },
  {
    accessor: (item) => item.zevClass,
    className: "text-center",
    Header: "ZEV Class",
    headerClassName: "font-weight-bold",
    id: "zev-class",
    maxWidth: 200,
  },
  {
    accessor: (item) => item.interiorVolume,
    className: "text-center",
    Header: "Interior Volume (cu ft)",
    headerClassName: "font-weight-bold",
    id: "volume",
    maxWidth: 200,
  },
  {
    accessor: (item) => item.totalSales,
    className: "text-center",
    Header: "Total Sales Forecast",
    headerClassName: "font-weight-bold",
    id: "sales",
    maxWidth: 200,
  },
];

export default recordsTableColumns;
