import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import ROUTES_CREDIT_REQUESTS from '../../app/routes/CreditRequests';

const AnalystRecommendationHeader = (props) => {
  const { submission, user } = props;
  const { id, validationStatus } = submission;

  return (
    <div className="p-2">
      {['RECOMMEND_APPROVAL', 'RECOMMEND_REJECTION', 'REJECTED', 'VALIDATED'].indexOf(validationStatus) >= 0
      && user.hasPermission('SIGN_SALES')
      && (
        <>
          <h4>Analyst Recommendation</h4>
          <ul className="mt-2 mb-0 pl-4">
            <li className="font-italic text-blue">
              <Link to={ROUTES_CREDIT_REQUESTS.VALIDATED_DETAILS.replace(/:id/g, id)}>
                View the credit application detail as processed by the analyst.
              </Link>
            </li>
          </ul>
        </>
      )}
    </div>
  );
};
AnalystRecommendationHeader.propTypes = {
  submission: PropTypes.shape().isRequired,
  user: PropTypes.shape().isRequired,
};
export default AnalystRecommendationHeader;
