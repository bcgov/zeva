const handleFilterChange = (event, filtered) => {
  const { id, value } = event.target
  let newFiltered = [...filtered]
  newFiltered = newFiltered.filter((each) => each.id !== id)
  return [...newFiltered, { id, value }]
}

export default handleFilterChange
