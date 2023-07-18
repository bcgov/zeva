const calculateReductionDifferences = (reductions, prevReductions) => {
  const result = []
  if (reductions && prevReductions) {
    for (const reduction of reductions) {
      for (const prevReduction of prevReductions) {
        if (reduction.type === prevReduction.type && reduction.modelYear === prevReduction.modelYear) {
          if (reduction.creditA !== prevReduction.creditA) {
            result.push({
              creditClass: 'A',
              modelYear: reduction.modelYear,
              oldValue: prevReduction.creditA,
              newValue: reduction.creditA
            })
          }
          if (reduction.creditB !== prevReduction.creditB) {
            result.push({
              creditClass: 'B',
              modelYear: reduction.modelYear,
              oldValue: prevReduction.creditB,
              newValue: reduction.creditB
            })
          }
        }
      }
    }
  }
  return result
}

export default calculateReductionDifferences
