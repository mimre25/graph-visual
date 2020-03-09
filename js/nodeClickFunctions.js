// functions that execute when a node is clicked
// functions are called in drawGraph function

// function executed when node is clicked
function nodeClick(node, svgs)
{
  cleanNodeDegree(svgs);
  selectedNode = node.id;
  let nodesize = nodesizeScale * 5;
  nodeHighlighted = true;
  // reset all nodes in both graphs by using d3. instead of svg.
  d3.selectAll("circle").style("stroke", () => d3.rgb(255, 255, 255)).attr("r", nodesize);


  deactivateFilter_nodecheckbox();
  nodeFilterFlag = weightFilterFlag = lengthFilterFlag = -1;
  svgs.forEach(function (x) {
    updateDrawing(x, [node.id]);
    // display clicked node's degree
    showNodeDegree(x, node.id);
  });

}

// show clicked node's degree beside itself on graph
function showNodeDegree(svg, nodeId)
{
  // for debugging(delete later)
  // svg.selectAll("circle").each(function (d){
  //   if (d.id === nodeId) {
  //     $("#currentNodeDegree").text("Node degree:" + d.degree);
  //   }
  // });
  var selectedCircle = svg.selectAll("circle").filter(function(d) {return d.id === nodeId;});
  selectedCircle.on("mouseover", function(d) {	
    addNodeIdText(svg, d);	
    d3.select("body").append("div")	
      .attr("class", "degTooltip")
      // .transition()		
      // .duration(200)
      .style("opacity", 0.9)
      .html("degree=" + d.degree)	
      .style("left", (d3.event.pageX) + "px")		
      .style("top", (d3.event.pageY + 10) + "px");	
  })					
  .on("mouseout", function(d) {		
    d3.select("body").selectAll(".degTooltip, rect, text").remove();
  });
}

/**
 * add a hover nodeId text beside nodes
 */
function addNodeIdText(svg, d)
{
  let wh = getTextWidth(d.id);
  let width = wh[0];
  let height = wh[1];
  let x = d.x + 0.75 * NODE_RADIUS;
  let y = d.y - 1.25 * NODE_RADIUS;  
  // deal with top side, right-top corner and right side specially
  let xborder = GRAPH_WIDTH - width;
  let yborder = NODE_RADIUS * 3;
  if (d.x <= xborder && d.y <= yborder) // top side
  {
    x = d.x + NODE_RADIUS;
    y = d.y + 1.25 * NODE_RADIUS;
  } 
  else if (d.x > xborder && d.y <= yborder) // right-top corder
  {
    x = d.x - width - NODE_RADIUS / 2;
    y = d.y + 1.25 * NODE_RADIUS;
  }
  else if (d.x > xborder && d.y > yborder) // right side
  {
    x = d.x - width - NODE_RADIUS;
  }

  // svg.append("text").attr("x", x).attr("y", y).text(d.id);

  // add a bordered "node.id" tooltip

  // svg.selectAll("g.nodeNameHoverContainer").remove();
  let textg = svg.append("g").attr("class", "nodeNameHoverContainer").style("opacity", 0.9);
  textg.append("rect")
    .attr("x", x)
    .attr("y", y-0.8*height)
    .attr("class", "nodeNameHover")
    .attr("width", 1.35*width)
    .attr("height", height);
    // .style("fill", "#ffffff")
    // .style("fill-opacity", 0)
    // .style("stroke","#383838")
    // .style("stroke-width", 0.5);
  textg.append("text")
    .attr("x", x+width*0.05)
    .attr("y", y)
    .text(d.id)
    .style("font-size", "0.7em")
    .attr("class", "nodeNameText");

  // disappear by timer
  // d3.selectAll("rect, text")
  //   .transition()
  //   .duration(1000)
  //   .remove();
}

