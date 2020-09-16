/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router';

import Loading from '../app/components/Loading';
import history from '../app/History';
import ROUTES_CREDITS from '../app/routes/Credits';
import ROUTES_SALES_SUBMISSIONS from '../app/routes/SalesSubmissions';
import CustomPropTypes from '../app/utilities/props';
import CreditRequestDetailsPage from './components/CreditRequestDetailsPage';
import ROUTES_ICBCVERIFICATION from '../app/routes/ICBCVerification';

const CreditRequestDetailsContainer = (props) => {
  const { match, user, validatedOnly } = props;
  const { id } = match.params;

  const [submission, setSubmission] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previousDateCurrentTo, setPreviousDateCurrentTo] = useState('');
  const [nonValidated, setNonValidated] = useState([]);
  const refreshDetails = () => {
    axios.all([
      axios.get(ROUTES_ICBCVERIFICATION.DATE),
      axios.get(ROUTES_SALES_SUBMISSIONS.DETAILS.replace(':id', id)),
      axios.get(ROUTES_SALES_SUBMISSIONS.RAW.replace(':id', id)),
    ]).then(axios.spread((dateResponse, submissionResponse, rawResponse) => {
      setPreviousDateCurrentTo(dateResponse.data.uploadDate);
      setSubmission(submissionResponse.data);
      setNonValidated(rawResponse.data.records
        .filter((each) => each.checked === false));
      setLoading(false);
    }));
  };

  useEffect(() => {
    refreshDetails();
  }, [id]);

  const handleSubmit = (validationStatus, comment) => {
    const submissionContent = { validationStatus };
    if (comment.length > 0) {
      submissionContent.salesSubmissionComment = { comment };
    }
    axios.patch(ROUTES_SALES_SUBMISSIONS.DETAILS.replace(':id', id), submissionContent).then(() => {
      history.push(ROUTES_CREDITS.CREDIT_REQUESTS);
    });
  };

  if (loading) {
    return (<Loading />);
  }

  return (
    <CreditRequestDetailsPage
      handleSubmit={handleSubmit}
      submission={submission}
      user={user}
      validatedOnly={validatedOnly}
      previousDateCurrentTo={previousDateCurrentTo}
      nonValidated={nonValidated}
    />
  );
};

CreditRequestDetailsContainer.defaultProps = {
  validatedOnly: false,
};

CreditRequestDetailsContainer.propTypes = {
  match: CustomPropTypes.routeMatch.isRequired,
  user: CustomPropTypes.user.isRequired,
  validatedOnly: PropTypes.bool,
};

export default withRouter(CreditRequestDetailsContainer);
