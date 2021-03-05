import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import ROUTES_CREDIT_REQUESTS from '../../app/routes/CreditRequests';

const AnalystRecommendationHeader = (props) => {
  const { id } = props;
  return (
    <div className="p-2">
      <h4>Analyst Recommendation</h4>
      <ul className="mt-2 mb-0 pl-4">
        <li className="font-italic text-blue">
          <Link to={ROUTES_CREDIT_REQUESTS.VALIDATED_DETAILS.replace(/:id/g, id)}>
            View sales not eligible for credits or overridden by the analyst from system default
          </Link>
        </li>
      </ul>
    </div>
  );
};
AnalystRecommendationHeader.propTypes = {
  id: PropTypes.number.isRequired,
};
export default AnalystRecommendationHeader;
