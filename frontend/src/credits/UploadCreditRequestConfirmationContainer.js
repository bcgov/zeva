/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import React from 'react';
import { withRouter } from 'react-router';

import CustomPropTypes from '../app/utilities/props';
import UploadRequestConfirmationPage from './components/UploadRequestConfirmationPage';

const UploadCreditRequestConfirmationContainer = (props) => {
  const { user } = props;
  const { match } = props;
  const { id } = match.params;

  return (
    <UploadRequestConfirmationPage
      submissionId={id}
      user={user}
    />
  );
};

UploadCreditRequestConfirmationContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
  match: CustomPropTypes.routeMatch.isRequired,
};

export default withRouter(UploadCreditRequestConfirmationContainer);
