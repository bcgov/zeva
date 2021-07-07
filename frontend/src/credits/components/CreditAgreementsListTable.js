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
        Header: 'Transaction Id',
        accessor: 'transactionId',
        id: 'col-transactionId'
    },
    {
        Header: 'Transaction Type',
        accessor: 'transactionType',
        id: 'col-transactionType'
    },
    {
        Header: 'Transaction Date',
        accessor: 'transactionDate',
        id: 'col-transactionDate'
    },
    {
        Header: 'Supplier',
        accessor: 'supplier',
        id: 'col-supplier'
    },
    {
        Header: 'A-Credits',
        accessor: 'aCredits',
        id: 'col-aCredits',
        className: 'text-right'
    },
    {
        Header: 'B-Credits',
        accessor: 'bCredits',
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
