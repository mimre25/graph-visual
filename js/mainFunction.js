
/**
 * fills the dataset dropdown with the dataets
 */
function setupDataSets()
{
  // text is displayName, value is graphName
  // datasets.forEach(e => $("#dataDropdown").append(new Option(e.displayName, e.graphName)));
  // Group by graph size
  datasets.sort((a, b) => (a.displayName > b.displayName)? 1 : -1).forEach(function (e)
  {
    switch(e.graphSize)
    {
      case "Small":
        $("#smallGroup").append(new Option(e.displayName, e.graphName));
        break;
      case "Medium":
        $("#mediumGroup").append(new Option(e.displayName, e.graphName));
        break;
      case "Large":
        $("#largeGroup").append(new Option(e.displayName, e.graphName));
      // break;
    }
  });

  // set default as "Les Miserables"
  $("#dataDropdown").val("les-miserables");
  // highlight what with special layouts
  let dataSource = $("#dataDropdown").val();
  let dataset = datasets.find(function (e)
  {
    return e.graphName === dataSource;
  });
}

/**
 * sets up the options that are per dataset
 */
function setupGraphOptions(svgs, simulations)
{
  $("#checkBoxColorBlind").change(function() {
    colorBlind = $("#checkBoxColorBlind").prop("checked");
  });

  $("#checkBoxEdgeHighlighting").change(function() {
    edgeHighlighting = $("#checkBoxEdgeHighlighting").prop("checked");
    svgs.forEach(x => updateDrawing(x, currentNeighbors));
  });

  $("#checkBoxNodeDegree").change(function() {
    nodeDegreeHighlighting = $("#checkBoxNodeDegree").prop("checked");
    svgs.forEach(x => updateDrawing(x, currentNeighbors));

  });

  $("#checkBoxEdgeThickness").change(function() {
    edgeThicknessHighlighting = $("#checkBoxEdgeThickness").prop("checked");
    svgs.forEach(x => updateDrawing(x, currentNeighbors));

  });

  $("#nodesizeScalar").on('input', function(){
    nodesizeScale = $("#nodesizeScalar").prop("value");
    simulations.forEach(x => x.force('collision', d3.forceCollide(NODE_RADIUS * nodesizeScale)));
    svgs.forEach(x => updateDrawing(x, currentNeighbors));

  });


  $("#nodeDegreeFilter").on('input', function() {
    nodeDegreeFilter = $("#nodeDegreeFilter").prop("value");
    svgs.forEach(x => updateDrawing(x, currentNeighbors));

  });

  $("#edgeFilterSlider").on('input', function() {
    edgeWeightFilter = $("#edgeFilterSlider").prop("value");
    svgs.forEach(x => updateDrawing(x, currentNeighbors));

  });

  $("#edgeLengthSliderL").on('input', function() {
    edgeLengthFilter = $("#edgeLengthSliderL").prop("value");
    $("#edgeLengthSliderR").prop("value", 0);
    computeEdgeLength(svgs[0]);
    svgs.forEach(x => updateDrawing(x, currentNeighbors));
  });
  $("#edgeLengthSliderR").on('input', function() {
    edgeLengthFilter = $("#edgeLengthSliderR").prop("value");
    $("#edgeLengthSliderL").prop("value", 0);
    computeEdgeLength(svgs[1]);
    svgs.forEach(x => updateDrawing(x, currentNeighbors));

  });
  $("#highlightOpacity").on('input', function ()
  {
    highlightOpacity = $("#highlightOpacity").prop("value");
    svgs.forEach(x => updateDrawing(x, currentNeighbors));
  })

}


/**
 * sets the scalae for the node size scalar slider
 * @global nodesizeScale
 */
function setupNodesizeScalar(dataset)
{
  switch(dataset.graphSize) 
  {
    case "Small":
        nodesizeScale = 1.3;
      break;
    case "Medium":
        nodesizeScale = 1.0;
      break;
    case "Large":
        nodesizeScale = 0.9;
      break;
  }
  let slider = $("#nodesizeScalar");
  let min_ = 0.7;
  let max_ = 2;
  slider.prop('min', min_);
  slider.prop('max', max_);
  slider.prop('step', 0.1);
  $("#nodesizeScaleMin").text(min_);
  $("#nodesizeScaleMax").text(max_);
  slider.prop("value", nodesizeScale);
}



