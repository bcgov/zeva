import React from 'react';
import formatNumeric from '../../app/utilities/formatNumeric';

const TableSection = (props) => {
  const { input, title, negativeValue } = props;
  let numberClassname = 'text-right';
  if (negativeValue) {
    numberClassname += ' text-red';
  }
  return (
    <>
      <tr className="subclass">
        <th className="large-column">
          {title}
        </th>
        <th> </th>
        <th> </th>

      </tr>
      {input.sort((a, b) => {
        if (a.modelYear < b.modelYear) {
          return 1;
        }
        if (a.modelYear > b.modelYear) {
          return -1;
        }
        return 0;
      }).map((each) => (
        <tr key={each.modelYear + each.B}>
          <td className="text-blue">
            &bull; &nbsp; &nbsp; {each.modelYear} Credits
          </td>
          <td className={numberClassname}>
            {formatNumeric(each.A, 2)}
          </td>
          <td className={numberClassname}>
            {formatNumeric(each.B, 2)}
          </td>
        </tr>
      ))}
    </>
  );
};

export default TableSection;
