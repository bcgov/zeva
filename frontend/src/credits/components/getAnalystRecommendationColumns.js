import _ from 'lodash';

const analystRecommendationColumns = (props) => {
  const { submission, user } = props;

  return [
    {
      accessor: (item) => {
        if (!submission.eligible) {
          return '-';
        }

        const eligibleSales = submission.eligible.find(
          (eligible) => eligible.vehicleId === item.vehicle.id
        );

        if (!eligibleSales) {
          return '-';
        }

        return eligibleSales.vinCount;
      },
      className: 'text-right eligible-sales',
      Footer: (reactTable) => {
        const sum = _.sumBy(reactTable.data, (item) => {
          if (isNaN(item['eligible-sales'])) {
            return 0;
          }

          return item['eligible-sales'];
        });

        if (sum === 0) {
          return '-';
        }

        return sum;
      },
      Header: 'Eligible Sales',
      headerClassName: ' eligible-sales',
      id: 'eligible-sales',
      show: user.isGovernment,
      width: 150
    },
    {
      accessor: (item) => {
        const { vehicle } = item;

        if (!submission.eligible) {
          return '-';
        }

        const eligibleSales = submission.eligible.find(
          (eligible) => eligible.vehicleId === vehicle.id
        );

        if (!eligibleSales) {
          return '-';
        }

        if (vehicle && vehicle.creditValue && vehicle.creditValue !== 0) {
          return (
            eligibleSales.vinCount * _.round(vehicle.creditValue, 2)
          ).toFixed(2);
        }

        return '-';
      },
      className: 'text-right eligible-zev-credits',
      Footer: (reactTable) => {
        const sum = _.sumBy(reactTable.data, (item) => {
          if (isNaN(item['eligible-zev-credits'])) {
            return 0;
          }

          return Number(item['eligible-zev-credits']);
        });

        if (sum === 0) {
          return '-';
        }

        return _.round(sum, 2).toFixed(2);
      },
      Header: 'Eligible ZEV Credits',
      headerClassName: ' eligible-sales',
      id: 'eligible-zev-credits',
      show: user.isGovernment || submission.validationStatus === 'VALIDATED',
      width: 200
    }
  ];
};

export default analystRecommendationColumns;
