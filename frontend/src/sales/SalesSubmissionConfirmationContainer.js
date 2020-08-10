/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import React from 'react';
import { withRouter } from 'react-router';

import CustomPropTypes from '../app/utilities/props';
import SalesSubmissionConfirmationPage from './components/SalesSubmissionConfirmationPage';

const SalesSubmissionConfirmationContainer = (props) => {
  const { user } = props;
  const { match } = props;
  const { id } = match.params;

  return (
    <SalesSubmissionConfirmationPage
      submissionId={id}
      user={user}
    />
  );
};

SalesSubmissionConfirmationContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
  match: CustomPropTypes.routeMatch.isRequired,
};

export default withRouter(SalesSubmissionConfirmationContainer);
