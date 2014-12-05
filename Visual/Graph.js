/**
  @author Maria Alejandra Montenegro

  Implementation of a graph structure.
  Consists of Graph, Nodes and Edges.
**/

function Graph()
{
	this.nodeSet = {};
	this.nodes = [];
	this.edges = [];
	this.layout; //type of graph
	
}

function Node(node_id)
{
  this.id = node_id;
  this.isSet = false;
  this.weight = 0;
  this.nodesTo = [];
  this.nodesFrom = [];
  this.position = {};
  this.data = {};
}

function Edge(source, target)
{
  this.source = source;
  this.target = target;
  this.data = {};
}

//-----
//Add dynamically to the already defined object a new getter
Graph.prototype.addNode = function(node) 
{
	if(this.nodeSet[node.id] == undefined)
	{
		 this.nodeSet[node.id] = node;
    	this.nodes.push(node);
		return true;
	}
	console.log("dd");
	return false;
};

Graph.prototype.getNode = function(node_id) 
{
  return this.nodeSet[node_id];
};

Graph.prototype.addEdge = function(source, target)
{
  if(source.addConnectedTo(target) === true) 
  {
	target.addConnectedFrom(source);
    var edge = new Edge(source, target);
    this.edges.push(edge);
    return true;
  }
  return false;
};

//--------
//node functions
Node.prototype.updateWeight = function(w)
{
	this.weight += w;
};
Node.prototype.addConnectedTo = function(node)
{
  if(this.connectedTo(node) === false)  //doenst already exist
  {
    this.nodesTo.push(node);
    return true;
  }
  return false;
};

Node.prototype.connectedTo = function(node)
{
  for(var i=0; i < this.nodesTo.length; i++) {
    var connectedNode = this.nodesTo[i];
    if(connectedNode.id == node.id) {
      return true;
    }
  }
  return false;
};
Node.prototype.addConnectedFrom = function(node)
{
  if(this.connectedFrom(node) === false)  //doenst already exist
  {
    this.nodesFrom.push(node);
    return true;
  }
  return false;
};

Node.prototype.connectedFrom = function(node)
{
  for(var i=0; i < this.nodesFrom.length; i++) {
    var connectedNode = this.nodesFrom[i];
    if(connectedNode.id == node.id) {
      return true;
    }
  }
  return false;
};


Node.prototype.draw = function(parent)
{
	var geometry = new THREE.SphereGeometry( 5, 15, 15 );
	var material = new THREE.MeshBasicMaterial( { color: Math.random() * 0xf0ffff, opacity: 0.7  } );
    var draw_obj = new THREE.Mesh( geometry, material );
	
	draw_obj.position.x = this.position.x;
	draw_obj.position.y = this.position.y;
	draw_obj.position.z = this.position.z;
	var textOpt = ["20pt", "", ""];
	
	if(this.data.name === undefined)
	{
		var label = new THREE.Label("temp label", textOpt);	
	}
	else{
		var label = new THREE.Label(this.data.name, textOpt);	
	}
	
	label.position.x = draw_obj.position.x;
  	label.position.y = draw_obj.position.y - 20;
	label.position.z = draw_obj.position.z;
	
	this.data.label_object = label;
	parent.add( this.data.label_object );
	
	draw_obj.name = this.data.title;
	draw_obj.id   = this.id;
	this.data.draw_obj  = draw_obj;
	this.position       = draw_obj.position;
	
	parent.add(this.data.draw_obj );
		
};

//Edge functions
Edge.prototype.drawLine = function(parent, geometries)
{
	var parameters = parameters || {};
	
	material = new THREE.LineBasicMaterial({ color: 0xff0000, opacity: 1, linewidth: 1.5 });
	var geometry = new THREE.Geometry();
	geometry.vertices.push(this.source.position);
	geometry.vertices.push(this.target.position);

	line = new THREE.Line( geometry, material, THREE.LinePieces );
	line.scale.x = line.scale.y = line.scale.z = 1;
	line.originalScale = 1;
	geometries.push(geometry);

	parent.add( line );
};

Edge.prototype.drawCurve = function(parent, geometries, curveRad)
{
	var parameters = parameters || {};
	var SUBDIVISIONS = 60;
	if(curveRad == null) 
		curveRad = 0;//-0.1;
	
	var mid = new THREE.Vector3();
	mid.x = (this.target.position.x + this.source.position.x )/2 * curveRad;
	mid.y = (this.target.position.y + this.source.position.y )/2 * curveRad;
	mid.z = (this.target.position.z + this.source.position.z )/2 * curveRad;

	material  = new THREE.LineBasicMaterial({ color: 0xff0000, opacity: 1, linewidth: 1.5 });
	var curve = new THREE.QuadraticBezierCurve3();
	curve.v0 = new THREE.Vector3(this.source.position.x, this.source.position.y, this.source.position.z);
	curve.v1 = mid;
	curve.v2 = new THREE.Vector3(this.target.position.x, this.target.position.y, this.target.position.z);
	
	var cp = new THREE.CurvePath();
    cp.add(curve);	
	line = new THREE.Line(cp.createPointsGeometry(SUBDIVISIONS), material);
	
	parent.add(line);
};