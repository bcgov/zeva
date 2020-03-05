import React, { useState } from 'react';
import PropTypes from 'prop-types';

const Accordion = (props) => {
  const { children } = props;
  return (
    <div className={'accordion'}>
      {children}
    </div>
  );
};

Accordion.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf(PropTypes.node)]).isRequired,
};

export default Accordion;
