import React from "react";
import ReactTooltip from "react-tooltip";
import PropTypes from "prop-types";

const Tooltip = ({ tooltipId, tooltipText, children, placement = "top" }) => (
  <span data-for={tooltipId} data-tip={tooltipText} className="tooltip-wrapper">
    <ReactTooltip
      id={tooltipId}
      className="tooltip"
      place={placement}
      effect="solid"
    />
    {children}
  </span>
);
Tooltip.propTypes = {
  tooltipId: PropTypes.string.isRequired,
  tooltipText: PropTypes.string.isRequired,
  children: PropTypes.node,
  placement: PropTypes.string,
};

export default Tooltip;
