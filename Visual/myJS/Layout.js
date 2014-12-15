/**
  @author Maria Alejandra Montenegro

  Implementation of graph layout structure.
  Consists of 
  random
  arc diagram
  Area Grouping
  Centralized Burst
  Centralized Ring
  Circular Ties
  Elliptical Impolsion
  Organic Rhizome
  Radial Convergence
  Radial Implosion
  Ramification
  Segmental Radical Convergence
  
**/

function Layout(graph, parent, options)
{
	var options = options || {};

	this.layout = options.layout || "random";
	this.attraction_multiplier = options.attraction || 5;
	this.repulsion_multiplier  = options.repulsion  || 0.75;
	this.numNodesCircumference = options.numCircum  || 50;
	this.graph  = graph;
	this.parent = parent;
	this.width  = options.width  || 200;
	this.height = options.height || 200;
	this.depth  = options.depth  || 200;
	 
	//function called
	this.curve = false;
	this.allLayouts = ["Random","SegRadialCov","RadialCov","RadialImp","CentralizedRing","Sphere"];
	this.currentLayout = this.allLayouts[0];
	this.isHelper = false;
	
	var callback_positionUpdated = options.positionUpdated;

	var EPSILON = 0.000001;
	var attraction_constant;
	var repulsion_constant;
	var forceConstant;
	var layout_iterations = 0;
	var temperature = 0;
	var nodes_length;
	var edges_length;

	// performance test
	var mean_time = 0;
}

Layout.prototype.setLayout = function(id)
{
	if(id < 0 || id > this.allLayouts.length) return;
	this.currentLayout = this.allLayouts[id];
}
Layout.prototype.createRandom = function(geometries)
{
	this.setLayout(0);
	
	//set position of new node
	var area_x = 350;
	var area_y = 300;
	var area_z = 200;
  
	for(var i = 0; i < this.graph.nodes.length; i++)
	{
		var x = Math.random() * area_x - Math.random() * area_x ;// Math.random() * area - Math.random() * area  ;
		var y = Math.random() * area_y - Math.random() * area_y;// Math.floor(Math.random() * (area + area + 1) - area);
		var z = Math.random() * area_z - Math.random() * area_z;//area - Math.random() * area  ;
		this.graph.nodes[i].position.x = x;
	   	this.graph.nodes[i].position.y = y;
	   	this.graph.nodes[i].position.z = z; 
		this.graph.nodes[i].draw(this.parent);
		
		
	}

	//drawing edges as line
	if(!this.isHelper)
		this.drawEdges(geometries);
}
/*Layout.prototype.createArcDiagram()
{
	
}
*/


// Circular visualization of graph. Nodes are arranges in circles.
// the amount of nodes per circle is determined by this.numNodesCircumference;
Layout.prototype.createSegmentedRadialConvergence = function(radius,geometries)
{
	this.setLayout(1);
	var counter = 0;
	var curRad  = radius;
	
	var center  = new THREE.Vector2();
	while(counter < this.graph.nodes.length)
	{
		var total = this.numNodesCircumference;
		//make sure we have enough, else justa dd remaining
		if((counter + total) > this.graph.nodes.length)
			total = Math.floor(this.graph.nodes.length - counter);
		
		//creading current circle
		this.createCircle(curRad,total,counter, center);
		
		if(this.createRadialImplosion == true)
			return;
		counter += total;
		curRad = curRad * 0.6;
	}
	
	//drawing edges as line
	this.drawEdges(geometries);

};


// Circular visualization of graph. Nodes are arranges in ONE big circle.
Layout.prototype.createRadialConvergence = function(radius, geometries, curveRad)
{
	this.setLayout(2);	
	
	var center  = new THREE.Vector2();
	this.createCircle(radius, this.graph.nodes.length, 0, center);
	this.drawEdges(geometries);
};

// Circular visualization of graph. Nodes are arranges in ONE big circle.
Layout.prototype.createRadialImplosion = function(radius, geometries)
{	
	this.setLayout(3);
	var n = Math.floor(this.graph.nodes.length/2);
	this.createSphere(n, radius);
	
	for(var i = n; i < this.graph.nodes.length; i++)
	{
		var vertex = new THREE.Vector3();
		do {
			vertex.x = Math.random() * this.width  - Math.random() * this.width ;
			vertex.y = Math.random() * this.height - Math.random() * this.height;
			vertex.z = Math.random() * this.depth  - Math.random() * this.depth;
			
		} while(vertex.length() > (radius*radius) );
		
		this.graph.nodes[i].position.x = vertex.x;
	   	this.graph.nodes[i].position.y = vertex.y;
	   	this.graph.nodes[i].position.z = vertex.z; 
		this.graph.nodes[i].draw(this.parent);
		
		
	}

	//drawing edges as line
	this.drawEdges(geometries);

};

