const getLatestAssignment = (assignments) => {
  if (!assignments || assignments.length === 0) {
    return null;
  }

  return assignments.reduce((latest, current) => {
    const latestDate = new Date(latest?.id);
    const currentDate = new Date(current?.id);
    return latestDate > currentDate ? latest : current;
  });
};

export default getLatestAssignment;