// remove the tooltips and former mouseover handler
function cleanNodeDegree(svgs)
{
  // $("#currentNodeDegree").empty();
  // d3.selectAll(".degTooltip").remove();// no need but to confirm
  if(selectedNode != null)
  {
    svgs.forEach(function (svg)
    {
      let selectedCircleL = svg.selectAll("circle").filter(function(d) {return d.id === selectedNode;});

      selectedCircleL.on("mouseover", function (d) {addNodeIdText(svg, d);})
        // .on("mouseout", function (d) {svg.selectAll("text, rect").remove();});
    });
  }
  
  // set the specific node's mouseover event null (use "null" because .off() is not supported)
  // svg1.selectAll("circle").filter(function(d) {return d.id === nodeId;}).on("mouseover", null);
  // svg2.selectAll("circle").filter(function(d) {return d.id === nodeId;}).on("mouseover", null);
}

function clusterHighlight(clusterId, svgs)
{
  currentHighlightCluster = clusterId;
  nodeHighlighted = true;
  // reset all nodes in both graphs by using d3. instead of svg.
  let nodes = [""];
  d3.selectAll("circle").each(function (d)
  {
    if(d.group === clusterId)
    {
      nodes.push(d.id);
    }
  });
  svgs.forEach(svg => updateDrawing(svg, nodes));
}


// Move to front, called when a node is clicked and highlighted so that it is not covered
// needed for the updateDrawing function
d3.selection.prototype.moveToFront = function ()
{
  return this.each(function ()
  {
    this.parentElement.appendChild(this);
  });
};


/**
 * highlights a given node
 * @param svg the svg to draw on
 * @param nodeId the node id to check
 * @param nodeIds the nodeIds that are to be highlighted
 */
function highlightNode(svg, nodeId, nodeIds)
{
  svg.selectAll("circle").each(function (d)
  {
    if (d.id === nodeId)
    {
      if (d.id === nodeIds[0])
      {
        if (nodeDegreeHighlighting)     
        {
          let add = d.degree/currentGraph["avgDegree"];
          add = parseFloat(add);
          let sz = d3.select(this).attr("r");
          sz = parseFloat(sz);
          let newR = sz + add > NODE_RADIUS + add ? NODE_RADIUS + add : sz + add;
          newR = parseFloat(newR);
          let nodesize = nodesizeScale * newR;
          d3.select(this).style("stroke", COLOR_NODE_BORDER_HIGHLIGHT).style("opacity", "1")
          .attr("r",nodesize + 2)
          .moveToFront();
        }else
        {
          let nodesize = nodesizeScale * NODE_RADIUS;
          d3.select(this).style("stroke", COLOR_NODE_BORDER_HIGHLIGHT).style("opacity", "1")
          .attr("r", nodesize +2)
          .moveToFront();
        }
      } else
      {
        d3.select(this).style("stroke", COLOR_NODE_BORDER_HIGHLIGHT).style("opacity", "1")
          .moveToFront();
      }
    }
  });

}

/**
 * removes highlights from the given node
 * @param svg the svg to draw on
 * @param nodeId the node id to check
 * @param nodeIds the nodeIds that are to be highlighted
 */
function deHighlightNode(svg, nodeId, nodeIds)
{
  svg.selectAll("circle").each(function (d)
  {
    if (d.id === nodeId)
    {

      //if nodesize checkbox checked, make sure node radius still rendered by degree after mouseout lines
      if (nodeDegreeHighlighting)     
      {
        let add = d.degree/currentGraph["avgDegree"];
        add = parseFloat(add);
        let sz = d3.select(this).attr("r");
        sz = parseFloat(sz);
        let newR = sz + add > NODE_RADIUS + add ? NODE_RADIUS + add : sz + add;
        newR = parseFloat(newR);
        let nodesize = nodesizeScale * newR;
        d3.select(this).style("stroke", COLOR_NODE_BORDER)
        .attr("r",nodesize)
        .moveToFront();
      }else
      {
        let nodesize = nodesizeScale * NODE_RADIUS;

        d3.select(this).style("stroke", COLOR_NODE_BORDER)
        .attr("r", nodesize)
        .moveToFront();
      }
    }
  });

}

