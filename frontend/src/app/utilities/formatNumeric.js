const formatNumeric = (value, decimals = 2) => {
  let newValue = value;

  if (decimals > 0) {
    newValue = newValue.toFixed(decimals);
  }

  if (typeof newValue === 'number') {
    newValue = newValue.toString();
  }

  newValue = newValue.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  return newValue;
};

export default formatNumeric;
