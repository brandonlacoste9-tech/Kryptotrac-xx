/* packages/orbitalprop/src/orbital-prop.ts */
import { buildGraph } from './graph-builder';
import { runOrbitCycle } from './orbit';
export async function orbitalPropReason(input:any){
  const graph = buildGraph(input.context || '', input.payload || {});
  const cycles = 24;
  for(let i=0;i<cycles;i++) runOrbitCycle(graph, null, i);
  const top = graph.nodes.sort((a,b)=> (b.activation||0)-(a.activation||0)).slice(0,5).map(n=>n.label).join(' → ');
  const action = graph.nodes.filter(n=>n.type==='action').sort((a,b)=>(b.activation||0)-(a.activation||0))[0]?.label || 'analyze';
  const conf = Math.min(1, graph.nodes.reduce((acc,n)=>acc + (n.activation||0), 0)/Math.max(1, graph.nodes.length));
  return { reasoning: top || 'no-conclusion', nextAction: action, confidence: conf, metadata:{ orbitSteps:cycles, graphNodes:graph.nodes.length, graphEdges: graph.edges.length } };
}
