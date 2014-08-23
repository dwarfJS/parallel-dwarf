var connect = require('connect'),
	compression = require('compression');

connect()
	.use(compression())
	.use(connect.static('./'))
	.listen(3000);