/**
 * sets the values for the node degree filter slider
 * @param graph the graph to use
 */
function setupNodeDegreeSlider(graph)
{
  let slider = $("#nodeDegreeFilter");
  slider.prop('min', graph.minDegree);
  slider.prop('max', graph.maxDegree);
  slider.prop('step', 1);
  slider.prop('value', graph.minDegree);
  $("#nodeDegreeMin").text(graph.minDegree);
  $("#nodeDegreeMax").text(graph.maxDegree);
  nodeDegreeFilter = graph.minDegree;
}


function setupEdgeThicknessSwitch(graph)
{
  let disabled = graph.avgWeight === 1;

  $("#checkBoxEdgeThickness").attr("disabled", disabled);
  $("#edgeThicknessDiv").css("opacity", disabled ? 0.5 : 1);

  $("#edgeThicknessDiv .slider").css("cursor", disabled ? "default" : "pointer");

}

/**
 * sets up the values for the edge filter slider
 * @param graph the current graph
 */
function setupEdgeWeightSlider(graph)
{

  let slider = $("#edgeFilterSlider");
  if(graph.avgWeight !== 1)
  {
    $("#edgeFilteringMin").text(graph.minWeight);
    $("#edgeFilteringMax").text(graph.maxWeight);

    slider.prop('min', graph.minWeight);
    slider.prop('max', graph.maxWeight);
    slider.prop('step', 1);
    slider.prop('value', graph.minWeight);
    slider.css("opacity", 1);
    slider.prop('disabled', false);
    edgeWeightFilter = graph.minWeight;
  } else
  {
    $("#edgeFilteringMin").html("&nbsp;&nbsp;");
    $("#edgeFilteringMax").html("&nbsp;&nbsp;&nbsp;"); //ugly hack *shrug*
    slider.css("opacity", 0.5);
    slider.prop('disabled', true);
    slider.prop('value', graph.minWeight); //while change to graphs without edgeweight, reset edgeweightslider
    edgeWeightFilter = graph.minWeight;
  }
}



/**
 * sets up teh values for the edge filter slider
 * @param graph the current graph
 */
function setupEdgeLengthSlider()
{
  let slider = $("#edgeLengthSliderL");

  let maxLength = Math.round(Math.sqrt(GRAPH_WIDTH**2 + GRAPH_HEIGHT**2));
  $("#edgeLengthMinL").text(0);
  $("#edgeLengthMaxL").text(maxLength);

  slider.prop('min', 0);
  slider.prop('max', maxLength);
  slider.prop('step', 1);
  slider.prop('value', 0);
  edgeLengthFilter = 0;

  slider = $("#edgeLengthSliderR");

  $("#edgeLengthMinR").text(0);
  $("#edgeLengthMaxR").text(maxLength);

  slider.prop('min', 0);
  slider.prop('max', maxLength);
  slider.prop('step', 1);
  slider.prop('value', 0);
}
/**
 * initiates the control element for a graph
 * @param elements the set of control elements to initialize
 */
function setupControlElements(elements)
{
  // elements.linkStrengthSpan.text(elements.strengthSlider.value);
  // elements.circleRadiusSpan.text(elements.radiusSlider.value);
  // elements.ebStepSizeSpan.text(elements.sliderB1.value);
  // elements.ebCompaitibiltySpan.text(elements.sliderB2.value);
  elements.ebDiv.css("opacity", 0.5);
}

/**
 * shows "link strength" slider's value as a tool tip
 *
 */
function setupSliderValueTooltip() {
  widgetsSliderDivs = ['#strengthDiv1', '#strengthDiv2', '#repulsiveDiv1', '#repulsiveDiv2', '#sliderDiv2', '#sliderDiv4'];
  sidebarSliderDivs = ['#nodesizeScalarDiv', '#nodeDegreeDiv', '#edgeLengthLeftDiv', '#edgeLengthRightDiv'];
  sliderDivs = widgetsSliderDivs.concat(sidebarSliderDivs);
  $.each(sliderDivs, function(index, sliderDiv){
    setupEachSlider(sliderDiv);
  });
  if(currentGraph["avgWeight"] !== 1)
  {
    setupEachSlider('#edgeFilterDiv');
  }
}

