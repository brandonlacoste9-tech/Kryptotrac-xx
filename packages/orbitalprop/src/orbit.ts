/* packages/orbitalprop/src/orbit.ts */
import type { SemanticGraph } from './graph-builder';
import { swish } from './activations';
export function runOrbitCycle(graph:SemanticGraph, memory:any, cycle:number){
  const eta = 0.06; const decay = 0.95; const stepSize = 0.01;
  for(const node of graph.nodes){
    const neighbors = graph.getNeighbors(node.id);
    let pull = 0;
    for(const n of neighbors){
      const w = graph.getEdgeWeight(node.id, n.id) || 0;
      const similarity = Math.max(0, node.position.reduce((s, _, i)=> s + (node.position[i] * (n.position[i] || 0)), 0));
      pull += (n.activation || 0) * w * (similarity || 0.001);
    }
    node.activation = Math.max(0, node.activation + eta * pull);
  }
  for(const node of graph.nodes){
    const delta = node.position.map(v=>v + (Math.random()-0.5)*stepSize);
    const mag = Math.sqrt(delta.reduce((s,x)=>s+x*x,0))||1;
    node.position = delta.map(x=>x/mag);
  }
  for(const node of graph.nodes){ node.activation = Math.min(2, node.activation * decay); node.activation = swish(node.activation); }
}
