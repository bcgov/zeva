import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import history from '../History';

const ButtonBack = (props) => {
  const { locationRoute } = props;
  const getRoute = () => {
    if (locationRoute) {
      return history.push(locationRoute);
    }
    return history.goBack();
  };
  return (
    <button
      className="button"
      onClick={() => {
        getRoute();
      }}
      type="button"
    >
      <FontAwesomeIcon icon="arrow-left" /> Back
    </button>
  );
};

ButtonBack.defaultProps = {
  locationRoute: '',
};
ButtonBack.propTypes = {
  locationRoute: PropTypes.string,
};
export default ButtonBack;
