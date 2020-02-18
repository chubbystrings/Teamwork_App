const he = require('he');

const Sanitize = {

  encode(content) {
    const cleanContent = he.encode(content);

    return cleanContent;
  },

  decode(content) {
    const originalContent = he.decode(content);
    return originalContent;
  },
};

module.exports = Sanitize;
