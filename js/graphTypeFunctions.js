// functions that change graph graphType are included in this file
// functions include the function that is executed when the dropdown menu is changed
// and the functions making the Force-directed, circular, and randomized node position and links

//for random graph and precomupted ones

function circularGraph(graph, simulation, radius, node, link)
{
  // set up simulation to correctly show graph
  simulation
    .nodes(graph.nodes)
    .on("tick", function ()
    {
      tickedCircular(radius, node, link);
    });
  simulation.force("link").strength(0);
  simulation.force("link").links(graph.links);
  // redraw graph
  // alphaTarget is a measure of how far the simulation has progressed. It is between 0 and 1, where 0 is completely finished
  // the simulation stops with the target is hit
  simulation.alpha(1).restart()
}

// function that creates force Directed Graph
function forceDirectedGraph(graph, simulation, svg, strengthVal, repulsiveForce, node, link)
{
  // set up simulation to correctly show graph
  simulation
    .nodes(graph.nodes)
    .on("tick", function ()
    {
      tickedFD(node, link);
    });
  simulation.force("link").strength(strengthVal / 10);
  simulation.force("link").links(graph.links);
  simulation.force("charge", d3.forceManyBody().strength(repulsiveForce))
  // redraw graph and stop motion shortly thereafter
  simulation.alpha(1).restart();
  // will stop motion of graph from spinning
  // setTimeout(simulation.stop, 3000);
}

// function that creates random graph
function randomGraph(graph, simulation, svg, node, link)
{
  // randomize points
  graph.nodePositions = randomize(svg);
  // set p simulation to correctly show graph
  simulation
    .nodes(graph.nodes)
    .on("tick", function ()
    {
      tickedRandom(node, link, graph);
    });
  simulation.force("link").strength(0);
  simulation.force("link").links(graph.links);
  // redraw graph
  simulation.alpha(0).restart();
}

// Functions to create circular graphs

// function used to give each node its position on the circular layout
// input: node x and y positions, desired circular graph radius
// output: [new_x, new_y] where new_x is the node's new x coordinate and new_y is its new y coordinate
function circular(x, y, r)
{
  let width = GRAPH_WIDTH/2 + GRAPH_WIDTH_MARGIN;
  let height = GRAPH_HEIGHT/2+ GRAPH_HEIGHT_MARGIN;
  let vx = x - width;
  let vy = y - height;
  let norm = Math.sqrt(Math.pow(vx, 2) + Math.pow(vy, 2));
  let new_x = width + vx / norm * r;
  let new_y = height + vy / norm * r ;
  return [new_x, new_y];
}

// used by simulation when circular layout is selected
function tickedCircular(circularRadius, nodes, link)
{
  nodes
    .attr("cx", function (d)
    {
      // convert to circular layout coordinates

      let position = circular(d.x, d.y, circularRadius);
      d.x = position[0];
      return d.x;
    })
    .attr("cy", function (d)
    {
      // convert to circlular layout coordinates
      let position = circular(d.x, d.y, circularRadius);
      d.y = position[1];
      return d.y;
    });
  link
    .attr("x1", function (d)
    {
      return d.source.x;
    })
    .attr("y1", function (d)
    {
      return d.source.y;
    })
    .attr("x2", function (d)
    {
      return d.target.x;
    })
    .attr("y2", function (d)
    {
      return d.target.y;
    });
}


// called when randomized layout is selected
// input: none
// output: dictionary where the key is the node's id and the value is a list [x, y] where x and y are the new x and y coordinates
function randomize(svg)
{
  let dataPoints = {};
  // assign each node a random x and y, do some math to make sure they stay on the screen
  // let width = svg.width;
  // let height = svg.height;
  svg.selectAll("circle").each(function (d)
  {
    let x = Math.random() * GRAPH_WIDTH + GRAPH_WIDTH_MARGIN;// * 0.92 + 20;
    let y = Math.random() * GRAPH_HEIGHT + GRAPH_HEIGHT_MARGIN;//; * 0.92 + 22;
    // store positions in a dictionary where key is node id
    dataPoints[d.id] = [x, y];
  });
  return dataPoints;
}

// used by simulation when random layout is selected
function tickedRandom(node, link, graph)
{
  node
    .attr("cx", function (d)
    {
      // get position from dictionary
      d.x = graph.nodePositions[d.id][0];
      return d.x;
    })
    .attr("cy", function (d)
    {
      // get position from dictionary
      d.y = graph.nodePositions[d.id][1];
      return d.y;
    });
  link
    .attr("x1", function (d)
    {
      return d.source.x;
    })
    .attr("y1", function (d)
    {
      return d.source.y;
    })
    .attr("x2", function (d)
    {
      return d.target.x;
    })
    .attr("y2", function (d)
    {
      return d.target.y;
    });
}


// used by simulation when FD is selected
function tickedFD(node, link)
{
  link
    .attr("x1", function (d)
    {
      return d.source.x;
    })
    .attr("y1", function (d)
    {
      return d.source.y;
    })
    .attr("x2", function (d)
    {
      return d.target.x;
    })
    .attr("y2", function (d)
    {
      return d.target.y;
    });
  node
    // .attr("transform", function (d)
    // {
    //   if (boundCheck(d.x, d.y))
    //   {
    //     return "translate(" + d.x + "," + d.y + ")";
    //   }
    // });
  .attr("cx", function(d) { return d.x = Math.max(NODE_RADIUS*nodesizeScale, Math.min(GRAPH_WIDTH +NODE_RADIUS*nodesizeScale, d.x)); })
  .attr("cy", function(d) { return d.y = Math.max(NODE_RADIUS*nodesizeScale, Math.min(GRAPH_HEIGHT+NODE_RADIUS*nodesizeScale, d.y)); });
}
