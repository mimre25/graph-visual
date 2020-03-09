// utilities necessary to button/slider changes
// functions are called in drawGraphFunction

let timeouts = [];

/**
 * if selected or filtered, reset ALL and then do bundling
 */
function resetForBundling(svgs)
{
  dragging = false;
  nodeHighlighted = false;
  edgeHighlighting = false;
  nodeDegreeHighlighting = false;
  $("#checkBoxNodeDegree").prop("disabled", false); 
  $("#checkBoxNodeDegree").prop("checked", false); 
  $("#nodeSizeDiv").css("opacity", 1);

  edgeThicknessHighlighting = false;  
  nodeDegreeFilter = currentGraph["minDegree"];
  edgeWeightFilter = currentGraph["minWeight"];
  edgeLengthFilter = 0;
  selectedNode =[];
  currentHighlightCluster = -1;
  currentNeighbors = [];
  $("#edgeLengthSliderL").prop("value", 0);
  $("#edgeLengthSliderR").prop("value", 0);
  $("#edgeFilterSlider").prop("value", currentGraph["minWeight"]);   
  $("#nodeDegreeFilter").prop("value", currentGraph["minDegree"]);

  // svg1.selectAll("line").style("stroke", COLOR_EDGE);
  // svg1.selectAll("circle").style("stroke", COLOR_NODE_BORDER);
  // svg2.selectAll("line").style("stroke", COLOR_EDGE);
  // svg2.selectAll("circle").style("stroke", COLOR_NODE_BORDER);
  svgs.forEach(function(svg)
  {
    resetNodes(svg);
    updateDrawing(svg, currentNeighbors);
  });

}
// initialize sliders and buttons
function initializeUI(elements, parameters, dataset, bundlingParameter)
{
  // initialize radio button to no bundling
  // bundling.checked = parameters.bundling;

  // set graph dropdown value and string
  elements.layoutDropDown.value = parameters.graphType;
  // elements.strOut.innerHTML = "You selected: " + parameters.graphType + " Layout.";


  elements.linkStrengthSliderDiv.style.display = "none";
  elements.radiusSliderDiv.style.display = "none";
  elements.randomButton.style.display = "none";
  elements.sortByClusterDiv.style.display = "none";
  switch (parameters.graphType)
  {
    case LAYOUTS.CIRCULAR:
        elements.radiusSliderDiv.style.display = "block";
        elements.sortByClusterDiv.style.display = "inline";
        bundlingParameter.stp = dataset.defaultStsize_cr;
        bundlingParameter.cmp = dataset.defaultComthresh_cr;

      break;
    case LAYOUTS.FORCE_DIRECTED:
        elements.linkStrengthSliderDiv.style.display = "block";
        bundlingParameter.stp = dataset.defaultStsize_fd;
        bundlingParameter.cmp = dataset.defaultComthresh_fd;
      break;
    case LAYOUTS.RANDOMIZED:
        bundlingParameter.stp = 6;
        bundlingParameter.cmp = 6;
        elements.randomButton.style.display = "block";
      break;
    case LAYOUTS.FM_3:
        bundlingParameter.stp = 6;
        bundlingParameter.cmp = 4;
      break;
    case LAYOUTS.FORCE_ATLAS:
        bundlingParameter.stp = 6;
        bundlingParameter.cmp = 4;
      break;
    case LAYOUTS.OPENORD:
        bundlingParameter.stp = 6;
        bundlingParameter.cmp = 4;
      break;
    case LAYOUTS.YIFAN_HU:
        bundlingParameter.stp = 6;
        bundlingParameter.cmp = 4;
      break;
    case LAYOUTS.SPECTRAL:
        bundlingParameter.stp = 6;
        bundlingParameter.cmp = 4;
      break;
    case EXTRA_LAYOUT:
      if(dataset.graphName === "cities" || dataset.graphName === "divorce")
      {
        elements.sortByClusterDiv.style.display = "inline";
      }
      break;
  }

  // initialize edge bundling step size slider
  // elements.sliderB1.value = 1;
  // elements.sliderB1.disabled = true;

  // initialize edge bundling compatibility threshold slider
  // elements.sliderB2.value = 0.6;
  // elements.sliderB2.disabled = true;
}

// function to execute when bundling radio button clicked
function bundlingButton(elements, graphic, graph, bundlingParameter, svgs)
{
  interactionFlags.mouseinteractAllowed = (!document.getElementById("bundling").checked);
  // bundling on is clicked
  if (bundling.checked)
  {
    while(timeouts.length > 0)
    {
      clearTimeout(timeouts.pop());
    }
  
    ControlInteractions(elements, graph);
    $("#checkBoxEdgeThickness").prop("checked", false);
    $(".loading-wrapper").show();
    // clear any red lines drawn if a node was selected
    // resetNodes defined in nodeClickFunctions.js
    resetNodes(graphic.svg);
    // clear any existing bundling
    clearBundling(graphic.svg, graphic.simulation);
    $("#checkBoxEdgeThickness").prop("checked", false);
    // disable link strength and circle radius slider
    // call function to show bundled links
    doBundling(bundlingParameter.stp, bundlingParameter.cmp, graphic.svg, svgs);
    // pause simulation so links stay attached to nodes
    graphic.simulation.stop();
  }
  // no longer wants to see bundling
  else
  {
    ControlInteractions(elements, graph);
    // enable link strength and circle radius slider
    // clear bundling
    clearBundling(graphic.svg, graphic.simulation);
    $("#checkBoxEdgeThickness").prop("checked", false);
  }
}

