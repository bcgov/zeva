import React from 'react';
import PropTypes from 'prop-types';
import ComplianceCalculatorModelRow from './ComplianceCalculatorModelRow';
import formatNumeric from '../../app/utilities/formatNumeric';

const ComplianceCalculatorModelTable = (props) => {
  const { models, estimatedModelSales, setEstimatedModelSales } = props;

  return (
    <div id="form" className="my-4">
      <div className="row">
        <div className="col-lg-12 col-xl-10">
          <fieldset>
            <div className="form-group row mb-0 font-weight-bold text-center">
              <span className="col-4">ZEV Model</span>
              <span className="col-1">ZEV Class</span>
              <span className="col-2">Credit Entitlement</span>
              <span className="col-3">Estimated Annual Sales Total</span>
              <span className="col-2">Estimated Credits Total</span>

            </div>
            {models.map((each) => (
              <ComplianceCalculatorModelRow key={each.id} model={each} setEstimatedModelSales={setEstimatedModelSales} estimatedModelSales={estimatedModelSales} />
            ))}
            <div className="form-group row text-blue font-weight-bold">
              {/* to do: make this update when keydown happens (currently skipping first change) */}
              Estimated Class A Credit Total: {estimatedModelSales && formatNumeric(estimatedModelSales.filter((each) => each.creditClass === 'A').reduce((a, v) => a + v.value, 0))}
              <br />
              Estimated Class B Credit Total: {estimatedModelSales && formatNumeric(estimatedModelSales.filter((each) => each.creditClass === 'B').reduce((a, v) => a + v.value, 0))}
            </div>
          </fieldset>
        </div>
      </div>
    </div>
  );
};

ComplianceCalculatorModelTable.propTypes = {
  models: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  estimatedModelSales: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  setEstimatedModelSales: PropTypes.func.isRequired,
};

export default ComplianceCalculatorModelTable;
