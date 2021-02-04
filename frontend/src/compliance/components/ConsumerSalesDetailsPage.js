import React from 'react';
import PropTypes from 'prop-types';
import CustomPropTypes from '../../app/utilities/props';
import Loading from '../../app/components/Loading';
import ComplianceReportAlert from './ComplianceReportAlert';
import Button from '../../app/components/Button';
import { now } from 'moment';
import ConsumerSalesLDVModalTable from '../components/ConsumerSalesLDVModelTable';

const ConsumerSalesDetailsPage = (props) => {
  const { user, loading, handleSave, handleChange } = props;

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

  let data = [
    {
      sales: '452',
      modelYear: '2019',
      make: details.organization.name,
      model: 'NIRO EV',
      type: 'BEV',
      range: '385',
      zevClass: 'A',
    },
    {
      sales: '643',
      modelYear: '2020',
      make: details.organization.name,
      model: 'SOUL EV',
      type: 'BEV',
      range: '179',
      zevClass: 'A',
    },
    {
      sales: '256',
      modelYear: '2020',
      make: details.organization.name,
      model: 'NIRO PLUG-IN',
      type: 'PHEV',
      range: '42',
      zevClass: 'B',
    },
    {
      sales: '123',
      modelYear: '2021',
      make: details.organization.name,
      model: 'OPTIMA PLUG-IN',
      type: 'PHEV',
      range: '47',
      zevClass: 'B',
    },
  ];

  if (loading) {
    return <Loading />;
  }

  return (
    <div id="compliance-consumer-sales-details" className="page">
      <div className="row mt-3">
        <div className="col-sm-12">
          <h2>2020 Model Year Compliance Report</h2>
        </div>
      </div>
      <div className="row">
        <div className="col-12">
          <ComplianceReportAlert
            report={details.consumerSales}
            type="Consumer Sales"
          />
        </div>
      </div>
      <div className="row mt-1">
        <div className="col-12">
          <div className="p-3 consumer-sales">
            <h3>Consumer Sales</h3>

            <div className="enter-ldv-sales mt-2">
              <div className="text-blue">
                Enter the total light duty vehicle sales for{' '}
                {details.organization.name} in British Columbia for the 2020
                model year (ICE & ZEV)
              </div>
              <div className="ldv-sales mt-2 p-3">
                <label className="text-blue mr-4 font-weight-bold">
                  2020 Model Year LDV Sales
                </label>
                <form onSubmit={(event) => handleSave(event)}>
                  <input
                    className="textbox-sales"
                    type="text"
                    onChange={handleChange}
                  ></input>
                </form>
              </div>
            </div>
            <div className="confirm-previous-sales mt-2">
              <div className="text-blue">
                Confirm the previous 3 model year total light duty vehicle sales
                for {details.organization.name} in British Columbia (ICE & ZEV).
                Changes to these totals will require supplemental report(s) for
                previous model year compliance reports.
              </div>
              <div className="previous-ldv-sales mt-2 p-3">
                <div className="first-model-year-ldv">
                  <label className="text-blue mr-4 font-weight-bold">
                    2019 Model Year LDV Sales:
                  </label>
                  <label className="sales-numbers">9,456</label>
                </div>
                <div className="second-model-year-ldv">
                  <label className="text-blue mr-4 font-weight-bold">
                    2018 Model Year LDV Sales:
                  </label>
                  <label className="sales-numbers">8,123</label>
                </div>
                <div className="third-model-year-ldv">
                  <label className="text-blue mr-4 font-weight-bold">
                    2017 Model Year LDV Sales:
                  </label>
                  <label className="sales-numbers">7,789</label>
                </div>
              </div>
              <div className="ldv-zev-models mt-2">
                <div className="text-blue">
                  If there are ZEV models missing below that contribute to your
                  2020 model year compliance report use the New ZEV Model form
                  to add them, they will require government validation.
                </div>
                <div className="sales-table mt-2">
                  <ConsumerSalesLDVModalTable data={data} />
                </div>
                <div className="total-ldv-sales font-weight-bold mt-2">
                  1,474 - total LDV ZEV models sold during the 2020 compliance
                  period ending September 30,2021.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-12 my-3">
          <div className="px-3">
            <input id="confirm-sales" name="confirm" type="checkbox" />{' '}
            <label htmlFor="confirm">
              I confirm the consumer sales figures are correct.
            </label>
          </div>
          <div className="px-3">
            <input id="confirm-model-info" name="confirm" type="checkbox" />{' '}
            <label htmlFor="confirm">
              I confirm the model year, type and range of each ZEV model sold or
              leased are correct.
            </label>
          </div>
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
};
export default ConsumerSalesDetailsPage;
