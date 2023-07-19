const constructReassessmentReductions = (reductions, prevReductions) => {
  const result = {
    reductionsToUpdate: [],
    reductionsToAdd: []
  }
  const potentialReductionsToAdd = []
  if (reductions && prevReductions) {
    for (const reduction of reductions) {
      let foundCorrespondingPrevReduction = false
      for (const prevReduction of prevReductions) {
        if (reduction.type === prevReduction.type && reduction.modelYear === prevReduction.modelYear) {
          if (reduction.creditA !== prevReduction.creditA) {
            potentialReductionsToAdd.push({
              creditClass: 'A',
              modelYear: reduction.modelYear,
              oldValue: prevReduction.creditA,
              newValue: reduction.creditA
            })
          }
          if (reduction.creditB !== prevReduction.creditB) {
            potentialReductionsToAdd.push({
              creditClass: 'B',
              modelYear: reduction.modelYear,
              oldValue: prevReduction.creditB,
              newValue: reduction.creditB
            })
          }
          foundCorrespondingPrevReduction = true
        }
      }
      if (!foundCorrespondingPrevReduction) {
        if (reduction.creditA) {
          result.reductionsToAdd.push({
            creditClass: 'A',
            modelYear: reduction.modelYear,
            value: reduction.creditA
          })
        }
        if (reduction.creditB) {
          result.reductionsToAdd.push({
            creditClass: 'B',
            modelYear: reduction.modelYear,
            value: reduction.creditB
          })
        }
      }
    }
    for (const reduction of potentialReductionsToAdd) {
      if (!reduction.oldValue) {
        result.reductionsToAdd.push({
          creditClass: reduction.creditClass,
          modelYear: reduction.modelYear,
          value: reduction.newValue
        })
      } else {
        result.reductionsToUpdate.push(reduction)
      }
    }
  }
  return result
}

export default constructReassessmentReductions
