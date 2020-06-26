/*
 * Presentational component
 */
import PropTypes from 'prop-types';
import React from 'react';
import ReactTable from 'react-table';

const SalesSubmissionVehiclesTable = (props) => {
  const {
    routeParams,
    submission,
  } = props;

  const columns = [{
    accessor: 'vehicle.modelYear',
    className: 'text-center',
    Header: 'MY',
    width: 120,
  }, {
    accessor: 'vehicle.make',
    Header: 'Make',
    id: 'make',
    width: 150,
  }, {
    accessor: 'vehicle.modelName',
    Header: 'Model',
    id: 'model',
  }, {
    accessor: 'saleDate',
    className: 'text-center',
    Header: 'Retail Sales Date',
    width: 150,
  }, {
    accessor: 'vin',
    className: 'text-center',
    Header: 'VIN',
    width: 200,
  }];

  const filterMethod = (filter, row) => {
    const id = filter.pivotId || filter.id;
    return row[id] !== undefined ? String(row[id])
      .toLowerCase()
      .includes(filter.value.toLowerCase()) : true;
  };

  const filterable = true;

  return (
    <ReactTable
      className="searchable"
      columns={columns}
      data={submission.records.filter(
        (record) => (record.vehicle.id === parseInt(routeParams.vehicle_id, 10)),
      )}
      defaultFilterMethod={filterMethod}
      defaultPageSize={submission.records.length}
      defaultSorted={[{
        id: 'make',
      }]}
      filterable={filterable}
      pageSizeOptions={[submission.records.length, 5, 10, 15, 20, 25, 50, 100]}
    />
  );
};

SalesSubmissionVehiclesTable.defaultProps = {};

SalesSubmissionVehiclesTable.propTypes = {
  routeParams: PropTypes.shape().isRequired,
  submission: PropTypes.shape({
    records: PropTypes.arrayOf(PropTypes.shape({})),
    submissionDate: PropTypes.string,
  }).isRequired,
};

export default SalesSubmissionVehiclesTable;
