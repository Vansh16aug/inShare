const bcrypt = require('bcrypt');

bcrypt.compare('test2', '$2b$13$Z3SHZRHqVBh1idjwm0woS.FzW5SQfWzkjKhGej4.PPY7GW8ivhdWe', (err, hashedPass) => {
	if (err) throw err;
	console.log(hashedPass);
})