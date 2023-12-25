import moment from 'moment';

export const getWeekDateRange = () => {
  // Set Monday as the start of the week in Moment.js
  moment.updateLocale('en', {
    week: {
      dow: 1 // Monday is the start of the week
    }
  });

  // Get the current date
  const currentDate = moment.utc();
  console.log('here', currentDate.format());
  // Get the starting date of the week (Monday)
  const startingDate = currentDate.clone().startOf('week');

  // Get the ending date of the week (Sunday)
  const endingDate = currentDate.clone().endOf('week');

  // Create an object to hold the dates for each day of the week
  const weekDatesNamesVsDates = {};
  for (let i = 0; i < 7; i++) {
    const date = startingDate.clone().add(i, 'days');

    weekDatesNamesVsDates[date.format('dddd').toUpperCase()] = date.format('YYYY-MM-DD');
  }

  // Format the dates if needed
  const formattedStartingDate = startingDate.format('YYYY-MM-DD');
  const formattedEndingDate = endingDate.format('YYYY-MM-DD');

  return {
    startingDate,
    endingDate,
    weekDatesNamesVsDates,
    formattedStartingDate,
    formattedEndingDate
  };
};
