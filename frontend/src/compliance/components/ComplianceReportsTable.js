import PropTypes from 'prop-types';
import React from 'react';

import ReactTable from '../../app/components/ReactTable';
import CustomPropTypes from '../../app/utilities/props';
import history from '../../app/History';
import ROUTES_COMPLIANCE from '../../app/routes/Compliance';
import formatNumeric from '../../app/utilities/formatNumeric';
import getClassAReduction from '../../app/utilities/getClassAReduction';
import getTotalReduction from '../../app/utilities/getTotalReduction';
import formatStatus from '../../app/utilities/formatStatus';

const ComplianceReportsTable = (props) => {
  const {
    user,
    data,
    showSupplier,
    filtered,
    ratios,
    setFiltered,
  } = props;

  const supplierClass = (paramClass) => {
    if (paramClass === 'L') {
      return 'Large';
    }

    if (paramClass === 'M') {
      return 'Medium';
    }

    if (paramClass === 'S') {
      return 'Small';
    }

    return '-';
  };

  const calculateClassAReduction = (item) => {
    if (item.validationStatus !== 'ASSESSED') {
      return '-';
    }

    const filteredRatio = ratios.find(
      (each) => Number(each.modelYear) === Number(item.modelYear.name),
    );

    if (filteredRatio && item.ldvSales > 0) {
      return formatNumeric(getClassAReduction(item.ldvSales, filteredRatio.zevClassA, item.supplierClass), 0);
    }

    return '-';
  };

  const calculateTotalReduction = (item) => {
    if (item.validationStatus !== 'ASSESSED') {
      return '-';
    }

    const filteredRatio = ratios.find(
      (each) => Number(each.modelYear) === Number(item.modelYear.name),
    );

    if (filteredRatio && item.ldvSales > 0) {
      return formatNumeric(getTotalReduction(item.ldvSales, filteredRatio.complianceRatio), 0);
    }

    return '-';
  };

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
    accessor: (row) => (formatStatus(row.supplementalStatus)),
    filterMethod: (filter, row) => {
      const filterValues = filter.value.split(',');

      let returnValue = false;

      filterValues.forEach((filterValue) => {
        const value = filterValue.toLowerCase().trim();

        if (value !== '' && !returnValue) {
          returnValue = row[filter.id].toLowerCase().includes(value);
        }
      });

      return returnValue;
    },
    className: 'text-center text-capitalize',
    Header: 'Status',
    headerClassName: 'font-weight-bold',
    id: 'status',
    maxWidth: 260,
  }, {
    accessor: (item) => (item.compliant),
    className: 'text-center',
    Header: 'Compliant',
    headerClassName: 'font-weight-bold',
    id: 'compliant',
    maxWidth: 260,
  }, {
    accessor: (item) => (item.ldvSales ? formatNumeric(item.ldvSales, 0) : '-'),
    className: 'text-right px-3',
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
    accessor: (item) => (calculateTotalReduction(item)),
    className: 'text-right',
    Header: 'Obligation Total',
    headerClassName: 'font-weight-bold',
    id: 'obligation-total',
    maxWidth: 260,
  }, {
    accessor: (item) => (calculateClassAReduction(item)),
    className: 'text-right',
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
      filtered={filtered}
      setFiltered={setFiltered}
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

ComplianceReportsTable.defaultProps = {
  filtered: [],
  setFiltered: () => {},
};

ComplianceReportsTable.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  filtered: PropTypes.arrayOf(PropTypes.shape()),
  ratios: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  user: CustomPropTypes.user.isRequired,
  setFiltered: PropTypes.func,
  showSupplier: PropTypes.bool.isRequired,
};

export default ComplianceReportsTable;
