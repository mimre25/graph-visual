$(document).ready(main);

let startTime = null;

/**
 * Removes the layouts from the dropdown that are not allowed
 * @param layouts the list of *allowed* layouts
 */
function removeNonListedLayouts(layouts)
{
  let nonAllowedLayouts = Object.keys(LAYOUTS).filter(x => !(layouts.includes(x)));

  nonAllowedLayouts.forEach(x => $("#dropdown1 option[value='" + LAYOUTS[x] + "']").remove());
  let optGroupFD = $("#dropdown1 optgroup[label='"+ LABEL_FORCE_DIRECTED +"']");
  let optGroupNFD = $("#dropdown1 optgroup[label='"+ LABEL_NON_FORCE_DIRECTED +"']");
  if (optGroupFD.children().length === 0)
  {
    optGroupFD.remove();
  }
  if (optGroupNFD.children().length === 0)
  {
    optGroupNFD.remove();
  }
}

/**
 * clears the graph canvas
 * @param svgQuiz
 */
function clearGraphCanvas(svgQuiz)
{
  svgQuiz.selectAll("*").remove();

}

function showGraphInterface()
{
  $("#rightDiv").prop('class', 'col-lg-6 col-md-12');
  $("#leftDiv").show();
  $("#sidebarInsideDiv").show();
  $("#graphInfoDiv").show();
}

function hideGraphInterface()
{

  $("#leftDiv").hide();
  $("#rightDiv").prop('class', 'col-lg-12');
  $("#questions").prop('class', 'offset-md-1 col-md-10');
  $("#sidebarInsideDiv").hide();
  $("#graphInfoDiv").hide();
}

function printQuestion(quiz, question_num)
{
  startTime = (new Date()).getTime();
  console.warn("showing question " + question_num);
  while(timeouts.length > 0)
  {
    clearTimeout(timeouts.pop());
  }
  let q = new Question(quiz.questions[question_num]);
  let contents = ''; // where question's html is stored
  if (q.type === 'checkbox')
  {
    q.text += "<br />Select all applicable answers.";
  }
  contents += '<p>' + q.text + '</p>';

  if (q.type === 'radio' || q.type === 'checkbox')
  {
    for (let i = 0; i < q.options.length; i++)
    {
      contents += fillTemplate(questionInputs, {aId: i, qNum: question_num, qType: q.type, qOption:q.options[i]});
    }
  } else if (q.type === 'text')
  {
    contents += fillTemplate(textArea, {qNum: question_num, qPlaceholder: q.placeholder});
  } else if (q.type === 'node')
  {
    contents += selectHint;
  }

  contents += '<hr>';
  let colSize = 'col-md-7';
  let graphContainerDisplay = 'block';
  if (q.hasGraph)
  {
    graphContainerDisplay = 'none';
    colSize = 'col-md-12';
  }

  $('.graph-container').css('display', graphContainerDisplay);
  $('#questions').attr('class', colSize);

  document.getElementById("questions").innerHTML = contents;
  $("#questionId").text(question_num);

  document.getElementById("questions-counter").innerHTML = '(' +
    (question_num + 1) + ' of ' + (quiz.questions.length) + ')';

  if (question_num + 1 === quiz['questions'].length)
  {
    $('#bSubmit').show();
    $('#bNext').hide();
  } else
  {
    $('#bSubmit').hide();
    $('#bNext').show();
  }

  ///graph part


  let svgQuiz = d3.select("#quizGraph"),
    width = 500,
    height = 550;

  let simulationQuiz = d3.forceSimulation()
    .force("link", d3.forceLink().id(function (d)
    {
      return d.id;
    }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));


  let parametersQuiz = {
    dataSource: "Les Miserables",
    graphType: "Force Directed",
    bundling: false,
    value: 5
  };

  let graphicQuiz = {
    svg: svgQuiz,
    simulation: simulationQuiz
  };
  let graphAvailable = q.hasGraph;
  if (graphAvailable)
  {
    showGraphInterface();
    let g = q.graph;
    parametersQuiz.graphType = g.layouts[0];
    let dataSourceNodes = document.getElementById("dataInfoNodes");
    let dataSourceEdges = document.getElementById("dataInfoEdges");
    let dataSourceClusters = document.getElementById("dataInfoClusters");

    let dataDropdown = $("#dataDropdown");
    let nodeNumber = document.getElementById("nodeNumberSpan");
    let clusterNumber = document.getElementById("clusterNumberSpan");
    resetGlobals();

    let dataset = datasets.find(function (e)
    {
      return e.displayName === g.resource;
    });


    let elements = initializeLeftGraphPanel();

    let url = './data/json/' + dataset.file;
    let svgs = [svgQuiz];
    d3.json(url, function (error, graph)
    {
      if (error) throw error;
      graph = preProcessGraph(graph);
      dataSourceNodes.innerHTML = "Number of nodes (displayed / total): " + graph.nodes.length + " / " + graph.nodes.length;
      dataSourceEdges.innerHTML = "Number of edges (displayed / total): " + graph.links.length + " / " + graph.links.length;
      nodeNumber.innerHTML = "Total: " + graph.nodes.length;
      clusterNumber.innerHTML = " Total: " + graph.clusters;
      currentGraph = graph;

      $("#edgeFilterSlider").off('input.slider change.slider keyup.slider mouseover.slider');
      $("#highlightOpacity").off('input.slider change.slider keyup.slider mouseover.slider');


      updateDataDescription(dataset);


      setupSliderValueTooltip();
      setupEdgeLengthSlider();
      setupNodeDegreeSlider(graph);
      setupEdgeWeightSlider(graph);
      setupEdgeThicknessSwitch(graph);

      setupGraphOptions(svgs, [simulationQuiz]);

      setupControlElements(elements);
      setupNodesizeScalar(dataset);
      setupNodeDropDown(svgs);
      setupClusterDropDown(svgs);


      graph.links.forEach(e => edgeLengths.push(0.1));



      parametersQuiz.dataSource = dataset.file;

      updateNodeDropDown(graph, dataset);
      updateClusterDropDown(graph);


      if(interactionFlags.layoutDropdownAllowed)
      {
        setupLayoutDropDowns(dataset.layout);
      }


      drawGraph(graph, graphicQuiz ,parametersQuiz, dataset, svgs, elements, true);
      $("#checkBoxColorBlind").change(function() {
        colorBlind = $("#checkBoxColorBlind").prop("checked");
        refreshcolorBlind(svgQuiz, dataset);
      });

      let prefLayout = q.graph.layouts.find(key => LAYOUTS[key] === dataset.preferredLayout);
      prefLayout = prefLayout === undefined ? dataset.layout !== undefined: prefLayout;
      if(prefLayout)
      {
        $("#dropdown1").val(dataset.preferredLayout).change();
      } else
      {
        $("#dropdown1").val(LAYOUTS[q.graph.layouts[0]]).change();
      }
      if(interactionFlags.layoutDropdownAllowed)
      {
        removeNonListedLayouts(q.graph.layouts)
      }
    });
  }
  else
  {
    clearGraphCanvas(svgQuiz);
    hideGraphInterface();
  }

}

