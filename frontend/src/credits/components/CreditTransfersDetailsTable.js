import React from 'react';
import PropTypes from 'prop-types';
import ReactTable from '../../app/components/ReactTable';
import formatNumeric from '../../app/utilities/formatNumeric';

const CreditTransfersDetailsTable = (props) => {
  const { submission } = props;

  const tableText = (
    <>
      <h3 className="mt-2">
        {submission.debitFrom.name} submits notice of the following proposed credit transfer
      </h3>
      <div className="text-blue">
        {submission.debitFrom.name} will transfer to {submission.creditTo.name}:
      </div>
    </>
  );

  const submissionProposalColumns = [{
    Header: 'Quantity',
    accessor: (item) => (formatNumeric(item.creditValue)),
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
    accessor: (item) => (`$${(item.creditValue * item.dollarValue).toFixed(2)}`),
    id: 'total',
    className: 'text-right',
  },
  ];
  return (
    <div className="row mb-3">
      <div className="col-sm-11">
        {tableText}
        <ReactTable
          className="transfer-summary-table"
          columns={submissionProposalColumns}
          data={submission.creditTransferContent}
        />
      </div>
    </div>
  );
};

CreditTransfersDetailsTable.propTypes = {
  submission: PropTypes.shape().isRequired,

};

export default CreditTransfersDetailsTable;
