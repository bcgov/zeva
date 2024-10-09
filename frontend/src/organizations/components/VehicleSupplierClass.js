const VehicleSupplierClass = (props) => {
  const { supplierClass } = props

  let text

  switch (supplierClass) {
    case 'M':
      text = 'Medium Volume Supplier (between 1,000 and 4,999 total vehicles supplied)'
      break
    case 'L':
      text = 'Large Volume Supplier (5,000 or more total vehicles supplied)'
      break
    case 'S':
      text = 'Small Volume Supplier (less than 1,000 total vehicles supplied)'
      break
    default:
      text = ''
  }

  return text
}

export default VehicleSupplierClass
