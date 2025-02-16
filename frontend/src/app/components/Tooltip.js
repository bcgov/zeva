import React from "react";
import ReactTooltip from "react-tooltip";
import PropTypes from "prop-types";

/***
 * Tooltip component
 * @param {string} tooltipId - unique id for the tooltip
 * @param {string} tooltipText - text to display in the tooltip
 * @param {node} children - children to render if required
 * @param {string} placement - placement of the tooltip (top, bottom, left, right)
 * @param {boolean} infoCircle - whether to display an info circle
 */
const Tooltip = ({
  tooltipId,
  tooltipText,
  children,
  placement = "top",
  infoCircle = false,
}) => (
  <span data-for={tooltipId} data-tip={tooltipText} className="tooltip-wrapper">
    <ReactTooltip
      id={tooltipId}
      className="tooltip"
      place={placement}
      effect="solid"
    />
    {/* react-fontawesome does not have the desired icon */}
    {infoCircle && (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        style={{ marginBottom: "4px", marginRight: "2px" }}
      >
        <g transform="scale(0.8) translate(-1.6, -1.6)">
          <path
            fill="#2F5496"
            d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"
          />
          <path fill="#2F5496" d="M11 11h2v6h-2zm0-4h2v2h-2z" />
        </g>
      </svg>
    )}
    {children}
  </span>
);

Tooltip.propTypes = {
  tooltipId: PropTypes.string.isRequired,
  tooltipText: PropTypes.string.isRequired,
  children: PropTypes.node,
  infoCircle: PropTypes.bool,
  placement: PropTypes.string,
};

export default Tooltip;
