import React from 'react';
import PropTypes from 'prop-types';

const DetailField = (props) => {
  const { className, label, value } = props;

  return (
    <div className="detail-field row">
      <div className="col-sm-3 label">{label}</div>
      <div className={`col-sm-9 value ${className}`}>{value}</div>
    </div>
  );
};

DetailField.defaultProps = {
  className: '',
};

DetailField.propTypes = {
  className: PropTypes.string,
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,
};

export default DetailField;
