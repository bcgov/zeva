const parseErrorResponse = (err, data) => {
  const errors = err;

  Object.entries(data).forEach(([key, value]) => {
    if (Object.prototype.toString.call(value) === '[object Object]') {
      parseErrorResponse(errors, value);
    } else {
      [errors[key]] = value;
    }
  });
};

export default parseErrorResponse;
