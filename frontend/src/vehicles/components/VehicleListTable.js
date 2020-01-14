/*
 * Presentational component
 */
import PropTypes from 'prop-types';
import React from 'react';
import ReactTable from 'react-table';

import history from '../../app/History';

const VehicleListTable = (props) => {
  const columns = [
    {
      accessor: 'make',
      Header: 'Make',
    },
    {
      accessor: 'model',
      Header: 'Model',
    },
    {
      accessor: 'trim',
      Header: 'Trim',
    },
    {
      accessor: (v) => v.modelYear.name,
      Header: 'Model Year',
      id: 'col-my',
    },
    {
      accessor: 'type',
      Header: 'Type',
    },
    {
      accessor: 'range',
      Header: 'Range (km)',
    },
    {
      accessor: (v) => ((v.creditValue && v.creditValue.a) ? v.creditValue.a : ''),
      Header: 'Class A Credits',
      id: 'col-class-a',
    },
    {
      accessor: (v) => ((v.creditValue && v.creditValue.b) ? v.creditValue.b : ''),
      Header: 'Class B Credits',
      id: 'col-class-b',
    },
    {
      accessor: (v) => (v.validated ? 'Yes' : 'No'),
      Header: 'Validated',
      id: 'col-validated',
    },
  ];

  const filterMethod = (filter, row) => {
    const id = filter.pivotId || filter.id;
    return row[id] !== undefined ? String(row[id])
      .toLowerCase()
      .includes(filter.value.toLowerCase()) : true;
  };

  const filterable = true;

  const { items } = props;

  return (
    <ReactTable
      className="searchable"
      columns={columns}
      data={items}
      defaultFilterMethod={filterMethod}
      defaultPageSize={10}
      defaultSorted={[{
        id: 'displayName',
      }]}
      filterable={filterable}
      getTrProps={(state, row) => {
        if (row && row.original) {
          return {
            onClick: () => {
              const { id } = row.original;

              history.push(`/vehicles/${id}`);
            },
            className: 'clickable',
          };
        }

        return {};
      }}
      pageSizeOptions={[5, 10, 15, 20, 25, 50, 100]}
    />
  );
};

VehicleListTable.defaultProps = {};

VehicleListTable.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number,
  })).isRequired,
};

export default VehicleListTable;
