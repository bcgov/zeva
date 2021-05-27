import React from 'react';
import PropTypes from 'prop-types';

import getTotalReduction from '../../app/utilities/getTotalReduction';
import getClassAReduction from '../../app/utilities/getClassAReduction';
import getUnspecifiedClassReduction from '../../app/utilities/getUnspecifiedClassReduction';

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
    updatedSales,
  } = props;

  return (
    <>
      <div className="row">
        <div className="col-6" />
        <div className="col-3">
          Supplier Information
        </div>
        <div className="col-3">
          Analyst Adjustment
        </div>
      </div>
      <div className="row">
        <div className="col-6">
          {modelYear} Model Year LDV Sales\Leases:
        </div>
        <div className="col-3">
          {currentSales}
        </div>
        <div className="col-3">
          <input type="text" onChange={(event) => { handleChangeSale(modelYear, event.target.value); }} value={updatedSales} />
        </div>
      </div>
      <div className="row">
        <div className="col-6">
          Compliance Ratio Credit Reduction:
        </div>
        <div className="col-3">
          {totalReduction}
        </div>
        <div className="col-3">
          {getTotalReduction(updatedSales, ratios.complianceRatio)}
        </div>
      </div>
      <div className="row">
        <div className="col-6">
          ZEV Class A Credit Reduction:
        </div>
        <div className="col-3">
          {classAReduction}
        </div>
        <div className="col-3">
          {getClassAReduction(updatedSales, ratios.zevClassA, supplierClass)}
        </div>
      </div>
      <div className="row">
        <div className="col-6">
          Unspecified ZEV Class Credit Reduction:
        </div>
        <div className="col-3">
          {leftoverReduction}
        </div>
        <div className="col-3">
          {getUnspecifiedClassReduction(
            getTotalReduction(updatedSales, ratios.complianceRatio),
            getClassAReduction(updatedSales, ratios.zevClassA, supplierClass),
          )}
        </div>
      </div>
    </>
  );
};

ConsumerLDVSales.defaultProps = {

};

ConsumerLDVSales.propTypes = {
  classAReduction: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]).isRequired,
  currentSales: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]).isRequired,
  handleChangeSale: PropTypes.func.isRequired,
  leftoverReduction: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]).isRequired,
  modelYear: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]).isRequired,
  ratios: PropTypes.shape().isRequired,
  supplierClass: PropTypes.string.isRequired,
  totalReduction: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]).isRequired,
  updatedSales: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]).isRequired,
};

export default ConsumerLDVSales;
