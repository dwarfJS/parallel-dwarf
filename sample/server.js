var connect = require('connect');

connect()
	.use(connect.static('./'))
	.listen(3000);