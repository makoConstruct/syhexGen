/* author: mako yass */

/* note: depends Wellrng.js   https://github.com/gmalysa/well-rng */
function newWell(seed){
	var star = new Array(32);
	for(var i=0; i<32; ++i){
		var cell = ((seed&(i*5)) ^ (seed>>i)); //this is all kind of arbitrary, but you'd be surprised how many methods didn't successfully initialize the rng.
		star[i] = cell & cell;} //[converts to int32]
	star[0] = seed;
	return new WELL(star);
}
/* parenthetical: (We don't need a secure hash, we just need a standard hash that can be repeated in a C environment. If someone could whip up a shoddier more efficient psuedohash that works the same as a minimal add, multiply and modulo psuedohash in C, that'd be appreciated.) */



/*//usage examples:
  canvas = document.createElement('canvas');
  canvas.width = canvas.height = 120 or whatever;
  var con = canvas.getContext('2d');

   drawHexFace(con, 38925732, 'rgb(255,255,255)', 'rgb(68,68,68)')

  or like,

  con.fillStyle = '#ffffff'
   pathHexFace(con, 9405)
  con.fill();
*/



var hexfaces_root3over4 = Math.sqrt(3/4);
var hexfaces_outerOverInner = Math.sqrt(5/4);

function drawHexFace(con, seed, iconFillStyle, circleFillStyle, innerProportion){ //draws one over a circle, where radius of the inner icon = (radius of circle)*innerProportion. innerProportion is optional and defaults to 0.8.
	var scaleFactor = innerProportion || 0.75;
	var circShade = 67;
	var wi = con.canvas.width;
	var hi = con.canvas.height;
	var ra = wi < hi ? wi/2 : hi/2;
	var swi = wi*scaleFactor;
	var shi = hi*scaleFactor;
	var sx = (wi - swi)/2;
	var sy = (hi - shi)/2;
	con.fillStyle = circleFillStyle;
	con.beginPath();
	con.arc(wi/2, hi/2, ra, 0, Math.PI*2);
	con.fill();
	con.fillStyle = iconFillStyle;
	pathHexFace(con, seed, sx, sy, swi, shi);
	con.fill();
}