function updateAnswer(quiz, questionNumber)
{
  let question = quiz.questions[questionNumber];
  let submissions = [];
  if (question.type === QUESTION_TYPE.SELECT)
  {
    submissions = currentNeighbors.length > 0 ? [currentNeighbors[0]] : [];
  } else {
    if (question.type === QUESTION_TYPE.TEXT) {
      let submission = document.getElementById(questionNumber).value;
      if (submission !== "")
      {
        submissions.push(submission);
      }
    } else if (question.type === QUESTION_TYPE.SINGLE || question.type === QUESTION_TYPE.MULTI) {
      for (let i = 0; i < question.options.length; i++) {
        let selection = document.getElementById(i.toString());
        if (selection.checked) {
          submissions.push(selection.getAttribute('label'));
        }
      }
    }
  }
  let answer = null;
  if (validateAnswer(quiz, questionNumber, submissions))
  {
    let endTime = (new Date()).getTime();
    let timeDiff = (endTime-startTime)/1000;
    answer = new Answer("", quiz.quizId, questionNumber, submissions, question.text,  {'time' : timeDiff});
  }
  return answer;
}

function validateAnswer(quiz, question_number, submissions)
{
  let q = quiz.questions[question_number];
  let ret = true;
  if (submissions.length === 0)
  {
    ret = confirm("The question has not been answered. Proceed anyway?");
  }
  return ret;
}

function clickEvent(e, quiz)
{
  let currentQuestion = +$("#questionId").text();
  e.preventDefault();
  let answer = updateAnswer(quiz, currentQuestion);
  if (answer !== null)
  {
    sendAnswer(quiz, answer, currentQuestion);
    answer.submission = [];
  }
}

function main()
{
  // datasets.push(...datasetsS);
  datasets.push(...datasetsQ);

  let currentUser = "mimre";
  let currentQuiz = "graph_quiz";


  let quizRequest = {
    "username": currentUser,
    "quiz_id": currentQuiz
  };


  getQuiz(quizRequest, runQuiz);


}


function runQuiz(quiz)
{
  let i = 0;
  while(i < quiz.questions.length && quiz.questions[i].answered) {
    console.log("skipping answered question number " + i++);
  }
  if (i >= quiz.questions.length)
  {
    window.location.replace("/submitted");
  }
  printQuestion(quiz, i);
  $('#bNext').on('click', e => clickEvent(e, quiz));
  $('#bSubmit').on('click', e => clickEvent(e, quiz));

}
