/*
 * Presentational component
 */
import PropTypes from 'prop-types';
import React from 'react';
import ReactTable from '../../app/components/ReactTable';
import CustomPropTypes from '../../app/utilities/props';
import history from '../../app/History';
import ROUTES_CREDIT_AGREEMENTS from '../../app/routes/CreditAgreements';

const CreditAgreementsListTable = (props) => {
  const {
    items,
    user,
    filtered,
    setFiltered,
  } = props;

  const COLUMNS = [{
    Header: 'Transaction ID',
    accessor: (row) => {
      let transactionInitial = '';

      switch (row.transactionType) {
        case 'Initiative Agreement':
          transactionInitial = 'IA';
          break;
        case 'Purchase Agreement':
          transactionInitial = 'PA';
          break;
        case 'Administrative Credit Allocation':
          transactionInitial = 'AA';
          break;
        case 'Administrative Credit Reduction':
          transactionInitial = 'AR';
          break;
        case 'Automatic Administrative Penalty':
          transactionInitial = 'AP';
          break;
        default:
          transactionInitial = '';
      }
      return transactionInitial.concat('-', row.id);
    },
    id: 'col-transactionId',
    className: 'text-center',
  }, {
    Header: 'Transaction Type',
    accessor: (row) => row.transactionType,
    id: 'col-transactionType',
    className: 'text-center',
  }, {
    Header: 'Transaction Date',
    accessor: 'effectiveDate',
    id: 'col-transactionDate',
    className: 'text-center',
  }, {
    Header: 'Supplier',
    accessor: (row) => row.organization.name,
    id: 'col-supplier',
    className: 'text-center',
  }, {
    Header: 'A-Credits',
    accessor: (row) => {
      let aCredits = 0;
      row.creditAgreementContent.forEach((eachContent) => {
        if (eachContent.creditClass === 'A') {
          aCredits += eachContent.numberOfCredits;
        }
      })
      return aCredits;
    },
    id: 'col-aCredits',
    className: 'text-right',
  }, {
    Header: 'B-Credits',
    accessor: (row) => {
      let bCredits = 0;
      row.creditAgreementContent.forEach((eachContent) => {
        if (eachContent.creditClass === 'B') {
          bCredits += eachContent.numberOfCredits;
        }
      });

      return bCredits;
    },
    id: 'col-bCredits',
    className: 'text-right',
  }, {
    Header: 'Status',
    accessor: (row) => {
      switch (row.status) {
        case 'DRAFT':
          return 'Draft';
        case 'RECOMMENDED':
          return 'Recommended';
        case 'ISSUED':
          return 'Issued';
        case 'DELETED':
          return 'Deleted';
        default:
          return '';
      }
    },
    id: 'col-status',
    className: 'text-center',
  }];

  return (
    <ReactTable
      columns={COLUMNS}
      data={items}
      filtered={filtered}
      setFiltered={setFiltered}
      getTrProps={(state, row) => {
        if (row && row.original) {
          return {
            onClick: () => {
              const { id } = row.original;
              history.push(ROUTES_CREDIT_AGREEMENTS.DETAILS.replace(/:id/g, id), filtered);
            },
            className: 'clickable',
          };
        }

        return {};
      }}
    />
  );
};

export default CreditAgreementsListTable;