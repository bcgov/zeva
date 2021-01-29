import React from 'react';
import CustomPropTypes from '../../app/utilities/props';

const ComplianceCalculatorDetailsPage = (props) => {
  const {
    user, modelYear, setModelYear, supplierSize, setSupplierSize,
  } = props;
  const selectionList = [{ id: 1, name: '2019' }, { id: 2, name: '2020' }].map((obj) => (
    <option key={(obj.id)} value={obj.name}>{obj.name || obj.description}</option>
  ));
  return (
    <div id="compliance-ldvsales-details" className="page">
      <div className="row mt-3 mb-2">
        <div className="col-sm-12">
          <h2>Credit Obligation Calculator</h2>
        </div>
      </div>
      <div id="form">
        <form onSubmit={(event) => console.log(event)}>
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
                      onChange={() => { console.log('hi'); }}
                      value="--"
                    >
                      {selectionList}
                    </select>
                  </div>
                </div>
                <div className="form-group mt-0">
                  <div className="text-blue">
                    <label className="pl-3 col-form-label">
                      Supplier Size
                    </label>
                    &nbsp; (based on average of previous 3 year total LDV sale):
                  </div>
                  <div className="pl-5">
                    <span className="text-blue ml-4">Small Volume Supplier - no obligation (under 1,000 total LDV sales)</span>
                    <br />
                    <input type="radio" name="supplier-size" value="medium" onChange={(event) => { setSupplierSize('Medium'); }} />
                    <span className="text-blue">Medium Volume Supplier (under 5,000 total LDV sales)</span>
                    <br />
                    <input type="radio" name="supplier-size" value="large" onChange={(event) => { setSupplierSize('Large'); }} />
                    <span className="text-blue">Large Volume Supplier (under 10,000 total LDV sales)</span>
                  </div>
                  <div className="form-group row mb-0">
                    <div className="col-sm-5 text-blue pl-0">
                      Compliance Ratio:

                    </div>
                    <div className="col-sm-6">
                      9.5%
                    </div>
                    {supplierSize === 'Large'
                    && (
                    <>
                      <div className="col-sm-5 text-blue pl-0">
                        Large Supplier Class A Ratio:

                      </div>
                      <div className="col-sm-6">
                        9%

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
                    <input className="col-sm-2" />
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
                        950
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
                        600
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
                        350
                      </b>
                    </div>
                  </div>
                </div>

              </fieldset>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

ComplianceCalculatorDetailsPage.propTypes = {
  user: CustomPropTypes.user.isRequired,
};

export default ComplianceCalculatorDetailsPage;
