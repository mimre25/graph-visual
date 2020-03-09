/* clearBundling and doBundling functions

graphic : svg and simulation elements of graphs
elements: widgets and strings that change in the user interface

*/

// will be used to clear edges drawn during edge bundling and restore old links
function clearBundling(svg, simulation)
{
  // redraw all original links
  svg.selectAll("line").each(function (d)
  {
    d3.select(this).style("stroke", function (d)
    {
      return "#999";
    })
  });
  // remove bundles links and restart simulation
  svg.selectAll("path").remove();
  simulation.alpha(0.3).restart();
  // remove failed notification (if have one)
  removeHints();
};

// will be used later on to draw edge bundling
let d3line = d3.line()
  .x(function (d)
  {
    return d.x;
  })
  .y(function (d)
  {
    return d.y;
  });


// used to draw edge bundling
// adapted from: https://bl.ocks.org/vasturiano/7c5f24ef7d4237f7eb33f17e59a6976e
function doBundling(st_size, comp_thresh, svg, svgs)
{
  // BUNDLING
  // manipulate data so that it is in the proper form for the provided bundling functions
  let nodes_bundle = {};
  svg.selectAll("circle").each(function (d)
  {
    innerdict = {};
    innerdict["x"] = d.x;
    innerdict["y"] = d.y;
    nodes_bundle[d.id] = innerdict;
  });
  let links_bundle = [];
  svg.selectAll("line").each(function (d)
  {
    mydict = {};
    mydict["source"] = d.source.id;
    mydict["target"] = d.target.id;
    links_bundle.push(mydict);
  });
  // begin bundling, step_size and compatibility_threshold adapted from https://github.com/upphiminn/d3.ForceBundle
  let fbundling = d3.ForceEdgeBundling()
    .step_size(st_size / 10)
    .compatibility_threshold(comp_thresh / 10)
    .nodes(nodes_bundle)
    .edges(links_bundle);
  try
  {
    let bundleResults = fbundling();

    // make all regular links white to hide them while bundling
    svg.selectAll("line").each(function (d)
    {
      d3.select(this).style("stroke", function (d)
      {
        return d3.rgb(255, 255, 255);
      });
    });

    // for each of the arrays in the results
    // draw a line between the subdivions points for that edge
    bundleResults.forEach(function (edge_subpoint_data)
    {
      svg.append("path")
        .attr("d", d3line(edge_subpoint_data))
        .style("stroke-width", 1.2)
        .style("stroke", function (d) 
        {
          return "#999";
        })
        .style("fill", "none")
        .style('stroke-opacity', .7); //use opacity as blending
    });

    // move nodes in front of the drawn path of edge bundling
    svg.selectAll(".nodes").each(function (d)
    {
      this.parentElement.appendChild(this);
    });
  }
  catch (e)
  {
    console.log(e);
    addBundlingFailNotification(svg, svgs);
  }

}
