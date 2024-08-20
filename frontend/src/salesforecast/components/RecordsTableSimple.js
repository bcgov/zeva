import React from "react";
import ReactTable from "react-table";
import columns from "../constants/recordsTableColumns";

const RecordsTableSimple = ({ items, pageSize }) => {
  return (
    <ReactTable
      columns={columns}
      data={items}
      filterable={false}
      sortable={false}
      showPageSizeOptions={false}
      defaultPageSize={pageSize}
    />
  );
};

export default RecordsTableSimple;