// // function executed when bundling sliders are changed
// function updateBundling(elements, graphic)
// {
//   // bundling on is clicked
//   if (elements.bundling.checked)
//   {

//     // clear existing bundling
//     clearBundling(graphic.svg, graphic.simulation);
//     // call function to show bundled links
//     doBundling(elements.sliderB1.value, elements.sliderB2.value, graphic.svg);
//     // pause simulation so links stay attached to nodes
//     graphic.simulation.stop();
//   }
// }


function animateForceDirectedLayout(simulation, links, nodes)
{
  simulation.nodes().forEach(function (n) {
    n.x = GRAPH_WIDTH/2;
    n.y = GRAPH_HEIGHT/2;
    n.vx = 0;
    n.vy = 0;
  });
  // simulation.alpha(1).restart();
  simulation.restart().alpha(0.3).stop();

  let steps = 1;
  while(timeouts.length > 0)
  {
    clearTimeout(timeouts.pop());
  }

  while(simulation.alpha() > simulation.alphaTarget()+0.0001 && steps++ < 1000)
  {
    let id = setTimeout(function() {
                          simulation.tick();
                          tickedFD(nodes, links);
                        }, 200 * steps);
    timeouts.push(id);
  }

}

// function executed when link strength slider is changed
function linkStrengthSlider(checkbox, linkStrength, simulation)
{
  if (!checkbox.checked)
  {
    simulation.force("link").strength(+linkStrength / 10);
    simulation.alpha(0.3).restart();
  }
}

// function to set up link strength slider
function setupLinkStrengthSlider(dataset, elements)
{
  let slider = elements.strengthSlider;
  let mid = dataset.defaultStrength;
  let min_ = dataset.strengthMin;
  let max_ = dataset.strengthMax;
  slider.min = min_;
  slider.max = max_;
  slider.attributes.step = 0.1;
  elements.strengthSliderMin.textContent = min_;
  elements.strengthSliderMax.textContent = max_;
  slider.value = mid;
}


// function executed when link strength slider is changed
function repulsiveForceSlider(checkbox, repulsiveForce, simulation)
{
  if (!checkbox.checked)
  {
    simulation.force("charge", d3.forceManyBody().strength(repulsiveForce));
    simulation.alpha(0.3).restart();
  }
}

// function to set up link strength slider
function setupRepulsiveForceSlider(elements, dataset)
{
  let slider = elements.repulsiveSlider;
  let mid = dataset.repulsiveDefault !== undefined ? dataset.repulsiveDefault : 30;
  let min_ = 0;
  let max_ = 100;
  slider.min = min_;
  slider.max = max_;
  slider.attributes.step = 0.1;
  elements.repulsiveSliderMin.textContent = min_;
  elements.repulsiveSliderMax.textContent = max_;
  slider.value = mid;
}