// set up one slider's value displaying effect
function setupEachSlider(sliderDivName) {
  var sliderDiv = $(sliderDivName),
    slider = $('input', sliderDiv),
    valueText = $('.sliderValue', sliderDiv),
    thumbwidth = 20;

  function setTooltip() {
    var value = slider.val();
    var percent = (value - slider.attr('min'))/(slider.attr('max') - slider.attr('min'));
    var thumbCorrect = thumbwidth * (percent - 0.5) * -1,
      textPos = Math.round((percent * slider.width()) - thumbwidth/4 + thumbCorrect);
    valueText.css('left', textPos);
    valueText.css('top', 25);
    valueText.text(value);
  }

  function setSliderEvent() {
    slider.on('input.slider change.slider keyup.slider mouseover.slider', function() {
      setTooltip();
      valueText.css('visibility', 'visible');
    });

    slider.on('mouseout.slider', function() {
      valueText.css('visibility', 'hidden');
    });

    // when window size changes
    $(window).on('resize.slider', function() {
      setTooltip();
    });
  }

  setSliderEvent();

}

/**
 * updates the graph description in the tool box
 * @param dataset the data set that is shown
 */
function updateDataDescription(dataset)
{
  let dataSourceType = document.getElementById("dataInfoType");
  let dataSourceName = document.getElementById("dataInfoName");
  let dataSourceDescription = document.getElementById("graphDescription");
  let dataSourceLink = document.getElementById("graphSource");
  dataSourceName.innerHTML = "<b>Name</b>: " + dataset.displayName + "<br /><br />";
  dataSourceType.innerHTML = "<b>Type of graph</b>: <br/>" + dataset.typeofgraph;
  dataSourceDescription.innerHTML = "<b>Description: </b><p class=\"text-left text-wrap\">" + dataset.description + "</p>";
  dataSourceLink.innerHTML = "<a href='" + dataset.src + "' target='_blank'>Source</a>";
}

/**
 * inserts all the layouts into the dropdown
 * @param extraLayouts any extra layouts to use
 */
function setupLayoutDropDowns(extraLayouts)
{
  let d1 = $("#dropdown1");
  let d2 = $("#dropdown2");
  d1.empty();
  d2.empty();

  d1.append("<optgroup label='" + LABEL_FORCE_DIRECTED + "'>");
  d2.append("<optgroup label='" + LABEL_FORCE_DIRECTED + "'>");

  d1.append("<optgroup label='" + LABEL_NON_FORCE_DIRECTED + "'>");
  d2.append("<optgroup label='" + LABEL_NON_FORCE_DIRECTED + "'>");

  Object.entries(LAYOUTS).slice(0, 3).sort((a, b) => a[1].localeCompare(b[1])).forEach(function(e)
  {
    $("optGroup[label='"+ LABEL_NON_FORCE_DIRECTED + "']").append(new Option(e[1], e[1]));
  });

  if (extraLayouts !== undefined)
  {
    $("optGroup[label='" + LABEL_NON_FORCE_DIRECTED + "']").append(new Option(extraLayouts, EXTRA_LAYOUT));
  }

  $("option", d1);
  $("option", d2);

  // add FR layout options
  Object.entries(LAYOUTS).slice(3, 9).sort((a, b) => a[1].localeCompare(b[1])).forEach(function(e)
  {
    let newFROption = $("<option>").val(e[1]).text(e[1]);
    $("optGroup[label='" + LABEL_FORCE_DIRECTED + "']").append(newFROption);
  });

  // remove indentation when one option is selected
  // removeIndentation(d1);
  // removeIndentation(d2);
}


/**
 * preprocesses the graph, eg sorting nodes, counting node degrees, etc
 * !!!! Warning, mutates the graph
 * @param g the graph to sort
 * @return the graph itself
 */
