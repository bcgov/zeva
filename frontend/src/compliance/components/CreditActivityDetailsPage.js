/* eslint-disable react/no-array-index-key */
import moment from 'moment-timezone';
import React from 'react';
import PropTypes from 'prop-types';
import { now } from 'moment';

import Button from '../../app/components/Button';
import Loading from '../../app/components/Loading';
import CreditBalanceTable from '../../credits/components/CreditBalanceTable';
import CreditTransactionListTable from '../../credits/components/CreditTransactionListTable';
import CustomPropTypes from '../../app/utilities/props';
import ComplianceReportAlert from './ComplianceReportAlert';
import ComplianceReportSignOff from './ComplianceReportSignOff';

const CreditActivityDetailsPage = (props) => {
  const {
    balances,
    loading,
    transactions,
    user,
    assertions,
    checkboxes,
    handleCheckboxClick,
  } = props;

  const details = {
    creditActivity: {
      history: [{
        status: 'DRAFT',
        createTimestamp: now(),
        createUser: user,
      }],
      status: 'DRAFT',
    },
    organization: user.organization,
  };

  const creditActivityDate = details.creditActivity.history[0].createTimestamp;

  const items = transactions.filter((transaction) => (
    moment(transaction.transactionTimestamp).isBefore(moment(creditActivityDate).format())
  ));

  if (loading) {
    return <Loading />;
  }

  return (
    <div id="compliance-supplier-information-details" className="page">
      <div className="row mt-3">
        <div className="col-sm-12">
          <h2>2020 Model Year Compliance Report</h2>
        </div>
      </div>
      <div className="row">
        <div className="col-12">
          <ComplianceReportAlert report={details.creditActivity} type="Credit Activity" />
        </div>
      </div>
      <div className="row mt-1">
        <div className="col-12">
          <h3>Credit Activity</h3>
        </div>
      </div>
      <div className="row mt-2">
        <div className="col-5">
          <div className="credit-activity">
            <h4>Starting Balance October 1, 2019</h4>
            <div className="mt-2">
              <CreditBalanceTable items={balances} />
            </div>
          </div>
        </div>
        <div className="offset-2 col-5">
          <div className="credit-activity">
            <h4>Closing Credit Balance September 30, 2020</h4>
            <div className="mt-2">
              <CreditBalanceTable items={balances} />
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-5">
        <div className="col-12">
          <h3>2020 Credit Transactions</h3>
          <div className="mb-2">If there are credit transactions missing from the list below, please use the Credit Transactions forms.</div>
          <CreditTransactionListTable items={items} user={user} />
        </div>
      </div>

      <div className="row">
        <div className="col-12 my-3">
          <ComplianceReportSignOff
            assertions={assertions}
            checkboxes={checkboxes}
            handleCheckboxClick={handleCheckboxClick}
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
              <Button buttonType="save" optionalClassname="button primary" action={() => {}} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

CreditActivityDetailsPage.defaultProps = {
};

CreditActivityDetailsPage.propTypes = {
  balances: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  loading: PropTypes.bool.isRequired,
  transactions: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  user: CustomPropTypes.user.isRequired,
  assertions: PropTypes.arrayOf(PropTypes.shape()),
  checkboxes: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string])),
  handleCheckboxClick: PropTypes.func.isRequired,
};
export default CreditActivityDetailsPage;
