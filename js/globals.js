// const str = "3";
// const fm = document.write("FM"+"<sup>"+3+"</sup>");

// DO NOT CHANGE THE ORDER AT WILL(used in setupLayoutDropDowns() in graph_main.js)
const LAYOUTS = {
  RANDOMIZED: 'Random',
  CIRCULAR: 'Circular',
  SPECTRAL: 'Spectral',
  // FR types
  FORCE_DIRECTED : 'D3-Force-Directed',
  FM_3: "FM\u00B3",
  FORCE_ATLAS: 'ForceAtlas2',
  OPENORD: 'OpenOrd',
  YIFAN_HU: 'Yifan Hu',
};
const LABEL_FORCE_DIRECTED = "Force-Directed";
const LABEL_NON_FORCE_DIRECTED = "Non Force-Directed";


const datasets = [];

const EXTRA_LAYOUT = "extra";


const GRAPH_MARGIN = 0.05;
const NODE_RADIUS = 5;

// const GRAPH_WIDTH = 500 * (1- GRAPH_MARGIN);
// const GRAPH_HEIGHT = 500 * (1- GRAPH_MARGIN);
// const GRAPH_WIDTH_MARGIN = GRAPH_WIDTH * GRAPH_MARGIN*0.5;
// const GRAPH_HEIGHT_MARGIN = GRAPH_HEIGHT * GRAPH_MARGIN*0.5;
const GRAPH_WIDTH = 500 - NODE_RADIUS*4;
const GRAPH_HEIGHT = 500 - NODE_RADIUS*4;
const GRAPH_WIDTH_MARGIN = NODE_RADIUS*2;
const GRAPH_HEIGHT_MARGIN = NODE_RADIUS*2;


const COLOR_EDGE = "#999";
const COLOR_EDGE_HIGHLIGHT = "#000";
const COLOR_NODE_BORDER = "#FFF";
const COLOR_NODE_BORDER_HIGHLIGHT = "#4b4b4b";

const LOCK_OPEN = '<i class="fas fa-lock-open"></i>';
const LOCK_CLOSED = '<i class="fas fa-lock"></i>';


let nodeFilterFlag = -1;
let weightFilterFlag = -1;
let lengthFilterFlag = -1;

let dragging = false;
let nodeHighlighted = false;

let edgeHighlighting = false;
let nodeDegreeHighlighting = false;
let edgeThicknessHighlighting = false;
let nodesizeScale = 1;
let nodeDegreeFilter = 0;
let edgeWeightFilter = 0;
let edgeLengthFilter = 0;
let currentGraph = {};
let currentNeighbors = [];
let currentHighlightCluster = -1;
let edgeLengths = [];
let highlightOpacity = 0.4;
let selectedNode = null; // current selected node(id)
let colorBlind = false;
let edgeBundlingComputing = false;

let interactionFlags =
{
  mouseinteractAllowed: true,
  emptyclickAllowed: true,
  nodeClickAllowed: true,
  nodeDbClickAllowed: true,
  dragAllowed: true,
  simulationAllowed: true,
  mouseNodeAllowed: true,
  mouseLineAllowed: true,

  nodeDegreeFilterAllowed: true,
  edgeWeightFilterAllowed: true,
  edgeLengthFilterAllowed: true,

  nodeDropdownAllowed: true,
  clusterDropdownAllowed: true,

  nodesizeCheckboxAllowed: true,
  edgethicknessCheckboxAllowed: true,

  datasetDropdownAllowed: true,
  layoutDropdownAllowed: true,
  FDAnimateAllowed: true,
  RMRandomizeAllowed: true,
  linkStrengthAllowed: true,
  repulsiveForceAllowed: true,
  circleRadiusAllowed: true,

  edgeBundlingAllowed: true,
  bundleStepsizeAllowed: true,
  bundleCompatibilityAllowed: true
};
  
  

let bundlingParameter1 = 
{
  stp: 5,
  cmp: 5
};
let bundlingParameter2 = 
{
  stp: 5,
  cmp: 5
};
/**
 * resets all the globals used for state preservation and brush n linking
 */
function resetGlobals()
{
  currentNeighbors = [];
  dragging = false;
  edgeHighlighting = false;
  nodeDegreeHighlighting = false;
  edgeThicknessHighlighting = false;
  nodeDegreeFilter = 0;
  edgeWeightFilter = 0;
  edgeLengthFilter = 0;
  currentHighlightCluster = -1;
  edgeLengths = [];
  interactionFlags.mouseinteractAllowed = true;
  // bundling.checked = false;
  $("#checkBoxEdgeThickness").prop("checked", false);
  $("#checkBoxNodeDegree").prop("checked", false);
  $("#bundling1").prop("checked", false);
  $("#bundling2").prop("checked", false);
  $("#bundling").prop("checked", false);
}


/***
 * initializes the graph panel and returns the 'elements' object
 * @param left whether the left panel or the right panel is initilaized
 * @returns {{bundling: HTMLElement, strengthSlider: HTMLElement, radiusSlider: HTMLElement, sliderDiv1: HTMLElement, sliderDiv2: HTMLElement, dropdown: HTMLElement, randomButton: HTMLElement, sliderB1: HTMLElement, sliderB2: HTMLElement, strOut: HTMLElement}}
 */