function preProcessGraph(g)
{
  g.links = g.links.filter(e => e.source !== e.target);

  let clusters = new Set();
  g.nodes.sort((a, b) => a.id > b.id ? 1 : -1);

  if (g.nodes[0].class !== undefined)
  {
    g.nodes.sort((a, b) => a.class > b.class ? 1 : a.id > b.id ? 1 : -1);
  }
  g.nodes.forEach(function(n) {
    n['degree'] = 0;
    n['highlighted'] = false;
    n['filtered'] = false;
    clusters.add(n.group);
  });

  g.links.forEach(function (l) {
    g.nodes.filter(n => n.id === l.source || n.id === l.target).forEach(x => ++x['degree']);
    if (l.value === undefined)
    {
      l.value = 1;
    }
  });

  let min = g.nodes.reduce((m, n) => n.degree < m ? n.degree : m, g.nodes[0].degree);
  let max = g.nodes.reduce((m, n) => n.degree > m ? n.degree : m, g.nodes[0].degree);
  let avg = g.nodes.reduce((s, n) => s + n.degree, 0)/g.nodes.length;
  g["minDegree"] = min;
  g["maxDegree"] = max;
  g["avgDegree"] = avg;

  let eMin = g.links.reduce((m, l) => l.value < m ? l.value : m, g.links[0].value);
  let eMax = g.links.reduce((m, l) => l.value > m ? l.value : m, g.links[0].value);
  let eAvg = g.links.reduce((s, l) => s + l.value, 0)/g.links.length;

  g["minWeight"] = eMin;
  g["maxWeight"] = eMax;
  g["avgWeight"] = eAvg;
  g["clusters"] = clusters.size;

  return g;
}

/**
 * initiates the hover tool tips
 */
function setupToolTips()
{
  $(function () {
    $('[data-toggle="tooltip"]').tooltip();
    // initiate footer tooltip, and set hidden
    updateFooterText(TOOLTIP.SVG_HOVER, "hidden");
  });
}

/**
 * mouseover and mouseout handler for showing and hiding tooltips
 */
function mouseOverOut(element, text)
{
  element.on("mouseover", () => updateFooterText(text, "visible"))
    .on("mouseout", () => updateFooterText(text, "hidden"));
}

/**
 * sets up the interaction for the node dropdown to highlight the selected node
 */
function setupNodeDropDown(svgs)
{
  $("#nodeDropdown").change(function() {
    // remove the former
    // cleanNodeDegree(selectedNode);
    // refresh selectedNode
    selectedNode = this.value;
    if(interactionFlags.nodeDropdownAllowed)
    {
      if (selectedNode === "None")
      {
        //deselection
        svgs.forEach(function(x)
        {
          resetNodes(x);
          currentNeighbors = [];
          updateDrawing(x, []);
        });



        activateFilter_nodecheckbox();
      } else
      {
        deactivateFilter_nodecheckbox();
        $("#clusterDropdown").val('None');
        if (interactionFlags.mouseinteractAllowed && interactionFlags.nodeClickAllowed)
        {
          //select node
          //there selectedNode is actually selectedNode.id
          if (isNaN(selectedNode))
          {
            nodeClick({id: selectedNode}, svgs);
          } else
          {
            nodeClick({id: +selectedNode}, svgs);
          }
        }
      }
    }
  })
    .on("focus", function()
    {
      // move onclick handler uninfluenced by the mouseover and mouseout
      $("#nodeDropdown").off("mouseover mouseout");
      updateFooterText(TOOLTIP.NODE_DROPDOWN, "visible");
      // automatically hide itself without focused out
      // setTimeout(function(){updateFooterText(TOOLTIP.NODE_DROPDOWN, "hidden");}, 8000);
    })
    .on("blur", function()
    {
      updateFooterText(TOOLTIP.NODE_DROPDOWN, "hidden");
      mouseOverOut($("#nodeDropdown"), TOOLTIP.NODE_DROPDOWN);
    });

  mouseOverOut($("#nodeDropdown"), TOOLTIP.NODE_DROPDOWN);
}

/**
 * sets up the interaction for the cluster dropdown to highlight the selected node
 */
