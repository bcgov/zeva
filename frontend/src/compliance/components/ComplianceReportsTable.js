import PropTypes from 'prop-types';
import React from 'react';
import ReactTable from '../../app/components/ReactTable';
import CustomPropTypes from '../../app/utilities/props';
import history from '../../app/History';
import ROUTES_COMPLIANCE from '../../app/routes/Compliance';

const ComplianceReportsTable = (props) => {
  const { user, data } = props;
  
  const columns = [{
    accessor: (item) => (item.modelYear.name),
    className: 'text-center',
    Header: 'Model Year',
    headerClassName: 'font-weight-bold ',
    id: 'model-year',
    maxWidth: 260,
  }, {
    accessor: (item) => (item.validationStatus),
    className: 'text-center',
    Header: 'Status',
    headerClassName: 'font-weight-bold',
    id: 'status',
    maxWidth: 260,
  }, {
    accessor: (item) => (item.compliant === true ? '-' : ''),
    className: 'text-center',
    Header: 'Compliant',
    headerClassName: 'font-weight-bold',
    id: 'compliant',
    maxWidth: 260,
  }, {
    accessor: (item) => (item.ldvSales ? item.ldvSales : '-'),
    className: 'text-center',
    Header: 'Total LDV Sales',
    headerClassName: 'font-weight-bold',
    id: 'total-ldv-sales',
    maxWidth: 260,
  }, {
    accessor: (item) => (item.supplierClass ? item.supplierClass : '-'),
    className: 'text-center',
    Header: 'Supplier Class',
    headerClassName: 'font-weight-bold',
    id: 'supplier-class',
    maxWidth: 260,
  }, {
    accessor: (item) => (item.obligationTotal ? item.obligationTotal : '-'),
    className: 'text-center',
    Header: 'Obligation Total',
    headerClassName: 'font-weight-bold',
    id: 'obligation-total',
    maxWidth: 260,
  }, {
    accessor: (item) => (item.obligationCredits ? item.obligationCredits : '-'),
    className: 'text-center',
    Header: 'Obligation A Credits',
    headerClassName: 'font-weight-bold',
    id: 'obligation-a-credits',
    maxWidth: 260,
  },
  ];


  return (
    <ReactTable
      className="compliance-reports-table"
      columns={columns}
      data={data}
      filterable={true}
      getTrProps={(state, row) => {
        if (row && row.original && user) {
          return {
            onClick: () => {
              const { id, validationStatus } = row.original;
              history.push(ROUTES_COMPLIANCE.REPORT_SUPPLIER_INFORMATION.replace(/:id/g, id));
            },
            className: 'clickable',
          };
        }

        return {};
      }}
      />
  );
};

ComplianceReportsTable.defaultProps = {};

ComplianceReportsTable.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default ComplianceReportsTable;