import React from 'react'
import PropTypes from 'prop-types'

import getTotalReduction from '../../app/utilities/getTotalReduction'
import getClassAReduction from '../../app/utilities/getClassAReduction'
import getUnspecifiedClassReduction from '../../app/utilities/getUnspecifiedClassReduction'
import formatNumeric from '../../app/utilities/formatNumeric'

const ConsumerLDVSales = (props) => {
  const {
    classAReduction,
    currentSales,
    handleChangeSale,
    leftoverReduction,
    modelYear,
    ratios,
    supplierClass,
    totalReduction,
    updatedSales
  } = props

  return (
    <>
      <div className="row">
        <div className="col-5" />
        <div className="col-3 text-blue font-weight-bold text-right">
          Supplier Information
        </div>
        <div className="col-3 text-blue font-weight-bold text-right">
          Analyst Adjustment
        </div>
      </div>
      <div className="row mb-3">
        <div className="col-5 text-blue">
          {modelYear} Model Year LDV Sales\Leases:
        </div>
        <div className="col-3 text-right">{currentSales}</div>
        <div className="col-3 text-right">
          <input
            className="text-right"
            type="text"
            onChange={(event) => {
              handleChangeSale(modelYear, event.target.value)
            }}
            value={updatedSales}
          />
        </div>
      </div>
      <div className="row">
        <div className="col-5 text-blue">
          Compliance Ratio Credit Reduction:
        </div>
        <div className="col-3 text-right">
          {formatNumeric(totalReduction, 2)}
        </div>
        <div className="col-3 text-right">
          {formatNumeric(
            getTotalReduction(updatedSales, ratios.complianceRatio, supplierClass),
            2
          )}
        </div>
      </div>
      <div className="row">
        <div className="col-5 text-blue">ZEV Class A Credit Reduction:</div>
        <div className="col-3 text-right">
          {formatNumeric(classAReduction, 2)}
        </div>
        <div className="col-3 text-right">
          {formatNumeric(
            getClassAReduction(updatedSales, ratios.zevClassA, supplierClass),
            2
          )}
        </div>
      </div>
      <div className="row">
        <div className="col-5 text-blue">
          Unspecified ZEV Class Credit Reduction:
        </div>
        <div className="col-3 text-right">
          {formatNumeric(leftoverReduction, 2)}
        </div>
        <div className="col-3 text-right">
          {formatNumeric(
            getUnspecifiedClassReduction(
              getTotalReduction(updatedSales, ratios.complianceRatio, supplierClass),
              getClassAReduction(updatedSales, ratios.zevClassA, supplierClass),
              supplierClassa
            ),
            2
          )}
        </div>
      </div>
    </>
  )
}

ConsumerLDVSales.defaultProps = {}

ConsumerLDVSales.propTypes = {
  classAReduction: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    .isRequired,
  currentSales: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    .isRequired,
  handleChangeSale: PropTypes.func.isRequired,
  leftoverReduction: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    .isRequired,
  modelYear: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    .isRequired,
  ratios: PropTypes.shape().isRequired,
  supplierClass: PropTypes.string.isRequired,
  totalReduction: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    .isRequired,
  updatedSales: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    .isRequired
}

export default ConsumerLDVSales
