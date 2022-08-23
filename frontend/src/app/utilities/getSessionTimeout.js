const getSessionTimeout = (tokenExp) => {
  let startTime = new Date();
  //warning will be 5 minutes before expiry
  let warningTime = new Date(tokenExp);
  warningTime.setMinutes(tokenExp.getMinutes() - 5);
  const msUntilWarning = Math.round(
    ((warningTime - startTime) % 86400000) % 3600000
  );
  return msUntilWarning;
};

export default getSessionTimeout;
