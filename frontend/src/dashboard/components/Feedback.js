import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Feedback = () => (
  <div className="feedback">
    <div><FontAwesomeIcon icon={['fas', 'envelope']} /></div>
    <h2>We want to hear from you</h2>
    <p>We are always striving to improve ZEV.</p>
    <p>
      Please send your suggestions and feedback to
      <a href="mailto: zev@gov.bc.ca" rel="noopener noreferrer" target="_blank">zev@gov.bc.ca</a>
    </p>
  </div>
);

export default Feedback;
