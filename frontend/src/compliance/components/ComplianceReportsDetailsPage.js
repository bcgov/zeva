import React from 'react';
import PropTypes from 'prop-types';
import CustomPropTypes from '../../app/utilities/props';

const ComplianceReportsDetailsPage = (props) => {
  const { user } = props;
  return (
    <div id="compliance-ldvsales-details" className="page">
      <div className="row mt-3 mb-2">
        <div className="col-sm-12">
          <h2>Model Year Compliance Reports</h2>
        </div>
      </div>
    </div>
  );
};
ComplianceReportsDetailsPage.propTypes = {
  user: CustomPropTypes.user.isRequired,
};
export default ComplianceReportsDetailsPage;