// function executes to continually check if node has been clicked in other graph
function updateDrawing(svg, nodeIds)
{
  let dataSourceNodes = document.getElementById("dataInfoNodes");
  let dataSourceEdges = document.getElementById("dataInfoEdges");
  let numOfNodesHighlighted = 0;
  let numOfEdgesHighlighted = 0;
  if (nodeIds.length > 0)
  {
    deactivateSelection(nodeFilterFlag, weightFilterFlag, lengthFilterFlag);
    currentNeighbors = nodeIds;
    // check all nodes in svg to see if one has been clicked
    svg.selectAll("circle").each(function (d)
    {
      // let opacity =  edgeHighlighting ? 0.5 : 0;
      let opacity =  highlightOpacity;
      d3.select(this).style("opacity", opacity);
    });

    if (currentHighlightCluster !== -1)
    {
      nodeIds.forEach(x =>  highlightNode(svg, x, nodeIds));
    }


    // reset all links in svg
    // let opacity = edgeHighlighting ? 0.7 : 0;
    let opacity = highlightOpacity;
    svg.selectAll("line").style("opacity", opacity).style("stroke", COLOR_EDGE);


    // update connecting links in svg for links where source/target is the selected node
    svg.selectAll("line").each(function (d)
    {
      if (nodeIds.includes(d.target.id) || nodeIds.includes(d.source.id))
      {
        if (currentHighlightCluster !== -1)
        {
          if (d.source.group === currentHighlightCluster && d.target.group === currentHighlightCluster)
          {
            highlightNode(svg, d.source.id, nodeIds);
            highlightNode(svg, d.target.id, nodeIds);

            let intensity = d.source.id === nodeIds[0] || d.target.id === nodeIds[0] ? 0 : 127;
            let primaryColor = intensity;
            if (edgeHighlighting || highlightOpacity > 0.5)
            {
              primaryColor = 255;
            }
            d3.select(this)
              .style("stroke", () => d3.rgb(primaryColor, intensity, intensity))
              .style("opacity", 1)
              .moveToFront();
          }
        } else
        {

          highlightNode(svg, d.source.id, nodeIds);
          highlightNode(svg, d.target.id, nodeIds);

          let intensity = d.source.id === nodeIds[0] || d.target.id === nodeIds[0] ? 0 : 127;
          let primaryColor = intensity;
          if (edgeHighlighting || highlightOpacity > 0.5)
          {
            primaryColor = 255;
          }
          d3.select(this)
            .style("stroke", () => d3.rgb(primaryColor, intensity, intensity))
            .style("opacity", 1)
            .moveToFront();
        }
      }
    });

    // change the content of dataSource
    if(highlightOpacity != 0)
    {
      dataSourceNodes.innerHTML = dataSourceNodes.innerHTML.replace("displayed", "highlighted");
      dataSourceEdges.innerHTML = dataSourceEdges.innerHTML.replace("displayed", "highlighted");
    } else
    {
      dataSourceNodes.innerHTML = dataSourceNodes.innerHTML.replace("highlighted", "displayed");
      dataSourceEdges.innerHTML = dataSourceEdges.innerHTML.replace("highlighted", "displayed");
    }
    // no matter how highlightOpacity changes, numbers in "dataSource" does not change
    svg.selectAll("circle").each(function (d)
    {
      let stroke = d3.select(this).style("stroke");
      if(stroke != d3.rgb(255, 255, 255)) {
        numOfNodesHighlighted += 1;
      }
    });
    svg.selectAll("line").each(function (d)
    {
      let stroke = d3.select(this).style("stroke");
      if(stroke != d3.rgb(153, 153, 153)) {
        numOfEdgesHighlighted += 1;
      }
    });
    updateNumberOfNodesAndEdgeDisplayed(numOfNodesHighlighted, numOfEdgesHighlighted);

  } else
  {

    dataSourceNodes.innerHTML = dataSourceNodes.innerHTML.replace("highlighted", "displayed");
    dataSourceEdges.innerHTML = dataSourceEdges.innerHTML.replace("highlighted", "displayed");
    svg.selectAll("line").style("opacity", 1);

    svg.selectAll("circle").each(function(d)
    {
      if(interactionFlags.nodesizeCheckboxAllowed)
      {
        increaseNodeRadiusByDegree(this, d);
      }
      nodesizeScalar(this, d);
    });

    svg.selectAll("line").each(function(d)
    {
      if(interactionFlags.edgethicknessCheckboxAllowed)
      {
        increaseEdgeThickness(this, d);
      }
    });


    if( interactionFlags.nodeDegreeFilterAllowed)
    {
      filterByNodeDegree(svg);
    }
    if( interactionFlags.edgeWeightFilterAllowed)
    {
      filterEdgesByWeight(svg);
    }
    if(interactionFlags.edgeLengthFilterAllowed)
    {
      filterEdgesByLength(svg);
    }
    deactivateSelection(nodeFilterFlag, weightFilterFlag, lengthFilterFlag);
  }

}


