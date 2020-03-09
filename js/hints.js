/**
 * Use "introJs" third library (called hint) to noticify something special or failed
 */


/**
 * set up the hints for special layout, without showing
 * @param dataset current data set
 */
function setupHighlightLayout(datasets)
{
  // Hint object constructor
  function Hints(graphName, hint)
  {
    this.graphName = graphName;
    this.hint = hint;
  }

  function initialHighlightLayout(layout)
  {
    let hlspecial = introJs();
    hlspecial.setOptions({
      hints: [
      {
        hint: "This data set has the special layout \"" + layout + "\".",
        element: "#dataDropdown",
        hintPosition: 'custom',
        hintAnimation: false,
      }
    ]
    });
    return hlspecial;
  }

  var hintsArray = [];
  datasets.forEach(function(e){
    hintsArray.push(new Hints(e.graphName, initialHighlightLayout(e.layout)));
  });

  return hintsArray;
}


/**
 * highlight the existence of special layouts when switching to those have
 * @param {*} dataset current data set
 * @param {*} hintsArray initialized hints array
 */
function showHighlightLayout(dataset, hintsArray)
{
  removeHints();
  // has special layout
  if("layout" in dataset)
  {
    var hintObject = hintsArray.find(function (e)
    {
      return e.graphName === dataset.graphName;
    });

    if (hintObject != undefined)
    {
      hintObject.hint.addHints();

      let scrollHandler = addSidebarScrollListener(hintObject.hint);

      hintObject.hint.onhintclose(function()
      {
        // remove once displayed
        let index = hintsArray.indexOf(hintObject);
        if(index > -1)
        {
          hintsArray.splice(index, 1);
        }
        removeHints();
        $("#sidebar").off("scroll", scrollHandler);
      });
    }
  }
}


/**
 * This adds a notification for when the bundling failed for a certain layout
 * @param svg the svg for which the bundling failed
 */
function addBundlingFailNotification(svg, svgs)
{
  // initial the hint
  let failedId = svg === svgs[0] ? 1 : 2;
  let layout = $("#dropdown" + failedId).val();

  let newHint = introJs();
  newHint.setOptions({
    hints: [
      {
        hint: "Edge bundling does not work for this data set in the " + layout + " layout.",
        element: "#edgeBundling",
        hintPosition: 'custom',
        hintAnimation: false,
      }
    ]
  });

  newHint.addHints();

  let scrollHandler = addSidebarScrollListener(newHint);
  newHint.onhintclose(function(){
    removeHints();
    $("sidebar").off("scroll", scrollHandler);
  });

}


// remove hints
function removeHints(scrollHandler)
{
  let container = document.querySelector(".introjs-hints");
  if(container)
  {
    while(container.firstChild)
      container.removeChild(container.firstChild);
  }
  // remove scroll listener
//   $("#sidebar").off("scroll", scrollHandler);
}


// listen to sidebar's scroll event and move the hint
function addSidebarScrollListener(hint)
{
    let scrollHandler = function()
    {
        hint.refresh();
    };
    $("#sidebar").scroll(scrollHandler);
    return scrollHandler;
}
