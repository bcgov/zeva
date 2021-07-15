import React from 'react';
import PropTypes from 'prop-types';
import CreditAgreementsAlert from './CreditAgreementsAlert';
import CreditAgreementsDetailsTable from './CreditAgreementsDetailsTable';

const CreditAgreementsDetailsPage = (props) => {
  const { user, items } = props;

  return (
    <div id="credit-agreements-detail-page" className="page">
      <div className="row mt-3 mb-2">
        <div className="col-sm-12">
          <h2>Initiative Agreement</h2>
        </div>
        <div className="credit-agreements-alert col-sm-12 mt-2">
          <CreditAgreementsAlert
            isGovernment={user.isGovernment}
            date="Oct.31, 2020"
            status="ISSUED"
          />
        </div>
      </div>
      <div className="credit-agreements-details grey-border-area">
        <div className="row">
          <span className="col-3">
            <h4 className="d-inline">Agreement ID: </h4>
          </span>
          <span className="col-5">20200630-IA-KIA</span>
        </div>
        <div className="row mt-2">
          <span className="col-3">
            <h4 className="d-inline">Transaction Date: </h4>
          </span>
          <span className="col-5">2020-06-30</span>
        </div>
        <div className="row mt-2">
          <span className="col-3">
            <h4 className="d-inline">Agreement Attachment: </h4>
          </span>
          <span className="col-5">20200630-IA-KIA.pdf</span>
        </div>
        <div className="row mt-2">
          <span className="col-3">
            <h4 className="d-inline">Message from the Director: </h4>
          </span>
          <span className="col-5">some applicable comment</span>
        </div>
        <div className="row mt-2">
          <span className="col-3"></span>
          <span className="col-5">
            <CreditAgreementsDetailsTable items={items} />
          </span>
        </div>
      </div>
    </div>
  );
};

CreditAgreementsDetailsPage.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

export default CreditAgreementsDetailsPage;
