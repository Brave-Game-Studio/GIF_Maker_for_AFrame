var canvas = null;
var context = null;
var screenWidth = 1280;
var screenHeight = 720;
var gifImageDelay = 500;
var totalNumberOfImages = 1;
var encoder = new GIFEncoder();
var imageAsBase64 = null;
var showProgress = false;//<<set this if you want to see progress via console

function gifMaker_SetParameters( imageWidth, imageHeight, imageDelay, numberOfImages ){
	screenWidth = imageWidth;
	screenHeight = imageHeight;
	gifImageDelay = imageDelay;
	totalNumberOfImages = numberOfImages;
}

function gifMaker_CreateAnimatedGif_WithFiles(dir, callback){
	setupWorkingCanvas();
	encoder.setDelay(gifImageDelay);
	add_imageAsFiles(dir, 1, totalNumberOfImages, callback);//this will step through each image from temp_img_(1).png to temp_img_(n).png, where n=totalNumberOfImages
}

function gifMaker_CreateAnimatedGif_WithCanvas(canvasCreateFunction, callback){
	setupWorkingCanvas();
	encoder.setDelay(gifImageDelay);//this is for the processing delay that occurs
	add_imageAsCanvas(canvasCreateFunction, 1, totalNumberOfImages, callback);//this will step through each image from temp_img_(1).png to temp_img_(n).png, where n=totalNumberOfImages
}

function setupWorkingCanvas(){
	
	canvas = document.createElement("canvas");
	canvas.id = "bitmap";
	canvas.style.visibility = "hidden";
	canvas.style.position = "absolute";
	canvas.width = screenWidth;
	canvas.height = screenHeight;
	context = canvas.getContext('2d');
	context.fillStyle = "rgb(255,255,255)";  
	context.fillRect(0,0,canvas.width, canvas.height); //GIF can't do transparent so do white

	encoder.setRepeat(0); //auto-loop
	encoder.setSize(screenWidth,screenHeight);
	encoder.start();
}

function doEncoding(callback){//sets base64 var
	if(showProgress){
		console.log("Image decoding...");
	}
	encoder.finish();
	imageAsBase64 = 'data:image/gif;base64,'+encode64(encoder.stream().getData());
	canvas.remove();//tidy up element, we don't need it any more
	if(showProgress){
		console.log("Calling callback if present");
	}
	callback();
}

function gifMaker_SaveToFile( fileName ){//save to file (downloads) given file name
	var link = document.querySelector("#gifDownloadLink");
	if(!link){//make the link if it doesn't exist
		link = document.createElement("a");
		link.id = "gifDownloadLink";
	}
    document.body.appendChild(link); // for Firefox
    link.setAttribute("href", imageAsBase64);
    link.setAttribute("download", fileName);
    link.click();
}

function add_imageAsFiles( dir, imageNumber, maxImage, callback )
{
  if(showProgress){
	console.log("processing Image: " + imageNumber);
  }
  base_image = new Image();
  base_image.src = dir + 'temp_img_(' + imageNumber + ').png';
  base_image.onload = function(){
    context.drawImage(base_image, 0, 0);//does NOT scale image to fit canvas, images are expected to be the same as stated in parameters
	encoder.addFrame(context);
	if (imageNumber < maxImage){
		add_imageAsFiles(dir, imageNumber + 1, maxImage, callback);
	}else{
		doEncoding(callback);
	}
  }
}

function add_imageAsCanvas( canvasCreateFunction, imageNumber, maxImage, callback )
{
  if(showProgress){
	console.log("processing Image: " + imageNumber);
  }
  base_image = new Image();
  canvas =  canvasCreateFunction()
  base_image.src = canvas.toDataURL();//converts the 2D image to image we can use for processing
  
  base_image.onload = function(){
	context.fillRect(0,0,canvas.width, canvas.height); 
    context.drawImage(base_image, 0, 0, screenWidth, screenHeight);//scales to fit screen
	encoder.addFrame(context);
	if (imageNumber < maxImage){
		setTimeout(function(){add_imageAsCanvas(canvasCreateFunction, imageNumber + 1, maxImage, callback);}, gifImageDelay);
	}else{
		doEncoding(callback);
	}
  }
}