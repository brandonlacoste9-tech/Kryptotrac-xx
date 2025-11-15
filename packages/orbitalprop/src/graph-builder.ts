/* packages/orbitalprop/src/graph-builder.ts */
function uuidv4() { return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) { const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8); return v.toString(16); }); }
export type Node = { id:string; label:string; type:string; activation:number; position:number[]; };
export type Edge = { source:string; target:string; weight:number; type?:string };
export type SemanticGraph = {
  nodes: Node[]; edges: Edge[];
  getNeighbors: (id:string)=>Node[]; getEdgeWeight:(a:string,b:string)=>number;
};
function randomUnitVector(d=3){ const v=Array.from({length:d},()=>Math.random()-0.5); const mag=Math.sqrt(v.reduce((s,x)=>s+x*x,0))||1; return v.map(x=>x/mag); }
export function buildGraph(text:string,payload:Record<string,any>={}) : SemanticGraph {
  const words = Array.from(new Set((text||'').split(/\s+/).filter(Boolean).slice(0,40)));
  const nodes:Node[] = words.map(w=>({ id: uuidv4(), label:w, type:'concept', activation:Math.random()*0.2, position: randomUnitVector() }));
  Object.keys(payload).slice(0,10).forEach(k=>nodes.push({ id: uuidv4(), label:String(k), type:'attribute', activation:0.05, position:randomUnitVector() }));
  const edges:Edge[] = [];
  for(let i=0;i<nodes.length;i++){
    for(let j=i+1;j<nodes.length;j++){
      const w=Math.random()*0.6;
      if(w>0.5) edges.push({ source:nodes[i].id, target:nodes[j].id, weight:w, type:'semantic' });
    }
  }
  const graph:SemanticGraph = { nodes, edges, getNeighbors(id){ const neigh = edges.filter(e=>e.source===id||e.target===id).map(e=> e.source===id? e.target : e.source ); return nodes.filter(n=>neigh.includes(n.id)); }, getEdgeWeight(a,b){ const e=edges.find(ee=> (ee.source===a&&ee.target===b)||(ee.source===b&&ee.target===a)); return e?e.weight:0 } };
  return graph;
}
