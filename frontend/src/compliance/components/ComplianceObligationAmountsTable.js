import React from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import formatNumeric from "../../app/utilities/formatNumeric";
import Tooltip from "../../app/components/Tooltip";

const ComplianceObligationAmountsTable = (props) => {
  const {
    classAReductions,
    handleChangeSales,
    page,
    ratios,
    reportYear,
    sales,
    statuses,
    supplierClass,
    totalReduction,
    unspecifiedReductions,
  } = props;
  const tooltip =
    "Please do not include motor vehicles with a gross vehicle weight rating of more than 3,856 kg that were supplied before October 1, 2024";
  const filteredClassAReductions = classAReductions.find(
    (reduction) => Number(reduction.modelYear) === Number(reportYear),
  );

  const filteredUnspecifiedReductions = unspecifiedReductions.find(
    (reduction) => Number(reduction.modelYear) === Number(reportYear),
  );

  let disabledInput = false;
  if (page === "obligation") {
    disabledInput =
      ["SAVED", "UNSAVED"].indexOf(statuses.complianceObligation.status) < 0;
  }

  return (
    <div>
      <div className="compliance-reduction-table">
        <div className="row mb-4 ">
          <div className="col-12">
            <table className="no-border">
              <tbody>
                <tr className="ldv-sales ">
                  <td className="text-blue" colSpan="3">
                    <Tooltip
                      tooltipId="supplied-tooltip"
                      tooltipText={tooltip}
                      placement="left"
                    >
                      <FontAwesomeIcon
                        icon="info-circle"
                        className="info-icon"
                      />
                      {reportYear}{" "}
                      {reportYear < 2024
                        ? "Model Year LDV Sales"
                        : "Model Year Vehicles Supplied"}
                      :
                    </Tooltip>
                  </td>
                  <td>
                    {page === "obligation" &&
                      statuses.assessment.status !== "ASSESSED" && (
                        <Tooltip
                          tooltipId="supplied-tooltip"
                          tooltipText={tooltip}
                          placement="left"
                        >
                          <span id="obligation-sales-input">
                            <FontAwesomeIcon
                              icon="info-circle"
                              className="info-icon"
                            />
                            <input
                              className="form-control"
                              disabled={disabledInput}
                              onChange={handleChangeSales}
                              type={disabledInput ? "string" : "number"}
                              value={
                                disabledInput ? formatNumeric(sales, 0) : sales
                              }
                            />
                          </span>
                        </Tooltip>
                      )}
                    {(page === "assessment" ||
                      (page === "obligation" &&
                        statuses.assessment.status === "ASSESSED")) &&
                      (formatNumeric(sales, 0) || 0)}
                  </td>
                </tr>
                <tr>
                  <td className="text-blue">{reportYear} Compliance Ratio:</td>
                  <td width="25%">{ratios.complianceRatio} %</td>
                  <td className="text-blue font-weight-bold" width="25%">
                    Compliance Ratio Credit Reduction:
                  </td>
                  <td className="font-weight-bold" width="25%">
                    {supplierClass === "S"
                      ? formatNumeric(0, 2)
                      : formatNumeric(totalReduction, 2)}
                  </td>
                </tr>
                {supplierClass === "L" && (
                  <tr>
                    <td className="text-blue">
                      Large Volume Supplier Class A Ratio:
                    </td>
                    <td>{ratios.zevClassA} %</td>
                    <td className="text-blue">
                      &bull; ZEV Class A Credit Reduction:
                    </td>
                    <td>{formatNumeric(filteredClassAReductions.value, 2)}</td>
                  </tr>
                )}
                <tr>
                  <td colSpan="2" />
                  <td className="text-blue">
                    &bull; Unspecified ZEV Class Credit Reduction:
                  </td>
                  <td>
                    {supplierClass === "S"
                      ? formatNumeric(0, 2)
                      : formatNumeric(filteredUnspecifiedReductions.value, 2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

ComplianceObligationAmountsTable.defaultProps = {
  handleChangeSales: () => {},
};

ComplianceObligationAmountsTable.propTypes = {
  classAReductions: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  handleChangeSales: PropTypes.func,
  page: PropTypes.string.isRequired,
  reportYear: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  ratios: PropTypes.shape().isRequired,
  sales: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  statuses: PropTypes.shape().isRequired,
  supplierClass: PropTypes.string.isRequired,
  totalReduction: PropTypes.oneOfType([PropTypes.number, PropTypes.shape()])
    .isRequired,
  unspecifiedReductions: PropTypes.arrayOf(PropTypes.shape()).isRequired,
};

export default ComplianceObligationAmountsTable;
