import React from 'react';
import PropTypes from 'prop-types';
import ComplianceCalculatorModelRow from './ComplianceCalculatorModelRow';
import formatNumeric from '../../app/utilities/formatNumeric';

const ComplianceCalculatorModelTable = (props) => {
  const { models, estimatedModelSales, setEstimatedModelSales } = props;
  const findModelIndex = (model) => estimatedModelSales.findIndex((sale) => (model.id === sale.id));
  const handleInputChange = (event, model) => {
    const { value, id } = event.target;
    let modelId = { id: id.split('-').slice(-1)[0] };
    const index = findModelIndex(modelId)
    const totalValue = model.creditValue * value;
    // make copy of estimatedModelSales and modify that instead
    const estimatedSalesCopy = estimatedModelSales.map((each) => ({ ...each }));
    console.log(estimatedSalesCopy)
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
    <div id="form" className="my-3">
      <div className="row">
        <div id="calculator-model-table" className="col-12">
          <fieldset>
            <table>
              <thead>
                <tr className="text-center compliance-calculator-inputs">

                  <th className="col-lg-3">ZEV Model</th>
                  <th className="col-lg-1">ZEV Class</th>
                  <th className="col-lg-1">Credit Entitlement</th>
                  <th className="col-lg-3">Estimated Annual Sales Total</th>
                  <th className="col-lg-2">Estimated Credits Total</th>
                </tr>
              </thead>
              <tbody>
                {models.map((each) => (
                  // <ComplianceCalculatorModelRow key={each.id} model={each} setEstimatedModelSales={setEstimatedModelSales} estimatedModelSales={estimatedModelSales} />
                  <tr className="mx-2">
                    <td className="text-left">{each.modelYear.name} {each.make} {each.modelName}</td>
                    <td className="text-center">{each.creditClass}</td>
                    <td className="text-right">{each.creditValue}</td>
                    <td><input
                      className="mx-auto d-block"
                      id={`input-sales-${each.id}`}
                      name="input-sales"
                      step="1"
                      type="number"
                      min="0"
                      onChange={(event) => {
                        handleInputChange(event, each);
                      }}
                    />
                    </td>
                    <td className="text-right px-1">{estimatedModelSales[findModelIndex(each)] ? `${estimatedModelSales[findModelIndex(each)].creditClass}-${formatNumeric(estimatedModelSales[findModelIndex(each)].value)}` : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