// Graph visualization which consists of a set of mainNodes. The mainNodes are the 
// nodes in the graph wiht highest connectivity. Once we have this nodes, the children of this nodes
// are arranged around the parent node; creating a heirarchy view of the graph
// This Function used the createCentralizedRing_helper to create the visualization  recursevly 
Layout.prototype.createCentralizedRing = function(radius, mainNodes, geometries)
{
	this.setLayout(4);
	this.isHelper = true;
	this.createRandom();//createCircle(radius, this.graph.nodes.length, 0, center);
	
	// find main nodes (onces with higher connectiviy)
	// create circle with main nodes
	var theta =  Math.PI * 2 / mainNodes.length;
	var angle = 0;	
	for( var i = 0; i < mainNodes.length; i++)
	{
		var x = Math.cos(angle) * radius;
		var y = Math.sin(angle) * radius;
		var z = 0;//Math.random() * this.depth - Math.random() * this.depth;
		
		mainNodes[i].isSet      = true;
		mainNodes[i].position.x = x;
		mainNodes[i].position.y = y;
		mainNodes[i].position.z = z;
		
		angle += theta;
	}
	
	this.createCentralizedRing_helper(radius - 100, mainNodes);
	
	this.isHelper = false;
	//draw egdess
	this.drawEdges(geometries);
};
// Function helper of createCentralizedRing
Layout.prototype.createCentralizedRing_helper = function(radius, mainNodes)
{	
	// create circle with main nodes
	for( var i = 0; i < mainNodes.length; i++)
	{
		var z = Math.random() * this.depth - Math.random() * this.depth;
		
		var theta =  Math.PI * 2 / mainNodes[i].nodesFrom.length;
		var angle = 0;	
		var m = mainNodes[i].nodesFrom.length * 3;
		for(var j = 0; j< mainNodes[i].nodesFrom.length ;j++)
		{
			if(mainNodes[i].nodesFrom[j].isSet) continue;
			var x = Math.cos(angle) * radius;
			var y = Math.sin(angle) * radius;
			
			mainNodes[i].nodesFrom[j].isSet      = true;
			mainNodes[i].nodesFrom[j].position.z = z;
			mainNodes[i].nodesFrom[j].position.x = x + mainNodes[i].position.x * 2.1;//(j * m) + mainNodes[i].position.x * 2.1;
			var y_ = Math.random() * 20 - Math.random() * 20 ;
			mainNodes[i].nodesFrom[j].position.y = y + mainNodes[i].position.y * 2.1;//( m + y_)+ mainNodes[i].position.y * (2.1) ;
			
			angle += theta;
		}
	}
	
	var left_nodes = new Array();
	for( var i = 0; i < this.graph.nodes.length; i++)
	{
		var n = this.graph.nodes[i];
		if(n.isSet == false)
		{
			n.position.x = 0;
			n.position.y = 0;
			n.position.z = 0;
			left_nodes.push(n);
		}
	}

	console.log(left_nodes.length);
	if(left_nodes.length <= 0) return;
	
	//this.createCentralizedRing_helper(radius + 50, left_nodes);
};

// Graph visulization with nodes around a sphere
Layout.prototype.createSphereGraph = function(radius, geometries)
{
	this.setLayout(5);
	this.createSphere(this.graph.nodes.length, radius);
	//draw edges
	this.drawEdges(geometries,-5);
};


