import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import History from '../../app/History';

const ActivityBanner = (props) => {
  const {
    colour,
    icon,
    boldText,
    regularText,
    linkTo,
    filter,
  } = props;

  return ([
    <div className="alert alert-light activity-banner" key={regularText}>
      <div>
        <FontAwesomeIcon icon={icon} size="3x" className={colour} />
      </div>
      <div className="activity-text">
        <h3>{boldText}</h3>
        <p>&nbsp;&mdash; {regularText}</p>
      </div>
      <div id="fa-arrow">
        <FontAwesomeIcon icon="chevron-right" size="2x" className={colour} />
      </div>
    </div>,
  ]);
};

export default ActivityBanner;
