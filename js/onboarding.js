/**
 * Use "introJs" third library ("/lib/intro.js") to implement the onboarding
 */

var introGuide = introJs();
introGuide.setOptions({
  exitOnOverlayClick: false,
});
introGuide.addSteps([{
    element: "#graphInsideDiv1",
    intro: "This panel shows the drawing of the graph. Click on a node to select it, and de-select by clicking on empty space.",
    position: "right"
  },
  {
    element: "#widgetsDiv1",
    intro: "Use these widgets to modify the graph layout.",
    position: "top"
  },
  {
    element: "#graphInfoDiv",
    intro: "Here we display the numbers of nodes and edges.",
    position: "bottom"
  },
  // {
  //   element: "#sidebarIntro",
  //   intro: "Use this toolbox to filter and highlight graph elements.",
  //   position: "left",
  //   highlightClass: "sidebarIntro",
  //   scrollTo: "tooltip",
  // },
  {
    element: "#dataDropdownIntro",
    intro: "Here you can select a different data set.",
    position: "left"
  },
  // {
  //   element: "#colorBlindDiv",
  //   intro: "Colorblind? Flip this switch for a color blindness friendly color map.",
  //   position: "left",
  // },
  {
    element: "#appearancePanel",
    intro: "Toggle to adjust the general appearance of the graph drawing.<br><br>This section and the two sections below can be folded/unfolded.",
    position: "left"
  },
  {
    element: "#filterPanel",
    intro: "Filter nodes and edges by their properties. This cannot be used when a selection is active.",
    position: "left"
  },
  {
    element: "#selectionPanel",
    intro: "Select one node or cluster to highlight, and adjust the unselected part's opacity. This cannot be used when a filter is active.",
    position: "left"
  },
  {
    element: "#describeDivIntro",
    intro: "Learn more about the data set here.",
    position: "left",
    scrollTo: "tooltip",
  },
  {
    element: "#help",
    intro: "Click 'help?' to review this introduction.",
    position: "bottom"
  },
]);

// show onboarding when someone opens the page for the first time
function initHelp (elements1, elements2, currentGraph, graphic1, graphic2, svgs) {
    if (localStorage.getItem("hasLoadBefore") == null) {
        setTimeout(function () {
            introGuide.start()
            .onchange(function(targetElement){
                resetForBackwards(targetElement, elements1, elements2, currentGraph, graphic1, graphic2, svgs);
                openSection(targetElement);
            })
            .onbeforechange(function(targetElement){
                resetSection(targetElement, elements1, elements2, currentGraph, graphic1, graphic2, svgs)})
            .onafterchange(function(targetElement){
                resetFilterBackwards(targetElement, svgs, currentGraph)})
            .onexit(() => foldSection());
    }, 2000);
    localStorage.setItem("hasLoadBefore", true);
  }
  ;
}

// when clicking "help" link
function helpOnClick(elements1, elements2, currentGraph, graphic1, graphic2, svgs) {
    introGuide.start()
        .onchange(function(targetElement){
            resetForBackwards(targetElement, elements1, elements2, currentGraph, graphic1, graphic2, svgs);
            openSection(targetElement);
        })
        .onbeforechange(function(targetElement){
            resetSection(targetElement, elements1, elements2, currentGraph, graphic1, graphic2, svgs)})
        .onafterchange(function(targetElement){
            resetFilterBackwards(targetElement, svgs, currentGraph)})
        .onexit(() => foldSection());
}

// open folded "Appearance"
function openSection(targetElement)
{
  if (targetElement.id == "widgetsDiv1")
  {
    $("#appearanceDiv").collapse('show');
  }
}

// fold "Appearance"
function foldSection()
{
  $("#appearanceDiv").collapse('hide');
}