function setupClusterDropDown(svgs)
{
  $("#clusterDropdown").change(function() {
    let clusterId = this.value;
    svgs.forEach(x => resetNodes(x));
    cleanNodeDegree(svgs);
    if(interactionFlags.clusterDropdownAllowed)
    {
      if (clusterId === "None")
      {
        //deselection
        svgs.forEach(x => updateDrawing(x, []));

        activateFilter_nodecheckbox();
        // $("#nodeDegreeFilter").prop("background-color",slider.background-color);
        currentNeighbors = [];
        currentHighlightCluster = -1;
      } else
      {
        deactivateFilter_nodecheckbox();
        //select node
        $("#nodeDropdown").val('None');
        clusterHighlight(+clusterId, svgs);
      }
    }
  })
    .on("focus", function()
    {
      // make focus handler uninfluenced by mouseover and mouseout
      $("#clusterDropdown").off("mouseover mouseout");
      updateFooterText(TOOLTIP.ClUSTER_DROPDOWN, "visible");
    })
    .on("blur", function()
    {
      updateFooterText(TOOLTIP.CLUSTER_DROPDOWN, "hidden");
      mouseOverOut($("#clusterDropdown"), TOOLTIP.CLUSTER_DROPDOWN);
    });
  // add mouseover and mouseout handler, defined above this current function
  mouseOverOut($("#clusterDropdown"), TOOLTIP.CLUSTER_DROPDOWN);
}

/***
 * Inserts all the nodes into the dropdown for selection
 * @param graph the graph that is used
 */
function updateNodeDropDown(graph, dataset)
{
  let dropDown = $("#nodeDropdown");
  dropDown.empty();
  dropDown.append(new Option("---", "None"));
  if (graph.nodes[0].class !== undefined)
  {//handling bipartite graphs
    dropDown.append("<optgroup label=" + dataset.groupNames[0] + ">");
    graph.nodes.forEach(e => { if(e.class === 0) dropDown.append(new Option(e.id, e.id))} );
    dropDown.append("<optgroup label=" + dataset.groupNames[1] + ">");
    graph.nodes.forEach(e => { if(e.class === 1) dropDown.append(new Option(e.id, e.id))} );

  } else
  {
    graph.nodes.forEach(e => dropDown.append(new Option(e.id, e.id)));
  }
}	

/***
 * Inserts all the clusters into the dropdown for selection
 * @param graph the graph that is used
 */
function updateClusterDropDown(graph)
{
  let dropDown = $("#clusterDropdown");
  dropDown.empty();
  dropDown.append(new Option("---", "None"));
  for (let i = 0; i < graph.clusters; ++i)
  {
    dropDown.append(new Option(i+1, i));
  }
}


/**
 * Sets up the interaction for the edge bundling (EB) switch.
 * Uses two invisible (hidden) switches that trigger the EB for each graph.
 */
function setUpEdgeBundlingButton()
{
  let button = $("#bundling");
  let b1 = $("#bundling1");
  let b2 = $("#bundling2");

  button.prop('checked', false);

  let changeButtons = (b, v) => b.prop('checked', v).change();

  button.on('change', function()
  {
    let ebOn = button.prop('checked');

    if (ebOn)
    {
      showLoadingForEdgeBundling();
      window.setTimeout(function ()
      {
        changeButtons(b1, ebOn);
        changeButtons(b2, ebOn);
      }, 100);
    } else
    {
      changeButtons(b1, ebOn);
      changeButtons(b2, ebOn);
    }

  });
}


function sanitizeLayoutDropdownSelection(dataset, parameters1, parameters2)
{
  let dropdown1 = $("#dropdown1");
  let dropdown2 = $("#dropdown2");
  if(parameters1.graphType === EXTRA_LAYOUT && parameters2.graphType === EXTRA_LAYOUT && dataset.layout === undefined)
  {
    dropdown1.val(dataset.preferredLayout).change();
    dropdown2.val(dataset.preferredLayout).change();
  }
  else
  {
    if (parameters1.graphType === EXTRA_LAYOUT && dataset.layout === undefined)
    {
      dropdown1.val(dropdown2.val()).change();
    }
    if (parameters2.graphType === EXTRA_LAYOUT && dataset.layout === undefined)
    {
      dropdown2.val(dropdown1.val()).change();
    }
  }

}