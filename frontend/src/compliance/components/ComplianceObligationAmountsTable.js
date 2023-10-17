import React from 'react'
import PropTypes from 'prop-types'

import formatNumeric from '../../app/utilities/formatNumeric'

const ComplianceObligationAmountsTable = (props) => {
  const {
    classAReductions,
    handleChangeSales,
    page,
    ratios,
    reportYear,
    sales,
    statuses,
    supplierClass,
    totalReduction,
    unspecifiedReductions
  } = props

  const filteredClassAReductions = classAReductions.find(
    (reduction) => Number(reduction.modelYear) === Number(reportYear)
  )

  const filteredUnspecifiedReductions = unspecifiedReductions.find(
    (reduction) => Number(reduction.modelYear) === Number(reportYear)
  )

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
                    {page === 'obligation' &&
                      statuses.assessment.status !== 'ASSESSED' && (
                        <input
                          className="form-control"
                          disabled={
                            ['SAVED', 'UNSAVED'].indexOf(
                              statuses.complianceObligation.status
                            ) < 0
                          }
                          onChange={handleChangeSales}
                          type="number"
                          value={formatNumeric(sales, 0)}
                        />
                    )}
                    {(page === 'assessment' ||
                      (page === 'obligation' &&
                        statuses.assessment.status === 'ASSESSED')) &&
                      (formatNumeric(sales, 0) || 0)}
                  </td>
                </tr>
                <tr>
                  <td className="text-blue">{reportYear} Compliance Ratio:</td>
                  <td width="25%">{ratios.complianceRatio} %</td>
                  <td className="text-blue font-weight-bold" width="25%">
                    Compliance Ratio Credit Reduction:
                  </td>
                  <td className="font-weight-bold" width="25%">
                    {supplierClass === 'S' ? formatNumeric(0, 2) : 
                      formatNumeric(totalReduction, 2)
                    }
                  </td>
                </tr>
                {supplierClass === 'L' && (
                  <tr>
                    <td className="text-blue">
                      Large Volume Supplier Class A Ratio:
                    </td>
                    <td>{ratios.zevClassA} %</td>
                    <td className="text-blue">
                      &bull; ZEV Class A Credit Reduction:
                    </td>
                    <td>{formatNumeric(filteredClassAReductions.value, 2)}</td>
                  </tr>
                )}
                <tr>
                  <td colSpan="2" />
                  <td className="text-blue">
                    &bull; Unspecified ZEV Class Credit Reduction:
                  </td>
                  <td>
                    {supplierClass === 'S' ? formatNumeric(0, 2) : 
                      formatNumeric(filteredUnspecifiedReductions.value, 2)
                    }
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

ComplianceObligationAmountsTable.defaultProps = {
  handleChangeSales: () => {}
}

ComplianceObligationAmountsTable.propTypes = {
  classAReductions: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  handleChangeSales: PropTypes.func,
  page: PropTypes.string.isRequired,
  reportYear: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  ratios: PropTypes.shape().isRequired,
  sales: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  statuses: PropTypes.shape().isRequired,
  supplierClass: PropTypes.string.isRequired,
  totalReduction: PropTypes.number.isRequired,
  unspecifiedReductions: PropTypes.arrayOf(PropTypes.shape()).isRequired
}

export default ComplianceObligationAmountsTable