// function that executes when data dropdown menu is changed
function dropdownChange(nodes, links, elements, graph, graphic, dataset)
{
// enable sliders on dropdownchange if nodes were selected in the previous graph
  $("#checkBoxNodeDegree").prop("disabled", false); //if nodes unclicked, activate the node size checkbox
  // $("#edgeLengthSliderL").prop("disabled", false);
  // $("#edgeLengthSliderR").prop("disabled", false); //if nodes unclicked, activate the filters
  // $("#nodeDegreeFilter").prop("disabled", false);
  // $("#filterDiv").css("opacity", 1);
  // $("#nodeSizeDiv").css("opacity", 1);
  while(timeouts.length > 0)
  {
    clearTimeout(timeouts.pop());
  }

  // set bundling checkbox to unchecked and remove any bundled edges
  // bundling.checked = false;
  // remove any bundled edges
  graphic.svg.selectAll("line").each(function (d)
  {
    d3.select(this).style("stroke", function (d)
    {
      return "#999";
    })
  });
  // remove bundles links and restart simulation
  graphic.svg.selectAll("path").remove();

  // set graph dropdown value and string
  let graphType = elements.layoutDropDown.value;
  // elements.strOut.innerHTML = "You selected: " + graphType + " Layout.";

  elements.linkStrengthSliderDiv.style.display = "none";
  elements.radiusSliderDiv.style.display = "none";
  elements.randomButton.style.display = "none";
  elements.sortByClusterDiv.style.display = "none";
  graphic.svg.selectAll("text, rect").remove();
  switch (graphType)
  {
    case LAYOUTS.CIRCULAR:
      elements.radiusSliderDiv.style.display = "inline";
      elements.sortByClusterDiv.style.display = "inline";
      circularGraph(graph, graphic.simulation, elements.radiusSlider.value, nodes, links);

      break;
    case LAYOUTS.FORCE_DIRECTED:
      elements.linkStrengthSliderDiv.style.display = "inline";
      elements.strengthSlider.value = dataset.defaultStrength;
      setupLinkStrengthSlider(dataset, elements);
      setupRepulsiveForceSlider(elements, dataset);
      // elements.linkStrengthSpan.text(elements.strengthSlider.value);
      realRepulsiveForce = -1 * elements.repulsiveSlider.value
      forceDirectedGraph(graph, graphic.simulation, graphic.svg, elements.strengthSlider.value, realRepulsiveForce, nodes, links);
      break;
    case LAYOUTS.RANDOMIZED:
      elements.randomButton.style.display = "inline";
      randomGraph(graph, graphic.simulation, graphic.svg, nodes, links);
      break;
    case LAYOUTS.FM_3:
      console.log("FM^3 layout");
      plotGraph(graphic, "./data/layouts/json/" + dataset.graphName + "_fm3.json", links, nodes, graph, elements);
      break;
    case LAYOUTS.FORCE_ATLAS:
      console.log("Force Atlas 2 layout");
      plotGraph(graphic, "./data/layouts/json/" + dataset.graphName + "_force-atlas-2.json", links, nodes, graph, elements);
      break;
    case LAYOUTS.OPENORD:
      console.log("OpenOrd layout");
      plotGraph(graphic, "./data/layouts/json/" + dataset.graphName + "_openOrd.json", links, nodes, graph, elements);
      break;
    case LAYOUTS.YIFAN_HU:
      console.log("Yifan_Hu layout");
      plotGraph(graphic, "./data/layouts/json/" + dataset.graphName + "_yifan-hu.json", links, nodes, graph, elements);
      break;
    case LAYOUTS.SPECTRAL:
      console.log("Spectral layout");
      plotGraph(graphic, "./data/layouts/json/" + dataset.graphName + "_spectral.json", links, nodes, graph, elements);
      break;
    case EXTRA_LAYOUT:
      console.log("extra layout");
      elements.sortByClusterDiv.style.display = "inline";
      plotGraph(graphic, "./data/json/" + dataset.graphName + "_positions.json", links, nodes, graph, elements);
      break;
  }


  // colorGrouping(graphic.svg);
}


/**
 * Shows the loading animation for edge bundling (EB) and sets the computing flag to true.
 * This is necessary to only remove the loading animation after completing EB for both drawings.
 * @global edgeBundlingComputing the flag that shows whether EB is currently computed for both graphs
 */
function showLoadingForEdgeBundling()
{
  $(".loading-wrapper").show(0);
  edgeBundlingComputing = true;
}


/**
 * Hides the loading animation after edge bundling (EB) is completed.
 * Uses a global flag to test whether both have finished computing or not.
 * @global edgeBundlingComputing the flag that shows whether EB is currently computed for both graphs
 */
function hideLoadingForEdgeBundling()
{
  if(edgeBundlingComputing)
  {
    edgeBundlingComputing = false;
  } else
  {
    $(".loading-wrapper").hide();
  }
}


/**
 * detect dropdown's open 
 */
// function isOpen(selectElem)
// {
  // set initial status false
  // var open = false;
  // // on each click toggle "open" variable
  // selectElem.on('click', function()
  // {
  //   open = !open;
  // });
  // // on each blur toggle "open" variable only if already open
  // selectElem.on('blur', function()
  // {
  //   // open == true ? !open : open;
  //   if(open)
  //   {
  //     open = !open;
  //   }
  // });
  // // on ESC key toggle "open" only if "open"
  // $(document).keyup(function(e)
  // {
  //   if(e.keyCode == 27)
  //   {
  //     // open == true ? !open : open;
  //     if(open)
  //     {
  //       open = !open;
  //     }
  //   }
  // });
  // console.log("open:"+open);
  // return open;
// }

/**
 * removes the indentation of FR options to avoid display position offset in "select"
 * @param select // the select element need removed indentation
 */
function removeIndentation(selectElem)
{
  var childOptions = $(".optionChild", selectElem);

  childOptions.each(function()
  {
    // var indentedName = $(this).text();
    // indentedNames.push({name: indentedName});
    if($(this).is(':selected'))
    {
      $(this).text($(this).attr('value'));
      // console.log($(this).text());
    }
  });

  selectElem.on('focus', function()
  {
    childOptions.each(function(index)
    {
      $(this).text('\u00A0\u00A0\u00A0\u00A0\u00A0'+$(this).attr('value'));
    });

    $(this).on('change', function()
    {
      childOptions.each(function(options)
      {
        if($(this).is(':selected'))
        {
          $(this).text($(this).attr('value'));
          // console.log($(this).text());
        }
      });
      $(this).blur();
    });
  });
}




