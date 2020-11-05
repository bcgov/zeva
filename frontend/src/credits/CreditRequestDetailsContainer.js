/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router';
import moment from 'moment-timezone';
import CreditTransactionTabs from '../app/components/CreditTransactionTabs';
import Loading from '../app/components/Loading';
import history from '../app/History';
import ROUTES_CREDIT_REQUESTS from '../app/routes/CreditRequests';
import CustomPropTypes from '../app/utilities/props';
import CreditRequestDetailsPage from './components/CreditRequestDetailsPage';
import ROUTES_ICBCVERIFICATION from '../app/routes/ICBCVerification';

const CreditRequestDetailsContainer = (props) => {
  const {
    location, match, user, validatedOnly,
  } = props;
  const { state: locationState } = location;
  const { id } = match.params;

  const [submission, setSubmission] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previousDateCurrentTo, setPreviousDateCurrentTo] = useState('no ICBC data uploaded yet.');
  const [nonValidated, setNonValidated] = useState([]);
  const refreshDetails = () => {
    axios.all([
      axios.get(ROUTES_ICBCVERIFICATION.DATE),
      axios.get(ROUTES_CREDIT_REQUESTS.DETAILS.replace(':id', id)),
    ]).then(axios.spread((dateResponse, submissionResponse) => {
      if (dateResponse.data.uploadDate) {
        setPreviousDateCurrentTo(moment(dateResponse.data.uploadDate).format('MMM D, YYYY'));
      }
      setSubmission(submissionResponse.data);
      setNonValidated(submissionResponse.data.content
        .filter((row) => row.recordOfSale));
      setLoading(false);
    }));
  };

  useEffect(() => {
    refreshDetails();
  }, [id]);

  const handleSubmit = (validationStatus, comment = '') => {
    const submissionContent = { validationStatus };
    if (comment.length > 0) {
      submissionContent.salesSubmissionComment = { comment };
    }
    axios.patch(ROUTES_CREDIT_REQUESTS.DETAILS.replace(':id', id), submissionContent).then(() => {
      if (validationStatus === 'SUBMITTED') {
        history.push(ROUTES_CREDIT_REQUESTS.CONFIRM.replace(':id', id));
      } else {
        history.push(ROUTES_CREDIT_REQUESTS.LIST);
      }
    });
  };

  if (loading) {
    return (<Loading />);
  }

  return ([
    <CreditTransactionTabs active="credit-requests" key="tabs" user={user} />,
    <CreditRequestDetailsPage
      handleSubmit={handleSubmit}
      key="page"
      locationState={locationState}
      nonValidated={nonValidated}
      previousDateCurrentTo={previousDateCurrentTo}
      submission={submission}
      user={user}
      validatedOnly={validatedOnly}
    />,
  ]);
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
