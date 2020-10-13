/*
 * Presentational component
 */
import PropTypes from 'prop-types';
import React from 'react';
import getCreditRequestSummary from '../../app/utilities/getCreditRequestSummary';
import ReactTable from '../../app/components/ReactTable';
import formatNumeric from '../../app/utilities/formatNumeric';
import CustomPropTypes from '../../app/utilities/props';

const CreditRequestSummaryTable = (props) => {
  const columns = [{
    headerClassName: 'header-group font-weight-bold',
    Header: 'Consumer ZEV Sales',
    columns: [{
      headerClassName: 'd-none',
      id: 'label',
      accessor: (item) => (item.label),
      className: 'text-left font-weight-bold',
      width: 200,
    },
    {
      headerClassName: 'd-none',
      className: 'text-right',
      accessor: 'sales',
      width: 75,
    }],
  }, {
    headerClassName: 'header-group font-weight-bold',
    Header: 'ZEV Credits',
    columns: [{
      headerClassName: 'd-none',
      id: 'credits',
      accessor: (item) => (item.creditsLabel),
      className: 'text-left font-weight-bold',
      width: 275,
    }],
  }, {
    Header: 'A',
    headerClassName: 'font-weight-bold',
    columns: [{
      headerClassName: 'd-none',
      accessor: (item) => (item.a ? formatNumeric(item.a, 2) : '-'),
      id: 'credit-class-A',
      className: 'text-right',
      width: 90,
    }],

  }, {
    Header: 'B',
    headerClassName: 'font-weight-bold',
    columns: [{
      headerClassName: 'd-none',
      accessor: (item) => (item.b ? formatNumeric(item.b, 2) : '-'),
      id: 'credit-class-B',
      className: 'text-right',
      width: 90,
    }],

  }];

  const { items, validationStatus, user } = props;
  const data = getCreditRequestSummary(items, validationStatus, user);
  return (
    <ReactTable
      className="credit-summary-table"
      columns={columns}
      data={data}
      filterable={false}
    />
  );
};

CreditRequestSummaryTable.defaultProps = {};

CreditRequestSummaryTable.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  user: CustomPropTypes.user.isRequired,
  validationStatus: PropTypes.string.isRequired,
};

export default CreditRequestSummaryTable;
