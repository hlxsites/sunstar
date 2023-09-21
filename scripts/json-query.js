/* eslint-disable max-len */
export default function query(select, from, where, orderBy, rowCount) {
  // Validate input parameters
  if (!Array.isArray(select) || !Array.isArray(from) || !Array.isArray(where) || where.length !== 3) {
    throw new Error('Invalid input parameters');
  }

  // Extract the filter condition components
  const [field, operator, value] = where;

  // Sort the 'from' array based on the orderBy parameter
  if (orderBy) {
    const [orderByField, sortOrder] = orderBy;
    from.sort((a, b) => {
      const aValue = a[orderByField];
      const bValue = b[orderByField];
      if (sortOrder === 'asc') {
        // eslint-disable-next-line no-nested-ternary
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } if (sortOrder === 'desc') {
        // eslint-disable-next-line no-nested-ternary
        return bValue < aValue ? -1 : bValue > aValue ? 1 : 0;
      }
      throw new Error('Invalid sortOrder');
    });
  }

  // Filter the 'from' array based on the condition
  const filteredData = from.filter((item) => {
    switch (operator) {
      case '<':
        return item[field] < parseFloat(value);
      case '>':
        return item[field] > parseFloat(value);
      case '=':
        return item[field] === value;
      default:
        return false; // Unsupported operator
    }
  });

  // Limit the number of rows based on the rowCount parameter
  const selectedData = filteredData.slice(0, rowCount);

  // Select the specified fields from the filtered data
  const result = selectedData.map((item) => {
    const selectedFields = {};
    select.forEach((fieldName) => {
      selectedFields[fieldName] = item[fieldName];
    });
    return selectedFields;
  });

  return result;
}
