import React from 'react';
import PropTypes from 'prop-types';
import formatNumeric from '../../app/utilities/formatNumeric';

const ComplianceCalculatorModelRow = (props) => {
  const { model, estimatedModelSales, setEstimatedModelSales } = props;
  const index = estimatedModelSales.findIndex((sale) => (model.id === sale.id));
  const handleInputChange = (event) => {
    const { value, id } = event.target;
    const totalValue = model.creditValue * value;
    // make copy of estimatedModelSales and modify that instead
    const estimatedSalesCopy = estimatedModelSales.map((each) => ({ ...each }));
    if (index >= 0) {
      estimatedSalesCopy[index].value = totalValue;
      estimatedSalesCopy[index].estimatedSalesNum = value;
      estimatedSalesCopy[index].creditClass = model.creditClass;
    } else {
      estimatedSalesCopy.push({
        id: model.id,
        value: totalValue,
        estimatedSalesNum: value,
        creditClass: model.creditClass,
      });
    }
    setEstimatedModelSales(estimatedSalesCopy);
  };

  return (
    <div className="row my-1 mx-2">
      <span className="col-4 text-left">{model.modelYear.name} {model.make} {model.modelName}</span>
      <span className="col-1 text-center">{model.creditClass}</span>
      <span className="col-2 text-right">{model.creditValue}</span>
      <span className="col-3">
        <input
          className="mx-auto d-block"
          id={`input-sales-${model.id}`}
          name="input-sales"
          step="1"
          type="number"
          min="0"
          onChange={(event) => {
            handleInputChange(event);
          }}
        />
      </span>
      <span className="col-2 text-right">
        {estimatedModelSales[index] ? `${estimatedModelSales[index].creditClass}-${formatNumeric(estimatedModelSales[index].value)}` : ''}
      </span>
    </div>
  );
};

ComplianceCalculatorModelRow.propTypes = {
  model: PropTypes.shape({}).isRequired,
  estimatedModelSales: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  setEstimatedModelSales: PropTypes.func.isRequired,
};
export default ComplianceCalculatorModelRow;
