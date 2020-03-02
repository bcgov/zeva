/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import CustomPropTypes from '../app/utilities/props';
import SalesSubmissionConfirmationPage from './components/SalesSubmissionConfirmationPage';
import SalesSubmissionPage from './components/SalesSubmissionPage';
import SalesSubmissionSignaturesPage from './components/SalesSubmissionSignaturesPage';
import SalesSubmissionValidationPage from './components/SalesSubmissionValidationPage';

const SalesSubmissionContainer = (props) => {
  const { mode, user } = props;

  const [workflowState, setWorkflowState] = useState('new');

  const submissionID = '2020-02-28';

  const details = {
    entries: [
      {modelYear: '2020', make: 'Suzuki', model: 'NIRO EV', type: 'BEV', range: 102, class: 'A', credits: 1, VIN: 'ABC12345679812398', VINStatus: 'VALID' },
      {modelYear: '2020', make: 'Suzuki', model: 'NIRO EV', type: 'BEV', range: 102, class: 'A', credits: 1, VIN: 'ABC123456798123912',VINStatus: 'VALID' },
      {modelYear: '2020', make: 'Suzuki', model: 'Deathstar', type: 'BEV', range: 23, class: 'B', credits: 1, VIN: 'ABC12345679812398', VINStatus: 'VALID' },
      {modelYear: '2020', make: 'Suzuki', model: 'Deathstar', type: 'BEV', range: 23, class: 'B', credits: 1, VIN: 'ABC123456442398', VINStatus: 'VALID' },
      {modelYear: '2020', make: 'Suzuki', model: 'Deathstar', type: 'BEV', range: 23, class: 'B', credits: 1, VIN: 'ABC1234567BCE2398', VINStatus: 'VALID' },
      {modelYear: '2020', make: 'Suzuki', model: 'NIRO EV', type: 'BEV', range: 102, class: 'A', credits: 1, VIN: 'ABC12345679895798',VINStatus: 'VALID' },
      {modelYear: '2020', make: 'Suzuki', model: 'NIRO EV', type: 'BEV', range: 102, class: 'A', credits: 1, VIN: 'ABC12345679812398', VINStatus: 'VALID' },

      {modelYear: '2020', make: 'Suzuki', model: 'NIRO EV', type: 'BEV', range: 102, class: 'A', credits: 1, VIN: 'ABC12345679812398', VINStatus: 'NOT_IN_PROVINCIAL_RECORDS' },

      {modelYear: '2020', make: 'Suzuki', model: 'NIRO EV', type: 'BEV', range: 102, class: 'A', credits: 1, VIN: 'ABC12345679812398', VINStatus: 'PREVIOUSLY_MATCHED' },
      {modelYear: '2020', make: 'Suzuki', model: 'NIRO EV', type: 'BEV', range: 102, class: 'A', credits: 1, VIN: 'ABC12345679812398', VINStatus: 'PREVIOUSLY_MATCHED' },

      {modelYear: '2020', make: 'Suzuki', model: 'NIRO EV', type: 'BEV', range: 102, class: 'A', credits: 1, VIN: 'ABC12345679812398', VINStatus: 'MODEL_MISMATCH' },
      {modelYear: '2020', make: 'Suzuki', model: 'NIRO EV', type: 'BEV', range: 102, class: 'A', credits: 1, VIN: 'ABC12345679812398', VINStatus: 'MODELYEAR_MISMATCH' },

    ],
    validationErrors: [
      {row: '32', message: 'Could not be understood because it has an empty VIN'},
      {row: '32', message: 'The VIN does not conform to the expected format (17 character string)'},
      {row: '47', message: 'This model does not exist or is not sold by the authenticated user or in this model year'},
    ]
  };

  const upload = () => {
    setWorkflowState('validating');
  };

  const readyToSign = () => {
    setWorkflowState('readyToSign');
  };

  const backToValidationPage = () => {
    setWorkflowState('validating');
  };

  const sign = () => {
    setWorkflowState('complete');
  };

  const backToStart = () => {
    setWorkflowState('new');
    //@todo clear any details, maybe issue delte request
  };

  switch (workflowState) {

    case 'readyToSign':
      return (<SalesSubmissionSignaturesPage user={user} sign={sign} submissionID={submissionID} backToValidationPage={backToValidationPage} details={details}/>);
    case 'validating':
      return (<SalesSubmissionValidationPage user={user} readyToSign={readyToSign} submissionID={submissionID} details={details} backToStart={backToStart}/>);
    case 'complete':
      return (<SalesSubmissionConfirmationPage user={user} submissionID={submissionID} details={details} />);
    case 'error':
      return (<p>An error occurred in validation. Please restart the submission</p>);
    case 'new':
    default:
      return (<SalesSubmissionPage user={user} upload={upload} />);
  }

};

SalesSubmissionContainer.defaultProps = {
  mode: 'edit',
};

SalesSubmissionContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
  mode: PropTypes.oneOf(['add', 'edit']),
};

export default SalesSubmissionContainer;
