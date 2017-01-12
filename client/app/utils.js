export const humanizeDate = (date) => {
  date = new Date(date);
  var hours = date.getHours();
  var mins = date.getMinutes();
  var secs = date.getSeconds();

  hours = hours < 10 ? `0${hours}` : hours;
  mins = mins < 10 ? `0${mins}` : mins;
  secs = secs < 10 ? `0${secs}` : secs;

  return `${hours}:${mins}:${secs}`;
};