/**
 * increases the edge thickness based on the edge value
 * @param link the svg object
 * @param edge the edge
 */
function increaseEdgeThickness(link, edge)
{
  let thickness = edgeThicknessHighlighting ? Math.sqrt(edge.value) : 1;
  d3.select(link).attr("stroke-width", thickness);
}

/**
 * scale the node radius with nodesizeScalar
 * @param circle the svg circle object
 */
function nodesizeScalar(circle, node)
{
  if (nodeDegreeHighlighting)
  {
    if((currentGraph["maxDegree"] - 1.5 * currentGraph["avgDegree"])<currentGraph["avgDegree"])
    {
      percent = node.degree/currentGraph["avgDegree"];
      percent = parseFloat(percent);
      add =  2 * percent;
    }else
    {
      add = node.degree/currentGraph["avgDegree"]/1.5;
    }
    add = parseFloat(add);
    let newR = add + NODE_RADIUS;
    newR = parseFloat(newR);
    let nodesize = nodesizeScale * newR;
    d3.select(circle).attr("r", nodesize);
  }else
  {
    let nodesize = nodesizeScale * NODE_RADIUS;
    d3.select(circle).attr("r", nodesize);
  }
}

/**
 * increases the node radius based on the node degree
 * @param circle the svg circle object
 * @param node the node
 */
function increaseNodeRadiusByDegree(circle, node)
{
  let add = -1;
  if((currentGraph["maxDegree"] - 1.5 * currentGraph["avgDegree"])<currentGraph["avgDegree"])
  {
    let percent = node.degree/currentGraph["avgDegree"];
    percent = parseFloat(percent);
    add = nodeDegreeHighlighting ? 2 * percent : 0;
  } else
  {
    add = nodeDegreeHighlighting ? node.degree/currentGraph["avgDegree"]/1.5 : 0;
  }
  add = parseFloat(add);   // if calling increase function twice, these values would be strings rather than float, thus cannot parse r correct
  let sz = d3.select(circle).attr("r");
  sz = parseFloat(sz);
  let newR = sz + add > NODE_RADIUS + add ? NODE_RADIUS + add : sz + add;
  newR = parseFloat(newR);
  d3.select(circle).attr("r", newR);
}

/**
 * filters the node by degree (global) and sets the opacity to 0 if below the minimum value
 * also removes edges that don't have any nodes to it
 * @param svg the svg to draw on
 * @global nodeDegreeFilter the value of the minimum node degree
 */
function filterByNodeDegree(svg)
{
  let hiding = [];
  let numOfNodesDisplayed = 0;
  let numOfEdgesDisplayed = 0;
  svg.selectAll("circle").each(function (d) {
    let opacity =  d.degree >= nodeDegreeFilter ? 1 : 0;
    // opacity *= d3.select(this).style("opacity");
    d3.select(this).style("opacity", opacity);
    // calculate displayed nodes (opacaity = 1)
    if(opacity === 1) {
      d3.select(this).moveToFront();
      numOfNodesDisplayed += 1;
    }
    hiding.push(opacity);
  });
  svg.selectAll("line").each(function (l, id, listOfLinks) {
    let opacity =  l.source.degree >= nodeDegreeFilter && l.target.degree >= nodeDegreeFilter ? 1 : 0;
    d3.select(this).style("opacity", opacity);

    // count displayed nodes (opacaity = 1)
    if(opacity === 1) {
      d3.select(this).moveToFront();
      numOfEdgesDisplayed += 1;
    }
  });
  // change the display of numbers of node displayed and edges displayed
  updateNumberOfNodesAndEdgeDisplayed(numOfNodesDisplayed, numOfEdgesDisplayed);
  nodeFilterFlag = hiding.indexOf(0);
  return nodeFilterFlag;
}

