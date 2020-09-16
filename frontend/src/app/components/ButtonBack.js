import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import history from '../History';

const ButtonBack = () => (
  <button
    className="button"
    onClick={() => {
      history.goBack();
    }}
    type="button"
  >
    <FontAwesomeIcon icon="arrow-left" /> Back
  </button>
);

export default ButtonBack;