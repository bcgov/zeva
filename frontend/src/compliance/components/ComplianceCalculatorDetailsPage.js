import React from 'react';
import CustomPropTypes from '../../app/utilities/props';

const ComplianceCalculatorDetailsPage = (props) => {
  const { user } = props;
  return (
    <div id="compliance-ldvsales-details" className="page">
      <div className="row mt-3 mb-2">
        <div className="col-sm-12">
          <h2>Compliance Calculator</h2>
        </div>
      </div>
    </div>
  );
};

ComplianceCalculatorDetailsPage.propTypes = {
  user: CustomPropTypes.user.isRequired,
};

export default ComplianceCalculatorDetailsPage;
