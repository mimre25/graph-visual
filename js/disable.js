var disable_array = ["#nodeDropdown", "#clusterDropdown", "#filterDiv *"]
var enable_array = ["#edgeLengthSliderL", "#edgeLengthSliderR", "#nodeDegreeFilter", "#nodeDropdown", "#clusterDropdown"]
var widget_events = ["#slider", "#slider2", "#slider3", "#slider4", "#RepulsiveForce1", "#RepulsiveForce2"]
var filter_events = ["#edgeFilterSlider", "#edgeLengthSliderL", "#edgeLengthSliderR", "#nodeDegreeFilter"]
var widgetsSliderDivs = ['#strengthDiv1', '#strengthDiv2', "#repulsiveDiv1", "#repulsiveDiv2", '#sliderDiv2', '#sliderDiv4'];
var sidebarSliderDivs = ['#nodesizeScalarDiv','#nodeDegreeDiv','#edgeLengthLeftDiv', '#edgeLengthRightDiv'];


function muteWidgetEvent(widget_events)
{
  $.each(widget_events, function(index, widget_event){
    $(widget_event).off('input.slider change.slider keyup.slider mouseover.slider');
    $(widget_event).off('mouseout.slider');
  });
}

function muteFliterEvent(filter_events)
{
  $.each(filter_events, function(index, filter_event){
    $(filter_event).off('input.slider change.slider keyup.slider mouseover.slider');
    $(filter_event).off('mouseout.slider');
  });
}
/**
 * 
 */
function disable(disable_array)
{
    $.each(disable_array, function(index, to_disable) {
        $(to_disable).prop("disabled", true);
    });
    $("#nodeDropdown").val('None');
    $("#clusterDropdown").val('None');
}

function enable(enable_array)
{
    $.each(enable_array, function(index, to_enable) {
        $(to_enable).prop("disabled", false);   
    })
}
/**
 * disable function for edge bundling
 */
function ControlInteractions(elements, graph)
{
  if(!interactionFlags.mouseinteractAllowed)
  {
    elements.strengthSlider.disabled = true;
    elements.repulsiveSlider.disabled = true;
    elements.linkStrengthSliderDiv.style.opacity = 0.5;
    elements.radiusSlider.disabled = true;
    elements.radiusSliderDiv.style.opacity = 0.5;
    elements.animateButton.prop("disabled", true);
    elements.randomButton.disabled = true;
    elements.layoutDropDown.disabled = true;
    muteWidgetEvent(widget_events);
    muteFliterEvent(filter_events);
    $("#highlightOpacity").prop("disabled", true);
    $("#highlightOpacity").off('input.slider change.slider keyup.slider mouseover.slider');
    $("#highlightOpacity").off('mouseout.slider');
    $("#nodeDropdown").val('None');
    $("#clusterDropdown").val('None');
    $("#filterDiv").css("opacity", 0.5);
    $("#selectionDiv").css("opacity", 0.5);  
    disable(disable_array);
    // // $("#edgeLengthSliderL").prop("disabled", true);
    // // $("#edgeLengthSliderR").prop("disabled", true);
    // // $("#edgeFilterSlider").prop("disabled", true); 
    // // $("#nodeDegreeFilter").prop("disabled", true);
    // $("#filterDiv *").prop("disabled", true);
    // // $("#nodeDropdown").prop("disabled", true);
    // // $("#clusterDropdown").prop("disabled", true);
    // // $("#highlightOpacity").prop("disabled", true);
    // $("#selectionDiv *").prop("disabled", true);  
  }else
  {
    setupSliderValueTooltip();
    elements.strengthSlider.disabled = false;
    elements.repulsiveSlider.disabled = false;
    elements.linkStrengthSliderDiv.style.opacity = 1;
    elements.radiusSlider.disabled = false;
    elements.radiusSliderDiv.style.opacity = 1;
    elements.animateButton.prop("disabled", false);
    elements.randomButton.disabled = false;
    elements.layoutDropDown.disabled = false;
    $("#selectionDiv").css("opacity", 1);  
    $("#filterDiv").css("opacity", 1);
    enable(enable_array);
    $("#highlightOpacity").prop("disabled", true);
    $("#opacity").css("opacity", 0.5);
    $("#highlightOpacity").off('input.slider change.slider keyup.slider mouseover.slider');
    $("#highlightOpacity").off('mouseout.slider');
    // $("#edgeLengthSliderL").prop("disabled", false);
    // $("#edgeLengthSliderR").prop("disabled", false);
    // $("#nodeDegreeFilter").prop("disabled", false);
    // $("#nodeDropdown").prop("disabled", false);
    // $("#clusterDropdown").prop("disabled", false);
    if(graph.avgWeight !== 1)
    {
      $("#edgeFilterSlider").prop("disabled", false);
      setupEachSlider("#edgeFilterDiv")
    }
  }
}

