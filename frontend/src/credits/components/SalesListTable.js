/*
 * Presentational component
 */
import moment from 'moment-timezone';
import PropTypes from 'prop-types';
import React from 'react';

import ReactTable from '../../app/components/ReactTable';
import { CREDIT_ERROR_CODES } from '../../app/constants/errorCodes';
import CustomPropTypes from '../../app/utilities/props';

const SalesListTable = (props) => {
  const {
    handleCheckboxClick,
    items,
    user,
    validatedList,
    filtered,
    setFiltered,
  } = props;


  const getErrorCodes = (item, fields = false) => {
    let errorCodes = '';

    item.warnings.forEach((warning) => {
      if (CREDIT_ERROR_CODES[warning]) {
        if (fields) {
          errorCodes += ` ${CREDIT_ERROR_CODES[warning].errorField} `;
        } else {
          if (errorCodes !== '') {
            errorCodes += ', ';
          }
          errorCodes += CREDIT_ERROR_CODES[warning].errorCode;
        }
      }
    });

    return errorCodes;
  };

  const columns = [{
    Header: 'Supplier Information',
    headerClassName: 'header-group',
    columns: [{
      accessor: (row) => {
        const { xlsModelYear } = row;

        if (Number.isNaN(xlsModelYear)) {
          return xlsModelYear;
        }

        return Math.trunc(row.xlsModelYear);
      },
      className: 'text-center',
      Header: 'MY',
      id: 'model-year',
    }, {
      accessor: 'xlsMake',
      Header: 'Make',
      id: 'make',
    }, {
      accessor: 'xlsModel',
      Header: 'Model',
      id: 'model',
    }, {
      accessor: (row) => (moment(row.salesDate).format('YYYY-MM-DD') !== 'Invalid date' ? moment(row.salesDate).format('YYYY-MM-DD') : row.salesDate),
      className: 'text-center',
      Header: 'Retail Sale',
      id: 'sales-date',
    }],
  }, {
    Header: '',
    headerClassName: 'header-group',
    columns: [{
      accessor: 'xlsVin',
      className: 'vin',
      Header: 'VIN',
      headerClassName: 'vin',
      id: 'vin',
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
      className: 'icbc-make',
      Header: 'Make',
      id: 'icbc-make',
    }, {
      accessor: (item) => (item.icbcVerification ? item.icbcVerification.icbcVehicle.modelName : '-'),
      className: 'icbc-model',
      Header: 'Model',
      id: 'icbc-model',
    }],
  }, {
    Header: '',
    headerClassName: 'header-group',
    columns: [{
      accessor: (item) => (getErrorCodes(item)),
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

  return (
    <ReactTable
      columns={columns}
      data={items}
      filtered={filtered}
      onFilteredChange={(input) => {
        setFiltered(input);
      }}
      defaultSorted={[{
        id: 'warning',
        desc: true,
      }]}
      getTrProps={(state, rowInfo) => {
        if (rowInfo) {
          if (rowInfo.row.warning.includes('11')) {
            return {
              className: 'icbc-verification-warning',
            };
          }

          if (rowInfo.row.warning.includes('41')) {
            return {
              className: 'icbc-mismatch-warning',
            };
          }

          if (rowInfo.row.warning.includes('61')) {
            return {
              className: 'invalid-data',
            };
          }
        }
        return {};
      }}
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
  filtered: PropTypes.arrayOf(PropTypes.object).isRequired,
  setFiltered: PropTypes.func.isRequired,
};

export default SalesListTable;
