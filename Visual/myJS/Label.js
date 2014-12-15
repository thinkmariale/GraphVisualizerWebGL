/**
  Original @author David Piegza
  Estented by @author Maria Alejandra Montenegro

  Implements a label for an object.

  It creates an text in canvas and sets the text-canvas as
  texture of a cube geometry.

  Parameters:
  text: <string>, text of the label

  Example:
  var label = new THREE.Label("Text of the label");
  label.position.x = 100;
  label.position.y = 100;
  scene.addObject(label);
 */

THREE.Label = function(text, parameters) {
  var parameters = parameters || {};

  var labelCanvas = document.createElement( "canvas" );

  function create() {
    var xc = labelCanvas.getContext("2d");
	if(parameters[0] === undefined)
		var fontsize = "40pt";
	else fontsize = parameters[0];
	  
    // set font size to measure the text
    xc.font = fontsize + " Arial";
    var len = xc.measureText(text).width ;

    labelCanvas.setAttribute('width', len);
    // set font size again cause it will be reset
    // when setting a new width
    xc.font = fontsize + " Arial";
    xc.textBaseline = 'top';
	xc.fillStyle = 'white';
    xc.fillText(text, 0, 0);

    var geometry = new THREE.BoxGeometry(len, 60, 0);
    var xm = new THREE.MeshBasicMaterial({map: new THREE.Texture(labelCanvas), transparent: true});
    xm.map.needsUpdate = true;

    // set text canvas to cube geometry
    var labelObject = new THREE.Mesh(geometry, xm);
	  labelObject.width = len;
    return labelObject;
  }

  return create();
}
