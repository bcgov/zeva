import React from 'react';
import PropTypes from 'prop-types';
import CustomPropTypes from '../../app/utilities/props';
import Loading from '../../app/components/Loading';
import ComplianceReportAlert from './ComplianceReportAlert';
import Button from '../../app/components/Button';
import { now } from 'moment';
import ComplianceReportSignOff from './ComplianceReportSignOff';
import ConsumerSalesLDVModalTable from '../components/ConsumerSalesLDVModelTable';

const ConsumerSalesDetailsPage = (props) => {
  const {
    user,
    loading,
    handleSave,
    handleChange,
    vehicles,
    confirmed,
    previousSales,
    assertions,
    checkboxes,
    readOnly,
    disabledCheckboxes,
    error,
    handleCheckboxClick,
  } = props;

  const details = {
    consumerSales: {
      history: [
        {
          status: 'DRAFT',
          createTimestamp: now(),
          createUser: user,
        },
      ],
      status: 'DRAFT',
    },
    organization: user.organization,
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div id="compliance-consumer-sales-details" className="page">
      <div className="row mt-3">
        <div className="col-sm-12">
          <h2>2020 Model Year Report</h2>
        </div>
      </div>
      {confirmed && (
        <div className="row">
          <div className="col-12">
            <ComplianceReportAlert
              report={details.consumerSales}
              type="Consumer Sales"
            />
          </div>
        </div>
      )}
      <div className="row mt-1">
        <div className="col-12">
          <div className="p-3 consumer-sales">
            <h3>Consumer Sales</h3>

            <div className="enter-ldv-sales mt-2">
              <div className="text-blue">
                Enter the 2020 model year light duty vehicle sales and lease
                total (ICE & ZEV) in British Columbia for{' '}
                {details.organization.name}.
              </div>
              <div className="ldv-sales mt-2 p-3">
                <form onSubmit={(event) => handleSave(event)}>
                  <label className="text-blue mr-4 font-weight-bold">
                    2020 Model Year LDV Sales\Leases
                  </label>
                  <input
                    className="textbox-sales"
                    type="text"
                    onChange={handleChange}
                    readOnly={readOnly}
                  ></input>
                  {error && (
                    <span className="text-danger ml-2">
                      2020 Model Year LDV Sales\Leases can't be blank
                    </span>
                  )}
                </form>
              </div>
            </div>
            <div className="confirm-previous-sales mt-2">
              <div className="text-blue">
                Confirm the previous 3 model year light duty vehicle sales and
                lease total (ICE & ZEV) in British Columbia for{' '}
                {details.organization.name}.
              </div>
              <div className="previous-ldv-sales mt-2 p-3">
                {previousSales.map((yearSale) => (
                  <div className="model-year-ldv" key={yearSale.id}>
                    <label className="text-blue mr-4 font-weight-bold">
                      {yearSale.modelYear} Model Year LDV Sales\Leases:
                    </label>
                    <label className="sales-numbers">{yearSale.ldvSales}</label>
                  </div>
                ))}
              </div>
              <div className="ldv-zev-models mt-2">
                <label className="text-blue mr-4 font-weight-bold">
                  Consumer Sales of Zero-Emission Vehicles
                </label>
                <div className="sales-table mt-2">
                  <ConsumerSalesLDVModalTable vehicles={vehicles} />
                </div>
                <div className="total-ldv-sales text-blue mt-2">
                  Pending Sales are VIN applied for in credit applications
                  awaiting government review. Sales Issued are those VIN already
                  verified by government as being eligible to earn credits
                </div>
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
            readOnly={readOnly}
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
                  {
                    handleSave(event);
                  }
                }}
              />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
ConsumerSalesDetailsPage.propTypes = {
  user: CustomPropTypes.user.isRequired,
  loading: PropTypes.bool.isRequired,
  handleSave: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  vehicles: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  confirmed: PropTypes.bool.isRequired,
  previousSales: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  error: PropTypes.bool.isRequired,
  assertions: PropTypes.arrayOf(PropTypes.shape()),
  checkboxes: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string])),
  handleCheckboxClick: PropTypes.func.isRequired,
  disabledCheckboxes: PropTypes.string.isRequired,
  readOnly: PropTypes.bool.isRequired
};
export default ConsumerSalesDetailsPage;
