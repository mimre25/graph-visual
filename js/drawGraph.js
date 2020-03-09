// This file sets the new drawGraph functions

/** Will take as arguments drawGraph(graphic, parameters, update, elements) in which
graphic : object with graphic.svg is svg created and graphic.simulation is the simulation defined
parameters : object containing the following
        dataSet : source of graph, name
        graphType : type of graph, string name such as "Force Directed", "Circular", "Randomized"
        bundling: boolean value of true for bundling, false for no bundling
        Value : depends on type of graph, input value for type of graph as follows
            "Force Directed" : input value of link strength (1-10)
            "Circular" : input value for radius of circle (40-240)
            "Randomized" : do not put any value
update : boolean true or false value if graph simulation needs to be changed when UI elements are changed
elements : UI elements needs to be passed as object if update is set to true. Objects are following:
        bundling :        checkbox clicked to enable/disable edge bundling
        bundlebox :       bundle checkbox and text
        strengthSlider :  slider that controls link strength for FD layout
        radiusSlider :   slider that controls circular layout strength
        sliderDiv1 :     div that stores FD link strength slider (needed to show/hide when layout change)
        sliderDiv2 :      div that stores circular radius slider (needed to show/hide when layout change)
        dropdown :        dropdown used to change layout
        randomButton :  	"Randomize" button used for random layout
        sliderB1 :        slider that controls the step size edge bundling function
        sliderB2 :        slider that controls the compatibility_threshold edge bundling function
        strOut:		       	<p> element that displays the currently selected layout

        **/
function drawGraph(graph, graphic, parameters, dataset, svgs, elements = {}, update = false, bundlingParameter = {})
{
  let dataPoints;
  let graphType;

  // link and node creation functions defined in nodesAndLinks.js file
  // add links to svg

  // add nodes to svg
  // nodes are created if the bundling button needs to be updated
  let nodes;
  let links = createLinks(graphic.svg, graph);
  if (!update)
  {
    nodes = createNodes(graphic.svg, graphic.simulation, graph, parameters.graphType, parameters.bundling, dataset);
  } else
  {
    nodes = createNodes(graphic.svg, graphic.simulation, graph, parameters.graphType, parameters.bundling, dataset);
  }



  // on click handler for when a node is clicked
  // nodeClick function defined in nodeClickFunctions file
  setUpOnClickActions(graphic.svg, graph, svgs);

  dropdownChange(nodes, links, elements, graph, graphic, dataset);
  // The following if statement deals with UI elements if the graph needs to be updated when UI is changed
  if (update)
  {
    setupUpdate(elements, parameters, graphic, graph, nodes, links, dataset, bundlingParameter, svgs);


    // do work whenever the layout dropdown is clicked
    elements.layoutDropDown.onchange = function ()
    {
      randomizeNodes(graph, graphic);
      ControlInteractions(elements, graph);
      elements.sortByCluster.checked = false;
      // elements.bundlebox.style.display = "inline";
      // re-create node so that the positions can be update when dragged (in Randomized graph)
      graphic.svg.selectAll(".nodes").remove();
      graphic.svg.selectAll(".links").remove();
      links = createLinks(graphic.svg, graph);
      nodes = createNodes(graphic.svg, graphic.simulation, graph, elements.layoutDropDown.value, parameters.bundling, dataset);
      // dropdown change function defined in utilities.js
      dropdownChange(nodes, links, elements, graph, graphic, dataset);
      parameters.graphType = elements.layoutDropDown.value;
      // set bundling to false
      parameters.bundling = false;
      setUpOnClickActions(graphic.svg, graph, svgs);
      updateDrawing(graphic.svg, currentNeighbors);
      // colorGrouping(graphic.svg);
      setupUpdate(elements, parameters, graphic, graph, nodes, links, dataset, bundlingParameter, svgs);
    }
  }
  svgs.forEach(x => updateDrawing(x, currentNeighbors));
}


