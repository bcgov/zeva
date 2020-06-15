/*
 * Presentational component
 */
import moment from 'moment-timezone';
import PropTypes from 'prop-types';
import React from 'react';
import ReactTable from 'react-table';

import formatStatus from '../../app/utilities/formatStatus';

const VehicleHistoryTable = (props) => {
  const columns = [
    {
      accessor: (row) => (row.createUser && row.createUser.displayName),
      Header: 'User',
      id: 'user',
    }, {
      accessor: (row) => formatStatus(row.validationStatus),
      className: 'text-center text-capitalize',
      Header: 'Status',
      id: 'status',
    }, {
      accessor: (row) => moment(row.createTimestamp).format('YYYY-MM-DD h[:]mm a'),
      className: 'text-center',
      Header: 'Timestamp',
      id: 'timestamp',
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
        id: 'at',
      }]}
      filterable={filterable}
      pageSizeOptions={[5, 10, 15, 20, 25, 50, 100]}
    />
  );
};

VehicleHistoryTable.defaultProps = {};

VehicleHistoryTable.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
  })).isRequired,
};

export default VehicleHistoryTable;
