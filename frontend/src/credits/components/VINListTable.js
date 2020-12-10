/*
 * Presentational component
 */
import axios from 'axios';
import moment from 'moment-timezone';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import ReactTable from 'react-table';

import CREDIT_ERROR_CODES from '../../app/constants/errorCodes';
import ROUTES_CREDIT_REQUESTS from '../../app/routes/CreditRequests';
import CustomPropTypes from '../../app/utilities/props';

const VINListTable = (props) => {
  const {
    handleCheckboxClick,
    id,
    items,
    user,
    invalidatedList,
    filtered,
    setContent,
    setFiltered,
  } = props;

  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState(-1);

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
      id: 'xls_model_year',
    }, {
      accessor: 'xlsMake',
      Header: 'Make',
      id: 'xls_make',
    }, {
      accessor: 'xlsModel',
      Header: 'Model',
      id: 'xls_model',
    }, {
      accessor: (row) => (moment(row.salesDate).format('YYYY-MM-DD') !== 'Invalid date' ? moment(row.salesDate).format('YYYY-MM-DD') : row.salesDate),
      className: 'text-center sales-date',
      filterable: false,
      Header: 'Retail Sale',
      id: 'xls_sale_date',
    }],
  }, {
    Header: '',
    headerClassName: 'header-group',
    columns: [{
      accessor: 'xlsVin',
      className: 'vin',
      Header: 'VIN',
      headerClassName: 'vin',
      id: 'xls_vin',
      minWidth: 150,
    }],
  }, {
    Header: 'ICBC Registration',
    headerClassName: 'header-group',
    columns: [{
      accessor: (item) => (item.icbcVerification ? item.icbcVerification.icbcVehicle.modelYear.name : '-'),
      className: 'icbc-model-year text-center',
      filterable: false,
      sortable: false,
      Header: 'MY',
      headerClassName: 'icbc-model-year',
      id: 'icbc-model-year',
    }, {
      accessor: (item) => (item.icbcVerification ? item.icbcVerification.icbcVehicle.make : '-'),
      className: 'icbc-make',
      filterable: false,
      sortable: false,
      Header: 'Make',
      id: 'icbc-make',
    }, {
      accessor: (item) => (item.icbcVerification ? item.icbcVerification.icbcVehicle.modelName : '-'),
      className: 'icbc-model',
      filterable: false,
      sortable: false,
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
              invalidatedList.findIndex((item) => Number(item) === Number(row.id)) < 0
            }
            onChange={(event) => { handleCheckboxClick(event); }}
            type="checkbox"
            value={row.id}
          />
        );
      },
      className: 'text-center validated',
      filterable: false,
      sortable: false,
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
      filterable
      onFilteredChange={(input) => {
        setFiltered(input);
      }}
      defaultSorted={[{
        id: 'xls_vin',
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
      loading={loading}
      manual
      onFetchData={(state) => {
        setLoading(true);

        const filters = {};

        state.filtered.forEach((each) => {
          filters[each.id] = each.value;
        });

        const sorted = [];

        state.sorted.forEach((each) => {
          let value = each.id;

          if (each.desc) {
            value = `-${value}`;
          }

          sorted.push(value);
        });

        axios.get(ROUTES_CREDIT_REQUESTS.CONTENT.replace(':id', id), {
          params: {
            filters,
            page: state.page + 1, // page from front-end is zero index, but in the back-end we need the actual page number
            page_size: state.pageSize,
            sorted: sorted.join(','),
          },
        }).then((response) => {
          const { content, pages: numPages } = response.data;

          setContent(content);
          setPages(numPages);
          setLoading(false);
        });
      }}
      pages={pages}
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
  invalidatedList: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ])).isRequired,
  filtered: PropTypes.arrayOf(PropTypes.object),
  setFiltered: PropTypes.func,
};

export default VINListTable;