function setupUpdate(elements, parameters, graphic, graph, nodes, links, dataset, bundlingParameter, svgs)
{
  let bundling = { 'checked': false };
  // If no parameters input, initialize buttons, sliders, and dropdown menu
  // initialize function defined in utilities.js file
  initializeUI(elements, parameters, dataset, bundlingParameter);
  // update graph when UI elements changed
  // on link strength slider, change the force
  elements.strengthSlider.onmouseup = function ()
  {
    if(interactionFlags.linkStrengthAllowed)
    {
      linkStrengthSlider(bundling, elements.strengthSlider.value, graphic.simulation);
      parameters.value = elements.strengthSlider.value;
      // elements.linkStrengthSpan.text(elements.strengthSlider.value);  
    }
  };
  elements.strengthSlider.oninput = function ()
  {
    if(interactionFlags.linkStrengthAllowed)
    {
      linkStrengthSlider(bundling, elements.strengthSlider.value, graphic.simulation);
      parameters.value = elements.strengthSlider.value;
      // elements.linkStrengthSpan.text(elements.strengthSlider.value);  
    }
  };
  elements.repulsiveSlider.onmouseup = function ()
  {
    if(interactionFlags.repulsiveForceAllowed)
    {
      let realRepulsiveForce = -1 * elements.repulsiveSlider.value;
      repulsiveForceSlider(bundling, realRepulsiveForce, graphic.simulation);
      parameters.value = elements.repulsiveSlider.value;
      // elements.linkStrengthSpan.text(elements.strengthSlider.value);  
    }
  };
  elements.repulsiveSlider.oninput = function ()
  {
    if(interactionFlags.repulsiveForceAllowed)
    {
      let realRepulsiveForce = -1 * elements.repulsiveSlider.value;
      repulsiveForceSlider(bundling, realRepulsiveForce, graphic.simulation);
      parameters.value = elements.repulsiveSlider.value;
      // elements.linkStrengthSpan.text(elements.strengthSlider.value);  
    }
  };

  elements.animateButton.on("click",function ()
  {
    if(interactionFlags.FDAnimateAllowed)
    {
      animateForceDirectedLayout(graphic.simulation, links, nodes);
    }
  });

  // on circle radius slider, change the radius
  elements.radiusSlider.onmouseup = function ()
  {
    if(interactionFlags.circleRadiusAllowed)
    {
      circularGraph(graph, graphic.simulation, elements.radiusSlider.value, nodes, links, elements);
      parameters.value = elements.radiusSlider.value;
      // elements.circleRadiusSpan.text(elements.radiusSlider.value);  
    }
  };
  elements.radiusSlider.oninput = function ()
  {
    if(interactionFlags.circleRadiusAllowed)
    {
      circularGraph(graph, graphic.simulation, elements.radiusSlider.value, nodes, links, elements);
      parameters.value = elements.radiusSlider.value;
      // elements.circleRadiusSpan.text(elements.radiusSlider.value);
    }
  };

  // when randomize button is clicked call randomize function
  elements.randomButton.onclick = function ()
  {
    if (parameters.bundling === false && interactionFlags.RMRandomizeAllowed)
    {
      // re-create random graph
      randomGraph(graph, graphic.simulation, graphic.svg, nodes, links);
    }
  };

  elements.sortByCluster.onchange = function()
  {
    if(elements.layoutDropDown.value === LAYOUTS.CIRCULAR)
    {
      if(elements.sortByCluster.checked === true)
      {
        idMapCircular(graph, graphic, graphic.svg, elements, nodes, links, parameters, svgs, dataset);
      }else
      {
        randomizeNodes(graph, graphic);
      }
      graphic.svg.selectAll(".nodes").remove();
      graphic.svg.selectAll(".links").remove();
      links = createLinks(graphic.svg, graph);
      nodes = createNodes(graphic.svg, graphic.simulation, graph, parameters.graphType, parameters.bundling, dataset);
      setUpOnClickActions(graphic.svg, graph, svgs);
      updateDrawing(graphic.svg, currentNeighbors);
      circularGraph(graph, graphic.simulation, elements.radiusSlider.value, nodes, links);
    }else if (elements.layoutDropDown.value === EXTRA_LAYOUT)
    {
      if(dataset.graphName === "cities" || dataset.graphName === "divorce")
      {
        plotGraph(graphic, "./data/json/" + dataset.graphName + "_positions.json", links, nodes, graph, elements);
      }  
    }
  };

  // when radio button for edge bundling is clicked
  // elements.bundlingCheckbox.onchange = function ()
  // {
  //   if(interactionFlags.edgeBundlingAllowed)
  //   {
  //     ControlInteractions(elements, graph);
  //     if(interactionFlags.mouseinteractAllowed)
  //     {
  //      resetForBundling(svgs);
  //     }
  //     // bundling button defined in utilities
  //     bundlingButton(elements, graphic, graph, bundlingParameter, svgs);
  //     let checked = elements.bundlingCheckbox.checked;
  //     parameters.bundling = checked;
  //     hideLoadingForEdgeBundling();
  //   }
  // };

}
