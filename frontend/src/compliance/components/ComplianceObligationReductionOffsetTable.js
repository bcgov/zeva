import React from 'react';
import PropTypes from 'prop-types';
import formatNumeric from '../../app/utilities/formatNumeric';

const ComplianceObligationReductionOffsetTable = (props) => {
  const {
    offsetNumbers, creditReduction, supplierClassInfo, handleOffsetChange,
  } = props;

  return (
    <div className="col-12">
      <div className="row">
        <table className="col-12">
          <tbody>
            {supplierClassInfo.class === 'L' && (
            <>
              <tr className="subclass">
                <th className="large-column">
                  ZEV Class A Credit Reduction
                </th>
                <th className="small-column text-center text-blue">
                  A
                </th>
                <th className="small-column text-center text-blue">
                  B
                </th>
              </tr>
              <tr>
                <td className="text-blue">&bull; &nbsp; &nbsp; year</td>
                <td className="text-right text-red">a</td>
                <td className="text-right text-red">b</td>
              </tr>
              <tr className="subclass">
                <th className="large-column">
                  Unspecified ZEV Class Credit Reduction
                </th>
                <th className="text-center">
                  A
                </th>
                <th className="text-center">
                  B
                </th>
              </tr>
            </>
            )}
            {supplierClassInfo.class !== 'L' && (
            <tr className="subclass">
              <th className="large-column">
                Compliance Ratio Credit Reduction
              </th>
              <th className="text-center">
                A
              </th>
              <th className="text-center">
                B
              </th>
            </tr>
            )}
            <tr>

              <td>
                Do you want to use ZEV Class A or B credits first for your unspecified ZEV class reduction?
              </td>
              <td className="text-center">
                <input
                  type="radio"
                  id="A"
                  onChange={(event) => {
                    creditReduction(event);
                  }}
                  name="creditOption"
                  value="A"
                />
              </td>
              <td className="text-center">
                <input
                  className="text-center"
                  type="radio"
                  id="B"
                  onChange={(event) => {
                    creditReduction(event);
                  }}
                  name="creditOption"
                  value="B"
                />
              </td>
            </tr>
            {offsetNumbers && Object.keys(offsetNumbers).map((year) => (
              <tr key={year}>
                <td>
                  &bull; &nbsp; &nbsp; {year} Credits
                </td>
                <td className="text-center">
                  <input
                    name="A"
                    id={`${year}-A`}
                    onChange={(event) => { handleOffsetChange(event); }}
                    type="number"
                  />
                </td>
                <td className="text-center">
                  <input
                    name="B"
                    id={`${year}-B`}
                    onChange={(event) => { handleOffsetChange(event); }}
                    type="number"
                  />
                </td>
              </tr>
            ))}
            <tr className="subclass">
              <th className="large-column">
                <span>
                  BALANCE AFTER CREDIT REDUCTION
                </span>
                <span className="float-right mr-3">{formatNumeric(Object.keys(offsetNumbers).reduce((a, v) => a + offsetNumbers[v].A + offsetNumbers[v].B, 0), 2)}</span>
              </th>
              <th className="text-right pr-3">{formatNumeric(Object.keys(offsetNumbers).reduce((a, v) => a + offsetNumbers[v].A, 0), 2)}</th>
              <th className="text-right pr-3">{formatNumeric(Object.keys(offsetNumbers).reduce((a, v) => a + offsetNumbers[v].B, 0), 2)}</th>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  );
};
ComplianceObligationReductionOffsetTable.propTypes = {
};
export default ComplianceObligationReductionOffsetTable;
