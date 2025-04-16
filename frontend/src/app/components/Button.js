import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import ReactTooltip from "react-tooltip";
import history from "../History";

const Button = (props) => {
  const {
    buttonType,
    locationRoute,
    locationState,
    action,
    optionalText,
    optionalIcon,
    disabled,
    optionalClassname,
    buttonTooltip,
    testid,
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
  let classname = "button";
  let onclick = () => {};
  let tooltip;
  if (buttonTooltip && !disabled) {
    tooltip = "";
  } else if (disabled) {
    tooltip = buttonTooltip;
  }
  switch (buttonType) {
    case "approve":
      text = optionalText;
      classname += " primary";
      onclick = action;
      break;
    case "back":
      onclick = () => {
        getRoute();
      };
      text = "Back";
      icon = "arrow-left";
      break;
    case "delete":
      icon = "trash";
      text = "Delete";
      classname += " text-danger";
      onclick = action;
      break;
    case "edit":
      icon = "edit";
      text = "Edit";
      onclick = action;
      break;
    case "download":
      text = "Download";
      icon = "download";
      onclick = action;
      break;
    case "reject":
      text = optionalText;
      classname += " text-danger";
      onclick = action;
      break;
    case "rescind":
      text = "Rescind Notice";
      classname += " text-danger";
      onclick = action;
      break;
    case "save":
      text = "Save";
      icon = "save";
      if (action) {
        onclick = action;
      }
      break;
    case "submit":
      text = "Submit";
      icon = "paper-plane";
      classname += " primary";
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
    <>
      {tooltip && (
        <ReactTooltip
          className="button-tooltip"
          multiline={true}
          id="btn-tip"
        />
      )}
      <span data-tip={tooltip} data-for="btn-tip">
        <button
          data-testid={testid}
          className={classname}
          disabled={disabled}
          onClick={(e) => {
            onclick(e);
          }}
          type="button"
        >
          {icon && <FontAwesomeIcon icon={icon} />}
          {text}
        </button>
      </span>
    </>
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
  buttonTooltip: "",
  testid: "",
};
Button.propTypes = {
  buttonType: PropTypes.string.isRequired,
  locationRoute: PropTypes.string,
  locationState: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.shape()),
    PropTypes.shape(),
  ]),
  optionalText: PropTypes.string,
  optionalIcon: PropTypes.string,
  optionalClassname: PropTypes.string,
  action: PropTypes.func,
  disabled: PropTypes.bool,
  buttonTooltip: PropTypes.string,
  testid: PropTypes.string,
};
export default Button;
