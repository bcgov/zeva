import React from 'react';
import PropTypes from 'prop-types';
import formatNumeric from '../../app/utilities/formatNumeric';

const ComplianceObligationAmountsTable = (props) => {
  const {
    reportYear, supplierClassInfo, totalReduction, ratios, classAReduction, leftoverReduction,
  } = props;

  return (
    <div className="mt-4">
      <h3 className="mb-2">Compliance Obligation</h3>
      <div className="col-12">
        {/* <h3 className="mt-4 mb-2">{reportYear} Compliance Ratio Reduction and Credit Offset</h3> */}
        <div className="row mb-4 compliance-reduction-table">
          <div className="col-lg-6 col-sm-12">
            <table className="mr-3 no-border px-3">
              <tbody>
                <tr>
                  <td className="text-blue">
                    {reportYear} Model Year LDV Sales\Leases:
                  </td>
                  <td>
                    {supplierClassInfo.ldvSales}
                  </td>
                </tr>
                {(supplierClassInfo.class === 'S' || supplierClassInfo.class === 'M')
                  && (
                    <>
                      <tr>
                        <td className="text-blue">
                          {reportYear} Compliance Ratio:
                        </td>
                        <td className="border-dark border-bottom">
                          x {ratios.complianceRatio} %
                        </td>
                      </tr>
                      <tr>
                        <td className="text-blue">
                          Compliance Ratio Credit Reduction:
                        </td>
                        <td>
                          {totalReduction}
                        </td>
                      </tr>
                    </>
                  )}
                {supplierClassInfo.class === 'L' && (
                  <>
                    <td className="text-blue">
                      {reportYear} Compliance Ratio:
                    </td>
                    <td>
                      {ratios.complianceRatio} %
                    </td>
                    <tr>
                      <td className="text-blue">
                        Large Volume Supplier Class A Ratio:
                      </td>
                      <td>
                        {ratios.zevClassA} %
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
          {supplierClassInfo.class === 'L' && (
          <div className="col-lg-6 col-sm-12 ">
            <table className="mr-3 no-border">
              <tbody>
                <tr className="font-weight-bold">
                  <td className="text-blue">
                    Compliance Ratio Credit Reduction:
                  </td>
                  <td>
                    {totalReduction}
                  </td>
                </tr>
                <>
                  <tr>
                    <td className="text-blue">
                      &bull; &nbsp; &nbsp; ZEV Class A Credit Reduction:
                    </td>
                    <td>
                      {classAReduction}
                    </td>
                  </tr>

                  <tr>
                    <td className="text-blue">
                      &bull; &nbsp; &nbsp; Unspecified ZEV Class Credit Reduction:
                    </td>
                    <td>
                      {leftoverReduction}
                    </td>
                  </tr>
                </>
              </tbody>
            </table>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};
ComplianceObligationAmountsTable.propTypes = {
};
export default ComplianceObligationAmountsTable;
