import React from 'react';
import PropTypes from 'prop-types';

const DetailField = (props) => {
  const { label, value } = props;

  return (
    <div className="detail-field row">
      <div className="col-sm-3 label">{label}</div>
      <div className="col-sm-9 value">{value}</div>
    </div>
  );
};

DetailField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

export default DetailField;
