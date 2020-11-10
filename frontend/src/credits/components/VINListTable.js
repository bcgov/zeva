/*
 * Presentational component
 */
import moment from 'moment-timezone';
import PropTypes from 'prop-types';
import React from 'react';

import ReactTable from '../../app/components/ReactTable';
import CREDIT_ERROR_CODES from '../../app/constants/errorCodes';
import CustomPropTypes from '../../app/utilities/props';

const VINListTable = (props) => {
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

    if (!item.warnings) {
      return errorCodes;
    }

    item.warnings.forEach((warning) => {
      if (CREDIT_ERROR_CODES[warning]) {
        if (fields) {
          errorCodes += ` ${CREDIT_ERROR_CODES[warning].errorField} `;
        } else if (!errorCodes.includes(CREDIT_ERROR_CODES[warning].errorCode)) {
          if (errorCodes !== '' && CREDIT_ERROR_CODES[warning].errorCode) {
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
      className: 'text-center sales-date',
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
      accessor: (row) => {
        if (row.warnings && row.warnings.some((warning) => [
          'DUPLICATE_VIN', 'INVALID_MODEL', 'VIN_ALREADY_AWARDED', 'EXPIRED_REGISTRATION_DATE',
        ].indexOf(warning) >= 0)) {
          return false;
        }

        return (
          <input
            checked={
              validatedList.findIndex((item) => Number(item) === Number(row.id)) >= 0
            }
            onChange={(event) => { handleCheckboxClick(event); }}
            type="checkbox"
            value={row.id}
          />
        );
      },
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
          const warnings = rowInfo.row.warning.split(', ');

          if (warnings.some((each) => ['21', '31', '51'].includes(each))) {
            return {
              className: 'icbc-danger',
            };
          }

          if (warnings.some((each) => ['11', '41', '61'].includes(each))) {
            let className = 'icbc-warning';

            if (rowInfo.original.warnings.includes('INVALID_DATE')) {
              className += ' warning-sales-date';
            }

            if (rowInfo.original.warnings.includes('MAKE_MISMATCHED')) {
              className += ' warning-icbc-make';
            }

            if (rowInfo.original.warnings.includes('MODEL_YEAR_MISMATCHED')) {
              className += ' warning-icbc-model-year';
            }

            if (rowInfo.original.warnings.includes('NO_ICBC_MATCH')) {
              className += ' warning-vin';
            }

            return {
              className,
            };
          }
        }
        return {};
      }}
    />
  );
};

VINListTable.defaultProps = {
  filtered: undefined,
  setFiltered: undefined,
};

VINListTable.propTypes = {
  handleCheckboxClick: PropTypes.func.isRequired,
  items: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  user: CustomPropTypes.user.isRequired,
  validatedList: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ])).isRequired,
  filtered: PropTypes.arrayOf(PropTypes.object),
  setFiltered: PropTypes.func,
};

export default VINListTable;
