import React from 'react'
import PropTypes from 'prop-types'

const ComplianceCalculatorDetailsInputs = (props) => {
  const {
    complianceYearInfo,
    handleInputChange,
    modelYearList,
    selectedYearOption,
    supplierSize
  } = props
  const selectionList = modelYearList.map((obj) => (
    <option key={`${obj.id}-${obj.name}`} value={obj.name}>
      {obj.name}
    </option>
  ))
  return (
    <div className="col-lg-5 col-sm-12 col-12 compliance-calculator-grey pl-0 m-lg-2">
      <fieldset>
        <div className="form-group row pl-0 mb-0">
          <label className="col-sm-7 col-form-label" htmlFor="model-year">
            Model Year:
          </label>
          <div className="col-sm-7 col-lg-4 pl-0">
            <select
              className="form-control"
              id="model-year"
              name="model-year"
              value={selectedYearOption}
              onChange={(event) => {
                handleInputChange(event)
              }}
            >
              {selectedYearOption === '--' && <option disabled>--</option>}
              {selectionList}
            </select>
          </div>
        </div>
        <div className="form-group pl-0 mt-0">
          <div className="text-blue">
            <label htmlFor="supplier-size" className="pl-3 col-form-label">
              Supplier Class
            </label>
            &nbsp; (based on average of previous 3 year total vehicles supplied):
          </div>
          <div className="pl-lg-5">
            <span className="text-blue ml-4">
              Small Volume Supplier (less than 1,000 total vehicles supplied)
            </span>
            <br />
            <input
              type="radio"
              id="supplier-size"
              name="supplier-size"
              value="medium"
              onChange={(event) => {
                handleInputChange(event)
              }}
            />
            <span className="text-blue">
              Medium Volume Supplier (1,000 to 4,999 total vehicles supplied)
            </span>
            <br />
            <input
              type="radio"
              id="supplier-size"
              name="supplier-size"
              value="large"
              onChange={(event) => {
                handleInputChange(event)
              }}
            />
            <span className="text-blue">
              Large Volume Supplier (5,000 or more total vehicles supplied)
            </span>
          </div>
          <div className="form-group row mb-0">
            <div className="col-xl-6 col-lg-10 col-9 text-blue pl-0">
              Compliance Ratio:
            </div>
            {supplierSize && selectedYearOption !== '--' && (
              <div className="col-3 col-lg-2 text-right">
                {complianceYearInfo.complianceRatio}%
              </div>
            )}
            {supplierSize === 'large' && selectedYearOption !== '--' && (
              <>
                <div className="col-xl-6 col-lg-10 col-9 text-blue pl-0">
                  Large Supplier Class A Ratio:
                </div>
                <div className="col-3 col-lg-2 text-right">
                  {complianceYearInfo.zevClassA}%
                </div>
              </>
            )}
          </div>
          <div className="form-group row mb-0 py-0">
            <label
              className="col-12 col-lg-7 col-form-label pl-0"
              htmlFor="provisional-sales"
            >
              Estimated Vehicles Supplied:
            </label>
            <input
              type="number"
              min="0"
              step="1"
              id="total-sales-number"
              className="col-10 col-lg-3 text-right"
              onChange={(event) => {
                handleInputChange(event)
              }}
            />
          </div>
        </div>
      </fieldset>
    </div>
  )
}
ComplianceCalculatorDetailsInputs.defaultProps = {
  supplierSize: '',
  selectedYearOption: '--',
  complianceNumbers: { total: '', classA: '', remaining: '' }
}
ComplianceCalculatorDetailsInputs.propTypes = {
  complianceNumbers: PropTypes.shape({
    total: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    classA: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    remaining: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  }),
  complianceYearInfo: PropTypes.shape({
    complianceRatio: PropTypes.string,
    zevClassA: PropTypes.string
  }).isRequired,
  handleInputChange: PropTypes.func.isRequired,
  modelYearList: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  selectedYearOption: PropTypes.string,
  supplierSize: PropTypes.string
}

export default ComplianceCalculatorDetailsInputs
