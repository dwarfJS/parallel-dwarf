define('./main', function (require, exports, module) {
    module.exports = {
    	init: function () {
    		document.getElementById('test').innerHTML = 'Hello ';
    	},
    	render: function (data) {
    		document.getElementById('test').innerHTML += data.name;
    		console.log(performance.now() - T[0]);
    	}
    }
})