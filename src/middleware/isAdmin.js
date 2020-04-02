const jwt = require('jsonwebtoken');
const pool = require('../db/database');

// Authentication for loggedIn Admin only
const Admin = {

  // eslint-disable-next-line consistent-return
  async verifyAdminToken(req, res, next) {
    // eslint-disable-next-line no-console
    try {
      if (!req.headers.authorization) {
        throw Error;
      }
      const token = req.headers.authorization.split(' ')[1];
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      const { teamId } = decodedToken;

      const { rows } = await pool.query('SELECT * FROM users WHERE users.team_id = $1 AND remember_token = $2', [teamId, token]);

      if (!rows) {
        return res.status(401).send({ status: 'error', error: 'Invalid Request' });
      }

      if (rows[0].remember_token === null) {
        return res.status(401).send({ status: 'error', error: 'Unauthorized' });
      }
      const dBToken = jwt.verify(rows[0].remember_token, process.env.JWT_SECRET);
      if (dBToken.teamId !== decodedToken.teamId) {
        return res.status(401).send({ status: 'error', error: 'Invalid Request' });
      }

      if (rows[0].role_id !== 1) {
        return res.status(401).send({ status: 'error', error: 'Not Authorized You are not an Admin' });
      }

      req.token = token;
      req.user = { ID: decodedToken.teamId };
      next();
    } catch (error) {
      // eslint-disable-next-line no-console
      return res.status(401).json({
        status: 'error',
        error: 'Invalid Request or User not Authorized',
      });
    }
  },

};


module.exports = Admin;
