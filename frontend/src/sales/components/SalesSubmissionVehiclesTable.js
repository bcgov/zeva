/*
 * Presentational component
 */
import PropTypes from 'prop-types';
import React from 'react';
import ReactTable from 'react-table';

const SalesSubmissionVehiclesTable = (props) => {
  const { submission } = props;

  const columns = [{
    accessor: 'id',
    className: 'text-right',
    Header: 'Sales ID',
    id: 'id',
    width: 100,
    filterable: false,
  }, {
    accessor: () => (submission.submissionDate),
    className: 'text-center',
    Header: 'Submission Date',
    id: 'submission-date',
    width: 100,
    filterable: false,
  }, {
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
    accessor: 'vin',
    className: 'text-center',
    Header: 'VIN',
    width: 200,
  }, {
    accessor: 'saleDate',
    className: 'text-center',
    Header: 'Sales Date',
    width: 150,
  }, {
    accessor: 'credits',
    className: 'text-right',
    Header: 'Credits',
    width: 120,
  }, {
    accessor: () => (<input type="checkbox" />),
    className: 'text-center',
    Header: 'Validate',
    id: 'validated',
    width: 100,
  }, {
    accessor: 'vinValidationStatus',
    className: 'text-center',
    Header: 'Satus',
    id: 'status',
    width: 150,
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
      data={submission.records}
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
  submission: PropTypes.shape({
    records: PropTypes.arrayOf(PropTypes.shape({})),
  }).isRequired,
};

export default SalesSubmissionVehiclesTable;