/**
 * filters edges by weight (global) and sets the opacity to 0 if below the minimum value
 * @param svg the svg to draw on
 * @global edgeWeightFilter the value of the minimum edge weight
 */
function filterEdgesByWeight(svg)
{
  let hiding = [];
  // filter lines by weight
  let lines = svg.selectAll("line");
  let numOfNodesDisplayed = 0;
  let numOfEdgesDisplayed = 0;
  lines.each(function (l) {
    let opacity =  l.value >= edgeWeightFilter && d3.select(this).style("opacity") > 0 ? 1 : 0;
    d3.select(this).style("opacity", opacity);
    if(opacity === 1) {
      d3.select(this).moveToFront();
      numOfEdgesDisplayed += 1;
    }
    hiding.push(opacity);
  });
  if ($("#edgeFilterSlider").val() != currentGraph["minWeight"])
  {
    // put invisible lines into disline
    let disline = lines.select(function(l){
      return d3.select(this).style("opacity") == 0 ? this : null;
    });
    let remainedLine = lines.select(function(l){
      return d3.select(this).style("opacity") != 0 ? this : null;
    });
    // put source and target of invisible lines into sourceIds and targetIds
    let sourceIds = [];
    disline.each(function(l){
      let sourceId = l.source.id;
      sourceIds.push(sourceId);
      return sourceIds;
    });
    let targetIds = [];
    disline.each(function(l){
      let targetId = l.target.id;
      targetIds.push(targetId);
      return targetIds;
    });
    // put source and target of visible lines into redrawIds
    let redrawIds = [];
    remainedLine.each(function(l){
      let redrawSourceId = l.source.id;
      let redrawTargetId = l.target.id;
      redrawIds.push(redrawSourceId);
      redrawIds.push(redrawTargetId);
      return redrawIds;
    });
    // if circle are source and target of invisible lines, hide them
    for (let i = 0; i<(sourceIds.length > targetIds.length ? sourceIds.length : targetIds.length); i++)
    {
      svg.selectAll("circle").each(function (d) {
              if(d.id === sourceIds[i] || targetIds[i] === d.id)
              {
                d3.select(this).style("opacity", 0);
              }
      });
    }
    // redraw mis-hidden circles
    for (let i=0; i<redrawIds.length; i++)
    {
      svg.selectAll("circle").each(function (d) {
        if(d.id === redrawIds[i])
        {
          d3.select(this).style("opacity", 1);
          d3.select(this).moveToFront();
        }
      });
    }
  }  
  // count displayed nodes (opacaity = 1)
  svg.selectAll("circle").each(function (d) {
    let opacity = d3.select(this).style("opacity");
    if(opacity == 1) {
      numOfNodesDisplayed += 1;
      d3.select(this).moveToFront();
    }
  });



  updateNumberOfNodesAndEdgeDisplayed(numOfNodesDisplayed, numOfEdgesDisplayed);


  weightFilterFlag = hiding.indexOf(0);
  return weightFilterFlag-1;
}

/**
 * filters edges by length (global) and sets the opacity to 0 if below the minimum value
 * @param svg the svg to draw on
 * @global edgeLengthFilter the value of the minimum edge length
 */
