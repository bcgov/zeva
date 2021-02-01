import PropTypes from 'prop-types';
import React from 'react';
import ReactTable from '../../app/components/ReactTable';
import CustomPropTypes from '../../app/utilities/props';

const ComplianceReportsTable = (props) => {
  const { user, data } = props;
  
  const columns = [{
    accessor: (item) => (item.modelYear),
    className: 'text-center',
    Header: 'Model Year',
    headerClassName: 'font-weight-bold ',
    id: 'model-year',
    maxWidth: 200,
  }, {
    accessor: (item) => (item.status),
    className: 'text-center',
    Header: 'Status',
    headerClassName: 'font-weight-bold',
    id: 'status',
    maxWidth: 200,
  }, {
    accessor: (item) => (item.compliant ? item.compliant : '-'),
    className: 'text-center',
    Header: 'Compliant',
    headerClassName: 'font-weight-bold',
    id: 'compliant',
    maxWidth: 200,
  }, {
    accessor: (item) => (item.totalLdvSales ? item.totalLdvSales : '-'),
    className: 'text-center',
    Header: 'Total LDV Sales',
    headerClassName: 'font-weight-bold',
    id: 'total-ldv-sales',
    maxWidth: 200,
  }, {
    accessor: (item) => (item.supplierClass ? item.supplierClass : '-'),
    className: 'text-center',
    Header: 'Supplier Class',
    headerClassName: 'font-weight-bold',
    id: 'supplier-class',
    maxWidth: 200,
  }, {
    accessor: (item) => (item.obligationTotal ? item.obligationTotal : '-'),
    className: 'text-center',
    Header: 'Obligation Total',
    headerClassName: 'font-weight-bold',
    id: 'obligation-total',
    maxWidth: 200,
  }, {
    accessor: (item) => (item.obligationACredits ? item.obligationACredits : '-'),
    className: 'text-center',
    Header: 'Obligation A Credits',
    headerClassName: 'font-weight-bold',
    id: 'obligation-a-credits',
    maxWidth: 200,
  },
  ];


  return (
    <ReactTable
      className="compliance-reports-table"
      columns={columns}
      data={data}
      filterable={true}
      />
  );
};

ComplianceReportsTable.defaultProps = {};

ComplianceReportsTable.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default ComplianceReportsTable;