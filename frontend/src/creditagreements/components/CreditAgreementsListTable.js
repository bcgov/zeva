/*
 * Presentational component
 */
import PropTypes from 'prop-types';
import React from 'react';
import ReactTable from '../../app/components/ReactTable';
import CustomPropTypes from '../../app/utilities/props';
const CreditAgreementsListTable = (props) => {

  const { items, user, filtered, setFiltered } = props;


  const COLUMNS = [
    {
        Header: 'Transaction ID',
        accessor: (row) => {
          console.log('TransactionID here');
          let transactionInitial = '';
          switch (row.transactionType) {
            case 'INITIATIVE_AGREEMENT':
              transactionInitial = 'IA';
              break;
            case 'PURCHASE_AGREEMENT':
              transactionInitial = 'PA';
              break;
            case 'ADMINISTRATIVE_CREDIT_ALLOCATION':
              transactionInitial = 'AA';
              break;              
            case 'ADMINISTRATIVE_CREDIT_REDUCTION':
              transactionInitial = 'AR';
              break;                
            case 'AUTOMATIC_ADMINISTRATIVE_PENALTY':
              transactionInitial = 'AP';
              break;  
          }
          return transactionInitial.concat('-', row.id);
        },
        id: 'col-transactionId'
    },
    {
        Header: 'Transaction Type',
        accessor: (row) => {
          let transactionType = '';
          switch (row.transactionType) {
            case 'INITIATIVE_AGREEMENT':
              transactionType = 'Initiative Agreement';
              break;
            case 'PURCHASE_AGREEMENT':
              transactionType = 'Purchase Agreement';
              break;
            case 'ADMINISTRATIVE_CREDIT_ALLOCATION':
              transactionType = 'Administrative Allocation';
              break;              
            case 'ADMINISTRATIVE_CREDIT_REDUCTION':
              transactionType = 'Administrative Reduction';
              break;                
            case 'AUTOMATIC_ADMINISTRATIVE_PENALTY':
              transactionType = 'Administrative Penalty';
              break;  
          }
          return transactionType;
        },
        id: 'col-transactionType'
    },
    {
        Header: 'Transaction Date',
        accessor: 'effectiveDate',
        id: 'col-transactionDate'
    },
    {
        Header: 'Supplier',
        accessor: (row) => row.organization.name,
        id: 'col-supplier'
    },
    {
      Header: 'A-Credits',
      accessor: (row) => {
        let aCredits = 0;
        row.creditAgreementContent.forEach( (eachContent) => {
          if (eachContent.creditClass === 'A') {
            aCredits += eachContent.numberOfCredits;
          }
        })
        return aCredits;
      },
      id: 'col-aCredits',
      className: 'text-right'
    },    
    {
      Header: 'B-Credits',
      accessor: (row) => {
        let bCredits = 0;
        row.creditAgreementContent.forEach( (eachContent) => {
          if (eachContent.creditClass === 'B') {
            bCredits += eachContent.numberOfCredits;
          }
        })
        return bCredits;
      },
      id: 'col-bCredits',
      className: 'text-right'
    },        
    {
      Header: 'Status',
      accessor: 'status',
      id: 'col-status'
    }    
  ]

  return (
    <ReactTable
      columns={COLUMNS}
      data={items}
      filtered={filtered}
      setFiltered={setFiltered}      
    />
  );
};

export default CreditAgreementsListTable;
