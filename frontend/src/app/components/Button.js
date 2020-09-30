import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import history from '../History';

const Button = (props) => {
  const {
    buttonType, locationRoute, locationState, action, optionalText, optionalIcon,
    disabled, optionalClassname,
  } = props;
  const getRoute = () => {
    if (locationRoute && locationState) {
      return history.push(locationRoute, locationState);
    }

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
      text = 'Delete';
      classname += ' text-danger';
      onclick = action;
      break;
    case 'download':
      text = 'Download';
      icon = 'download';
      onclick = action;
      break;
    case 'save':
      text = 'Save';
      icon = 'save';
      if (action) {
        onclick = action;
      }
      break;
    case 'submit':
      text = 'Submit';
      icon = 'paper-plane';
      classname += ' primary';
      onclick = action;
      break;
    default:
      text = optionalText;
      onclick = action;
      break;
  }
  if (optionalText) {
    text = optionalText;
  }
  if (optionalIcon) {
    icon = optionalIcon;
  }
  if (optionalClassname) {
    classname = optionalClassname;
  }

  return (
    <button
      className={classname}
      disabled={disabled}
      onClick={(e) => {
        onclick(e);
      }}
      type="button"
    >
      {icon && <FontAwesomeIcon icon={icon} /> }{text}
    </button>
  );
};

Button.defaultProps = {
  optionalText: null,
  optionalIcon: null,
  locationRoute: null,
  locationState: undefined,
  action: null,
  optionalClassname: null,
  disabled: false,
};
Button.propTypes = {
  buttonType: PropTypes.string.isRequired,
  locationRoute: PropTypes.string,
  locationState: PropTypes.arrayOf(PropTypes.shape()),
  optionalText: PropTypes.string,
  optionalIcon: PropTypes.string,
  optionalClassname: PropTypes.string,
  action: PropTypes.func,
  disabled: PropTypes.bool,
};
export default Button;
