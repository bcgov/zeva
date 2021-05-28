import React from 'react';
import formatNumeric from '../../app/utilities/formatNumeric';

const SummaryConsumerSalesTable = (props) => {
  const { consumerSalesDetails } = props;
  const {
   zevSales, pendingZevSales,
  } = consumerSalesDetails;

  return (
    <>
      <table id="compliance-summary-consumer-sales-table">
        <tbody>
          <tr>
            <td className="text-blue">ZEV Sales\Leases Issued:</td>
            <td className="text-right">{formatNumeric(zevSales, 0)}</td>
          </tr>
          <tr>
            <td className="text-blue">ZEV Sales\Leases Submitted with this report:</td>
            <td className="text-right">{formatNumeric(pendingZevSales, 0)}</td>
          </tr>
        </tbody>
      </table>
    </>
  );
};
export default SummaryConsumerSalesTable;
