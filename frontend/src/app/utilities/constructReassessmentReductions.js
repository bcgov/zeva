import Big from "big.js"

const constructReassessmentReductions = (reductions, prevReductions) => {
  const result = {
    reductionsToUpdate: [],
    reductionsToAdd: []
  }
  const bigZero = new Big(0)
  const potentialReductionsToAdd = []
  if (reductions && prevReductions) {
    for (const reduction of reductions) {
      let foundCorrespondingPrevReduction = false
      for (const prevReduction of prevReductions) {
        if (reduction.type === prevReduction.type && reduction.modelYear === prevReduction.modelYear) {
          if (!(reduction.creditA.eq(prevReduction.creditA))) {
            potentialReductionsToAdd.push({
              creditClass: 'A',
              modelYear: reduction.modelYear,
              oldValue: prevReduction.creditA.toNumber(),
              newValue: reduction.creditA.toNumber()
            })
          }
          if (!(reduction.creditB.eq(prevReduction.creditB))) {
            potentialReductionsToAdd.push({
              creditClass: 'B',
              modelYear: reduction.modelYear,
              oldValue: prevReduction.creditB.toNumber(),
              newValue: reduction.creditB.toNumber()
            })
          }
          foundCorrespondingPrevReduction = true
        }
      }
      if (!foundCorrespondingPrevReduction) {
        if (!(reduction.creditA.eq(bigZero))) {
          result.reductionsToAdd.push({
            creditClass: 'A',
            modelYear: reduction.modelYear,
            value: reduction.creditA.toNumber()
          })
        }
        if (!(reduction.creditB.eq(bigZero))) {
          result.reductionsToAdd.push({
            creditClass: 'B',
            modelYear: reduction.modelYear,
            value: reduction.creditB.toNumber()
          })
        }
      }
    }
    for (const reduction of potentialReductionsToAdd) {
      if (reduction.oldValue.eq(bigZero)) {
        result.reductionsToAdd.push({
          creditClass: reduction.creditClass,
          modelYear: reduction.modelYear,
          value: reduction.newValue.toNumber()
        })
      } else {
        result.reductionsToUpdate.push(reduction)
      }
    }
  }
  return result
}

export default constructReassessmentReductions