function filterEdgesByLength(svg)
{
  let hiding = [];
  let lines = svg.selectAll("line");

  let numOfNodesDisplayed = 0;
  let numOfEdgesDisplayed = 0;
  lines.each(function (l) {
    let opacity = edgeLengths[l.index] >= edgeLengthFilter && d3.select(this).style("opacity") > 0 ? 1 : 0;
    // opacity *= d3.select(this).style("opacity");
    d3.select(this).style("opacity", opacity);
    if(opacity == 1) {
      numOfEdgesDisplayed += 1;
      d3.select(this).moveToFront();
    }
    hiding.push(opacity);
  });
  if ($("#edgeLengthSliderL").val() != 0 || ($("#edgeLengthSliderR").val() !== undefined && $("#edgeLengthSliderR").val() != 0))
  {
    // put invisible lines into disline
    let disline = lines.select(function(l){
      return d3.select(this).style("opacity") == 0 ? this : null;
    });
    let remainedLine = lines.select(function(l){
      return d3.select(this).style("opacity") != 0 ? this : null;
    });
    // put source and target of invisible lines into sourceIds and targetIds
    sourceIds = [];
    disline.each(function(l){
      let sourceId = l.source.id;
      sourceIds.push(sourceId);
      return sourceIds;
    });
    targetIds = [];
    disline.each(function(l){
      let targetId = l.target.id;
      targetIds.push(targetId);
      return targetIds;
    });
    // put source and target of visible lines into redrawIds
    redrawIds = [];
    remainedLine.each(function(l){
      let redrawSourceId = l.source.id;
      let redrawTargetId = l.target.id;
      redrawIds.push(redrawSourceId);
      redrawIds.push(redrawTargetId);
      return redrawIds;
    });
    // if circle are source and target of invisible lines, hide them
    for (var i = 0; i<(sourceIds.length > targetIds.length ? sourceIds.length : targetIds.length); i++)
    {
      svg.selectAll("circle").each(function (d) {
              if(d.id == sourceIds[i] || d.id == targetIds[i])
              {
                d3.select(this).style("opacity", 0);
              }
      });
    }
    // redraw mis-hidden circles
    for (var i=0; i<redrawIds.length; i++)
    {
      svg.selectAll("circle").each(function (d) {
        if(d.id == redrawIds[i])
        {
          d3.select(this).style("opacity", 1);
          d3.select(this).moveToFront();
        }
      });
    }  
  }
  // count displayed nodes (opacaity = 1)
  svg.selectAll("circle").each(function (d) {
    let opacity = d3.select(this).style("opacity");
    if(opacity == 1) {
      numOfNodesDisplayed += 1;
      d3.select(this).moveToFront();
    }
  });
  updateNumberOfNodesAndEdgeDisplayed(numOfNodesDisplayed, numOfEdgesDisplayed);
  lengthFilterFlag = hiding.indexOf(0);
  return lengthFilterFlag;
}

/**
 * computes the edge length in the drawing and saves it globally
 * @param svg the svg to use
 * @global edgeLenghts the array that stores the edgelengths
 */
function computeEdgeLength(svg)
{
  svg.selectAll("line").each(function (l) {
    let x1 = d3.select(this).attr("x1");
    let y1 = d3.select(this).attr("y1");
    let x2 = d3.select(this).attr("x2");
    let y2 = d3.select(this).attr("y2");
    let len = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    edgeLengths[l.index] = len;
  });
}

// function resets node to normal
function resetNodes(svg)
{
  nodeHighlighted = false;
  // reset all nodes in svg

  svg.selectAll("circle").style("stroke", () => d3.rgb(255, 255, 255)).attr("r", nodesizeScale * NODE_RADIUS);

  // reset all lines in svg as white 
  svg.selectAll("line").style("stroke", "#999");
}

/***
 * computes the width of the text for labels
 * @param text the text to measure
 * @returns {*[width, height]} of the text element
 */
function getTextWidth(text)
{
  let textWidthDiv = document.getElementById("textWidthDiv");
  textWidthDiv.innerHTML = text;
  let height = (textWidthDiv.clientHeight + 5);
  let width = (textWidthDiv.clientWidth + 5);

  return [width, height];
}

