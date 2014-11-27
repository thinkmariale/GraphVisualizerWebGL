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
	var curve = false;
	var isSegmentedRadialCovergence = false;
	var isRadialCovergence = false;
	var isRadialImplosion  = false;
	var isCentralizedRing  = false;
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

Layout.prototype.createRandom = function(geometries)
{
	//set position of new node
	var area_x = 350;
	var area_y = 300;
	var area_z = 100;
  
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
	if(!this.isCentralizedRing)
		this.drawEdges(geometries);
}
/*Layout.prototype.createArcDiagram()
{
	
}
*/


Layout.prototype.createSegmentedRadialConvergence = function(radius,geometries)
{
	var counter = 0;
	var curRad  = radius;
	
	this.isSegmentedRadialCovergence = true;
	
	while(counter < this.graph.nodes.length)
	{
		
		var total = this.numNodesCircumference;
	
		//make sure we have enough, else justa dd remaining
		if((counter + total) > this.graph.nodes.length)
			total = Math.floor(this.graph.nodes.length - counter);
		
		//creading current circle
		this.createCircle(curRad,total,counter);
		
		if(this.createRadialImplosion == true)
			return;
		counter += total;
		curRad = curRad * 0.6;
	}
	
	//drawing edges as line
	this.drawEdges(geometries);

	this.isSegmentedRadialCovergence = false;
};

Layout.prototype.createRadialImplosion = function(radius, geometries)
{	
	this.isRadialImplosion = true;
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

	
	this.isRadialImplosion = false;
};


Layout.prototype.createRadialConvergence = function(radius, geometries, curveRad)
{
	this.isRadialCovergence = true;
	
	var center  = new THREE.Vector2();
	this.createCircle(radius, this.graph.nodes.length, 0, center);
	
	this.drawEdges(geometries);
	this.isRadialCovergence = false;
};

Layout.prototype.createCentralizedRing = function(radius, mainNodes, geometries)
{
	this.isCentralizedRing = true;
	this.createRandom();//createCircle(radius, this.graph.nodes.length, 0, center);
	
	// find main nodes (onces with higher connectiviy)
	// create circle with main nodes
	var theta =  Math.PI * 2 / mainNodes.length;
	var angle = 0;
	var counter = 0;
	
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
	
	this.createCentralizedRing_helper(radius -50, mainNodes);
	
	//draw egdess
	this.drawEdges(geometries);
	this.isCentralizedRing = false;
	
};

Layout.prototype.createCentralizedRing_helper = function(radius, mainNodes)
{	
	// create circle with main nodes
	for( var i = 0; i < mainNodes.length; i++)
	{
		var z = Math.random() * this.depth - Math.random() * this.depth;
		
		for(var j = 0; j< mainNodes[i].nodesTo.length ;j++)
		{
			if(mainNodes[i].nodesTo[j].isSet) continue;
			mainNodes[i].nodesTo[j].isSet      = true;
			mainNodes[i].nodesTo[j].position.x = (j * 15) + mainNodes[i].position.x * 2.1 * dis;
			mainNodes[i].nodesTo[j].position.y = (j * 15)+ mainNodes[i].position.y * 2.1 * dis;
			
			mainNodes[i].nodesTo[j].position.z = z;
		}
		
		var m = mainNodes[i].nodesFrom.length * 3;
				for(var j = 0; j< mainNodes[i].nodesFrom.length ;j++)
		{
			if(mainNodes[i].nodesFrom[j].isSet) continue;
			mainNodes[i].nodesFrom[j].isSet      = true;
			mainNodes[i].nodesFrom[j].position.x = (j * m) + mainNodes[i].position.x * 2.1;
			var y_ = Math.random() * 20 - Math.random() * 20 ;
			mainNodes[i].nodesFrom[j].position.y = ( m + y_)+ mainNodes[i].position.y * (2.1) ;
			mainNodes[i].nodesFrom[j].position.z = z;
		}
	}
	
	var left_nodes = new Array();
	for( var i = 0; i < this.graph.nodes.length; i++)
	{
		var n = this.graph.nodes[i];
		if(n.isSet == false)
		{
			n.position.x = 0;
			n.position.y = 100;
			n.position.z = curz;
			left_nodes.push(n);
		}
	}

	console.log(left_nodes.length);
	if(left_nodes.length <= 0) return;
	
	//this.createCentralizedRing_helper(radius + 50, left_nodes);
};


//--------------
//functions
Layout.prototype.drawEdges = function(geometries)
{
	//drawing edges as curve
	for(var i = 0; i < this.graph.edges.length; i++)
	{
		var e = this.graph.edges[i];
		if(this.curve)
			e.drawCurve(this.parent, geometries);
		else
			e.drawLine(this.parent, geometries);
	}
	
};
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
	var theta =  Math.PI *2 / total;
	var angle = 0;
		
	for(var n = 0; n < total ; n++)
	{
		//if(n%10 == 0)
		//	curz = Math.random() * this.depth - Math.random() * this.depth;
		var x = Math.cos(angle) * radius + center.x;
		var y = Math.sin(angle) * radius + center.y;
		var z = curz;
		
		this.graph.nodes[counter + n].position.x = x;
		this.graph.nodes[counter + n].position.y = y;
		this.graph.nodes[counter + n].position.z = z;
		this.graph.nodes[counter + n].draw(this.parent);
		
		angle +=theta;
	}	
};

Layout.prototype.createSphere = function(n, radius)
{
	for(var i=0;i< n;i++)
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
 
