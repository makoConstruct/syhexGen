/* author: mako yass */

imul = Math.imul || function imul(a, b) {
  var ah  = (a >>> 16) & 0xffff;
  var al = a & 0xffff;
  var bh  = (b >>> 16) & 0xffff;
  var bl = b & 0xffff;
  // the shift by 0 fixes the sign on the high part
  // the final |0 converts the unsigned value into a signed value
  return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0)|0);
}

function perfectLCG(v){
	return (imul(v,1121) + 2451) % 3136;
}
function faceSpecFromNumber(n){ //returns a facespec
	var middles = n & ((1 << 6) - 1);
	n = n >> 6;
	var topline = (n % 7) + 1;
	n = ((n|0) / 7)|0;
	var bottomline = (n) + 1;
	function bit(m,n){return (m>>n)&1}
	return [
		bit(topline,0), bit(middles,0), bit(bottomline,0), 
		bit(topline,1), bit(middles,1), bit(middles,2), bit(bottomline,1), 
		bit(topline,2), bit(middles,3), bit(middles,4), bit(middles,5), bit(bottomline,2)
	];
}



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
var cellsAcross = 5; var cellsDown = 5;

function drawHexFace(con, spec, iconFillStyle, circleFillStyle, innerProportion){ //draws one over a circle, where radius of the inner icon = (radius of circle)*innerProportion. innerProportion is optional and defaults to 0.8.
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
	if(spec instanceof Array){
		pathHexFaceFromSpec(con, spec, sx, sy, swi, shi);
	}else{
		pathHexFace(con, spec, sx, sy, swi, shi);
	}
	con.fill();
}

function pathHexFace(con, seed, xin, yin, wi, hi){ //paths a centered maximized 5*5 face. You do the filling.  xin, yin, wi and hi specify the dimensions of the hexface on the canvas and are optional, default to being centered and maximized in the canvas context.
	var wi = wi || con.canvas.width;
	var hi = hi || con.canvas.height;
	var xin = xin || 0;
	var yin = yin || 0;
	pathHexFaceFromSpec(con, faceSpecFromNumber(perfectLCG(seed^666)), xin, yin, wi, hi); //Don't ask me why I'm doing the xor, it just seems to yeild better icons.
}

function pathHexFaceFromSpec(con, spec, xin, yin, wi, hi){ //allows to specify the icon, a spec is a column major array of the cells of the left side of the hex, 1 for filled, 0 for empty
	//make sheet from spec
	var wi = wi || con.canvas.width;
	var hi = hi || con.canvas.height;
	var xin = xin || 0;
	var yin = yin || 0;
	var sheet = new Array(cellsAcross*cellsDown);
	var arms = Math.ceil(cellsAcross/2);
	var lXStart = 0;
	var lYStart = 0;
	var columnLength = cellsDown - (arms-1);
	var rXStart = cellsAcross-1;
	var rYStart = arms-1;
	var specc = 0;
	while(arms > 0){
		for(var d=0; d<columnLength; ++d){
			if(spec[specc++] == 1){
				sheet[lXStart + (lYStart+d)*cellsAcross] = 1;
				if(lXStart != rXStart)
					sheet[rXStart + (rYStart+d)*cellsAcross] = 1;
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
	var widthOverHeight = ((cellsAcross-1)*hexfaces_root3over4 + 1/hexfaces_outerOverInner)/(cellsDown-1 + 1/hexfaces_outerOverInner);
	var span = ((wi < hi*widthOverHeight)?wi:hi*widthOverHeight);
	var hexradius =
		span/(2*(cellsAcross-1)*hexfaces_root3over4 + 2); // ': (cellsAcross-1)*hexradius*2*hexfaces_root3over4 + hexradius*2 == span
	var x = xin + wi/2 - Math.floor(cellsAcross/2)*2*hexradius*hexfaces_root3over4;
	var y = yin + hi/2 - (cellsDown-1)*hexradius /*which is the top cell in the glyph*/ + hexradius*Math.floor(cellsAcross/2);
	var circ = function(x,y){
		con.arc(x,y,hexradius/hexfaces_outerOverInner,0,Math.PI*2,true);
		con.closePath();
	}
	// var circ = function(x,y){ //like a circle, but with 6 sharp corners.
	// 	con.moveTo(x, y + hexradius);
	// 	con.lineTo(x + hexradius*hexfaces_root3over4, y + hexradius/2);
	// 	con.lineTo(x + hexradius*hexfaces_root3over4, y - hexradius/2);
	// 	con.lineTo(x, y - hexradius);
	// 	con.lineTo(x - hexradius*hexfaces_root3over4, y - hexradius/2);
	// 	con.lineTo(x - hexradius*hexfaces_root3over4, y + hexradius/2);
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
			ix < 0 || ix >= cellsAcross ||
			iy < 0 || iy >= cellsDown)
				return false;
			else
				return sheet[ix + iy*cellsAcross] == 1;
	}
	var toCanv = function(ix,iy){
		return [
			x + ix*hexfaces_root3over4*hexradius*2,
			y + iy*hexradius*2 - ix*hexradius
		];
	}
	for(var xi=0; xi<cellsAcross; ++xi){
		for(var yi=0; yi<cellsDown; ++yi){
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
