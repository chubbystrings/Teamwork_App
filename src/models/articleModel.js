const Sanitize = require('../middleware/validation/sanitizeData');

const articleData = (rows) => {
  const data = [];

  rows.forEach((row) => {
    data.push({
      id: row.article_id,
      title: Sanitize.decode(row.title),
      article: Sanitize.decode(row.content),
      createdOn: row.article_created_on,
    });
  });
  return data;
};

module.exports = articleData;


// const decodeData = (rows) => {
//   const data = [];
//   rows.forEach((row) => {
//     const originalContent =  Sanitize.decode(row.content);
//     const originalTitle =  Sanitize.decode(row.title);
//     const cols = {
//       article_id: row.article_id,
//       author_firstname: row.author_firstname,
//       author_lastname: row.author_lastname,
//       title: originalTitle,
//       content: originalContent,
//       created_on: row.created_on,

//     };

//     data.push(cols);
//   });
//   return data;
// };
