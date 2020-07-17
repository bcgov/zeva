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
  const checkForWarnings = (item) => {
    if (item.vehicle.modelYear !== item.icbcVerification.icbcVehicle.modelYear.name) {
      return {
        errorCode: '21',
        errorField: 'model-year',
      };
    }
<<<<<<< HEAD
    return {
      errorCode: '0'
    };
=======
    return '0';
>>>>>>> release-1.6.0
  };
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
      accessor: (item) => (item.icbcVerification ? item.icbcVerification.icbcVehicle.modelYear.name : '-'),
      className: 'icbc-model-year text-center',
      Header: 'MY',
      headerClassName: 'icbc-model-year',
      id: 'icbc-model-year',
    }, {
      accessor: (item) => (item.icbcVerification ? item.icbcVerification.icbcVehicle.make : '-'),
      Header: 'Make',
      id: 'icbc-make',
      className: 'icbc-make',
    }, {
      accessor: (item) => (item.icbcVerification ? item.icbcVerification.icbcVehicle.modelName : '-'),
      Header: 'Model',
      id: 'icbc-model',
      className: 'icbc-model',
    }],
  }, {
    Header: '',
    headerClassName: 'header-group',
    columns: [{
      accessor: (item) => (item.icbcVerification ? checkForWarnings(item).errorCode : '11'),
      className: 'warning text-right',
      Header: 'Warning',
      headerClassName: 'warning',
      id: 'warning',
    }, {
      accessor: (row) => (
        <input
          checked={
            validatedList.findIndex((item) => Number(item) === Number(row.id)) >= 0
          }
          onChange={(event) => { handleCheckboxClick(event); }}
          type="checkbox"
          value={row.id}
        />
      ),
      className: 'text-center validated',
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
        desc: true,
      }]}
      getTrProps={(state, rowInfo) => {
        if (rowInfo.row.warning === '11') {
          return {
            className: 'icbc-verification-warning',
          };
        }
        if (rowInfo.row.warning === '21') {
          return {
            className: `${checkForWarnings(rowInfo.original).errorField} icbc-mismatch-warning`,
          };
        }
        return {};
      }}
      filterable={filterable}
      pageSizeOptions={[(items.length > 0 ? items.length : 10), 5, 10, 15, 20, 25, 50, 100]}
    />
  );
};

SalesListTable.defaultProps = {};

SalesListTable.propTypes = {
  handleCheckboxClick: PropTypes.func.isRequired,
  items: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  user: CustomPropTypes.user.isRequired,
  validatedList: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ])).isRequired,
};

export default SalesListTable;
