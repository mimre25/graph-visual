// This function will plot a graph from a json file, taking in svg and simulation
// graphic argument is made up of graphic.svg and graphic.simulation
// dataLink is the link to the data json file

/* FUNCTION HAS BUG: function plots all points but error with dragging nodes. If there are two graphs
the node in the other graph is dragged instead. This could be a result of the letiable
nodePoints being a global letiable defined in the plotGraph function and the drawGraph function.
This letiable is used in the createNodes function and function that creates random graph, defined
in graphTypeFunctions.js
*/

function plotGraph(graphic, positionsLink, links, nodes, graph, elements)
{

  d3.json(positionsLink, function (error, data)
  {
    if (error)
    {
      throw error;
    }
    //nodePosition(graphic.svg, data, graph);

    //tickedPlot(node, link, data);
    let dataLength = data.nodes.length;
    // set simulation to correctly show graph
    graph.nodePositions = nodePosition(graphic.svg, data, graph, dataLength, elements);
    //
    graphic.simulation
      .nodes(graph.nodes)
      .on("tick", function ()
      {
        tickedRandom(nodes, links, graph);
      });
    graphic.simulation.force("link").links(graph.links);
    graphic.simulation.force("link").strength(0);
    // redraw graph
    graphic.simulation.alpha(0).restart();

  });
}

/**
 * creates an array of node positions based on the one given in the data array
 * includes margin and size computations
 * @param svg the svg to use
 * @param data the node positions to use
 * @param graph the underlying graph
 * @param dataLength the length of the data array
 * @return an array with the new node positions
 */
function nodePosition(svg, data, graph, dataLength, elements)
{
  let nodePoints = {};
  svg.selectAll("circle").each(function (d)
  {
    for (let i = 0; i < dataLength; i++)
    {
      if (d.id === data.nodes[i].id)
      {
        let x = GRAPH_WIDTH_MARGIN + data.nodes[i].x * GRAPH_WIDTH;
        let y = GRAPH_HEIGHT_MARGIN + data.nodes[i].y * GRAPH_HEIGHT;
        // store positions in a dictionary where key is node id
        nodePoints[d.id] = [x, y];
      }
    }
  });
  if (graph.nodes[0].class !== undefined && elements.sortByCluster.checked === true)
  {
    return idMap(graph, svg, nodePoints);
  } else
  {
    return nodePoints;
  }
}


function idMap(graph, svg, nodePoints)
{
  graph.nodes = graph.nodes.map(function(n) {
    let pos = nodePoints[n.id];
    n.x = pos[0];
    n.y = pos[1];
    return n;
  });
  let firms = graph.nodes.filter(x => x.class === 1);
  let cities = graph.nodes.filter(x => x.class === 0);

  let firmPositions = firms.slice(0);
  let cityPositions = cities.slice(0);
  firmPositions.sort((a, b) => a["y"] - b["y"]);
  cityPositions.sort((a, b) => a["y"] - b["y"]);


  let firmClusters = firms.slice(0);
  let cityClusters = cities.slice(0);
  firmClusters.sort((a, b) => a["group"] - b["group"]);
  cityClusters.sort((a, b) => a["group"] - b["group"]);


  let firmMapping = firms.slice(0);
  let cityMapping = cities.slice(0);

  for (let i = 0; i < firmPositions.length; i++)
  {
    firmMapping[firmClusters[i].id] = i;
  }
  for (let i = 0; i < cityPositions.length; i++)
  {
    cityMapping[cityClusters[i].id] = i;
  }

  // let nodePoints = {};
  let nodePoints_ = {};
  svg.selectAll("circle").each(function (d)
  {
    let pos = [];
    if (d.class === 0)
    {
      //cities
      let pos_ = cityPositions[cityMapping[d.id]];
      pos = nodePoints[pos_.id];
       // = [pos_.x, pos_.y];
    } else
    {
      //firms
      let pos_ = firmPositions[firmMapping[d.id]];
      pos = nodePoints[pos_.id];
      // pos = [pos_.x, pos_.y];
    }
    nodePoints_[d.id] = pos;
  });


  return nodePoints_;
}

function idMapCircular(graph, graphic, svg, elements, nodes, links, parameters, svgs, dataset)
{
  if(elements.sortByCluster.checked === true)
  {
    let former = [];
    let sorted = [];
    former = graph.nodes.slice(0);
    sorted = graph.nodes.slice(0);

    let center =
        {
          x: GRAPH_WIDTH/2 + GRAPH_WIDTH_MARGIN,
          y: GRAPH_HEIGHT/2+ GRAPH_HEIGHT_MARGIN,
        };

    formerPositions = former.sort((a, b) =>
        (Math.atan2(a.y - center.y, a.x - center.x)) >
        (Math.atan2(b.y - center.y, b.x - center.x)) ? 1 : -1);
    sortedClusters = sorted.sort((a, b) => (a.group) > (b.group) ? 1 : -1);
    let circularMapping = former.slice(0);
    for (let i = 0; i < formerPositions.length; i++)
    {
      circularMapping[sortedClusters[i].id] = i;
    }
    let nodePoints_ = {};
    let nodePoints = {};
    svg.selectAll("circle").each(function (d)
    {
      for (let i = 0; i < formerPositions.length; i++)
      {
        if (formerPositions[i].id === d.id)
        {
          let x = formerPositions[i].x;
          let y = formerPositions[i].y;
          // store positions in a dictionary where key is node id
          nodePoints[d.id] = [x, y];
        }
      }
    });


    svg.selectAll("circle").each(function (d)
    {
      let pos = [];
      let pos_ = formerPositions[circularMapping[d.id]];

      pos = nodePoints[pos_.id];
      nodePoints_[d.id] = pos;
    });
    graph.nodes.forEach(function (d)
    {
      for (let prop in nodePoints_)
      {
        prop = typeof(d.id) === "number" ? Number(prop) : prop;
        if (prop === d.id)
        {
          d.x = nodePoints_[prop][0];
          d.y = nodePoints_[prop][1];
        }
      }
    });
  }
}

/**
 * function that randomizes node positions
 * @param {*} graph 
 * @param {*} graphic 
 */
function randomizeNodes(graph, graphic)
{
  let dataPoints = randomize(graphic.svg);
  graph.nodes.forEach(function(d)
    {
      for (let prop in dataPoints)
      {
        prop = typeof(d.id)==="number" ? Number(prop) : prop;
        if (prop === d.id)
        {
          d.x = dataPoints[prop][0];
          d.y = dataPoints[prop][1];
        }
      }
    });
}
