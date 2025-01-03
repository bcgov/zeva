const urlInsertIdAndYear = (route, id, modelYear) => {
  const encode = (str) => encodeURIComponent(str);
  return `${route.replace(":id", encode(id))}?year=${encode(modelYear)}`;
}

export default urlInsertIdAndYear;