function initializeGraphPanel(left)
{
  let bundling;
  let strengthSlider;
  let strengthSliderMin;
  let strengthSliderMax;
  let repulsiveSlider;
  let repulsiveSliderMin;
  let repulsiveSliderMax;
  let radiusSlider;
  let sliderDiv1;
  let sliderDiv2;
  let dropdown;
  let demo;
  let randomize;
  // let sliderB1;
  // let sliderB2;
  // let sliderValueSpan;
  // let circleRadiusSpan;
  let ebStepSizeSpan;
  let ebCompaitibiltySpan;
  let ebDiv;
  let animateButton;
  let rememberLayout;
  let sortByCluster;
  let sortByClusterDiv;

  // let selectedNode = document.getElementById("selectedNode");

  if (left)
  {
    // get all html elements
    bundling = document.getElementById("bundling1");
    strengthSlider = document.getElementById("slider");
    strengthSliderMin = document.getElementById("linkStrengthMin1");
    strengthSliderMax = document.getElementById("linkStrengthMax1");
    repulsiveSlider = document.getElementById("RepulsiveForce1");
    repulsiveSliderMin = document.getElementById("RepulsiveForceMin1");
    repulsiveSliderMax = document.getElementById("RepulsiveForceMax1");
    radiusSlider = document.getElementById("slider2");
    sliderDiv1 = document.getElementById("sliderDiv1");
    sliderDiv2 = document.getElementById("sliderDiv2");
    dropdown = document.getElementById("dropdown1");
    demo = document.getElementById("demo1");
    randomize = document.getElementById("randomize1");
    // sliderB1 = document.getElementById("sliderB1");
    // sliderB2 = document.getElementById("sliderB2");
    sliderValueSpan = $("#linkStrength1Value");
    animateButton = $("#animate1");
    // circleRadiusSpan = $("#circleRadius1Value");
    ebStepSizeSpan = $("#EBStepSize1Span");
    ebCompaitibiltySpan = $("#EBCompatibility1Span");
    ebDiv = $("#EBdiv1");
    rememberLayout = $("#checkBoxRememberLayout1");
    sortByCluster = document.getElementById("checkBoxSortByCluster1");
    sortByClusterDiv = document.getElementById("sortByClusterDiv1");
  } else
  {
    bundling = document.getElementById("bundling2");
    strengthSlider = document.getElementById("slider3");
    strengthSliderMin = document.getElementById("linkStrengthMin2");
    strengthSliderMax = document.getElementById("linkStrengthMax2");
    repulsiveSlider = document.getElementById("RepulsiveForce2");
    repulsiveSliderMin = document.getElementById("RepulsiveForceMin2");
    repulsiveSliderMax = document.getElementById("RepulsiveForceMax2");
    radiusSlider = document.getElementById("slider4");
    sliderDiv1 = document.getElementById("sliderDiv3");
    sliderDiv2 = document.getElementById("sliderDiv4");
    dropdown = document.getElementById("dropdown2");
    demo = document.getElementById("demo2");
    randomize = document.getElementById("randomize2");
    // sliderB1 = document.getElementById("sliderB3");
    // sliderB2 = document.getElementById("sliderB4");
    sliderValueSpan = $("#linkStrength2Value");
    animateButton = $("#animate2");
    // circleRadiusSpan = $("#circleRadius2Value");
    ebStepSizeSpan = $("#EBStepSize2Span");
    ebCompaitibiltySpan = $("#EBCompatibility2Span");
    ebDiv = $("#EBdiv2");
    rememberLayout = $("#checkBoxRememberLayout2");
    sortByCluster = document.getElementById("checkBoxSortByCluster2");
    sortByClusterDiv = document.getElementById("sortByClusterDiv2");
  }
// objects for graph1

  /* html elements for graph1
  bundling :        checkbox clicked to enable/disable edge bundling
  strengthSlider :  slider that controls link strength for FD layout
  radiusSlider :   slider that controls circular layout strength
  sliderDiv1 :     div that stores FD link strength slider (needed to show/hide when layout change)
  sliderDiv2 :      div that stores circular radius slider (needed to show/hide when layout change)
  dropdown :        dropdown used to change layout
  randomButton :  	"Randomize" button used for random layout
  sliderB1 :        slider that controls the step size edge bundling function
  sliderB2 :        slider that controls the compatibility_threshold edge bundling function
  strOut:		       	<p> element that displays the currently selected layout
  */
  let elements = {
    bundlingCheckbox: bundling,
    strengthSlider: strengthSlider,
    strengthSliderMin: strengthSliderMin,
    strengthSliderMax: strengthSliderMax,
    repulsiveSlider: repulsiveSlider,
    repulsiveSliderMin: repulsiveSliderMin,
    repulsiveSliderMax: repulsiveSliderMax,
    radiusSlider: radiusSlider,
    linkStrengthSliderDiv: sliderDiv1,
    radiusSliderDiv: sliderDiv2,
    layoutDropDown: dropdown,
    randomButton: randomize,
    ebStepSizeSpan: ebStepSizeSpan,
    ebCompaitibiltySpan: ebCompaitibiltySpan,
    ebDiv: ebDiv,
    animateButton: animateButton,
    rememberLayoutCheckbox: rememberLayout,
    sortByCluster: sortByCluster,
    sortByClusterDiv: sortByClusterDiv
  };

  return elements;
}

function initializeRightGraphPanel()
{
  return initializeGraphPanel(false);
}

function initializeLeftGraphPanel()
{
  return initializeGraphPanel(true);
}

function updateFooterText(tooltip, visibility)
{
  // $('#explainFeatureSpan').text(tooltip).css("visibility", visibility);
  $('#explainFeatureSpan').css("visibility", visibility);
  $('#explainFeatureSpan').text(tooltip);
}


function TRACE(x)
{
  console.log("TRACE:", x);
  return x;
}


