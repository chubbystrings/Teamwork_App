const Sanitize = require('../middleware/validation/sanitizeData');

const commentsData = (rows) => {
  const data = [];
  const cols = {};
  rows.forEach((row) => {
    const originalContent = Sanitize.decode(row.comment_body);

    cols.comment_id = row.comment_id;
    cols.article_id = row.article_id;
    cols.author_firstname = row.first_name;
    cols.author_lastname = row.last_name;
    cols.content = originalContent;
    cols.created_on = row.created_on;

    data.push(cols);
  });
  return data;
};

module.exports = commentsData;


// function decode html encoded characters from datanbase
// const decodeData = (rows) => {
//     const data = [];
//     rows.forEach((row) => {
//       const originalContent =  Sanitize.decode(row.comment_body);
//       const cols = {
//         comment_id: row.comment_id,
//         article_id: row.article_id,
//         author_firstname: row.first_name,
//         author_lastname: row.last_name,
//         content: originalContent,
//         created_on: row.created_on,

//       };

//       data.push(cols);
//     });
//     return data;
// };
