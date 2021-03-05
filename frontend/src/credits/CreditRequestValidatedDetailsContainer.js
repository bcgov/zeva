/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';

import Loading from '../app/components/Loading';
import ROUTES_CREDIT_REQUESTS from '../app/routes/CreditRequests';
import CustomPropTypes from '../app/utilities/props';
import CreditRequestValidatedDetailsPage from './components/CreditRequestValidatedDetailsPage';

const qs = require('qs');

const CreditRequestValidatedDetailsContainer = (props) => {
  const { location, match, user } = props;
  const { id } = match.params;

  const [content, setContent] = useState([]);
  const [submission, setSubmission] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invalidatedList, setInvalidatedList] = useState([]);

  const query = qs.parse(location.search, { ignoreQueryPrefix: true });

  const refreshDetails = () => {
    axios.all([
      axios.get(ROUTES_CREDIT_REQUESTS.DETAILS.replace(':id', id)),
      axios.get(ROUTES_CREDIT_REQUESTS.UNSELECTED.replace(':id', id), { params: query }),
    ]).then(axios.spread((submissionResponse, unselectedResponse) => {
      const { data: submissionData } = submissionResponse;
      setSubmission(submissionData);

      const { data: unselected } = unselectedResponse;
      setInvalidatedList(unselected);

      setLoading(false);
    })).finally(() => {
      if (submission.validationStatus !== 'VALIDATED') {
        throw new Error(
          'Credit Request hasn\'t been validated yet.',
        );
      }
    });
  };

  useEffect(() => {
    refreshDetails();
  }, [id]);

  if (loading) {
    return (<Loading />);
  }

  return (
    <CreditRequestValidatedDetailsPage
      content={content}
      invalidatedList={invalidatedList}
      routeParams={match.params}
      setContent={setContent}
      submission={submission}
      user={user}
    />
  );
};

CreditRequestValidatedDetailsContainer.propTypes = {
  location: PropTypes.shape().isRequired,
  user: CustomPropTypes.user.isRequired,
  match: CustomPropTypes.routeMatch.isRequired,
};

export default withRouter(CreditRequestValidatedDetailsContainer);
