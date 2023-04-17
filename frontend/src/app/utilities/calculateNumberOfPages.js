const calculateNunberOfPages = (numberOfItems, pageSize) => {
  if (numberOfItems === 0) {
    return 1
  }
  return Math.ceil(numberOfItems / pageSize)
}

export default calculateNunberOfPages