//--------------
//functions
Layout.prototype.drawEdges = function(geometries,rad)
{
	//drawing edges as curve
	for(var i = 0; i < this.graph.edges.length; i++)
	{
		var e = this.graph.edges[i];
		if(this.curve)
			e.drawCurve(this.parent, geometries,rad);
		else
			e.drawLine(this.parent, geometries);
	}
	
};
Layout.prototype.reDraw = function(geometries)
{
	for(var i = 0; i < this.graph.nodes.length; i++)
		this.graph.nodes[i].draw(this.parent);
	
	//if(curLayout == "sphere")
	//	this.drawEdges(geometries,-5);
	//else
		this.drawEdges(geometries);
}
Layout.prototype.checkIfContain = function(array, node)
{
	for(var i = 0;i<array.length;i++)
	{
		if(array[i]== null)
		 	continue;	
		if(array[i].id == node.id)
			return true;
	}
	return false;
	
};
Layout.prototype.inCircle = function(x,y,z,rad)
{
	var a = x*x + y*y + z*z;
	if(a < rad * rad)
		return true;
	
	return false;
};

Layout.prototype.createCircle = function(radius, total, counter, center){
	
	var curz = Math.random() * this.depth - Math.random() * this.depth;
	var theta =  Math.PI * 2 / (total);
	var angle = 0;
	
	for(var n = 0; n < total ; n++)
	{
		var rad = radius;
		var weight = this.graph.nodes[counter + n].weight;
		//console.log(this.graph.nodes[counter + n].weight);
		if(weight > 10)
			rad += (2 * weight);
		var x = Math.cos(angle) * rad + center.x;
		var y = Math.sin(angle) * rad + center.y;
		var z = curz;
		
		this.graph.nodes[counter + n].position.x = x;
		this.graph.nodes[counter + n].position.y = y;
		this.graph.nodes[counter + n].position.z = z;
		this.graph.nodes[counter + n].draw(this.parent);
		
		console.log(weight + " " + this.graph.nodes[counter + n].data.name);
		var newAngle = angle;
		var disp = 1.65;
		var wDis = 5;
		if(weight > 1)
			wDis = weight * 1.5;
		
		if( newAngle > 1.57 && newAngle < 4.71) {
			this.graph.nodes[counter + n].data.label_object.position.y = y - 24;
			this.graph.nodes[counter + n].data.label_object.rotation.z = newAngle - Math.PI /1;
			this.graph.nodes[counter + n].data.label_object.translateX(-((Math.floor(this.graph.nodes[counter + n].data.label_object.width)/disp) + wDis) )		
		}
		else{
			this.graph.nodes[counter + n].data.label_object.position.y = y - 24;
			this.graph.nodes[counter + n].data.label_object.rotation.z = newAngle;
			this.graph.nodes[counter + n].data.label_object.translateX((Math.floor(this.graph.nodes[counter + n].data.label_object.width)/disp) + wDis);
		}
		//this.graph.nodes[counter + n].data.label_object.position.x = x;// + 50;
  		//this.graph.nodes[counter + n].data.label_object.position.y = y + 100;
		//this.data.label_object.position.z = this.data.label_object.position.z;
		
		angle += theta;
	}	
};

Layout.prototype.createSphere = function(n, radius)
{
	for(var i = 0; i < n; i++)
	{
		var u  = Math.random();
	   	var v  = Math.random();
	   	var theta = 2 * Math.PI * u ;
	   	var phi   = Math.acos(2 * v - 1);
	   	this.graph.nodes[i].position.x = (radius * Math.sin(phi) * Math.cos(theta));
	    this.graph.nodes[i].position.y = (radius * Math.sin(phi) * Math.sin(theta));
	   	this.graph.nodes[i].position.z = (radius * Math.cos(phi));	
		this.graph.nodes[i].draw(this.parent);
	}
};

Layout.prototype.maxNodesConnections = function(array)
{
	var mainNodes = new Array();
	var mainNodes_ = new Array();
	var min = 0;
	
	// find main nodes (onces with higher connectiviy)
	for(var i = 0; i < array.length; i++)
	{
		var n = array[i];
		if(array[i].isSet) continue;
		var length = n.nodesTo.length + n.nodesFrom.length;
		if(length == 0)
			mainNodes_.push(n);
		else
		{
			if(mainNodes.length > 0)
			{ 
				if(length >= min)
				{
					if(length == min) 
						mainNodes.push(n);
					else 
					{
						mainNodes.pop();
						mainNodes.push(n);
						min = length;
					}
				}
			}
			else
			{
				mainNodes.push(n);
				min = length;
			}
		}
	}
	console.log("main  " + mainNodes_.length + " " +  mainNodes.length + " min: " + min);
	for(var i = 0; i < mainNodes_.length; i++)
		mainNodes.push(mainNodes_[i]);
		
	return mainNodes;
};
 
