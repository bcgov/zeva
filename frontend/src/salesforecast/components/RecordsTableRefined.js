import React from "react";
import ReactTable from "react-table";
import columns from "../constants/recordsTableColumns";
import calculateNumberOfPages from "../../app/utilities/calculateNumberOfPages";

const RecordsTableRefined = ({
  items,
  itemsCount,
  loading,
  page,
  pageSize,
  setPage,
}) => {
  return (
    <ReactTable
      manual
      columns={columns}
      data={items}
      loading={loading}
      filterable={false}
      sortable={false}
      showPageSizeOptions={false}
      page={page - 1}
      pages={calculateNumberOfPages(itemsCount, pageSize)}
      pageSize={pageSize}
      onPageChange={(pageIndex) => {
        setPage(pageIndex + 1);
      }}
    />
  );
};

export default RecordsTableRefined;
