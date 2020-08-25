import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import history from '../../app/History';

const ActivityBanner = (props) => {
  const {
    colour,
    icon,
    boldText,
    regularText,
    linkTo,
    className,
  } = props;

  return (
    <button type="button" name="activity-button" data-testid="activity-button" className={`alert alert-light activity-banner ${className}`} key={regularText} onClick={()=>{history.push(linkTo)}}>
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
    </button>
  );
};

export default ActivityBanner;

ActivityBanner.defaultProps = {
  className: '',
  linkTo: '',
};

ActivityBanner.propTypes = {
  colour: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  boldText: PropTypes.string.isRequired,
  regularText: PropTypes.string.isRequired,
  linkTo: PropTypes.string,
  className: PropTypes.string,
};
