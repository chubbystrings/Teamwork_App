// const uuid4 = require('uuid/v4');
const jwt = require('jsonwebtoken');
const pool = require('../db/database');
const Validation = require('../middleware/validation/userValidation');
const userData = require('../models/userModel');

// const uuid = uuid4();


// create User Controller
exports.addUser = async (request, response) => {
  // eslint-disable-next-line no-console
  try {
    const {
      roleId, firstName, lastName, email, password, gender, jobRole, department, address,
    } = request.body;

    const now = new Date();
    const upperFirstName = firstName.toUpperCase();
    const upperLastName = lastName.toUpperCase();

    // Validate user data
    if (!roleId || !firstName || !lastName || !gender || !jobRole || !department || !address) {
      return response.status(400).send({
        status: 'error',
        error: 'field cannot be empty',
      });
    }

    if (!Validation.userDataValidation(roleId, gender, jobRole, department, address)) {
      return response.status(400).send({
        status: 'error',
        error: 'invalid request, one or more field has wrong data type',
      });
    }

    if (!Validation.checkForChar(firstName) || !Validation.checkForChar(lastName)) {
      return response.status(400).send({ status: 'error', error: 'No characters allowed' });
    }

    if (!email || !password) {
      return response.status(400).send({ status: 'error', error: 'Some values are missing' });
    }

    if (!Validation.passwordLength(password.length)) {
      return response.status(400).send({ status: 'error', error: 'Password is too short' });
    }

    if (!Validation.isValidEmail(email)) {
      return response.status(400).send({ status: 'error', error: 'Please enter a valid email address' });
    }
    const hashPassword = Validation.hashPassword(password);

    // INsert validated data into database
    const { rows, rowCount } = await pool.query('INSERT INTO users (user_id, role_id, first_name, last_name, email, password, gender, job_role, department, address, created_on) VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10) returning *', [roleId, upperFirstName, upperLastName, email, hashPassword, gender, jobRole, department, address, now]);
    if (!rows || rowCount === 0) {
      return response.status(401).send({ status: 'error', error: 'invalid request' });
    }

    const token = Validation.generateToken(rows[0].team_id);

    return response.status(201).json({
      status: 'success',
      data: {
        message: 'user account successfully created',
        token,
        userId: rows[0].team_id,
      },
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    if (e.routine === '_bt_check_unique') {
      return response.status(409).send({ status: 'error', error: 'email already exist' });
    }

    return response.status(500).send({ status: 'error', error: e });
  }
};


// login controller
exports.loginUser = async (request, response) => {
  const { email, password } = request.body;
  const now = new Date();

  // validate email/password
  if (!email || !password) {
    return response.status(400).send({ error: 'Some values are missing' });
  }
  try {
    // find user with email and password in database

    const { rows, rowCount } = await pool.query('SELECT * FROM users WHERE users.email = $1', [email]);

    if (!rows || rowCount === 0) { return response.status(401).json({ status: 'error', error: 'email or password is incorrect' }); }

    if (!Validation.comparePassword(rows[0].password, password)) {
      return response.status(401).send({ status: 'error', error: ' email or password is incorrect' });
    }

    // generate token and store in database
    const token = Validation.generateToken(rows[0].team_id);

    const resultData = await pool.query('UPDATE users SET remember_token = $1, updated_on = $2 WHERE team_id = $3 returning *', [token, now, rows[0].team_id]);

    const payload = jwt.decode(token);
    const { exp } = payload;
    // eslint-disable-next-line no-console

    return response.status(200).send({
      status: 'success',
      data: {
        token,
        userId: resultData.rows[0].team_id,
        role: resultData.rows[0].role_id === 1 ? 'admin' : 'employee',
        firstName: resultData.rows[0].first_name,
        lastName: resultData.rows[0].last_name,
        email: resultData.rows[0].email,
        darkMode: rows[0].dark_mode,
        expirationTime: exp,
      },
    });
  } catch (error) {
    return response.status(500).send({ status: 'error', error });
  }
};


// logout controller
exports.logoutUser = async (request, response) => {
  try {
    const now = new Date();
    const { rows } = await pool.query('SELECT * FROM users WHERE team_id = $1', [request.user.ID]);

    if (!rows) {
      return response.status(500).send({ status: 'error', error: 'Invalid request' });
    }
    const data = await pool.query('UPDATE users SET remember_token = $1, updated_on = $2 WHERE team_id = $3 returning *', [null, now, rows[0].team_id]);
    if (!data.rows || data.rowCount === 0) {
      return response.status(401).send({ status: 'error', error: 'invalid request' });
    }
    return response.status(200).send({
      status: 'success',
      data: {
        message: 'logged Out',
      },

    });
  } catch (error) {
    return response.status(500).send({ status: 'error', error });
  }
};

exports.getAllUsers = async (request, response) => {
  try {
    const { rows } = await pool.query('SELECT team_id as userid, first_name as firstName, last_name as lastName, email, users.role_id as roleId, created_on as createdOn, is_active as isActive, role.role_name as role FROM users LEFT JOIN role ON users.role_id = role.role_id');

    if (!rows) {
      return response.status(500).send({ error: 'Invalid request' });
    }

    // rearrange user data to be displayed on request
    return response.status(200).send({
      status: 'Successful',
      data: rows,
    });
  } catch (error) {
    return response.status(500).send({ error: 'invalid request' });
  }
};

exports.getUser = async (request, response) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE team_id = $1', [request.user.ID]);

    if (!rows) {
      return response.status(500).send({ error: 'Invalid request' });
    }

    // rearrange user data to be displayed on request
    const data = userData(rows);
    return response.status(200).json({ data });
  } catch (error) {
    return response.status(500).send({ error: 'invalid request' });
  }
};

