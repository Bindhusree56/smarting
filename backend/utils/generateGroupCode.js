// Generates a short, human-friendly, unique SHG group code e.g. "SHG-7K3F9A"
const Group = require('../models/Group');

const randomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no O/0/I/1 to avoid confusion
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `SHG-${code}`;
};

const generateGroupCode = async () => {
  let code;
  let exists = true;
  while (exists) {
    code = randomCode();
    exists = await Group.exists({ code });
  }
  return code;
};

module.exports = generateGroupCode;
