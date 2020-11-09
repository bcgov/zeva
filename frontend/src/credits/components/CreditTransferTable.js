import React from 'react';
import ReactTable from '../../app/components/ReactTable';
import getSupplierSummary from '../../app/utilities/getSupplierSummary';

const CreditTransferTable = (props) => {
  const { tableType, submission } = props;

  let tableText;
  if (tableType === 'supplierBalance') {
    tableText = (
      <div className="text-blue my-3">
        Issuing this transfer will result in the following credit balance change to each supplier.
      </div>
    );
  } else {
    tableText = (
      <>
        <h3 className="mt-2">
          {submission.debitFrom.name} submits notice of the following proposed credit transfer
        </h3>
        <div className="text-blue">
          {submission.debitFrom.name} will transfer to {submission.creditTo.name}:
        </div>
      </>
    );
  }

  const supplierBalanceData = getSupplierSummary(submission);
  const supplierBalanceColumns = [{
    Header: 'Supplier',
    headerClassName: 'text-right',
    columns: [{
      id: 'supplier',
      accessor: (item) => (item.supplierLabel),
      className: 'text-right',
      width: 250,
    }],

  }, {
    Header: 'Current Balance',
    id: 'current-balance',
    headerClassName: 'font-weight-bold',
    className: 'text-center',
    columns: [{
      headerClassName: 'd-none',
      id: 'current-balance-a',
      accessor: (item) => (`${item.currentBalanceA}-A`),
      className: 'text-right',
      width: 125,
    },
    {
      headerClassName: 'd-none',
      id: 'current-balance-b',
      accessor: (item) => (`${item.currentBalanceB}-B`),
      className: 'text-right',
      width: 125,
    }],
  }, {
    Header: 'New Balance',
    headerClassName: 'font-weight-bold',
    id: 'new-balance',
    className: 'text-center',
    columns: [{
      headerClassName: 'd-none',
      id: 'new-balance-a',
      accessor: (item) => (`${item.newBalanceA}-A`),
      className: 'text-right',
      width: 125,
    },
    {
      headerClassName: 'd-none',
      id: 'new-balance-b',
      accessor: (item) => (`${item.newBalanceB}-B`),
      className: 'text-right',
      width: 125,
    }],
  }];

  const submissionProposalColumns = [{
    Header: 'Quantity',
    accessor: (item) => (Math.ceil(item.creditValue)),
    id: 'credit-quantity',
    className: 'text-right',
  }, {
    Header: 'Model Year',
    accessor: (item) => (item.modelYear.name),
    id: 'model-year',
    className: 'text-center',
  }, {
    Header: 'ZEV Class',
    accessor: (item) => (item.creditClass.creditClass),
    id: 'zev-class',
    className: 'text-center',
  },
  {
    Header: 'Value Per Credit',
    accessor: (item) => (item.dollarValue),
    id: 'dollar-value',
    width: 150,
    className: 'text-right',
  }, {
    Header: 'Total',
    accessor: (item) => (`$${item.creditValue * item.dollarValue}`),
    id: 'total',
    className: 'text-right',
  },
  ];
  return (
    <div className="row mb-4">
      <div className="col-sm-11">
        {tableType === 'supplierBalance'
       && (
       <div className="form p-2">
         {tableText}
         <ReactTable
           className="transfer-summary-table"
           columns={supplierBalanceColumns}
           data={supplierBalanceData}
           filterable={false}
         />
       </div>
       )}
        {tableType === 'submissionSummary'
       && (
       <>
         {tableText}
         <ReactTable
           className="transfer-summary-table"
           columns={submissionProposalColumns}
           data={submission.creditTransferContent}
         />
       </>
       )}
      </div>
    </div>
  );
};

export default CreditTransferTable;
