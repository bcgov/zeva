import React from 'react';
import PropTypes from 'prop-types';
import CustomPropTypes from '../../app/utilities/props';

const ComplianceCalculatorDetailsPage = (props) => {
  const {
    complianceNumbers,
    complianceYearInfo,
    handleInputChange,
    modelYearList,
    selectedYearOption,
    supplierSize,
  } = props;
  const selectionList = modelYearList.map((obj) => (
    <option key={(obj.id)} value={obj.name}>{obj.name}</option>
  ));
  return (
    <div id="compliance-ldvsales-details" className="page">
      <div className="row mt-3 mb-2">
        <div className="col-sm-12">
          <h2>Credit Obligation Calculator</h2>
        </div>
      </div>
      <div id="form">
        <div className="row">
          <div className="col-lg-12 col-xl-10">
            <fieldset>
              <div className="form-group row mb-0">
                <label
                  className="col-sm-4 col-form-label"
                  htmlFor="model-year"
                >
                  Model Year:
                </label>
                <div className="col-sm-2  pl-0">
                  <select
                    className="form-control"
                    id="model-year"
                    name="model-year"
                    value={selectedYearOption}
                    onChange={(event) => { handleInputChange(event); }}
                  >
                    {selectedYearOption === '--' && <option disabled>--</option>}
                    {selectionList}
                  </select>
                </div>
              </div>
              <div className="form-group mt-0">
                <div className="text-blue">
                  <label
                    htmlFor="supplier-size"
                    className="pl-3 col-form-label"
                  >
                    Supplier Size
                  </label>
                  &nbsp; (based on average of previous 3 year total LDV sale):
                </div>
                <div className="pl-5">
                  <span className="text-blue ml-4">Small Volume Supplier - no obligation (under 1,000 total LDV sales)</span>
                  <br />
                  <input
                    type="radio"
                    id="supplier-size"
                    name="supplier-size"
                    value="medium"
                    onChange={(event) => { handleInputChange(event); }}
                  />
                  <span className="text-blue">Medium Volume Supplier (under 5,000 total LDV sales)</span>
                  <br />
                  <input
                    type="radio"
                    id="supplier-size"
                    name="supplier-size"
                    value="large"
                    onChange={(event) => { handleInputChange(event); }}
                  />
                  <span className="text-blue">Large Volume Supplier (under 10,000 total LDV sales)</span>
                </div>
                <div className="form-group row mb-0">
                  <div className="col-sm-5 text-blue pl-0">
                    Compliance Ratio:

                  </div>
                  {supplierSize && (selectedYearOption !== '--') && (
                    <div className="col-sm-6">
                      {complianceYearInfo.complianceRatio}%
                    </div>
                  )}
                  {supplierSize === 'large'
                    && (selectedYearOption !== '--') && (
                    <>
                      <div className="col-sm-5 text-blue pl-0">
                        Large Supplier Class A Ratio:

                      </div>
                      <div className="col-sm-6">
                        {complianceYearInfo.zevClassA}%

                      </div>
                    </>
                  )}
                </div>
                <div className="form-group row mb-0 py-0">
                  <label
                    className="col-sm-4 col-form-label pl-0"
                    htmlFor="provisional-sales"
                  >
                    Provisional LDV Sales:
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    id="total-sales-number"
                    className="col-sm-2"
                    onChange={(event) => { handleInputChange(event); }}
                  />
                </div>
                <div className="form-group row mb-0 py-0">
                  <label
                    className="col-sm-5 col-form-label pl-0 pb-0"
                    htmlFor="provisional-sales"
                  >
                    Provisional Credit Target Total:
                  </label>
                  <div className="col-sm-6 pb-0">
                    <b>
                      {complianceNumbers.total}
                    </b>
                  </div>
                  <label
                    className="col-sm-5 col-form-label pl-0 pb-0"
                    htmlFor="provisional-sales"
                  >
                    Provisional Class A Credit Obligation:
                  </label>
                  <div className="col-sm-6 pb-0">
                    <b>
                      {complianceNumbers.classA}
                    </b>
                  </div>
                  <label
                    className="col-sm-5 col-form-label pl-0 pb-0"
                    htmlFor="provisional-sales"
                  >
                    Remaining Class A or B Credit Obligation:
                  </label>
                  <div className="col-sm-6">
                    <b>
                      {complianceNumbers.remaining}
                    </b>
                  </div>
                </div>
              </div>

            </fieldset>
          </div>
        </div>
      </div>
    </div>
  );
};
ComplianceCalculatorDetailsPage.defaultProps = {
  supplierSize: '',
  selectedYearOption: '--',
};
ComplianceCalculatorDetailsPage.propTypes = {
  complianceNumbers: PropTypes.shape({
    total: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]),
    classA: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]),
    remaining: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]),
  }).isRequired,
  complianceYearInfo: PropTypes.shape({
    complianceRatio: PropTypes.number,
    zevClassA: PropTypes.number,
  }).isRequired,
  handleInputChange: PropTypes.func.isRequired,
  modelYearList: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  selectedYearOption: PropTypes.string,
  supplierSize: PropTypes.string,
};

export default ComplianceCalculatorDetailsPage;
