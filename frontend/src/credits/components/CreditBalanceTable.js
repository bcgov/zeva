/*
 * Presentational component
 */
import PropTypes from 'prop-types';
import React from 'react';

import ReactTable from '../../app/components/ReactTable';
import formatNumeric from '../../app/utilities/formatNumeric';

const CreditBalanceTable = (props) => {
  const { items } = props;

  const balances = {};

  items.sort((a, b) => (
    parseFloat(b.modelYear.name) - parseFloat(a.modelYear.name)
  ));

  const totalCredits = {};

  items.forEach((balance) => {
    if (balance.modelYear && balance.creditClass) {
      balances[balance.modelYear.name] = {
        ...balances[balance.modelYear.name],
        [balance.creditClass.creditClass]: parseFloat(balance.totalValue),
      };

      let currentValue = 0;
      if (totalCredits[balance.weightClass.weightClassCode]
        && totalCredits[balance.weightClass.weightClassCode][balance.creditClass.creditClass]) {
        currentValue = parseFloat(
          totalCredits[balance.weightClass.weightClassCode][balance.creditClass.creditClass],
        );
      }

      /*
      While this looks unnecessarily complicated,
      this is needed as we'll have more weight classes in the future
      */
      totalCredits[balance.weightClass.weightClassCode] = {
        ...totalCredits[balance.weightClass.weightClassCode],
        label: `Total ${balance.weightClass.weightClassCode}`,
        [balance.creditClass.creditClass]: currentValue + parseFloat(balance.totalValue),
      };
    }
  });

  const columns = [{
    accessor: (item) => (`${item.label} Credits`),
    className: 'text-right',
    Header: '',
    id: 'label',
  }, {
    accessor: (item) => (item.A ? formatNumeric(item.A, 2, true) : '-'),
    className: 'text-right credits-left',
    Cell: (item) => (
      <span className={item.value < 0 ? 'text-danger' : ''}>{item.value}</span>
    ),
    Header: 'A',
    headerClassName: 'font-weight-bold credits-left',
    id: 'credit-class-A',
    maxWidth: 150,
  }, {
    accessor: (item) => (item.B ? formatNumeric(item.B, 2, true) : '-'),
    className: 'text-right',
    Cell: (item) => (
      <span className={item.value < 0 ? 'text-danger' : ''}>{item.value}</span>
    ),
    Header: 'B',
    headerClassName: 'font-weight-bold',
    id: 'credit-class-B',
    maxWidth: 150,
  }];

  return (
    <ReactTable
      className="credit-balance-table"
      columns={columns}
      data={
        Object.entries(balances).map(([key, value]) => ({
          label: key,
          ...value,
        })).concat(Object.values(totalCredits))
      }
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
