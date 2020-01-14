import React from "react";

const DetailField = (props) => {
  const { label, value } = props;

  return (
    <div className="detail-field row">
      <div className="col-sm-3 label">{label}</div>
      <div className="col-sm-9 value">{value}</div>
    </div>
  );
};

export default DetailField;