/**
 * activate the filtering area
 */
function activateFilter_nodecheckbox()
{
  $("#highlightOpacity").prop("disabled", true);
  $("#highlightOpacity").off('input.slider change.slider keyup.slider mouseover.slider');
  $("#highlightOpacity").off('mouseout.slider');
  $("#edgeFilterSlider").off('input.slider change.slider keyup.slider mouseover.slider');
  $("#edgeFilterSlider").off('mouseout.slider');
  $("#opacity").css("opacity", 0.5);
  $("#checkBoxNodeDegree").prop("disabled", false); //if nodes unselected in the dropdown, activate the checkbox

  $.each(sidebarSliderDivs, function(index, sliderDiv){
    setupEachSlider(sliderDiv);
  });
  $("#edgeLengthSliderL").prop("disabled", false);
  $("#edgeLengthSliderR").prop("disabled", false);
  $("#nodeDegreeFilter").prop("disabled", false);
  $("#filterDiv").css("opacity", 1);
  $("#nodeSizeDiv").css("opacity", 1);
  if(currentGraph["avgWeight"] !== 1)
  {
    $("#edgeFilterSlider").prop("disabled", false);
    setupEachSlider("#edgeFilterDiv");
  }
}

/**
 * deactivate the filtering area 
 */
function deactivateFilter_nodecheckbox()
{
  $("#highlightOpacity").prop("disabled", false); //activate opacity if clusterdropdown selected
  setupEachSlider("#highlightOpacityDiv");
  $("#opacity").css("opacity", 1);
  $("#checkBoxNodeDegree").prop("disabled", true); //if nodes selected in the dropdown, disable the node size checkbox
  $("#checkBoxNodeDegree").prop("checked", false); //in the meantime, make the checkbox unchecked
  nodeDegreeHighlighting = false;
//   $("#edgeLengthSliderL").prop("disabled", true);
//   $("#edgeLengthSliderR").prop("disabled", true);
//   $("#edgeFilterSlider").prop("disabled", true); //if nodes selected, deactivate the filters
//   $("#nodeDegreeFilter").prop("disabled", true);
  $("#filterDiv *").prop("disabled", true);
  muteFliterEvent(filter_events);
  $("#filterDiv").css("opacity", 0.5);
  $("#nodeSizeDiv").css("opacity", 0.5);
  $("#edgeLengthSliderL").prop("value", 0);
  $("#edgeLengthSliderR").prop("value", 0);
  $("#edgeFilterSlider").prop("value", currentGraph["minWeight"]);   //if nodes clicked reset the filters
  $("#nodeDegreeFilter").prop("value", currentGraph["minDegree"]);
  edgeWeightFilter = currentGraph["minWeight"];
  nodeDegreeFilter = currentGraph["minDegree"];
}

/**  
 * disable selection while filtering
*/
function deactivateSelection(nodeFilterFlag, weightFilterFlag, lengthFilterFlag)
{

  if (nodeFilterFlag!==-1||weightFilterFlag!==-1||lengthFilterFlag!==-1||!interactionFlags.mouseinteractAllowed)
  {
    $("#nodeDropdown").prop("disabled", true);
    $("#clusterDropdown").prop("disabled", true);
    $("#highlightOpacity").prop("disabled", true);
    $("#highlightOpacity").off('input.slider change.slider keyup.slider mouseover.slider');
    $("#highlightOpacity").off('mouseout.slider');
    $("#nodeDropdown").val('None');
    $("#clusterDropdown").val('None');
    $("#selectionDiv").css("opacity", 0.5);  
  }else
  {
    $("#nodeDropdown").prop("disabled", false);
    $("#clusterDropdown").prop("disabled", false);
    $("#selectionDiv").css("opacity", 1);
  }
}

function disableEdgebundling(dataset)
{
  if (dataset.graphSize === "Large")
  {
    $("#bundling").attr("disabled", true);
    $("#edgeBundling").css("opacity", 0.5);
  }else
  {
    $("#bundling").attr("disabled", false);
    $("#edgeBundling").css("opacity", 1);
  }
}