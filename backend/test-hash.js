const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('RongPlan2026!@#', 10);
console.log('HASH:', hash);
