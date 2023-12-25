export const generateUniqueCode = (id) => {
  // Function to pad the month and day with leading zero if necessary
  const pad = (number) => {
    return (number < 10 ? '0' : '') + number;
  };

  // Get current date
  const now = new Date();
  const formattedDate = now.getFullYear().toString() + pad(now.getMonth() + 1) + pad(now.getDate());

  // Convert to base 32
  const dateBase32 = parseInt(formattedDate).toString(32);
  const idBase32 = parseInt(id).toString(32);

  // Concatenate and return the result
  return dateBase32 + idBase32;
};
