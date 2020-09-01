/*
 * Presentational component
 */
import PropTypes from 'prop-types';
import React from 'react';

import ReactTable from '../../app/components/ReactTable';

const CreditBalanceTable = (props) => {
  const columns = [{
    accessor: (item) => (`${item.label} Credits`),
    className: 'text-right',
    Header: '',
    id: 'label',
  }, {
    accessor: 'A',
    className: 'text-right credits-left',
    Header: 'A',
    headerClassName: 'font-weight-bold credits-left',
    id: 'credit-class-A',
    maxWidth: 150,
  }, {
    accessor: 'B',
    className: 'text-right',
    Header: 'B',
    headerClassName: 'font-weight-bold',
    id: 'credit-class-B',
    maxWidth: 150,
  }];

  const { items } = props;

  return (
    <ReactTable
      className="credit-balance-table"
      columns={columns}
      data={items}
      defaultSorted={[{
        id: 'label',
        desc: true,
      }]}
      filterable={false}
      getTrProps={(state, rowInfo) => {
        if (rowInfo) {
          if (rowInfo.row.label.toLowerCase().includes('total')) {
            return {
              className: 'font-weight-bold',
            };
          }
        }

        return {};
      }}
    />
  );
};

CreditBalanceTable.defaultProps = {};

CreditBalanceTable.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

export default CreditBalanceTable;
