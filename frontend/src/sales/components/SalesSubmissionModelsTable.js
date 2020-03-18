/*
 * Presentational component
 */
import PropTypes from 'prop-types';
import React from 'react';
import ReactTable from 'react-table';
import _ from 'lodash';

import history from '../../app/History';
import ROUTES_SALES from '../../app/routes/Sales';

const SalesSubmissionModelsTable = (props) => {
  const columns = [{
    accessor: 'sales',
    className: 'text-right',
    Header: 'Sales',
    id: 'sales',
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
    width: 200,
  }, {
    accessor: 'vehicle.modelName',
    Header: 'Model',
    id: 'model',
  }, {
    accessor: 'vehicle.vehicleZevType',
    className: 'text-center',
    Header: 'ZEV Type',
    width: 150,
  }, {
    accessor: 'vehicle.range',
    className: 'text-right',
    Header: 'R. (km)',
    width: 150,
  }, {
    accessor: 'vehicle.vehicleClassCode',
    className: 'text-center',
    Header: 'Class',
    width: 120,
  }, {
    className: 'text-right',
    Header: 'Credits',
    accessor: (item) => (_.round(item.credits, 2)),
    id: 'credits',
    width: 150,
  }];

  const filterMethod = (filter, row) => {
    const id = filter.pivotId || filter.id;
    return row[id] !== undefined ? String(row[id])
      .toLowerCase()
      .includes(filter.value.toLowerCase()) : true;
  };

  const filterable = true;

  const { items, submission } = props;

  const data = [];
  items.forEach((item) => {
    const found = data.findIndex((obj) => (obj.vehicle.id === item.vehicle.id));

    if (found >= 0) {
      data[found] = {
        ...data[found],
        credits: data[found].credits + item.credits,
        sales: data[found].sales + 1,
      };
    } else {
      data.push({
        credits: item.credits,
        sales: 1,
        vehicle: item.vehicle,
      });
    }
  });

  return (
    <ReactTable
      className="searchable"
      columns={columns}
      data={data}
      defaultFilterMethod={filterMethod}
      defaultPageSize={data.length}
      defaultSorted={[{
        id: 'make',
      }]}
      filterable={filterable}
      getTrProps={(state, row) => {
        if (row && row.original) {
          return {
            onClick: () => {
              const { id } = row.original.vehicle;
              let url = ROUTES_SALES.APPROVAL_DETAILS.replace(/:id/g, submission.id);
              url = url.replace(/:vehicle_id/g, id);

              history.push(url);
            },
            className: 'clickable',
          };
        }

        return {};
      }}
      pageSizeOptions={[items.length, 5, 10, 15, 20, 25, 50, 100]}
    />
  );
};

SalesSubmissionModelsTable.defaultProps = {};

SalesSubmissionModelsTable.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  submission: PropTypes.shape({
    id: PropTypes.number,
  }).isRequired,
};

export default SalesSubmissionModelsTable;
