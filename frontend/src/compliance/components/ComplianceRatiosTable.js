/*
 * Presentational component
 */
import PropTypes from 'prop-types';
import React from 'react';
import ReactTable from '../../app/components/ReactTable';

const ComplianceRatiosTable = (props) => {
  const { data } = props;
  const columns = [{
    accessor: (item) => (item.modelYear),
    className: 'text-center',
    Header: 'Model Year',
    headerClassName: 'font-weight-bold ',
    id: 'model-year',
    sortable: false,
    maxWidth: 200,
  }, {
    accessor: (item) => `${item.complianceRatio}%`,
    className: 'text-center',
    Header: 'Compliance Ratio',
    headerClassName: 'font-weight-bold',
    id: 'compliance-ratio',
    sortable: false,
    maxWidth: 200,
  }, {
    accessor: (item) => `${item.zevClassA}%`,
    className: 'text-center',
    Header: 'ZEV Class A',
    headerClassName: 'font-weight-bold',
    id: 'zev-class-A',
    sortable: false,
    maxWidth: 200,
  }];

  return (
    <ReactTable
      className="compliance-ratios-table"
      columns={columns}
      data={data}
      filterable={false}
    />
  );
};

ComplianceRatiosTable.defaultProps = {};

ComplianceRatiosTable.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

export default ComplianceRatiosTable;
