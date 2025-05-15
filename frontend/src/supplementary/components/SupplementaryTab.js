import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

const SupplementaryTab = (props) => {
  const {
    selected,
    title,
    url,
    disabled,
    status = "",
    assessed = false,
  } = props;

  return (
    <>
      <li
        className={`nav-item ${selected ? "active" : ""} ${status} ${assessed ? "ASSESSED" : ""}`}
        role="presentation"
      >
        {selected ? (
          <span>{title}</span>
        ) : (
          <>
            <span className={`${disabled ? "disabled" : ""}`}>
              <Link
                to={url}
                style={disabled ? { pointerEvents: "none" } : null}
              >
                {title}
              </Link>
            </span>
          </>
        )}
      </li>
    </>
  );
};

SupplementaryTab.defaultProps = {};

SupplementaryTab.propTypes = {
  selected: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  status: PropTypes.string,
  assessed: PropTypes.bool,
  disabled: PropTypes.bool,
  tooltip: PropTypes.string,
};

export default SupplementaryTab;
