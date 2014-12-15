/**
  @author Maria Alejandra Montenegro

  Implementation of graph visualisations.
  Consists of Graph, Nodes and Edges and different 
  types of Layouts.
**/

// scene variables
var container;
var renderer, controls, scene, camera
var mouse = new THREE.Vector2(),
	offset = new THREE.Vector3(),
	INTERSECTED, SELECTED;

// graph variables
var numMaxNodes = 50;
var geometries  = [];
var nodes       = [];
var graph ;
var parent;

function initScene()
{
	container = document.createElement( 'div' );
	document.getElementById("MyGraph").appendChild( container );
	
     scene = new THREE.Scene();
     camera = new THREE.PerspectiveCamera(
		35,             // Field of view
		window.innerWidth / window.innerHeight,      // Aspect ratio
		0.1,            // Near plane
		10000           // Far plane
	);
	camera.position.z = 1400;
	camera.lookAt( scene.position );
	renderer = new THREE.WebGLRenderer({alpha: true});// How content will be displayed in web
    renderer.setSize( window.innerWidth, window.innerHeight);
	container.appendChild( renderer.domElement );
	
	//renderer.domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
	//renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
	//renderer.domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );

	// done setting main THREE scene stuff
	parent = new THREE.Object3D();
	scene.add( parent );

	var minNeighborhs = 2;
	var mainNodesInGraph = false;
	if(graph.nodes.length < 0)
		var m = createGraph(minNeighborhs, mainNodesInGraph);

	var n = Math.floor(nodes.length/2);
	var options = {numCircum:n};//, lastName:"Doe", age:50, eyeColor:"blue"};
	layout = new Layout(graph, parent,options);
 

	layout.curve = false;
	layout.createRandom(geometries);
	//layout.createSegmentedRadialConvergence(300, geometries);
	//layout.createRadialConvergence(300, geometries);
	//layout.createRadialImplosion(200,geometries);
	//layout.createCentralizedRing(130, m, geometries);
	//layout.createSphereGraph(200, geometries);
	
	
	//Setting controller after everything is added so it knows what dimentions it has to "play around" with
	controls = new THREE.TrackballControls( camera, container );
	
	controls.rotateSpeed = 1.0;
	controls.zoomSpeed = 1.2;
	controls.panSpeed = 0.8;
	controls.noZoom = false;
	controls.noPan = false;
	controls.staticMoving = true;
	controls.dynamicDampingFactor = 0.3;
	
	render();
	
}

function changeDisplay(isCurve)
{
	layout.curve = isCurve;
	console.log(isCurve);
	reset();
	
	layout.reDraw(geometries);
}
function changeLayout(sel) {
	var value = sel.value;  
	var radius = 350;

	console.log(sel);
	reset();
	
	switch(sel)
	{
		case "Random":
			layout.createRandom(geometries);
			break;
		case "SegmentedRadialConvergence":
			layout.createSegmentedRadialConvergence(radius, geometries);
			break;
		case "RadialConvergence":
			layout.createRadialConvergence(radius, geometries);
			break;
		case "RadialImplosion":
			layout.createRadialImplosion(radius,geometries);
			break;
		case "SphereGraph":
			layout.createSphereGraph(radius, geometries);
			break;
		default:
			layout.createRandom(geometries);
	}

}

//function to load facebook JSON file into nodes for the graph
function loadNodes(response)
{
	graph = new Graph();
	
	for( var n in response.data)
	{
		var post = response.data[n];
		var node = graph.getNode(post.from.id);
		if(node == null)
		{
			node = new Node( post.from.id);
			node.data.message = post.message;
			node.data.name = post.from.name;
			graph.addNode(node);
			nodes.push(node);
			
		}
		//else {
		//	node.updateWeight(1);
			//console.log(node.data.name);	
			//console.log(node.weight);	
		//}
		
		//add connections through comments
		if(post.comments)
		{
			for(var c in post.comments.data)
			{
				var comment = post.comments.data[c];
				var node1 = graph.getNode(comment.from.id);
				if(node1 != null)
				{
					var e = graph.addEdge(node, node1);
					if(e) e.data.comment = comment.message;
				}
				else
				{
					node1 = new Node( comment.from.id);
					node1.data.message = comment.message;
					node1.data.name = comment.from.name;
					graph.addNode(node1);
					nodes.push(node1);
					var e = graph.addEdge(node, node1);
					if(e) e.data.comment = comment.message;
				}
				node.updateWeight(1);
				
			}
		}
	}

}

