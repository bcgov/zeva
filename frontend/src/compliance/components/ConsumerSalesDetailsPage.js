import React from 'react';
import PropTypes from 'prop-types';
import CustomPropTypes from '../../app/utilities/props';
import Loading from '../../app/components/Loading';
import ComplianceReportAlert from './ComplianceReportAlert';
import Button from '../../app/components/Button';
import history from '../../app/History';
import ComplianceReportSignOff from './ComplianceReportSignOff';
import ConsumerSalesLDVModalTable from './ConsumerSalesLDVModelTable';

const ConsumerSalesDetailsPage = (props) => {
  const {
    details,
    user,
    loading,
    handleSave,
    handleChange,
    vehicles,
    assertions,
    checkboxes,
    disabledCheckboxes: propsDisabledCheckboxes,
    error,
    handleCheckboxClick,
    handleInputChange,
    avgSales,
    vehicleSupplierClass,
    previousYearsExist,
    previousYearsList,
    salesInput,
    modelYear,
    firstYear,
    secondYear,
    thirdYear,
    statuses,
  } = props;

  let disabledCheckboxes = propsDisabledCheckboxes;

  if (loading) {
    return <Loading />;
  }

  const confirmPreviousSalesText = (
    <div className="text-blue">
      Confirm the previous 3 model year light duty vehicle sales and lease
      totals (ICE & ZEV) in British Columbia for {details.organization.name}.
      These totals are taken from previous model year reports, changes required
      to these totals will require a supplemental report
    </div>
  );

  const enterPreviousSalesText = (
    <div className="text-blue">
      Enter the previous 3 model year light duty vehicle sales and lease total
      (ICE & ZEV) in British Columbia for {details.organization.name}. If this
      is your first year supplying light duty vehicles in B.C. you can enter 0
      in the input fields.
    </div>
  );

  assertions.forEach((assertion) => {
    if (checkboxes.indexOf(assertion.id) >= 0) {
      disabledCheckboxes = 'disabled';
    }
  });

  return (
    <div id="compliance-consumer-sales-details" className="page">
      <div className="row mt-3">
        <div className="col-sm-12">
          <h2>{modelYear} Model Year Report</h2>
        </div>
      </div>
      <div className="row">
        <div className="col-12">
          {details && details.consumerSales && details.consumerSales.history && (
            <ComplianceReportAlert
              next="Compliance Obligation"
              report={details.consumerSales}
              status={statuses.consumerSales}
              type="Consumer Sales"
            />
          )}
        </div>
      </div>

      <div className="row mt-1">
        <div className="col-12">
          <div className="p-3 consumer-sales">
            <h3>Consumer Sales</h3>

            <div className="enter-ldv-sales mt-2">
              <div className="text-blue">
                Enter the {modelYear} model year light duty vehicle sales and lease
                total (ICE & ZEV) in British Columbia for{' '}
                {details.organization.name}.
              </div>
              <div className="ldv-sales mt-2 p-3">
                <form onSubmit={(event) => handleSave(event)}>
                  <label className="text-blue mr-4 font-weight-bold">
                    {modelYear} Model Year LDV Sales\Leases
                  </label>
                  <input
                    defaultValue={salesInput || 0}
                    className="textbox-sales"
                    type="number"
                    onChange={handleChange}
                    min="0"
                  />
                  {error && (
                    <small className="text-danger ml-2">
                      {modelYear} Model Year LDV Sales\Leases can&apos;t be blank
                    </small>
                  )}
                </form>
              </div>
            </div>
            <div className="row">
              {previousYearsExist ? (
                <div className="col-sm-12">{confirmPreviousSalesText}</div>
              ) : (
                <div className="col-sm-12">{enterPreviousSalesText}</div>
              )}
            </div>
            <div className="row">
              <div className="col-6">
                {previousYearsExist ? (
                  <div className="previous-ldv-sales mt-2 p-3">
                    {previousYearsList.map((yearSale) => (
                      <div className="model-year-ldv" key={yearSale.id}>
                        <label className="text-blue mr-4 font-weight-bold">
                          {yearSale.modelYear} Model Year LDV Sales\Leases:
                        </label>
                        <label className="sales-numbers">
                          {yearSale.previousSales}
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="confirm-previous-sales mt-2">
                    <div className="previous-ldv-sales mt-2 p-3">
                      <form onSubmit={(event) => handleSave(event)}>
                        <div className="row ml-1 mb-2">
                          <label className="text-blue mr-4 font-weight-bold">
                            {firstYear} Model Year LDV Sales\Leases
                          </label>
                          <input
                            className="textbox-first"
                            type="number"
                            onChange={handleInputChange}
                            id="first"
                            min="0"
                          />
                        </div>
                        <div className="row ml-1 mb-2">
                          <label className="text-blue mr-4 font-weight-bold">
                            {secondYear} Model Year LDV Sales\Leases
                          </label>
                          <input
                            className="textbox-second"
                            type="number"
                            onChange={handleInputChange}
                            id="second"
                            min="0"
                          />
                        </div>
                        <div className="row ml-1 mb-2">
                          <label className="text-blue mr-4 font-weight-bold">
                            {thirdYear} Model Year LDV Sales\Leases
                          </label>
                          <input
                            className="textbox-third"
                            type="number"
                            onChange={handleInputChange}
                            id="third"
                            min="0"
                          />
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
              <div className="col-6">
                <div className="previous-ldv-avg p-3 mt-2">
                  <div className="mt-1 row">
                    <h4 className="col-5 ml-2">3 Year Average LDV Sales:</h4>
                    <div className="col-5">
                      <span>{avgSales}</span>
                    </div>
                  </div>
                  <div className="mt-1 row">
                    <h4 className="col-5 ml-2">Vehicle Supplier Class: </h4>
                    <div className="col-5">
                      <span> {vehicleSupplierClass(avgSales)[0]} </span>
                      <span> {vehicleSupplierClass(avgSales)[1]} </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="ldv-zev-models mt-2">
              <label className="text-blue mr-4 font-weight-bold">
                Consumer Sales of Zero-Emission Vehicles
              </label>
              <div className="text-blue mt-2">
                If you have outstanding {modelYear} consumer sales to submit you can{' '}
                <label
                  className="text-primary"
                  onClick={() => {
                    history.push('/credit-requests/new');
                  }}
                >
                  {' '}
                  <u>enter an application for credits for consumer sales</u>
                </label>{' '}
                as part of this model year report.
              </div>
              <div className="sales-table mt-2">
                <ConsumerSalesLDVModalTable vehicles={vehicles} />
              </div>
              <div className="total-ldv-sales text-blue mt-2">
                Pending Sales are VIN applied for in credit applications
                awaiting government review. Sales Issued are those VIN already
                verified by government as being eligible to earn credits.
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-12 my-3">
          <ComplianceReportSignOff
            assertions={assertions}
            checkboxes={checkboxes}
            handleCheckboxClick={handleCheckboxClick}
            disabledCheckboxes={disabledCheckboxes}
            user={user}
          />
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12">
          <div className="action-bar mt-0">
            <span className="left-content">
              <Button buttonType="back" locationRoute="/compliance/reports" />
            </span>
            <span className="right-content">
              <Button
                buttonType="save"
                optionalClassname="button primary"
                action={(event) => {
                  handleSave(event);
                }}
              />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
ConsumerSalesDetailsPage.defaultProps = {
  assertions: [],
  avgSales: 0,
  checkboxes: [],
  salesInput: null,
};

ConsumerSalesDetailsPage.propTypes = {
  details: PropTypes.shape({
    organization: PropTypes.shape(),
    consumerSales: PropTypes.shape(),
  }).isRequired,
  user: CustomPropTypes.user.isRequired,
  loading: PropTypes.bool.isRequired,
  handleSave: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  vehicles: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  error: PropTypes.bool.isRequired,
  assertions: PropTypes.arrayOf(PropTypes.shape()),
  checkboxes: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  ),
  handleCheckboxClick: PropTypes.func.isRequired,
  disabledCheckboxes: PropTypes.string.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  avgSales: PropTypes.number,
  vehicleSupplierClass: PropTypes.func.isRequired,
  previousYearsExist: PropTypes.bool.isRequired,
  previousYearsList: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  salesInput: PropTypes.number,
  modelYear: PropTypes.number.isRequired,
  firstYear: PropTypes.number.isRequired,
  secondYear: PropTypes.number.isRequired,
  thirdYear: PropTypes.number.isRequired,
  statuses: PropTypes.shape().isRequired,
};
export default ConsumerSalesDetailsPage;
