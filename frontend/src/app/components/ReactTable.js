/*
Custom React Table that has dynamic page size resizing
ie. Page Size options is disabled and the number of row displayed
is based on the items provided
*/
import PropTypes from 'prop-types';
import React, { useRef, useState } from 'react';
import ReactTable from 'react-table';

const CustomReactTable = (props) => {
  const {
    className,
    columns,
    data,
    defaultSorted,
    filterable,
    filtered: propsFiltered,
    getTrProps,
    onFilteredChange,
  } = props;

  const [pageSize, setPageSize] = useState(data.length);
  const [filtered, setFiltered] = useState(propsFiltered);
  let reactTable = useRef(null);

  const defaultFilterMethod = (filter, row) => {
    const id = filter.pivotId || filter.id;
    return row[id] !== undefined ? String(row[id])
      .toLowerCase()
      .includes(filter.value.toLowerCase()) : true;
  };

  return (
    <ReactTable
      ref={(r) => {
        reactTable = r;
      }}
      className={`searchable ${className}`}
      columns={columns}
      filtered={filtered}
      data={data}
      defaultFilterMethod={defaultFilterMethod}
      onFilteredChange={(input) => {
        onFilteredChange(input);
        setFiltered(input);
        setPageSize(reactTable.getResolvedState().sortedData.length);
      }}
      defaultPageSize={data.length}
      defaultSorted={defaultSorted}
      filterable={filterable}
      getTrProps={getTrProps}
      pageSize={pageSize}
      pageSizeOptions={[pageSize]}
      showPagination={false}
    />
  );
};

CustomReactTable.defaultProps = {
  className: '',
  filterable: true,
  filtered: [],
  getTrProps: () => {},
  onFilteredChange: () => {},
};

CustomReactTable.propTypes = {
  className: PropTypes.string,
  columns: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  defaultSorted: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  filterable: PropTypes.bool,
  filtered: PropTypes.arrayOf(PropTypes.shape({})),
  getTrProps: PropTypes.func,
  onFilteredChange: PropTypes.func,
};

export default CustomReactTable;
