// functions create node and links and also define dragging action Functions


/**
 * checks if x and y are in bounds and returns 2 bools
 * @param x x-coordinate
 * @param y y-coordinate
 * @return [{boolean]} two booleans describing x and y in bound
 */
function boundCheck(x, y)
{
  return   [x > 0 + GRAPH_WIDTH_MARGIN && x < GRAPH_WIDTH+GRAPH_WIDTH_MARGIN,
           y > 0 + GRAPH_HEIGHT_MARGIN && y < GRAPH_HEIGHT + GRAPH_HEIGHT_MARGIN];
}
/**
 * if colorBlind is true, refill the nodes with colorBlind color
 */

function refreshcolorBlind(svg, dataset)
{
  if(dataset.graphName === "cities"||dataset.graphName === "divorce")
  {
    if(colorBlind)
    {
      svg.selectAll("circle")
      .style("fill", function(d)
      {
        let color = d.class === 0 ? (x => COLOR_BI_BLUE_BLIND[x%15]) : (x => COLOR_BI_ORANGE_BLIND[x%15]);
        return color(d.group);
      });
    }else
    {
      svg.selectAll("circle")
      .style("fill", function(d)
      {
        let color = d.class === 0 ? (x => COLOR_BI_BLUE[x%15]) : (x => COLOR_BI_ORANGE[x%15]);
        return color(d.group);
      });  
    }
  }else
  {
    let color = colorBlind ? (x => COLOR_BLIND_15[x%15]) : d3.scaleOrdinal(d3.schemeCategory20);
    svg.selectAll("circle")
    .style("fill", function(d)
    {
      return color(d.group);
    });  
  }
}

function createNodes(svg, simulation, graph, graphType, checkbox, dataset)
{

  // if statements so that checkbox input can be checkbox object or boolean value
  if (typeof checkbox === "boolean")
  {
    let value = checkbox;
    checkbox = {
      checked: value
    };
  }
  // set color variable to be used to color nodes for non-Les Miserables graph nodes
  if (dataset.graphName === "cities" || dataset.graphName === "divorce")
  {
    return svg.append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(graph.nodes)
      .enter().append("circle")
      // .attr("r", NODE_RADIUS)
      .attr("r", nodesizeScale * NODE_RADIUS)
      .style("fill", function(d)
      {
        if (colorBlind)
        {
          let color = d.class === 0 ? (x => COLOR_BI_BLUE_BLIND[x%15]) : (x => COLOR_BI_ORANGE_BLIND[x%15]);
          return color(d.group);  
        }else
        {
          let color = d.class === 0 ? (x => COLOR_BI_BLUE[x%15]) : (x => COLOR_BI_ORANGE[x%15]);
          return color(d.group);  
        }
      })
      .call(d3.drag()
        .on("start", function (d)
        {
          dragging = true;
          svg.selectAll("text").remove();
          dragstarted(checkbox, simulation, d);
        })
        .on("drag", function (d)
        {
          dragged(checkbox, graphType, d, graph, simulation);
        })
        .on("end", function (d)
        {
          dragended(checkbox, simulation, d);
          dragging = false;
        }));  
  }else
  {
    let color = colorBlind ? (x => COLOR_BLIND_15[x%15]) : d3.scaleOrdinal(d3.schemeCategory20);
    return svg.append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(graph.nodes)
      .enter().append("circle")
      // .attr("r", NODE_RADIUS)
      .attr("r", nodesizeScale * NODE_RADIUS)
      .style("fill", function (d)
      {
        return color(d.group);
      })
      .call(d3.drag()
        .on("start", function (d)
        {
          dragging = true;
          svg.selectAll("text").remove();
          dragstarted(checkbox, simulation, d);
        })
        .on("drag", function (d)
        {
          dragged(checkbox, graphType, d, graph, simulation);
        })
        .on("end", function (d)
        {
          dragended(checkbox, simulation, d);
          dragging = false;
        }));  
  }
}

// function to create links
function createLinks(svg, graph)
{
  return svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(graph.links)
    .enter().append("line");
}

function dragstarted(checkbox, simulation, d)
{
  if (!checkbox.checked)
  {
    if (!d3.event.active)
    {
      // simulation.alpha(1).restart();
    }
    d.fx = null;
    d.fy = null;
  }
}

function dragged(checkbox, graphType, d, graph, simulation)
{
  if (!checkbox.checked)
  {
    let x = d3.event.x;
    let y = d3.event.y;
    let boundChecks = boundCheck(x, y);
    let xIn = boundChecks[0];
    let yIn = boundChecks[1];
    if (xIn || yIn)
    {
      if (xIn)
      {
        d.fx = x;
      }
      if (yIn)
      {
        d.fy = y;
      }
      // update randomized locations to reflect locations after dragging
      if (graphType !== LAYOUTS.FORCE_DIRECTED && graphType !== LAYOUTS.CIRCULAR)
      {

        simulation.alpha(1).restart();
        graph.nodePositions[d.id][0] = d.fx;
        graph.nodePositions[d.id][1] = d.fy;
      }
    }

  }
}

function dragended(checkbox, simulation, d)
{
  if (!checkbox.checked)
  {
    if (!d3.event.active && d.fx !== null && d.fy !== null)
    {
      simulation.alpha(1).restart();
    }

    d.fx = null;
    d.fy = null;
  }
}
