function parseResponse(output, expected='object') {
 if(typeof output!=='string')throw Error('Gateway returned an invalid response.');
 const trimmed=output.trim();
 const valid=value=>expected==='array'?Array.isArray(value):value!==null&&typeof value==='object'&&!Array.isArray(value);
 try{const value=JSON.parse(trimmed);if(valid(value))return value;}catch{}
 // Accept a single JSON document on its own line(s), with ordinary log lines before/after.
 // Do not guess between multiple valid documents or extract nested objects from malformed JSON.
 const lines=trimmed.split(/\r?\n/), candidates=[];
 if(trimmed.length>1024*1024||lines.length>1000)throw Error('Gateway response contains too much non-JSON output.');
 for(let start=0;start<lines.length;start++) {
  if(!lines[start].startsWith(expected==='array'?'[':'{'))continue;
  for(let end=start;end<lines.length;end++) {
   try{const value=JSON.parse(lines.slice(start,end+1).join('\n'));if(valid(value)){candidates.push(value);start=end;break;}}catch{}
  }
 }
 if(candidates.length!==1)throw Error('Gateway returned an ambiguous or invalid JSON response.');
 return candidates[0];
}
module.exports={parseResponse};