//Funtion to start the graph creation
function createGraph(minNeighborhs, mainNodes)
{
	graph = new Graph();
	// adding nodes to my graph
	nodes.length = 0;
	geometries.length = 0;
	
	//creating all nodes
	for (var counter = 0; counter < numMaxNodes; counter ++)
	{
		var node = new Node(counter);
		node.data.title = "node " + Math.floor(counter).toString();
		graph.addNode(node);
		nodes.push(node);
	}
	
	//creating edges
	if(mainNodes)
	{
		var num = numMaxNodes /5;
		//create the main nodes of the graph
		var mainN = new Array();
		for(var i = 0; i < num; i++)
		{
			nodes[i].data.mainNode = true;
			mainN.push(nodes[i]);
			var r = Math.floor(Math.random() * num) ;
			while(r == i)
				r = Math.floor(Math.random() * num) ;
			//if((i+1) < num)
			//{
				var x = graph.addEdge(nodes[i], nodes[r]);
				//console.log("added " + x);
			//}
		}
		//go through all nodes and create edges
		for(var i = 0; i < numMaxNodes; i++)
		{
			var e = Math.floor(Math.random() * num);
			if(nodes[i].data.mainNode) continue;
			graph.addEdge(nodes[i], mainN[e]);
		}
		
		return mainN;
	}
	else
	{
		for(var i = 0; i < numMaxNodes; i++)
		{
			//adding edges and neighbor nodes
			var num_egdes = Math.floor(Math.random() * minNeighborhs) + 1;
			var pass = true;
			if(nodes[i].nodesTo.length + nodes[i].nodesFrom.length  >= minNeighborhs) 
				pass = false;
		
			while(num_egdes > 0 && pass)
			{
				var max = 5;
				var e = Math.floor(Math.random() * numMaxNodes);

				while(e == i || nodes[e].nodesTo.length + nodes[e].nodesFrom.length > (minNeighborhs -1))
				{
					if(max <= 0) break;
					e = Math.floor(Math.random() * numMaxNodes);
					max--;
				}
				//adding connection bw nodes
				if(max > 0)
					graph.addEdge(nodes[i], nodes[e]);

				//drawing nodes and edges
				if(num_egdes == 1) pass = false;
				num_egdes--;
			}
			//console.log("edges " + i + " "  + nodes[i].nodesTo.length + " " +  nodes[i].nodesFrom.length + " total " 
			//			+ (nodes[i].nodesTo.length + nodes[i].nodesFrom.length ));

		}
	}

}

//Function to reset
function reset()
{
	geometries.length = 0;
	geometries  = [];
	parent.children = [];
}


function render()
{
	//parent.rotation.y += 0.01;
	
	// Update position of lines (edges)
    for(var i=0; i<geometries.length; i++) {
      geometries[i].verticesNeedUpdate = true;
    }
	
	controls.update();
	renderer.render( scene, camera );
	requestAnimationFrame(render);
}


// mouse events
function onDocumentMouseMove( event ) {
	event.preventDefault();

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	
	/*var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 ).unproject( camera );
	var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
	if ( SELECTED ) {
		var intersects = raycaster.intersectObject( plane );
		SELECTED.position.copy( intersects[ 0 ].point.sub( offset ) );
		return;
	}*/
	
	//var intersects = raycaster.intersectObjects( graph.nodes );
	/*
	if ( intersects.length > 0 ) {
		if ( INTERSECTED != intersects[ 0 ].object ) {
			if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
			
			INTERSECTED = intersects[ 0 ].object;
			INTERSECTED.currentHex = INTERSECTED.material.color.getHex();

			plane.position.copy( INTERSECTED.position );
			plane.lookAt( camera.position );
		}
		container.style.cursor = 'pointer';
	}
	else {
		if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );

		INTERSECTED = null;
		container.style.cursor = 'auto';
	}*/
}
/*
function onDocumentMouseDown( event ) {
	event.preventDefault();
	var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 ).unproject( camera );
	var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
	var intersects = raycaster.intersectObjects( objects );

	if ( intersects.length > 0 ) {
		controls.enabled = false;
		SELECTED = intersects[ 0 ].object;
		var intersects = raycaster.intersectObject( plane );
		offset.copy( intersects[ 0 ].point ).sub( plane.position );
		container.style.cursor = 'move';
	}
}

function onDocumentMouseUp( event ) {
	event.preventDefault();
	controls.enabled = true;
	if ( INTERSECTED ) {
		plane.position.copy( INTERSECTED.position );
		SELECTED = null;
	}
	container.style.cursor = 'auto';
}
*/
