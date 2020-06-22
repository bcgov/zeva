import React from 'react';
import PropTypes from 'prop-types';

const DetailField = (props) => {
  const {
    className, label, value, id
  } = props;

  return (
    <div className="detail-field row">
      <div className="col-sm-3 label">{label}</div>
      <div id={id} className={`col-sm-9 value ${className}`}>{value}</div>
    </div>
  );
};

DetailField.defaultProps = {
  className: '',
  id: '',
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
  id: PropTypes.string,
};

export default DetailField;
