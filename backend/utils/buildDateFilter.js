
export const buildDateFilter = ({
  filter,
  startDate,
  endDate,
  startIndex = 2,
}) => {
  let clause = "";
  let values = [];

  if (startDate && endDate) {
    clause = `AND date BETWEEN $${startIndex} AND $${startIndex + 1}`;
    values.push(startDate, endDate);
    return { clause, values };
  }

  switch (filter) {
    case "day":
      clause = `AND date = CURRENT_DATE`;
      break;

    case "week":
      clause = `AND date >= CURRENT_DATE - INTERVAL '7 days'`;
      break;

    case "month":
      clause = `AND date >= DATE_TRUNC('month', CURRENT_DATE)`;
      break;

    case "year":
      clause = `AND date >= DATE_TRUNC('year', CURRENT_DATE)`;
      break;

    default:
      clause = "";
  }

  return { clause, values };
};