exports.darkMode = async (request, response) => {
  // eslint-disable-next-line no-console
  const { mode } = request.body;
  if (mode === '') {
    return response.status(400).send({
      status: 'error',
      error: 'request body missing',
    });
  }

  if (typeof (mode) !== 'boolean') {
    return response.status(400).send({
      status: 'error',
      error: 'request body type error',
    });
  }


  try {
    const { rows, rowCount } = await pool.query('UPDATE users SET dark_mode = $1 WHERE team_id = $2 returning *', [mode, request.user.ID]);

    if (!rows || rowCount === 0) {
      return response.status(404).send({
        status: 'error',
        error: 'user not found',
      });
    }

    return response.status(200).send({
      status: 'Successful',
      data: {
        message: 'update successfully updated',
        darkMode: rows[0].dark_mode,
      },
    });
  } catch (error) {
    return response.status(501).send({
      status: 'error',
      error,
    });
  }
};

exports.isActive = async (request, response) => {
  const { userId, active } = request.body;

  if (!userId || active === '') {
    return response.status(400).send({
      status: 'error',
      error: 'a userid and active is required',
    });
  }

  if (typeof (active) !== 'boolean') {
    return response.status(400).send({
      status: 'error',
      error: 'active type error must be boolean',
    });
  }
  try {
    const { rows, rowCount } = await pool.query('UPDATE users SET is_active = $1 WHERE team_id = $2 returning *', [active, userId]);
    if (!rows || rowCount === 0) {
      return response.status(500).send({
        status: 'error',
        error: 'server error not implemnted',
      });
    }

    return response.status(200).send({
      status: 'successful',
      data: {
        message: 'Updated successfully',
      },
    });
  } catch (error) {
    return response.status(501).send({
      status: 'error',
      error,
    });
  }
};

exports.deleteUser = async (request, response) => {
  const userId = request.params.userid;

  if (!userId) {
    return response.status(400).send({
      status: 'error',
      error: 'Please provide userid as parameter',
    });
  }
  try {
    const { rows, rowCount } = await pool.query('DELETE FROM users WHERE team_id = $1 returning *', [userId]);

    if (!rows || rowCount === 0) {
      return response.staus(404).send({
        status: 'error',
        error: 'No user found',
      });
    }

    return response.status(200).send({
      status: 'Successful',
      data: {
        message: 'Deleted Successfully',
      },
    });
  } catch (error) {
    return response.status(500).send({
      status: 'error',
      error,
    });
  }
};

exports.deleteMany = async (request, response) => {
  if (!request.query.ids) {
    return response.status(400).send({
      status: 'error',
      error: 'Bad request no query parameter',
    });
  }
  try {
    const select = 'DELETE FROM users WHERE team_id IN';
    const userIds = `(${request.query.ids})`;
    const final = `${select.concat(userIds)} returning*`;
    const { rows, rowCount } = await pool.query(final);

    if (!rows || rowCount === 0) {
      return response.status(400).send({
        status: 'error',
        error: 'No users found',
      });
    }

    return response.status(200).send({
      status: 'Successful',
      data: {
        message: 'Deleted Successfully',
      },
    });
  } catch (error) {
    return response.status(500).send({
      status: 'error',
      error,
    });
  }
};
