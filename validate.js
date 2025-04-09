const bcrypt = require('bcrypt');

const hash = '$2b$12$07gUcDcL2RmxvdG1HnczauDWSfMv52gEacE0U4knURuSIPOiC2vvG';
const password = 'hj13ke2ram2CODE';

bcrypt.compare(password, hash).then((result) => {
  console.log(result ? '✅ Match!' : '❌ No match.');
});
