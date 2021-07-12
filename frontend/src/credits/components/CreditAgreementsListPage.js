import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import PropTypes from 'prop-types';

import Loading from '../../app/components/Loading';
import history from '../../app/History';
import CustomPropTypes from '../../app/utilities/props';
import ROUTES_CREDIT_AGREEMENTS from '../../app/routes/CreditAgreements';
import CreditAgreementsListTable from './CreditAgreementsListTable';
import CreditAgreementsFilter from './CreditAgreementsFilter';

const CreditAgreementsListPage = (props) => {
  const {
    creditAgreements,
    filtered,
    handleClear,
    loading,
    setFiltered,
    user,
  } = props;

  if (loading) {
    return <Loading />;
  }

  return (
    <div id="CreditsAgreement" className="page">
      <div className="row mt-3 mb-2">
        <div className="col-md-8 d-flex align-items-end">
          <h2>Credit Agreements & Adjustments</h2>
        </div>
      </div>
      <div className="row">
        <div className="col-lg-12 text-right content">
          <CreditAgreementsFilter
            items={creditAgreements}
            filtered={filtered}
            handleClear={handleClear}
            setFiltered={setFiltered}
            user={user}
          />
        </div>
      </div>
      <div className="row mt-3">
        <label />
      </div>
      <div className="row">
        <div className="col-md-12">
          <CreditAgreementsListTable
            items={creditAgreements}
            user={user}
            filtered={filtered}
            setFiltered={setFiltered}
          />
        </div>
      </div>
    </div>
  );
};

CreditAgreementsListPage.defaultProps = {
  filtered: undefined,
  setFiltered: undefined,
};

CreditAgreementsListPage.propTypes = {
  creditAgreements: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  filtered: PropTypes.arrayOf(PropTypes.shape()),
  handleClear: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  setFiltered: PropTypes.func,
  user: CustomPropTypes.user.isRequired,
};

export default CreditAgreementsListPage;
