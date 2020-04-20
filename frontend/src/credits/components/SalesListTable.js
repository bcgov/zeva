/*
 * Presentational component
 */
import PropTypes from 'prop-types';
import React from 'react';
import ReactTable from 'react-table';

import CustomPropTypes from '../../app/utilities/props';

const SalesListTable = (props) => {
  const {
    handleCheckboxClick,
    items,
    user,
    validatedList,
  } = props;

  const columns = [{
    Header: 'Supplier Information',
    headerClassName: 'header-group',
    columns: [{
      accessor: 'vehicle.modelYear',
      className: 'text-center',
      Header: 'MY',
    }, {
      accessor: 'vehicle.make',
      Header: 'Make',
    }, {
      accessor: 'vehicle.modelName',
      Header: 'Model',
    }, {
      accessor: 'saleDate',
      className: 'text-center',
      Header: 'Retail Sale',
    }],
  }, {
    Header: '',
    headerClassName: 'header-group',
    columns: [{
      accessor: 'vin',
      className: 'vin',
      Header: 'VIN',
      headerClassName: 'vin',
      minWidth: 150,
    }],
  }, {
    Header: 'ICBC Registration',
    headerClassName: 'header-group',
    columns: [{
      accessor: () => '-',
      className: 'icbc-model-year text-center',
      Header: 'MY',
      headerClassName: 'icbc-model-year',
      id: 'icbc-model-year',
    }, {
      accessor: () => '-',
      Header: 'Make',
      id: 'icbc-make',
    }, {
      accessor: () => '-',
      Header: 'Model',
      id: 'icbc-model',
    }, {
      accessor: () => '-',
      className: 'text-center',
      Header: 'Registration',
      id: 'icbc-registration-date',
    }],
  }, {
    Header: '',
    headerClassName: 'header-group',
    columns: [{
      accessor: () => '-',
      className: 'warning text-right',
      Header: 'Warning',
      headerClassName: 'warning',
      id: 'warning',
    }, {
      accessor: (row) => (
        <input
          checked={
            row.validationStatus === 'VALIDATED'
            || validatedList.findIndex((item) => Number(item) === Number(row.id)) >= 0
          }
          onChange={(event) => { handleCheckboxClick(event); }}
          type="checkbox"
          value={row.id}
        />
      ),
      className: 'text-center',
      Header: 'Validated',
      id: 'validated',
      show: user.isGovernment,
    }],
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
      data={items}
      defaultFilterMethod={filterMethod}
      defaultPageSize={items.length > 0 ? items.length : 10}
      defaultSorted={[{
        id: 'warning',
      }]}
      filterable={filterable}
      pageSizeOptions={[(items.length > 0 ? items.length : 10), 5, 10, 15, 20, 25, 50, 100]}
    />
  );
};

SalesListTable.defaultProps = {};

SalesListTable.propTypes = {
  handleCheckboxClick: PropTypes.func.isRequired,
  items: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  submission: PropTypes.shape({
    records: PropTypes.arrayOf(PropTypes.shape({})),
    submissionDate: PropTypes.string,
  }).isRequired,
  user: CustomPropTypes.user.isRequired,
  validatedList: PropTypes.arrayOf().isRequired,
};

export default SalesListTable;
