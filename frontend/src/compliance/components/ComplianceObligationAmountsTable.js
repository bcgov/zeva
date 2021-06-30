import React from 'react';
import PropTypes from 'prop-types';
import getTotalReduction from '../../app/utilities/getTotalReduction';
import getUnspecifiedClassReduction from '../../app/utilities/getUnspecifiedClassReduction';
import getClassAReduction from '../../app/utilities/getClassAReduction';

const ComplianceObligationAmountsTable = (props) => {
  const {
    reportYear,
    supplierClassInfo,
    ratios,
    page,
    handleChangeSales,
    sales,
    statuses,
  } = props;
  return (
    <div>
      <div className="compliance-reduction-table">
        <div className="row mb-4 ">
          <div className="col-12">
            <table className="no-border">
              <tbody>
                <tr className="ldv-sales ">
                  <td className="text-blue" colSpan="3">
                    {reportYear} Model Year LDV Sales:
                  </td>
                  <td>
                    {page === 'obligation'
                    && (
                    <input
                      className="form-control"
                      type="text"
                      onChange={handleChangeSales}
                      value={sales}
                      disabled={['SAVED', 'UNSAVED'].indexOf(statuses.complianceObligation.status) < 0}
                    />
                    )}
                    {page === 'assessment'
                    && (sales || 0)}
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
                  <td className="text-blue">&bull; ZEV Class A Credit Reduction:</td>
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
                  <td className="text-blue">&bull; Unspecified ZEV Class Credit Reduction:</td>
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
        </div>
      </div>
    </div>
  );
};

ComplianceObligationAmountsTable.defaultProps = {
  handleChangeSales: () => {},
};

ComplianceObligationAmountsTable.propTypes = {
  handleChangeSales: PropTypes.func,
  page: PropTypes.string.isRequired,
  reportYear: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,
  ratios: PropTypes.shape().isRequired,
  sales: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,
  statuses: PropTypes.shape().isRequired,
  supplierClassInfo: PropTypes.shape().isRequired,
};
export default ComplianceObligationAmountsTable;
