import PropTypes from 'prop-types';
import React from 'react';
import ReactTable from '../../app/components/ReactTable';
import CustomPropTypes from '../../app/utilities/props';
import history from '../../app/History';
import ROUTES_COMPLIANCE from '../../app/routes/Compliance';

const ComplianceReportsTable = (props) => {
  const { user, data, showSupplier } = props;

  const supplierClass = (paramClass) => {
    if (paramClass === 'L') {
      return 'Large'
    }
    else if (paramClass === 'M') {
      return 'Medium';
    }
    else if (paramClass === 'S') {
      return 'Small';
    }
    else {
      return '-';
    }
  }

  const columns = [{
    accessor: (item) => (item.organizationName),
    className: 'text-center',
    Header: 'Supplier',
    headerClassName: 'font-weight-bold ',
    id: 'supplier_name',
    show: showSupplier,
    maxWidth: 260,
  }, {
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
    accessor: (item) => (supplierClass(item.supplierClass)),
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
  }];

  return (
    <ReactTable
      className="compliance-reports-table"
      columns={columns}
      data={data}
      filterable
      getTrProps={(state, row) => {
        if (row && row.original && user) {
          return {
            onClick: () => {
              const { id, validationStatus } = row.original;
              if (validationStatus === 'ASSESSED' || user.isGovernment) {
                history.push(ROUTES_COMPLIANCE.REPORT_ASSESSMENT.replace(/:id/g, id));
              } else {
                history.push(ROUTES_COMPLIANCE.REPORT_SUPPLIER_INFORMATION.replace(/:id/g, id));
              }
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
  showSupplier: PropTypes.bool.isRequired,
};

export default ComplianceReportsTable;
