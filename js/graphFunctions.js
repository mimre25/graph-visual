
/**
 * starts a bfs from the starting node and returns an array containing all the nodes with a maximum number of hops
 * @param graph the graph to use in formal {nodes, links}
 * @param startId the id of the starting node, has to be in nodes
 * @param hops the number of hops to travers
 */
function breadthFirstSearch(graph, startId, hops)
{
  let links = graph.links;

  let neighbors = [startId];

  for (let i = 0; i < hops ; ++i)
  {
    let numNeighbors = neighbors.length;
    for (let j = 0; j < numNeighbors; ++j)
    {
      let id = neighbors[j];
      let l = links.filter(x => x.source.id === id || x.target.id === id);

      l.forEach(function (x) {
        if (!neighbors.includes(x.source.id))
        {
          neighbors.push(x.source.id);
        }
        if (!neighbors.includes(x.target.id))
        {
          neighbors.push(x.target.id);
        }
      });
    }
  }
  return neighbors;
}