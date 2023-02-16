const formatAddress = (address) => {
    const addressElements = [];
    if (address) {
        if (address.representativeName) {
            addressElements.push(address.representativeName);
        }
        if (address.addressLine1) {
            addressElements.push(address.addressLine1);
        }
        if (address.addressLine2) {
            addressElements.push(address.addressLine2);
        }
        if (address.city) {
            addressElements.push(address.city);
        }
        if (address.state) {
            addressElements.push(address.state);
        }
        if (address.country) {
            addressElements.push(address.country);
        }
        if (address.postalCode) {
            addressElements.push(address.postalCode);
        }
    }
    return addressElements.join(', ');
}

export default formatAddress;