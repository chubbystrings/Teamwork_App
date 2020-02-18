const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const Validation = {

  hashPassword(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
  },

  comparePassword(hashPassword, password) {
    return bcrypt.compareSync(password, hashPassword);
  },

  passwordLength(passwordLength) {
    return passwordLength >= 7;
  },

  isValidEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
  },

  generateToken(id) {
    const token = jwt.sign({
      teamId: id,
    },
    process.env.JWT_SECRET, { expiresIn: '6h' });
    return token;
  },

  hidePrivateData(user) {
    const rows = { ...user };
    delete rows[0].password;
    if (rows[0].remember_token) {
      delete rows[0].remember_token;
    }
    return rows;
  },

  checkForChar(field) {
    const char = /^[a-zA-Z]+$/;
    if (char.test(field)) {
      return true;
    }
    return false;
  },
  userDataValidation(roleId, gender, jobRole, department, address) {
    if (!/^[0-9]+$/.test(roleId)) {
      return false;
    }
    if (!/^[a-zA-Z]+$/.test(gender)) {
      return false;
    }
    if (!/^[a-z\sA-Z]+$/.test(jobRole)) {
      return false;
    }
    if (!/^[a-zA-Z]+$/.test(department)) {
      return false;
    }
    if (address.length > 300) {
      return false;
    }
    if (!/^[0-9a-z\sA-Z]+$/.test(address)) {
      return false;
    }
    return true;
  },

};

module.exports = Validation;