// function that processes graph click transactions  
function setUpOnClickActions(svg, graph, svgs)
{
  svg.on("click", function ()
  {
    if(interactionFlags.mouseinteractAllowed && interactionFlags.emptyclickAllowed)
    {
      cleanNodeDegree(svgs);
      selectedNode = null;

      edgeLengthFilter = 0;
      edgeWeightFilter = graph.minWeight;  //reset filters' value
      nodeDegreeFilter = graph.minDegree;
      svgs.forEach(function(svg)
      {
        resetNodes(svg);
        updateDrawing(svg, []);
      });
      $("#nodeDropdown").val('None');
      $("#clusterDropdown").val('None');
      $("#edgeLengthSliderL").prop("value", 0);
      $("#edgeLengthSliderR").prop("value", 0);  //reset sliders back to min
      $("#nodeDegreeFilter").prop("value", graph.minDegree);
  
      // $("#nodeDropdown").prop("disabled", false);
      // $("#clusterDropdown").prop("disabled", false);
      activateFilter_nodecheckbox();
      currentNeighbors = [];
      currentHighlightCluster = -1;
      // while on click, just enable edgeweightslider for Les_Misrables
      if(graph.avgWeight !== 1)
      {
        $("#edgeFilterSlider").prop('disabled', false);
        $("#edgeFilterSlider").prop("value", graph.minWeight);
      }  
    }
  });
  svg.selectAll("circle")
    .on("click", function (d)
    {
      d3.event.stopPropagation();
      svg.selectAll("text, rect").remove();

      $("#nodeDropdown").val(d.id);
      $("#clusterDropdown").val('None');
      currentHighlightCluster = -1;
      if(interactionFlags.mouseinteractAllowed && interactionFlags.nodeClickAllowed)
      {
        nodeClick(d, svgs);
      }

    })
    //add a hover text, while mouse moves over nodes 
    .on("mouseover", function (d)
    {
      if(!dragging && interactionFlags.mouseNodeAllowed)
      {
        let op = d3.select(this).style("opacity");
        if (op > 0)
        {
          addNodeIdText(svg, d);
        }
      }
    })
    .on("mouseout", function (d)
    {
      if(interactionFlags.mouseNodeAllowed)
      {
        svg.selectAll("text, rect").remove();
      }
    })
    //draw neighbors of current nodes if dbclicked
    .on("dblclick", function (d)
    {
      if(interactionFlags.mouseinteractAllowed && interactionFlags.nodeDbClickAllowed)
      {
        let neighbors = breadthFirstSearch(graph, d.id, 1);
        let nodesize = nodesizeScale * 5;
        d3.selectAll("circle").style("stroke", () => d3.rgb(255, 255, 255)).attr("r", nodesize);
        //add black stroke with radius 5 to nodes  ?????

        svgs.forEach(x => updateDrawing(x, neighbors));
      }


    });

  // highlightnode while mouseover line
    svg.selectAll("line").on("mouseover", function (d)
    {
      if(!dragging && interactionFlags.mouseinteractAllowed && interactionFlags.mouseLineAllowed)
      {
        let op = d3.select(this).style("opacity");
        if (op > 0 && !nodeHighlighted)
        {
          d3.select(this)
            .style("stroke", COLOR_EDGE_HIGHLIGHT)
            .moveToFront();
          highlightNode(svg, d.source.id, []);
          highlightNode(svg, d.target.id, []);
          // display nodes id label
          addNodeIdText(svg, d.source);
          addNodeIdText(svg, d.target);
        }
      }
    }).on("mouseout", function (d)
    {
      if(!dragging && interactionFlags.mouseinteractAllowed && interactionFlags.mouseLineAllowed)
      {
        let op = d3.select(this).style("opacity");
        if (op > 0 && !nodeHighlighted)
        {
          d3.select(this)
            .style("stroke", COLOR_EDGE);
          deHighlightNode(svg, d.source.id, []); //source of line
          deHighlightNode(svg, d.target.id, []); //target of line
          // remove nodeId lables
          svg.selectAll("text, rect").remove();
        }
      }
    });
  svg.on("mouseover", () => updateFooterText(TOOLTIP.SVG_HOVER, "visible")).on("mouseout", () => updateFooterText(TOOLTIP.SVG_HOVER, "hidden"));
}


function updateNumberOfNodesAndEdgeDisplayed(numOfNodesDisplayed, numOfEdgesDisplayed)
{
  let dataSourceNodes = document.getElementById("dataInfoNodes");
  let dataSourceEdges = document.getElementById("dataInfoEdges");
  dataSourceNodes.innerHTML = dataSourceNodes.innerHTML.replace(/([^:][^:]*: )[^\/][^\/]*\/ (..*)/, '$1' + numOfNodesDisplayed + ' / $2');
  dataSourceEdges.innerHTML = dataSourceEdges.innerHTML.replace(/([^:][^:]*: )[^\/][^\/]*\/ (..*)/, '$1' + numOfEdgesDisplayed + ' / $2');
}