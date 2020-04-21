const getCreditClass = (vehicle) => {
  if ((vehicle.vehicleZevType.vehicleZevCode === 'BEV' && vehicle.range < 80.47)
    || vehicle.range < 16) {
    return 'C';
  }

  if (vehicle.vehicleZevType.vehicleZevCode === 'BEV') {
    return 'A';
  }

  return 'B';
};

export default getCreditClass;
