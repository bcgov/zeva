import Big from 'big.js'

const convertBalances = (balances) => {
    const bigZero = new Big(0)
    for (const balance of balances) {
        if (balance.creditA) {
            balance.creditA = new Big(balance.creditA)
        } else {
            balance.creditA = bigZero
        }
        if (balance.creditB) {
            balance.creditB = new Big(balance.creditB)
        } else {
            balance.creditB = bigZero
        }
    }
}

const convertCarryOverDeficits = (deficits) => {
    const bigZero = new Big(0)
    Object.keys(deficits).forEach((year) => {
      deficits[year].A = deficits[year].A ? new Big(deficits[year].A) : bigZero
      deficits[year].unspecified = deficits[year].unspecified ? new Big(deficits[year].unspecified) : bigZero
    })
}

export {convertBalances, convertCarryOverDeficits}