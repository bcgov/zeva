const VehicleSupplierClass = (props) => {
  const { supplierClass } = props;

  let text;

  switch (supplierClass) {
    case 'M':
      text = 'Medium Volume Supplier';
      break;
    case 'L':
      text = 'Large Volume Supplier';
      break;
    case 'S':
      text = 'Small Volume Supplier';
      break;
    default:
      text = '';
  }

  return text;
};

export default VehicleSupplierClass;
