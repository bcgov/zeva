import React from 'react'
import PropTypes from 'prop-types'
import CustomPropTypes from '../../app/utilities/props'
import formatNumeric from '../../app/utilities/formatNumeric'

const ComplianceCalculatorDetailsTotals = (props) => {
  const { complianceNumbers, supplierSize, estimatedModelSales, user } = props

  return (
    <div className="col-lg-4 col-12 px-3 compliance-calculator-totals m-lg-2">
      <div className="form-group row p-3">
        <table className="m-auto">
          <tbody>
            <tr>
              <td className="font-weight-bold text-blue pt-4">
                Estimated Compliance Ratio Reduction:
              </td>
              <td className="pl-3 font-weight-bold pt-4 text-right">
                {complianceNumbers.total}
              </td>
            </tr>
            {supplierSize === 'large' && (
              <>
                <tr>
                  <td className="text-blue">-ZEV Class A Debit:</td>
                  <td className="pl-3 text-right">
                    {complianceNumbers.classA}
                  </td>
                </tr>
                <tr>
                  <td className="text-blue">-Unspecified ZEV Class Debit:</td>
                  <td className="pl-3 text-right">
                    {complianceNumbers.remaining}
                  </td>
                </tr>
              </>
            )}
            <tr>
              <td className="font-weight-bold text-blue pt-4">
                Current Credit Balance:
              </td>
              <td />
            </tr>
            <tr>
              <td className="text-blue">Class A Credit Total:</td>
              <td className="pl-3 text-right">{formatNumeric(user.organization.balance.A)}</td>
            </tr>
            <tr>
              <td className="text-blue">Class B Credit Total:</td>
              <td className="pl-3 text-right">{formatNumeric(user.organization.balance.B)}</td>
            </tr>
            <tr>
              <td className="text-blue pt-4">
                <b>Estimated Annual ZEV Sales</b> (from below):
              </td>
              <td />
            </tr>
            <tr>
              <td className="text-blue">Estimated Class A Credit Total:</td>
              <td className="pl-3 text-right">
                {estimatedModelSales &&
                  formatNumeric(
                    estimatedModelSales
                      .filter((each) => each.creditClass === 'A')
                      .reduce((a, v) => a + v.value, 0)
                  )}
              </td>
            </tr>
            <tr>
              <td className="text-blue">Estimated Class B Credit Total:</td>
              <td className="pl-3 text-right">
                {estimatedModelSales &&
                  formatNumeric(
                    estimatedModelSales
                      .filter((each) => each.creditClass === 'B')
                      .reduce((a, v) => a + v.value, 0)
                  )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
ComplianceCalculatorDetailsTotals.defaultProps = {}

ComplianceCalculatorDetailsTotals.propTypes = {
  complianceNumbers: PropTypes.shape().isRequired,
  estimatedModelSales: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  supplierSize: PropTypes.string.isRequired,
  user: CustomPropTypes.user.isRequired
}

export default ComplianceCalculatorDetailsTotals
