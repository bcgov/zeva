const VehicleSupplierClass = (props) => {
  const { supplierClass } = props

  let text

  switch (supplierClass) {
    case 'M':
      text = 'Medium Volume Supplier (between 1,000 and 4,999 total LDV sales)'
      break
    case 'L':
      text = 'Large Volume Supplier (5,000 or more total LDV sales)'
      break
    case 'S':
      text = 'Small Volume Supplier (less than 1,000 total LDV sales)'
      break
    default:
      text = ''
  }

  return text
}

export default VehicleSupplierClass
