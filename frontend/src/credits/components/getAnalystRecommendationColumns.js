import React from "react";
import isLegacySubmission from "../../app/utilities/isLegacySubmission";
import { tooltipText } from "../constants/creditRequest";
import Tooltip from "../../app/components/Tooltip";

const analystRecommendationColumns = (props) => {
  const { submission, user } = props;

  return [
    {
      accessor: (item) => {
        if (!submission.eligible) {
          return "-";
        }

        const eligibleSales = submission.eligible.find(
          (eligible) => eligible.vehicleId === item.vehicle.id,
        );

        if (!eligibleSales) {
          return "-";
        }

        return eligibleSales.vinCount;
      },
      className: "text-right eligible-sales",
      Footer: (reactTable) => {
        const sum = reactTable.data
          .map((item) => {
            if (isNaN(item["eligible-sales"])) {
              return 0;
            }
            return Number(item["eligible-sales"]);
          })
          .reduce((a, b) => a + b);

        if (sum === 0) {
          return "-";
        }

        return sum;
      },
      Header: () => {
        if (isLegacySubmission(submission)) {
          return "Eligible Sales";
        }
        return (
          <div>
            <Tooltip
              tooltipId="zevSales"
              tooltipText={tooltipText}
              infoCircle
            />
            Eligible ZEVs Supplied
          </div>
        );
      },
      headerClassName: " eligible-sales",
      id: "eligible-sales",
      show: user.isGovernment,
      width: 150,
    },
    {
      accessor: (item) => {
        const { vehicle } = item;

        if (!submission.eligible) {
          return "-";
        }

        const eligibleSales = submission.eligible.find(
          (eligible) => eligible.vehicleId === vehicle.id,
        );

        if (!eligibleSales) {
          return "-";
        }

        if (vehicle && vehicle.creditValue && vehicle.creditValue !== 0) {
          return (
            eligibleSales.vinCount *
            (Math.round((vehicle.creditValue + Number.EPSILON) * 100) / 100)
          ).toFixed(2);
        }

        return "-";
      },
      className: "text-right eligible-zev-credits",
      Footer: (reactTable) => {
        const sum = reactTable.data
          .map((item) => {
            if (isNaN(item["eligible-zev-credits"])) {
              return 0;
            }
            return Number(item["eligible-zev-credits"]);
          })
          .reduce((a, b) => a + b);

        if (sum === 0) {
          return "-";
        }

        return (Math.round((sum + Number.EPSILON) * 100) / 100).toFixed(2);
      },
      Header: "Eligible ZEV Credits",
      headerClassName: " eligible-sales",
      id: "eligible-zev-credits",
      show: user.isGovernment || submission.validationStatus === "VALIDATED",
      width: 200,
    },
  ];
};

export default analystRecommendationColumns;
