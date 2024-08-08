import PropTypes from "prop-types";
import React from "react";
import ReactTable from "../../app/components/ReactTable";

const ConsumerSalesForecastTable = (props) => {
  const { data } = props;

  const columns = [
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
      accessor: (item) => item.vehicleZevType,
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
      accessor: (item) => item.volume,
      className: "text-center",
      Header: "Interior Volume (cu ft)",
      headerClassName: "font-weight-bold",
      id: "volume",
      maxWidth: 200,
    },
    {
      accessor: (item) => item.sales,
      className: "text-center",
      Header: "Total Sales Forecast",
      headerClassName: "font-weight-bold",
      id: "sales",
      maxWidth: 200,
    },
  ];

  return (
    <ReactTable
      className='compliance-reports-table'
      columns={columns}
      data={{}}
      filterable={false}
    />
  );
};

ConsumerSalesForecastTable.defaultProps = {};

ConsumerSalesForecastTable.propTypes = {
  data: PropTypes.shape().isRequired,
};

export default ConsumerSalesForecastTable;
