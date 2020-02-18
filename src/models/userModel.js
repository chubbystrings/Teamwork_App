
const userData = (row) => {
  const data = [];
  const cols = {};
  const role = row[0].role_id === 1 ? 'Admin' : 'Employee';

  cols.id = row[0].team_id;
  cols.user = row[0].user_id;
  cols.role = role;
  cols.firstname = row[0].first_name;
  cols.lastname = row[0].last_name;
  cols.email = row[0].email;
  cols.createdOn = row[0].created_on;

  data.push(cols);

  return data;
};

module.exports = userData;
