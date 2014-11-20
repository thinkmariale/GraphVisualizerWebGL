/**
  @author Maria Alejandra Montenegro

  Implementation of graph visualisations.
  Consists of Graph, Nodes and Edges and different 
  types of Layouts.
**/

var renderer;
var scene;
var camera

var numMaxNodes = 200;
var geometries  = [];
var nodes       = [];
var graph ;
var parent;

function initScene()
{
	
	renderer = new THREE.WebGLRenderer({alpha: true});// How content will be displayed in web
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

     scene = new THREE.Scene();
     camera = new THREE.PerspectiveCamera(
		35,             // Field of view
		window.innerWidth / window.innerHeight,      // Aspect ratio
		0.1,            // Near plane
		10000           // Far plane
	);
	camera.position.z = 1100;
	//camera.position.set( -15, 10, 10 );
	camera.lookAt( scene.position );

	parent = new THREE.Object3D();
	scene.add( parent );
	createGraph();

	layout = new Layout(graph, parent);
	layout.curve = true;
	//layout.createRandom(geometries);
	//layout.createSegmentedRadialConvergence(200, geometries);
	//layout.createRadialConvergence(300, geometries);
	layout.createRadialImplosion(200,geometries);
	render();
	
}

//Funtion to start the graph creation
function createGraph()
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
		//drawNodes(node);		
	}
	
	//creating edges
	for(var i = 0; i < numMaxNodes; i++)
	{
		//adding edges and neighbot nodes
		var num_egdes = Math.floor(Math.random() * 2);
		while(num_egdes > 0)
		{
			var e = Math.floor(Math.random() * numMaxNodes);
			while(e==i)
				e = Math.floor(Math.random() * numMaxNodes);
			
			graph.addEdge(nodes[i], nodes[e]);
			//drawing nodes and edges
			//drawEgdes(nodes[i], nodes[e]);
			num_egdes--;
		}
	}
	
}

//Function to draw the nodes of the graph
function drawNodes(node_)
{
	var geometry = new THREE.SphereGeometry( 5, 15, 15 );
	var material = new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff, opacity: 0.7  } );
    var draw_obj = new THREE.Mesh( geometry, material );

	//set position of new node
	var area_x = 350;
	var area_y = 300;
	var area_z = 100;
   	draw_obj.position.x = Math.random() * area_x - Math.random() * area_x ;// Math.random() * area - Math.random() * area  ;
	draw_obj.position.y = Math.random() * area_y - Math.random() * area_y;// Math.floor(Math.random() * (area + area + 1) - area);
	draw_obj.position.z = Math.random() * area_z - Math.random() * area_z;//area - Math.random() * area  ;
	
	
	var textOpt = ["10pt", "", ""];
	if(node_.data.title === undefined)
	{
		var label = new THREE.Label("temp label", textOpt);	
	}
	else{
		var label = new THREE.Label(node_.data.title, textOpt);	
	}
	
	label.position.x = draw_obj.position.x;
  	label.position.y = draw_obj.position.y - 20;
	label.position.z = draw_obj.position.z;
	
	node_.data.label_object = label;
	//parent.add( node_.data.label_object );
	
	draw_obj.name = node_.data.title;
	draw_obj.id   = node_.id;
	node_.data.draw_obj  = draw_obj;
	node_.position       = draw_obj.position;
	
	parent.add(node_.data.draw_obj );
}

//functio to draw the edges bw nodes
function drawEgdes(node, neighborNode, parameters)
{
	var parameters = parameters || {};
	
	material = new THREE.LineBasicMaterial({ color: 0xff0000, opacity: 1, linewidth: 1.5 });

	var tmp_geo = new THREE.Geometry();
	
	tmp_geo.vertices.push(node.position);
	tmp_geo.vertices.push(neighborNode.position);

//	line = new THREE.Line( tmp_geo, material, THREE.LinePieces );
	//line.scale.x = line.scale.y = line.scale.z = 1;
	//line.originalScale = 1;

	//geometries.push(tmp_geo);

	//parent.add( line );
	
	var mid = new THREE.Vector3();
	mid.x = (neighborNode.position.x + node.position.x )/2;
	mid.x = (neighborNode.position.y + node.position.y )/2;
	mid.x = (neighborNode.position.z + node.position.z )/2;
	
	var SUBDIVISIONS = 10;
	var geometry = new THREE.Geometry();
	var curve = new THREE.QuadraticBezierCurve3();
	curve.v0 = new THREE.Vector3(node.position.x, node.position.y, node.position.z);
	curve.v1 = mid;
	curve.v2 = new THREE.Vector3(neighborNode.position.x, neighborNode.position.y, neighborNode.position.z);
	for (var j = 0; j < SUBDIVISIONS; j++) {
		geometry.vertices.push( curve.getPoint(j / SUBDIVISIONS) )
	}
	//material = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 2 } );
	line = new THREE.Line(geometry, material);
	//line.scale.x = line.scale.y = line.scale.z = 1;
	line.originalScale = 1;
	geometries.push(geometry);
	
	
	
	
	parent.add(line);
	
	
}


function render()
{
	
	parent.rotation.y += 0.01;
	
	// Update position of lines (edges)
    for(var i=0; i<geometries.length; i++) {
      geometries[i].verticesNeedUpdate = true;
	
    }
	
	
	renderer.render( scene, camera );
	requestAnimationFrame(render);
}

