export function gelu(x:number){ return 0.5*x*(1+Math.tanh(Math.sqrt(2/Math.PI)*(x+0.044715*Math.pow(x,3)))); }
export function swish(x:number){ return x/(1+Math.exp(-x)); }
export function sinc(x:number){ if(x===0) return 1; return Math.sin(x)/x; }
