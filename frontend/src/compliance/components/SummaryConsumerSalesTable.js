import React from 'react';
import formatNumeric from '../../app/utilities/formatNumeric';

const SummaryConsumerSalesTable = (props) => {
  const { consumerSalesDetails } = props;
  const {
    ldvSales, zevSales, year, averageLdv3Years, pendingZevSales,
  } = consumerSalesDetails;

  return (
    <>
      <table id="compliance-summary-consumer-sales-table">
        <tbody>
          <tr>
            <td className="text-blue">{year} Model Year LDV Sales\Leases:</td>
            <td className="text-right">{formatNumeric(ldvSales, 0)}</td>
          </tr>
          <tr>
            <td className="text-blue">{year} Model Year Issued ZEV Sales\Leases:</td>
            <td className="text-right">{formatNumeric(zevSales, 0)}</td>
          </tr>
          <tr>
            <td className="text-blue">{year} Model Year Pending ZEV Sales\Leases:</td>
            <td className="text-right">{formatNumeric(pendingZevSales, 0)}</td>
          </tr>
          <tr>
            <td className="text-blue">3 Year Average ({year - 3}-{year - 1}) LDV Sales\Leases:</td>
            <td className="text-right">{formatNumeric(averageLdv3Years, 0)}</td>
          </tr>
        </tbody>
      </table>
      <div className="text-blue my-3">
        <span className="font-weight-bold">Vehicle Supplier Class: </span>
        <span className="text-left">{consumerSalesDetails.supplierClass} Volume Supplier</span>
      </div>
    </>
  );
};
export default SummaryConsumerSalesTable;
