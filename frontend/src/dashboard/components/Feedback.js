import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const Feedback = () => (
  <div id="feedback" className="dashboard-card">
    <div className="content icon">
      <FontAwesomeIcon icon={['fas', 'envelope']} />
    </div>
    <div className="content">
      <h2>We want to hear from you</h2>
    </div>
    <div className="content">
      <p>We are always striving to improve the ZEV Reporting System.</p>
      <p>
        {'Please send your suggestions and feedback to '}
        <a
          href="mailto:ZEVRegulation@gov.bc.ca?subject=ZEVA Comments"
          rel="noopener noreferrer"
          target="_blank"
        >
          {' '}
          ZEVRegulation@gov.bc.ca
        </a>
      </p>
    </div>
  </div>
)

export default Feedback
