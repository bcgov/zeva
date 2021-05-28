import React from 'react';
import PropTypes from 'prop-types';
import formatNumeric from '../../app/utilities/formatNumeric';
import getTotalReduction from '../../app/utilities/getTotalReduction';
import getUnspecifiedClassReduction from '../../app/utilities/getUnspecifiedClassReduction';
import getClassAReduction from '../../app/utilities/getClassAReduction';

const ComplianceObligationAmountsTable = (props) => {
  const {
    reportYear,
    supplierClassInfo,
    totalReduction,
    ratios,
    classAReduction,
    leftoverReduction,
    page,
    handleChangeSales,
    sales,
    statuses,
  } = props;

  return (
    <div className="mt-4">
      <h3 className="mb-2">Compliance Obligation</h3>
      <div className={page === 'assessment' ? 'col-12 grey-border-area' : 'col-12'}>
        <div className="row mb-4 compliance-reduction-table">
          <div className="col-12">
            <table className="mr-3 no-border px-3">
              <tbody>
                <tr className="ldv-sales ">
                  <td className="text-blue " colSpan="3">
                    {reportYear} Model Year LDV Consumer Sales\Leases Total:
                  </td>
                  <td>
                    <input
                      className="form-control"
                      type="text"
                      onChange={handleChangeSales}
                      value={sales}
                      disabled={['SAVED', 'UNSAVED'].indexOf(statuses.complianceObligation.status) < 0} />
                  </td>
                </tr>
                <tr>
                  <td className="text-blue">{reportYear} Compliance Ratio:</td>
                  <td width="25%">{ratios.complianceRatio} %</td>
                  <td className="text-blue font-weight-bold" width="25%">Compliance Ratio Credit Reduction:</td>
                  <td className="font-weight-bold" width="25%">
                    {getTotalReduction(sales, ratios.complianceRatio)}
                  </td>
                </tr>
                {supplierClassInfo.class === 'L' && (
                <tr>
                  <td className="text-blue">Large Volume Supplier Class A Ratio:</td>
                  <td>{ratios.zevClassA} %</td>
                  <td className="text-blue">ZEV Class A Credit Reduction:</td>
                  <td>
                    {getClassAReduction(
                      sales,
                      ratios.zevClassA,
                      supplierClassInfo.class,
                    )}
                  </td>
                </tr>
                )}
                <tr>
                  <td colSpan="2" />
                  <td className="text-blue">Unspecified ZEV Class Credit Reduction:</td>
                  <td>
                    {getUnspecifiedClassReduction(
                      getTotalReduction(sales, ratios.complianceRatio),
                      getClassAReduction(
                        sales,
                        ratios.zevClassA,
                        supplierClassInfo.class,
                      ),
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {(supplierClassInfo.class === 'L' || supplierClassInfo.class === 'Large') && (
          <div className="col-lg-6 col-sm-12 ">
            <table className="mr-3 no-border">
              <tbody>
                <tr className="font-weight-bold">
                  <td className="text-blue">
                    Compliance Ratio Credit Reduction:
                  </td>
                  <td>
                    {formatNumeric((totalReduction), 2)}
                  </td>
                </tr>
                <>
                  <tr>
                    <td className="text-blue">
                      &bull; &nbsp; &nbsp; ZEV Class A Credit Reduction:
                    </td>
                    <td>
                      {formatNumeric(classAReduction, 2)}
                    </td>
                  </tr>

                  <tr>
                    <td className="text-blue">
                      &bull; &nbsp; &nbsp; Unspecified ZEV Class Credit Reduction:
                    </td>
                    <td>
                      {formatNumeric((leftoverReduction), 2)}
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
  statuses: PropTypes.shape().isRequired,
};
export default ComplianceObligationAmountsTable;
