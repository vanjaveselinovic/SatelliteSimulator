function satelliteIcon(params) {
	if (params === undefined) params = {};

	var size = params.size === undefined ? 100 : params.size,
	    line = size/15;

	if (params.outline === true) {
		var canvasOutline = document.createElement("canvas"),
		    ctx2d = canvasOutline.getContext("2d");
		    
		canvasOutline.width = size;
		canvasOutline.height = size;

		ctx2d.fillStyle = "rgb(0, 0, 0)";

		ctx2d.fillRect(0, size/3, size, size/3);

		ctx2d.fillRect(size/3, 0, size/3, size);

		ctx2d.beginPath();
		ctx2d.ellipse(size/2, line*2, size/6+line, size/6+line, Math.PI/2, 0, 2*Math.PI);
		ctx2d.fill();

		ctx2d.clearRect(0, 0, size, line);

		ctx2d.fillRect(size/3+line, 0, line*3, line*3);
	}

	var canvasMain = document.createElement("canvas");
	ctx2d = canvasMain.getContext("2d");
	canvasMain.width = size;
	canvasMain.height = size;

	ctx2d.fillStyle = "rgb(0, 128, 200)";

	ctx2d.fillRect(line, size/3+line, size-line*2, size/3-line*2);

	ctx2d.fillStyle = "rgb(200, 200, 200)";

	ctx2d.fillRect(size/3+line, line*4, size/3-line*2, size-line*6);

	ctx2d.beginPath();
	ctx2d.ellipse(size/2, line*2, size/6, size/6, Math.PI/2, 0, 2*Math.PI);
	ctx2d.fill();

	ctx2d.fillStyle = "rgb(128, 128, 128)";

	ctx2d.fillRect(size/3+line, size-line*2, size/3-line*2, line);

	ctx2d.clearRect(0, 0, size, line*2);

	ctx2d.fillRect(size/3+line*2, line, line, line);

	var canvasComposite = document.createElement("canvas");
	ctx2d = canvasComposite.getContext("2d");
	canvasComposite.width = size*2;
	canvasComposite.height = size*2;

	ctx2d.translate(size, -1*size/2);
	ctx2d.rotate(Math.PI/4);

	if (params.outline === true) ctx2d.drawImage(canvasOutline, size/2, size/2);
	ctx2d.drawImage(canvasMain, size/2, size/2);

	return canvasComposite;
}

var CanvasIcon = {
	Satellite: satelliteIcon
};