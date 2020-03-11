/*
 * Presentational component
 */
import PropTypes from 'prop-types';
import React from 'react';
import ReactTable from 'react-table';
import history from '../../app/History';

const SalesSubmissionListTable = (props) => {
  const columns = [
    {
      Header: 'Submission ID',
      accessor: 'submissionId',
    },
    {
      Header: 'Status',
      accessor: 'validationStatus',
    },
    {
      Header: 'Total VINs',
      accessor: 'totals.vins',
    },
    {
      Header: 'Date',
      accessor: 'submissionDate',
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
        id: 'submissionDate',
      }]}
      getTrProps={(state, row) => {
        if (row && row.original) {
          return {
            onClick: () => {
              const { id } = row.original;

              history.push(`/sales/${id}`);
            },
            className: 'clickable',
          };
        }

        return {};
      }}
      filterable={filterable}
      pageSizeOptions={[5, 10, 15, 20, 25, 50, 100]}
    />
  );
};

SalesSubmissionListTable.defaultProps = {};

SalesSubmissionListTable.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

export default SalesSubmissionListTable;
