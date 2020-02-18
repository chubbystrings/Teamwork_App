
const Sanitize = require('../middleware/validation/sanitizeData');

const gifData = (rows) => {
  const data = [];

  rows.forEach((row) => {
    data.push({
      id: row.id,
      title: Sanitize.decode(row.title),
      imageUrl: row.url,
      createdOn: row.created_on,
    });
  });
  return data;
};

module.exports = gifData;
