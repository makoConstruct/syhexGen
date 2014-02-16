*interactive example*: [syhexGen](http://makopool.com/syhexGen.html)

*note*: depends Wellrng.js, get as rng.js from https://github.com/gmalysa/well-rng

(*parenthetically*: We don't need a secure hash, we just need a standard hash that can be repeated in a C environment. If someone could whip up a shoddier more efficient psuedohash that works the same in javascript as a minimal add, multiply and modulo psuedohash in C, that'd be appreciated.)


	//usage examples:
	canvas = document.createElement('canvas');
	canvas.width = canvas.height = 120 or whatever;
	var seed = some number, this determines which face you get;
	var con = canvas.getContext('2d');
	
	drawHexFace(con, seed, 'rgb(255,255,255)', 'rgb(68,68,68)')
	
or like,

	con.fillStyle = '#ffffff'
	pathHexFace(con, seed)
	con.fill();
