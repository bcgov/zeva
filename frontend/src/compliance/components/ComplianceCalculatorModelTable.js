import React from 'react'
import PropTypes from 'prop-types'
import formatNumeric from '../../app/utilities/formatNumeric'

const ComplianceCalculatorModelTable = (props) => {
  const { models, estimatedModelSales, setEstimatedModelSales } = props
  const findModelIndex = (model) =>
    estimatedModelSales.findIndex((sale) => model.id === sale.id)
  const handleInputChange = (event, model) => {
    const { value } = event.target
    const index = findModelIndex(model)
    const totalValue = model.creditValue * value
    // make copy of estimatedModelSales and modify that instead
    const estimatedSalesCopy = estimatedModelSales.map((each) => ({ ...each }))
    if (index >= 0) {
      estimatedSalesCopy[index].value = totalValue
      estimatedSalesCopy[index].estimatedSalesNum = value
      estimatedSalesCopy[index].creditClass = model.creditClass
    } else {
      estimatedSalesCopy.push({
        id: model.id,
        value: totalValue,
        estimatedSalesNum: value,
        creditClass: model.creditClass
      })
    }
    setEstimatedModelSales(estimatedSalesCopy)
  }
  return (
    <div id="form" className="my-3">
      <div className="row">
        <div className="col-12">
          <div id="calculator-model-table">
            <fieldset>
              <table>
                <thead>
                  <tr className="text-center compliance-calculator-grey">
                    <th className="zev-model text-left">ZEV Model</th>
                    <th className="zev-class">ZEV Class</th>
                    <th className="credit-entitlement text-right">
                      Credit Entitlement
                    </th>
                    <th className="estimated-sales">
                      Estimated annual ZEVs supplied
                    </th>
                    <th className="estimated-credits text-right">
                      Estimated Credits Total
                    </th>
                    <th>&nbsp;</th>
                  </tr>
                </thead>
                <tbody>
                  {models.map((each) => (
                    <tr className="mx-2" key={each.id}>
                      <td className="text-left">
                        {each.modelYear.name} {each.make} {each.modelName}
                      </td>
                      <td className="text-center">{each.creditClass}</td>
                      <td className="text-right px-1">{each.creditValue}</td>
                      <td className="px-4">
                        <input
                          className="mx-auto d-block text-right"
                          id={`input-sales-${each.id}`}
                          name="input-sales"
                          step="1"
                          type="number"
                          min="0"
                          onChange={(event) => {
                            handleInputChange(event, each)
                          }}
                        />
                      </td>
                      <td className="text-right px-1">
                        {estimatedModelSales[findModelIndex(each)]
                          ? `${formatNumeric(
                              estimatedModelSales[findModelIndex(each)].value
                            )}-${
                              estimatedModelSales[findModelIndex(each)]
                                .creditClass
                            }`
                          : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </fieldset>
          </div>
        </div>
      </div>
    </div>
  )
}

ComplianceCalculatorModelTable.propTypes = {
  models: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  estimatedModelSales: PropTypes.arrayOf(
    PropTypes.shape({
      creditClass: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    })
  ).isRequired,
  setEstimatedModelSales: PropTypes.func.isRequired
}

export default ComplianceCalculatorModelTable
