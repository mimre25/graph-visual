// main graph-visual file
// sets graph objects and calls drawGraph function

// resources common to both graphs



function setUpLayoutLock(lock, params)
{
  lock.click(function() {
    if (params.keepLayout)
    {//it's closed now, so open it
      lock.html(LOCK_OPEN);
    } else if (params.graphType !== EXTRA_LAYOUT)
    {
      lock.html(LOCK_CLOSED);
    } else
    {
      params.keepLayout = !params.keepLayout;
    }
    params.keepLayout = !params.keepLayout;
  });
}




window.onload = function ()
{
  datasets.push(...datasetsS);
  datasets.push(...datasetsQ);
  // first graph
  let svg1 = d3.select("#g1");

  const ATTRACTING_FORCE = -30; //if this value is positive then nodes attract each other, if it's negative they repulse each other

//see https://github.com/d3/d3-force
  let simulation1 = d3.forceSimulation()
    .force("link", d3.forceLink().id(x=>x.id))
    .force("charge", d3.forceManyBody().strength(ATTRACTING_FORCE))
    .force("center", d3.forceCenter(GRAPH_WIDTH / 2, GRAPH_HEIGHT / 2))
    .force("collision", d3.forceCollide(NODE_RADIUS));
  simulation1.force("link").strength(document.getElementById("slider").value / 10);

// graphical elements for graph 1
  let graphic1 = {
    svg: svg1,
    simulation: simulation1
  };


  let parameters1 = {
    dataSet: datasets[0],
    graphType: LAYOUTS.FORCE_DIRECTED,
    bundling: false,
    value: 5,
    keepLayout: false
  };

// second graph
  let svg2 = d3.select("#g2");

  let simulation2 = d3.forceSimulation()
    .force("link", d3.forceLink().id(x=>x.id))
    .force("charge", d3.forceManyBody().strength(ATTRACTING_FORCE))
    .force("center", d3.forceCenter(GRAPH_WIDTH / 2, GRAPH_HEIGHT / 2))
    .force("collision", d3.forceCollide(NODE_RADIUS));
  simulation2.force("link").strength(document.getElementById("slider3").value / 10);


// graphical elements for graph 2
  let graphic2 = {
    svg: svg2,
    simulation: simulation2
  };

  let parameters2 = {
    dataSet: datasets[0],
    graphType: LAYOUTS.FORCE_DIRECTED,
    bundling: false,
    value: 5,
    keepLayout: false
  };

  let svgs = [svg1, svg2];

 // setupAbout();
  setUpEdgeBundlingButton();
  $("#checkBoxColorBlind").prop("checked", false);




  // $("div").on("mouseover", () => updateFooterText(TOOLTIP.EMPTY));
  $("#opacity").css("opacity", 0.5);
  setupToolTips();
  setupDataSets();
  let hintsArray = setupHighlightLayout(datasets);

  let elements1 = initializeLeftGraphPanel();
  let elements2 = initializeRightGraphPanel();

  let simulations = [simulation1, simulation2];

  setupGraphOptions(svgs, simulations);

  setupControlElements(elements1);
  setupControlElements(elements2);
  setupNodeDropDown(svgs);
  setupClusterDropDown(svgs);
  setupSliderValueTooltip();

  initHelp(elements1, elements2, currentGraph, graphic1, graphic2, svgs);
  $("#help").on("click", function(){
    helpOnClick(elements1, elements2, currentGraph, graphic1, graphic2, svgs);
  });


  // data source html elements
  // let dataSourceText = document.getElementById("dataSet");
  // let dataSourceClusters = document.getElementById("dataInfoClusters");
  // let dataSourceType = document.getElementById("dataInfoType");
  // let dataSourceDescription = document.getElementById("graphDescription");
  // let dataSourceLink = document.getElementById("graphSource");


  let dataSourceNodes = document.getElementById("dataInfoNodes");
  let dataSourceEdges = document.getElementById("dataInfoEdges");
  let dataDropdown = $("#dataDropdown");
  let nodeNumber = document.getElementById("nodeNumberSpan");
  let clusterNumber = document.getElementById("clusterNumberSpan");
  // When user changes the data source dropdown

  // add the exclusion between "remember" and extra layout
  let layoutLock1 = $("#checkBoxRememberLayout1");
  let layoutLock2 = $("#checkBoxRememberLayout2");
  setUpLayoutLock(layoutLock1, parameters1);
  setUpLayoutLock(layoutLock2, parameters2);


  dataDropdown.on("change", function ()
  {
    resetGlobals();
    $(".loading-wrapper").show();
    // $("#dropdown1>option:eq(0)").prop('selected', true).trigger('change');
    // $("#dropdown2>option:eq(1)").prop('selected', true).trigger('change');



    let dataSource = dataDropdown.val();

    let dataset = datasets.find(function (e)
    {
      return e.graphName === dataSource;
    });

    //dataSourceText.innerHTML = "Current Data Source: " + dataset.graphName;
    updateDataDescription(dataset);

    // decide the highlight to display or not
    setupNodesizeScalar(dataset);
    showHighlightLayout(dataset, hintsArray);

    let dropdown1 = $("#dropdown1");
    let dropdown2 = $("#dropdown2");

    let keep1 = parameters1.keepLayout;//.checked();
    let keep2 = parameters2.keepLayout;//.checked();

    if (parameters1.graphType === EXTRA_LAYOUT && dataset.layout === undefined)
    {
      dropdown1.val(dataset.preferredLayout).change();
    }
    if (parameters2.graphType === EXTRA_LAYOUT && dataset.layout === undefined)
    {
      dropdown2.val(dataset.preferredLayout).change();
    }

    // Clear previous svg
    d3.selectAll("svg > *").remove();
    // Redraw two graphs with dataSet parameter updated
    parameters1.dataSet = dataset;
    parameters2.dataSet = dataset;
    parameters1.value = dataset.defaultStrength;
    parameters2.value = dataset.defaultStrength;
    parameters1.graphType = parameters1.keepLayout ? $('#dropdown1').val() : dataset.preferredLayout;
    parameters2.graphType = parameters2.keepLayout ? $('#dropdown2').val() : dataset.preferredLayout;
    // sanitizeLayoutDropdownSelection(dataset, parameters1, parameters2);


    let link = '';
    if (dataset.graphName === "Les Miserables")
    {
      link = dataset.file; //this is for chrome debugging only
    }
    else
    {
      link = './data/json/' + dataset.file;
    }

    if(interactionFlags.layoutDropdownAllowed)
    {
      setupLayoutDropDowns(dataset.layout);
    }


    // if(parameters2.keepLayout && parameters2.graphType == EXTRA_LAYOUT)
    // {
    //   elements2.rememberLayoutCheckbox.prop('checked', false);
    // }
  


    $("#dropdown1").change(function() {
      parameters1.graphType = $("#dropdown1").val();
      if(parameters1.keepLayout && parameters1.graphType === EXTRA_LAYOUT)
      {
        elements1.rememberLayoutCheckbox.html(LOCK_OPEN);
        parameters1.keepLayout = !parameters1.keepLayout;
      }
    });
    $("#dropdown2").change(function() {
      parameters2.graphType = $("#dropdown2").val();
      if(parameters2.keepLayout && parameters2.graphType === EXTRA_LAYOUT)
      {
        elements2.rememberLayoutCheckbox.html(LOCK_OPEN);
        parameters2.keepLayout = ! parameters2.keepLayout;
      }
    });



    d3.json(link, function (error, graph)
    {
      if (error) throw error;
      console.info("graph", graph);
      graph = preProcessGraph(graph);
      dataSourceNodes.innerHTML = "Number of nodes (displayed / total): " + graph.nodes.length + " / " + graph.nodes.length;
      dataSourceEdges.innerHTML = "Number of edges (displayed / total): " + graph.links.length + " / " + graph.links.length;
      nodeNumber.innerHTML = "Total: " + graph.nodes.length;
      clusterNumber.innerHTML = " Total: " + graph.clusters;
      currentGraph = graph;
      let graph1 = jQuery.extend(true, {}, graph);
      let graph2 = jQuery.extend(true, {}, graph);

      $("#edgeFilterSlider").off('input.slider change.slider keyup.slider mouseover.slider');
      $("#edgeFilterSlider").off('mouseout.slider');
      $("#highlightOpacity").off('input.slider change.slider keyup.slider mouseover.slider');
      $("#highlightOpacity").off('mouseout.slider');


      setupSliderValueTooltip();
      disableEdgebundling(dataset); 

      $("#highlightOpacity").prop("value", 0.4);
      setupEdgeLengthSlider();
      setupNodeDegreeSlider(graph);
      setupEdgeWeightSlider(graph);
      setupEdgeThicknessSwitch(graph);
      graph.links.forEach(e => edgeLengths.push(0.1));
      drawGraph(graph1, graphic1, parameters1, dataset, svgs, elements1, true, bundlingParameter1);
      drawGraph(graph2, graphic2, parameters2, dataset, svgs, elements2, true, bundlingParameter2);
      $("#checkBoxColorBlind").change(function() {
        colorBlind = $("#checkBoxColorBlind").prop("checked");
        refreshcolorBlind(graphic1.svg, dataset);
        refreshcolorBlind(graphic2.svg, dataset);
      });
      updateNodeDropDown(graph, dataset);
      updateClusterDropDown(graph);
      $(".loading-wrapper").hide();

      $("#dropdown1").trigger('change');
      $("#dropdown2").trigger('change');
    });
  });
  // $("#dataDropdown option:last-child").attr("selected", "selected");
  dataDropdown.trigger("change");

};