function pathHexFace(con, seed, xin, yin, wi, hi){ //paths a centered maximized 5*5 face. You do the filling.  xin, yin, wi and hi specify the dimensions of the hexface on the canvas and are optional, default to being centered and maximized in the canvas context.
	var w = 5, h = 5, padding = 0; //you can change/parametize these if you like. Note, w must be an odd number.
	wi = wi || con.canvas.width;
	hi = hi || con.canvas.height;
	xin = xin || 0;
	yin = yin || 0;
	var widthOverHeight = ((w-1)*hexfaces_root3over4 + 1/hexfaces_outerOverInner)/(h-1 + 1/hexfaces_outerOverInner);
	var span = ((wi < hi*widthOverHeight)?wi:hi*widthOverHeight);
	var hexradius =
		span/(2*(w-1)*hexfaces_root3over4 + 2); // ': (w-1)*hexradius*2*hexfaces_root3over4 + hexradius*2 == span
	var katy = newWell(seed ^ 666);
	var x = xin + wi/2 - Math.floor(w/2)*2*hexradius*hexfaces_root3over4;
	var y = yin + hi/2 - (h-1)*hexradius /*which is the top cell in the glyph*/ + hexradius*Math.floor(w/2);
	
	//make syhexSpec from seed
	
	// var presents = katy.randBits(32);
	// var bitsTaken = 0;
	var takeRBit = function(){
		return katy.randInt(0,1);
		// if(bitsTaken == 31){
		// 	bitsTaken = 0;
		// 	presents = katy.randBits(32);
		// }
		// return 1 & (presents >> (bitsTaken++));
	};
	var off = Math.floor(w/2);
	spec = new Array((h-off)*(off+1) + (off*(off+1))/2);
	var counter=0;
	do{
		if(++counter > 9000)
			throw "something's wrong. katy isn't generating any valid candidates.";
		for(var i=0; i<spec.length; ++i)
			spec[i] = takeRBit();
		var topHasSomething = false;
		var bottomHasSomething = false;
		for(var i=0, col=h-off; i<spec.length; i += (col++)){
			if(spec[i] == 1){
				topHasSomething = true;
				break;
			}
		}
		for(var i=h-off-1, col=h-off; i<spec.length; i += (++col)){
			if(spec[i] == 1){
				bottomHasSomething = true;
				break;
			}
		}
	}while(!topHasSomething || !bottomHasSomething);
	
	//make sheet from spec
	var sheet = new Array(w*h);
	var arms = Math.ceil(w/2);
	var lXStart = 0;
	var lYStart = 0;
	var columnLength = h - (arms-1);
	var rXStart = w-1;
	var rYStart = arms-1;
	var specc = 0;
	while(arms > 0){
		for(var d=0; d<columnLength; ++d){
			if(spec[specc++] == 1){
				sheet[lXStart + (lYStart+d)*w] = 1;
				if(lXStart != rXStart)
					sheet[rXStart + (rYStart+d)*w] = 1;
			}
		}
		--arms;
		
		++lXStart;
		++columnLength;
		--rXStart;
		--rYStart;
	}
	
	//draw the sheet
	con.beginPath();
	var circ = function(x,y){
		con.arc(x,y,hexradius/hexfaces_outerOverInner,0,Math.PI*2,true);
		con.closePath();
	}
	// var hex = function(x,y){ //like circ, only has sharp corners.
	// 	con.moveTo(x, y + hexradius);
	// 	con.lineTo(x - hexradius*hexfaces_root3over4, y + hexradius/2);
	// 	con.lineTo(x - hexradius*hexfaces_root3over4, y - hexradius/2);
	// 	con.lineTo(x, y - hexradius);
	// 	con.lineTo(x + hexradius*hexfaces_root3over4, y - hexradius/2);
	// 	con.lineTo(x + hexradius*hexfaces_root3over4, y + hexradius/2);
	// 	con.closePath();
	// }
	var ulf = function(ox,oy){
		var xsp = hexradius/hexfaces_outerOverInner/2;
		var ysp = hexradius/hexfaces_outerOverInner *hexfaces_root3over4;
		con.moveTo(ox-xsp, oy+ysp);
		con.lineTo(ox+xsp, oy-ysp);
		con.lineTo(ox-hexradius*2*hexfaces_root3over4+xsp, oy-hexradius-ysp);
		con.lineTo(ox-hexradius*2*hexfaces_root3over4-xsp, oy-hexradius+ysp);
		con.closePath();
	};
	var uf = function(ox,oy){
		var xsp = hexradius/hexfaces_outerOverInner;
		con.moveTo(ox-xsp, oy);
		con.lineTo(ox+xsp, oy);
		con.lineTo(ox+xsp, oy-hexradius*2);
		con.lineTo(ox-xsp, oy-hexradius*2);
		con.closePath();
	};
	var blf = function(ox,oy){
		var xsp = hexradius/hexfaces_outerOverInner/2;
		var ysp = hexradius/hexfaces_outerOverInner *hexfaces_root3over4;
		con.moveTo(ox+xsp, oy+ysp);
		con.lineTo(ox-xsp, oy-ysp);
		con.lineTo(ox-hexradius*2*hexfaces_root3over4-xsp, oy+hexradius-ysp);
		con.lineTo(ox-hexradius*2*hexfaces_root3over4+xsp, oy+hexradius+ysp);
		con.closePath();
	};
	var hexAt = function(ix,iy){
		if( /*excuse the unterse style, my chrome has a bug*/
			ix < 0 || ix >= w ||
			iy < 0 || iy >= h)
				return false;
			else
				return sheet[ix + iy*w] == 1;
	}
	var toCanv = function(ix,iy){
		return [
			x + ix*hexfaces_root3over4*hexradius*2,
			y + iy*hexradius*2 - ix*hexradius
		];
	}
	for(var xi=0; xi<w; ++xi){
		for(var yi=0; yi<h; ++yi){
			//each cell here draws a line to the cells on its left and top iff those cells are lit.
			if(hexAt(xi,yi)){
				var l = toCanv(xi,yi);
				circ(l[0], l[1]);
				if(hexAt(xi+0, yi-1)){
					uf(l[0],l[1]);
				}
				if(hexAt(xi-1, yi+0)){
					blf(l[0],l[1]);
				}
				if(hexAt(xi-1, yi-1)){
					ulf(l[0],l[1]);
				}
			}
		}
	}
}
