// This file has two functions on "about"

// show "About" and return
// var aboutOnClick = (function()
// {
//   let aboutShowing = false;
//   hiddenElementsName = "#textWidthDiv, .loading-wrapper, #topNav, #mainDiv, .introjs-hints";

//   return function()
//   {
//     aboutShowing ? backfromAbout(hiddenElementsName) : gotoAbout(hiddenElementsName);
//     aboutShowing = ! aboutShowing;
//   }
// }) ();


function gotoAbout()
{
  let hiddenElementsName = "#textWidthDiv, .loading-wrapper, #topNav, #mainDiv, .introjs-hints";
  // clear body (hide all body's children)
  $(hiddenElementsName).hide();

  // create new gloabl div
  let globalDiv = $("<div id='globalDiv'><div>");
  // append to body
  $("body").append(globalDiv);
  // load html
  globalDiv.load("about.html");

}


function backfromAbout()
{
  let hiddenElementsName = "#textWidthDiv, #topNav, #mainDiv, .introjs-hints";

  let globalDiv = $("#globalDiv");
  globalDiv.remove();

  $(hiddenElementsName).show();
}


// let ABOUT_TEXT = "";
// let ABOUT_NAVI = "";

// function setupAbout()
// {
//   jQuery.get("about.html", function (my_var)
//   {
//     ABOUT_TEXT = my_var;
//   });
//   jQuery.get("navigation.html", function (my_var)
//   {
//     ABOUT_NAVI = my_var.firstChild;
//   });
// }