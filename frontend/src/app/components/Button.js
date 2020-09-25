import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import history from '../History';

const Button = (props) => {
  const { buttonType, locationRoute, action } = props;
  const getRoute = () => {
    if (locationRoute) {
      return history.push(locationRoute);
    }
    return history.goBack();
  };
  let text;
  let icon;
  let classname = 'button';
  let onclick = () => {};
  switch (buttonType) {
    case 'back':
      onclick = () => { getRoute(); };
      text = 'Back';
      icon = 'arrow-left';
      break;
    case 'delete':
      icon = 'trash';
      onclick = () => { action(); };
      text = 'Delete';
      classname += ' text-danger';
      break;
    default:
      break;
  }

  return (
    <button
      className={classname}
      onClick={() => {
        onclick();
      }}
      type="button"
    >
      <FontAwesomeIcon icon={icon} />{text}
    </button>
  );
};

export default Button;