function resetForBackwards(targetElement, elements1, elements2, graph, graphic1, graphic2, svgs)
{
  if (targetElement.id === "filterPanel" || targetElement.id === "describeDivIntro")
  {
    svgs.forEach(function(svg)
    {
        resetNodes(svg);
        updateDrawing(svg, []);
    });
    activateFilter_nodecheckbox();
    $("#nodeDropdown").val('None');
    $("#clusterDropdown").val('None');
    currentNeighbors = [];
    currentHighlightCluster = -1;
    // while on click, just enable edgeweightslider for Les_Misrables
    if(graph.avgWeight !== 1)
    {
        $("#edgeFilterSlider").prop('disabled', false);
        $("#edgeFilterSlider").prop("value", graph.minWeight);
    }
    $("#edgeLengthSliderL").prop("value", 0);
    $("#edgeLengthSliderR").prop("value", 0);  //reset sliders back to min
    $("#nodeDegreeFilter").prop("value", graph.minDegree);  
  }else if(targetElement.id === "dataDropdownIntro")
  {
    $("#checkBoxEdgeThickness").prop("checked", false);
    $("#checkBoxNodeDegree").prop("checked", false);
    edgeThicknessHighlighting = false;
    nodeDegreeHighlighting = false;
    svgs.forEach(function(svg)
    {
        resetNodes(svg);
        updateDrawing(svg, []);
    });
    // if(bundling.checked === true)
    //   {
    //     bundling.checked = false;
    //     interactionFlags.mouseinteractAllowed = true;
    //     ControlInteractions(elements1, graph);
    //     ControlInteractions(elements2, graph);
    //     clearBundling(graphic1.svg, graphic1.simulation);
    //     clearBundling(graphic2.svg, graphic2.simulation);
    //     $("#bundling").prop("checked", false);
    //     $("#bundling1").prop("checked", false);
    //     $("#bundling2").prop("checked", false);
    //   }
  }
}

function resetFilterBackwards(targetElement, svgs, graph)
{
  if(targetElement.id === "appearancePanel")
  {
    nodeFilterFlag = weightFilterFlag = lengthFilterFlag = -1;
    $("#edgeLengthSliderL").prop("value", 0);
    $("#edgeLengthSliderR").prop("value", 0);  //reset sliders back to min
    $("#nodeDegreeFilter").prop("value", graph.minDegree); 
    if(graph.avgWeight !== 1)
      {
          $("#edgeFilterSlider").prop('disabled', false);
          $("#edgeFilterSlider").prop("value", graph.minWeight);
      }
    edgeWeightFilter = currentGraph["minWeight"];
    nodeDegreeFilter = currentGraph["minDegree"];
    edgeLengthFilter = 0;
    deactivateSelection(nodeFilterFlag, weightFilterFlag, lengthFilterFlag);
    svgs.forEach(function (svg)
    {
      resetNodes(svg);
      updateDrawing(svg, []);
    });
  }
}
function resetSection(targetElement, elements1, elements2, graph, graphic1, graphic2, svgs)
{
    if(targetElement.id === "widgetsDiv1")
    {
        svgs.forEach(function(svg)
        {
            resetNodes(svg);
            updateDrawing(svg, []);
        });
        activateFilter_nodecheckbox();
        $("#nodeDropdown").val('None');
        $("#clusterDropdown").val('None');
        currentNeighbors = [];
        currentHighlightCluster = -1;
        // while on click, just enable edgeweightslider for Les_Misrables
        if(graph.avgWeight !== 1)
        {
            $("#edgeFilterSlider").prop('disabled', false);
            $("#edgeFilterSlider").prop("value", graph.minWeight);
        }
        $("#edgeLengthSliderL").prop("value", 0);
        $("#edgeLengthSliderR").prop("value", 0);  //reset sliders back to min
        $("#nodeDegreeFilter").prop("value", graph.minDegree);  
    }
    else if (targetElement.id === "filterPanel")
    {
      $("#checkBoxEdgeThickness").prop("checked", false);
      $("#checkBoxNodeDegree").prop("checked", false);
      edgeThicknessHighlighting = false;
      nodeDegreeHighlighting = false;
      // if(bundling.checked === true)
      // {
      //   bundling.checked = false;
      //   interactionFlags.mouseinteractAllowed = true;
      //   ControlInteractions(elements1, graph);
      //   ControlInteractions(elements2, graph);
      //   clearBundling(graphic1.svg, graphic1.simulation);
      //   clearBundling(graphic2.svg, graphic2.simulation);
      //   $("#bundling").prop("checked", false);
      //   $("#bundling1").prop("checked", false);
      //   $("#bundling2").prop("checked", false);
      // }
    }else if (targetElement.id === "selectionPanel")
    {
      nodeFilterFlag = weightFilterFlag = lengthFilterFlag = -1;
      $("#edgeLengthSliderL").prop("value", 0);
      $("#edgeLengthSliderR").prop("value", 0);  //reset sliders back to min
      $("#nodeDegreeFilter").prop("value", graph.minDegree); 
      if(graph.avgWeight !== 1)
        {
            $("#edgeFilterSlider").prop('disabled', false);
            $("#edgeFilterSlider").prop("value", graph.minWeight);
        }
      edgeWeightFilter = currentGraph["minWeight"];
      nodeDegreeFilter = currentGraph["minDegree"];
      edgeLengthFilter = 0;
      deactivateSelection(nodeFilterFlag, weightFilterFlag, lengthFilterFlag);
      svgs.forEach(function (svg)
      {
        resetNodes(svg);
        updateDrawing(svg, []);
      });
    }
}