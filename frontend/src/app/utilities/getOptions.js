import React from 'react';
const getOptions = (inputObj, displayField) => {
    const uniqueArr = [...new Set(inputObj.map((eachItem) => {
        if (typeof eachItem[displayField] === 'string') {
          return eachItem[displayField];
        }
  
        return eachItem[displayField].shortName || eachItem[displayField].name;
      }))];
      return uniqueArr.sort().map((each) => (
        <option key={each}>{each}</option>
      ));    

}

export default getOptions;