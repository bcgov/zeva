import Big from "big.js"

const formatNumeric = (value, decimals = 2, roundBracket) => {
  if (value instanceof Big) {
    return value.toFixed(decimals)
  }

  let newValue = value
  if (isNaN(newValue)) {
    return newValue
  }

  newValue = Number(newValue)

  if (decimals > 0) {
    newValue = newValue.toFixed(decimals)
  } else if (decimals === 0) {
    newValue = Math.round(newValue)
  }
  if (Math.abs(value) < 0.001 && decimals !== 0) {
    newValue = '0.00'
  }
  if (roundBracket) {
    if (newValue < 0) {
      newValue = `(${(newValue * -1).toFixed(decimals)})`
    }
  }
  if (typeof newValue === 'number') {
    newValue = newValue.toString()
  }

  newValue = newValue.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')

  return newValue
}

export default formatNumeric
