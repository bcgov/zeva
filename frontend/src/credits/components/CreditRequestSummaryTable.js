/*
 * Presentational component
 */
import PropTypes from 'prop-types';
import React from 'react';
import getCreditRequestSummary from '../../app/utilities/getCreditRequestSummary';
import ReactTable from '../../app/components/ReactTable';
import formatNumeric from '../../app/utilities/formatNumeric';

const CreditRequestSummaryTable = (props) => {
  const columns = [{
    headerClassName: 'header-group',
    Header: 'Consumer ZEV Sales',
    columns: [{
      headerClassName: 'd-none',
      id: 'label',
      accessor: (item) => (item.label),
      className: 'text-left font-weight-bold',
    },
    {
      headerClassName: 'd-none',
      accessor: 'sales',
      // id: 'label',
    }],
  }, {
    headerClassName: 'header-group',
    Header: 'ZEV Credits',
    columns: [{
      headerClassName: 'd-none',
      id: 'credits',
      accessor: (item) => (item.creditsLabel),
      className: 'text-left font-weight-bold',
    }],
  }, {
    
    Header: 'A',
    headerClassName: 'font-weight-bold credits-left',
    maxWidth: 150,
    columns: [{
      headerClassName: 'd-none',
      accessor: (item) => (item.a ? formatNumeric(item.a, 2) : '-'),
      id: 'credit-class-A',
      className: 'text-right credits-left',
    }],

  }, {
    
    Header: 'B',
    headerClassName: 'font-weight-bold',
    maxWidth: 150,
    columns: [{
      headerClassName: 'd-none',
      accessor: (item) => (item.b ? formatNumeric(item.b, 2) : '-'),
      id: 'credit-class-B',
      className: 'text-right',
    }],

  }];

  const { items, validationStatus, user } = props;
  const data = getCreditRequestSummary(items, validationStatus, user);
  console.log(data);
  return (
    <ReactTable
      className="credit-balance-table"
      columns={columns}
      data={data}
      defaultSorted={[{
        id: 'label',
        desc: true,
      }]}
      filterable={false}
      // getTrProps={(state, rowInfo) => {
      //   if (rowInfo) {
      //     if (rowInfo.row.label.toLowerCase().includes('total')) {
      //       return {
      //         className: 'font-weight-bold',
      //       };
      //     }
      //   }

      //   return {};
      // }}
    />
  );
};

CreditRequestSummaryTable.defaultProps = {};

CreditRequestSummaryTable.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

export default CreditRequestSummaryTable;
