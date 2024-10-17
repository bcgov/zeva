import React from 'react'
import formatNumeric from '../../app/utilities/formatNumeric'

const SummaryConsumerSalesTable = (props) => {
  const { consumerSalesDetails, modelYear } = props
  const { zevSales, pendingZevSales } = consumerSalesDetails

  return (
    <>
      <table id="compliance-summary-consumer-sales-table">
        <tbody>
          <tr>
            <td className="text-blue">{modelYear < 2024 ? "ZEV Sales\\Leases Issued:" : "ZEVs Issued:"}</td>
            <td className="text-right">{formatNumeric(zevSales, 0)}</td>
          </tr>
          <tr>
            <td className="text-blue">
              {modelYear < 2024 ? "ZEV Sales\\Leases Submitted with this report:" : "ZEVs Submitted with this report:"}
            </td>
            <td className="text-right">{formatNumeric(pendingZevSales, 0)}</td>
          </tr>
        </tbody>
      </table>
    </>
  )
}
export default SummaryConsumerSalesTable
