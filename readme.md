*interactive example*: [syhexGen](http://makopool.com/syhexGen.html)

*Parenthetical News*: There is no longer a dependency on WellRNG.js. We're now using a linear congruential generator for hashing seeds and producing facespecs from them (parameters: m=3136, c=1121, a=2451). This ensures that if you use your ids as the seed for each face, you wont have a single repetition prior to id number 3136. The period is as long as it possibly can be.
LCG functions are also astonishingly efficient. Not that that matters at all here.

	//usage examples:
	canvas = document.createElement('canvas');
	canvas.width = canvas.height = 120 or whatever;
	var seed = some number, this determines which face you get;
	var con = canvas.getContext('2d');
	
	drawHexFace(con, seed, 'rgb(255,255,255)', 'rgb(68,68,68)')
	
or like,

	con.fillStyle = '#rgb(120,120,120)'
	pathHexFace(con, seed)
	con.fill();

You can path a syhex according to a predetermined icon spec like this:

	pathHexFaceFromSpec(con, [1,1,1, 1,0,0,1, 1,0,0,0,1])

And
	
	drawHexFace(con, [1,1,1, 1,0,0,1, 1,0,0,0,1], 'rgb(255,255,255)', 'rgb(68,68,68)')
	
will also work.