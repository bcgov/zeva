import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import PropTypes from 'prop-types';

const AccordionPanel = (props) => {
  const { children, title, startExpanded } = props;
  const [expanded, setExpanded] = useState(startExpanded);

  return (
    <div className={`accordion-panel ${expanded ? 'expanded' : 'collapsed'}`}>
      <div className={'accordion-title'} onClick={() => setExpanded(!expanded)}>
        <span>{title}</span>
        <div className={'accordion-button'}>
          {expanded && <FontAwesomeIcon icon="caret-up" size={'2x'} />}
          {expanded || <FontAwesomeIcon icon="caret-down" size={'2x'} />}
        </div>
      </div>
      {expanded && (<div className={'accordion-content'}>
        {children}
      </div>)}
    </div>
  );
};

AccordionPanel.defaultProps = {
  startExpanded: false,
};

AccordionPanel.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf(PropTypes.node)]).isRequired,
  startExpanded: PropTypes.bool,
  title: PropTypes.string.isRequired,
};

export default AccordionPanel;
