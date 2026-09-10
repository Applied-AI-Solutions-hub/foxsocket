(()=>{var Xt=()=>{};function Lr(t){let e;return()=>(e===void 0&&(e=t()),e)}var Sr=t=>t;var Ft=t=>t*1e3,Yt=t=>t/1e3;var Ar=t=>Array.isArray(t)&&typeof t[0]=="number";var Ai=(t,e,o=10)=>{let r="",i=Math.max(Math.round(e/o),2);for(let a=0;a<i;a++)r+=Math.round(t(a/(i-1))*1e4)/1e4+", ";return`linear(${r.substring(0,r.length-2)})`};var Dn=t=>t!==null;function Ei(t,{repeat:e,repeatType:o="loop"},r,i=1){let a=t.filter(Dn),l=i<0||e&&o!=="loop"&&e%2===1?0:a.length-1;return!l||r===void 0?a[l]:r}var Eo=class{constructor(){this.updateFinished()}get finished(){return this._finished}updateFinished(){this._finished=new Promise(e=>{this.resolve=e})}notifyFinished(){this.resolve()}then(e,o){return this.finished.then(e,o)}};function Er(t){for(let e=1;e<t.length;e++)t[e]??(t[e]=t[e-1])}var zo=t=>t.startsWith("--");function zi(t,e,o){zo(e)?t.style.setProperty(e,o):t.style[e]=o}var $i={};function $o(t,e){let o=Lr(t);return()=>$i[e]??o()}var ki=$o(()=>window.ScrollTimeline!==void 0,"scrollTimeline");var ko=$o(()=>{try{document.createElement("div").animate({opacity:0},{easing:"linear(0, 1)"})}catch{return!1}return!0},"linearEasing");var pt=([t,e,o,r])=>`cubic-bezier(${t}, ${e}, ${o}, ${r})`;var zr={linear:"linear",ease:"ease",easeIn:"ease-in",easeOut:"ease-out",easeInOut:"ease-in-out",circIn:pt([0,.65,.55,1]),circOut:pt([.55,0,1,.45]),backIn:pt([.31,.01,.66,-.59]),backOut:pt([.33,1.53,.69,.99])};function $r(t,e){if(t)return typeof t=="function"?ko()?Ai(t,e):"ease-out":Ar(t)?pt(t):Array.isArray(t)?t.map(o=>$r(o,e)||zr.easeOut):zr[t]}function Mi(t,e,o,{delay:r=0,duration:i=300,repeat:a=0,repeatType:n="loop",ease:l="easeOut",times:s}={},c=void 0){let m={[e]:o};s&&(m.offset=s);let d=$r(l,i);Array.isArray(d)&&(m.easing=d);let f={delay:r,duration:i,easing:Array.isArray(d)?"linear":d,fill:"both",iterations:a+1,direction:n==="reverse"?"alternate":"normal"};return c&&(f.pseudoElement=c),t.animate(m,f)}function Fi(t){return typeof t=="function"&&"applyToOptions"in t}function Ri({type:t,...e}){return Fi(t)&&ko()?t.applyToOptions(e):(e.duration??(e.duration=300),e.ease??(e.ease="easeOut"),e)}var Gt=class extends Eo{constructor(e){if(super(),this.finishedTime=null,this.isStopped=!1,this.manualStartTime=null,!e)return;let{element:o,name:r,keyframes:i,pseudoElement:a,allowFlatten:n=!1,finalKeyframe:l,onComplete:s}=e;this.isPseudoElement=!!a,this.allowFlatten=n,this.options=e,Xt(typeof e.type!="string",`Mini animate() doesn't support "type" as a string.`,"mini-spring");let c=Ri(e);this.animation=Mi(o,r,i,c,a),c.autoplay===!1&&this.animation.pause(),this.animation.onfinish=()=>{if(this.finishedTime=this.time,!a){let m=Ei(i,this.options,l,this.speed);this.updateMotionValue&&this.updateMotionValue(m),zi(o,r,m),this.animation.cancel()}s?.(),this.notifyFinished()}}play(){this.isStopped||(this.manualStartTime=null,this.animation.play(),this.state==="finished"&&this.updateFinished())}pause(){this.animation.pause()}complete(){this.animation.finish?.()}cancel(){try{this.animation.cancel()}catch{}}stop(){if(this.isStopped)return;this.isStopped=!0;let{state:e}=this;e==="idle"||e==="finished"||(this.updateMotionValue?this.updateMotionValue():this.commitStyles(),this.isPseudoElement||this.cancel())}commitStyles(){let e=this.options?.element;!this.isPseudoElement&&e?.isConnected&&this.animation.commitStyles?.()}get duration(){let e=this.animation.effect?.getComputedTiming?.().duration||0;return Yt(Number(e))}get iterationDuration(){let{delay:e=0}=this.options||{};return this.duration+Yt(e)}get time(){return Yt(Number(this.animation.currentTime)||0)}set time(e){let o=this.finishedTime!==null;this.manualStartTime=null,this.finishedTime=null,this.animation.currentTime=Ft(e),o&&this.animation.pause()}get speed(){return this.animation.playbackRate}set speed(e){e<0&&(this.finishedTime=null),this.animation.playbackRate=e}get state(){return this.finishedTime!==null?"finished":this.animation.playState}get startTime(){return this.manualStartTime??Number(this.animation.startTime)}set startTime(e){this.manualStartTime=this.animation.startTime=e}attachTimeline({timeline:e,rangeStart:o,rangeEnd:r,observe:i}){return this.allowFlatten&&this.animation.effect?.updateTiming({easing:"linear"}),this.animation.onfinish=null,e&&ki()?(this.animation.timeline=e,o&&(this.animation.rangeStart=o),r&&(this.animation.rangeEnd=r),Sr):i(this)}};var Mo=class{constructor(e){this.stop=()=>this.runAll("stop"),this.animations=e.filter(Boolean)}get finished(){return Promise.all(this.animations.map(e=>e.finished))}getAll(e){return this.animations[0][e]}setAll(e,o){for(let r=0;r<this.animations.length;r++)this.animations[r][e]=o}attachTimeline(e){let o=this.animations.map(r=>r.attachTimeline(e));return()=>{o.forEach((r,i)=>{r&&r(),this.animations[i].stop()})}}get time(){return this.getAll("time")}set time(e){this.setAll("time",e)}get speed(){return this.getAll("speed")}set speed(e){this.setAll("speed",e)}get state(){return this.getAll("state")}get startTime(){return this.getAll("startTime")}get duration(){return Ii(this.animations,"duration")}get iterationDuration(){return Ii(this.animations,"iterationDuration")}runAll(e){this.animations.forEach(o=>o[e]())}play(){this.runAll("play")}pause(){this.runAll("pause")}cancel(){this.runAll("cancel")}complete(){this.runAll("complete")}};function Ii(t,e){let o=0;for(let r=0;r<t.length;r++){let i=t[r][e];i!==null&&i>o&&(o=i)}return o}var Zt=class extends Mo{then(e,o){return this.finished.finally(e).then(()=>{})}};var Pi=new WeakMap,kr=(t,e="")=>`${t}:${e}`;function Mr(t){let e=Pi.get(t);return e||(e=new Map,Pi.set(t,e)),e}function Vi(t,e){if(t?.inherit&&e){let{inherit:o,...r}=t;return{...e,...r}}return t}function Fr(t,e){let o=t?.[e]??t?.default??t;return o!==t?Vi(o,t):o}var Di=["borderTopLeftRadius","borderTopRightRadius","borderBottomRightRadius","borderBottomLeftRadius"];var Ni=new Set(["borderWidth","borderTopWidth","borderRightWidth","borderBottomWidth","borderLeftWidth","borderRadius",...Di,"width","maxWidth","height","maxHeight","top","right","bottom","left","inset","insetBlock","insetBlockStart","insetBlockEnd","insetInline","insetInlineStart","insetInlineEnd","padding","paddingTop","paddingRight","paddingBottom","paddingLeft","paddingBlock","paddingBlockStart","paddingBlockEnd","paddingInline","paddingInlineStart","paddingInlineEnd","margin","marginTop","marginRight","marginBottom","marginLeft","marginBlock","marginBlockStart","marginBlockEnd","marginInline","marginInlineStart","marginInlineEnd","fontSize","backgroundPositionX","backgroundPositionY"]);function Rr(t,e){for(let o=0;o<t.length;o++)typeof t[o]=="number"&&Ni.has(e)&&(t[o]=t[o]+"px")}function Ir(t,e,o){if(t==null)return[];if(t instanceof EventTarget)return[t];if(typeof t=="string"){let r=document;e&&(r=e.current);let i=o?.[t]??r.querySelectorAll(t);return i?Array.from(i):[]}return Array.from(t).filter(r=>r!=null)}function Fo(t,e){let o=window.getComputedStyle(t);return zo(e)?o.getPropertyValue(e):o[e]}function Bi(t,e,o,r){if(t==null)return[];let i=Ir(t,r),a=i.length;Xt(!!a,"No valid elements provided.","no-valid-elements");let n=[];for(let s=0;s<a;s++){let c=i[s],m={...o};typeof m.delay=="function"&&(m.delay=m.delay(s,a));for(let d in e){let f=e[d];Array.isArray(f)||(f=[f]);let p={...Fr(m,d)};p.duration&&(p.duration=Ft(p.duration)),p.delay&&(p.delay=Ft(p.delay));let _=Mr(c),y=kr(d,p.pseudoElement||""),B=_.get(y);B&&B.stop(),n.push({map:_,key:y,unresolvedKeyframes:f,options:{...p,element:c,name:d,allowFlatten:!m.type&&!m.ease}})}}for(let s=0;s<n.length;s++){let{unresolvedKeyframes:c,options:m}=n[s],{element:d,name:f,pseudoElement:p}=m;!p&&c[0]===null&&(c[0]=Fo(d,f)),Er(c),Rr(c,f),!p&&c.length<2&&c.unshift(Fo(d,f)),m.keyframes=c}let l=[];for(let s=0;s<n.length;s++){let{map:c,key:m,options:d}=n[s],f=new Gt(d);c.set(m,f),f.finished.finally(()=>c.delete(m)),l.push(f)}return l}var Nn=t=>{function e(o,r,i){return new Zt(Bi(o,r,i,t))}return e},Jt=Nn();var we=typeof window<"u",Ro=we?window:null,ot=we?document:null,z={OBJECT:0,ATTRIBUTE:1,CSS:2,TRANSFORM:3,CSS_VAR:4},v={NUMBER:0,UNIT:1,COLOR:2,COMPLEX:3},W={NONE:0,AUTO:1,FORCE:2},I={replace:0,none:1,blend:2},Pr=Symbol(),Se=Symbol(),Io=Symbol(),rt=Symbol(),Oi=Symbol(),C=1e-11,Qt=1e12,Ae=1e3,eo=240,Ee="",Ui="var(",to=[],Po=(()=>{let t=new Map;return t.set("x","translateX"),t.set("y","translateY"),t.set("z","translateZ"),t})(),Rt=["perspective","translateX","translateY","translateZ","rotate","rotateX","rotateY","rotateZ","scale","scaleX","scaleY","scaleZ","skew","skewX","skewY"],qi=Rt.reduce((t,e)=>({...t,[e]:e+"("}),{}),J=()=>{},Hi=t=>t,Wi=/\)\s*[-.\d]/,ji=/(^#([\da-f]{3}){1,2}$)|(^#([\da-f]{4}){1,2}$)/i,Ki=/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i,Xi=/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(-?\d+|-?\d*.\d+)\s*\)/i,Yi=/hsl\(\s*(-?\d+|-?\d*.\d+)\s*,\s*(-?\d+|-?\d*.\d+)%\s*,\s*(-?\d+|-?\d*.\d+)%\s*\)/i,Gi=/hsla\(\s*(-?\d+|-?\d*.\d+)\s*,\s*(-?\d+|-?\d*.\d+)%\s*,\s*(-?\d+|-?\d*.\d+)%\s*,\s*(-?\d+|-?\d*.\d+)\s*\)/i,Vr=/[-+]?\d*\.?\d+(?:e[-+]?\d)?/gi,Zi=/^([-+]?\d*\.?\d+(?:e[-+]?\d+)?)([a-z]+|%)$/i,Ji=/([a-z])([A-Z])/g;var Qi=/var\(\s*(--[\w-]+)(?:\s*,\s*([^)]+))?\s*\)/;var It={id:null,keyframes:null,playbackEase:null,playbackRate:1,frameRate:eo,loop:0,reversed:!1,alternate:!1,autoplay:!0,persist:!1,duration:Ae,delay:0,loopDelay:0,ease:"out(2)",composition:I.replace,modifier:Hi,onBegin:J,onBeforeUpdate:J,onUpdate:J,onLoop:J,onPause:J,onComplete:J,onRender:J},oo={current:null,root:ot},M={defaults:It,precision:4,timeScale:1,tickThreshold:200,editor:null},Dr={version:"4.5.0",engine:null};we&&(Ro.AnimeJS||(Ro.AnimeJS=[]),Ro.AnimeJS.push(Dr));var Nr=t=>t.replace(Ji,"$1-$2").toLowerCase(),_e=(t,e)=>t.indexOf(e)===0,Be=Date.now,it=Array.isArray,Vo=t=>t&&t.constructor===Object,ta=t=>typeof t=="number"&&!isNaN(t),Oe=t=>typeof t=="string",Ue=t=>typeof t=="function",S=t=>typeof t>"u",at=t=>S(t)||t===null,Do=t=>we&&t instanceof SVGElement,Br=t=>ji.test(t),Or=t=>_e(t,"rgb"),Ur=t=>_e(t,"hsl"),oa=t=>Br(t)||(Or(t)||Ur(t))&&(t[t.length-1]===")"||!Wi.test(t)),ro=t=>!M.defaults.hasOwnProperty(t),Bn=["opacity","rotate","overflow","color"],ra=(t,e)=>{if(Bn.includes(e))return!1;if(t.getAttribute(e)||e in t){if(e==="scale"){let o=t.parentNode;return o&&o.tagName==="filter"}return!0}};var ht=Math.pow,ia=Math.sqrt,aa=Math.sin,na=Math.cos;var sa=Math.floor,la=Math.asin;var io=Math.PI,ea=Math.round,re=(t,e,o)=>t<e?e:t>o?o:t,L=(t,e)=>{if(e<0)return t;if(!e)return ea(t);let o=10**e;return ea(t*o)/o};var Pt=(t,e,o)=>o===1?e:o===0?t:t+(e-t)*o,ao=t=>t===1/0?Qt:t===-1/0?-Qt:t,gt=t=>t<=C?C:ao(L(t,11)),P=t=>it(t)?[...t]:t,ca=(t,e)=>{let o={...t};for(let r in e){let i=t[r];o[r]=S(i)?e[r]:i}return o},$=(t,e,o,r="_prev",i="_next")=>{let a=t._head,n=i;for(o&&(a=t._tail,n=r);a;){let l=a[n];e(a),a=l}},wt=(t,e,o="_prev",r="_next")=>{let i=e[o],a=e[r];i?i[r]=a:t._head=a,a?a[o]=i:t._tail=i,e[o]=null,e[r]=null},qe=(t,e,o,r="_prev",i="_next")=>{let a=t._tail;for(;a&&o&&o(a,e);)a=a[r];let n=a?a[i]:t._head;a?a[i]=e:t._head=e,n?n[r]=e:t._tail=e,e[r]=a,e[i]=n};var ma=(t,e,o)=>{let r=t.style.transform;if(r){let i=t[rt],a=0,n=r.length,l;for(;a<n;){for(;a<n&&r.charCodeAt(a)===32;)a++;if(a>=n)break;let c=a;for(;a<n&&r.charCodeAt(a)!==40;)a++;if(a>=n)break;let m=r.substring(c,a),d=1,f=a+1,p=-1,_=-1;for(a++;a<n&&d>0;){let B=r.charCodeAt(a);B===40?d++:B===41?d--:B===44&&d===1&&(p===-1?p=a:_===-1&&(_=a)),a++}let y=a-1;m==="translate"||m==="translate3d"?(p===-1?i.translateX=r.substring(f,y).trim():(i.translateX=r.substring(f,p).trim(),_===-1?i.translateY=r.substring(p+1,y).trim():(i.translateY=r.substring(p+1,_).trim(),i.translateZ=r.substring(_+1,y).trim())),l=r.substring(f,y)):m==="scale"||m==="scale3d"?p===-1?i.scale=r.substring(f,y).trim():(i.scaleX=r.substring(f,p).trim(),_===-1?i.scaleY=r.substring(p+1,y).trim():(i.scaleY=r.substring(p+1,_).trim(),i.scaleZ=r.substring(_+1,y).trim())):i[m]=r.substring(f,y)}if(e==="translate3d"&&l)return o&&(o[e]=l),l;let s=i[e];if(!S(s))return o&&(o[e]=s),s}return e==="translate3d"?"0px, 0px, 0px":e==="rotate3d"?"0, 0, 0, 0deg":_e(e,"scale")?"1":_e(e,"rotate")||_e(e,"skew")?"0deg":"0px"},No=t=>{let e=Ee;for(let o=0,r=Rt.length;o<r;o++){let i=Rt[o],a=t[i];if(a!==void 0){if(i==="translateX"){let n=t.translateY;if(n!==void 0){let l=t.translateZ;l!==void 0?(e+=`translate3d(${a},${n},${l}) `,o+=2):(e+=`translate(${a},${n}) `,o+=1);continue}}if(i==="scaleX"&&t.scale===void 0){let n=t.scaleY;if(n!==void 0){let l=t.scaleZ;l!==void 0?(e+=`scale3d(${a},${n},${l}) `,o+=2):(e+=`scale(${a},${n}) `,o+=1);continue}}e+=`${qi[i]}${a}) `}i==="rotateZ"&&t.rotate3d!==void 0&&(e+=`rotate3d(${t.rotate3d}) `)}return t.matrix!==void 0&&(e+=`matrix(${t.matrix}) `),t.matrix3d!==void 0&&(e+=`matrix3d(${t.matrix3d}) `),e};var qr=[];function Bo(t,e){if(!t)return null;let o=qr.length;e:for(let r=0;r<o;r++){let i=qr[r];if(i.detect&&!i.detect(t))continue;let a=i.targetAdapters;for(let n=0,l=a.length;n<l;n++){let s=a[n];if(s.detect(t)){let c=s.props[e];if(c&&(!c.gate||c.gate(t)))return c;break e}}}for(let r=0;r<o;r++){let i=qr[r];if(i.detect&&!i.detect(t))continue;let a=i.propertyResolvers;for(let n=0,l=a.length;n<l;n++){let s=a[n](t,e);if(s)return s}}return null}var On=t=>{let e=Ki.exec(t)||Xi.exec(t),o=S(e[4])?1:+e[4];return[+e[1],+e[2],+e[3],o]},Un=t=>{let e=t.length,o=e===4||e===5;return[+("0x"+t[1]+t[o?1:2]),+("0x"+t[o?2:3]+t[o?2:4]),+("0x"+t[o?3:5]+t[o?3:6]),e===5||e===9?+(+("0x"+t[o?4:7]+t[o?4:8])/255).toFixed(3):1]},Hr=(t,e,o)=>(o<0&&(o+=1),o>1&&(o-=1),o<1/6?t+(e-t)*6*o:o<1/2?e:o<2/3?t+(e-t)*(2/3-o)*6:t),qn=t=>{let e=Yi.exec(t)||Gi.exec(t),o=+e[1]/360,r=+e[2]/100,i=+e[3]/100,a=S(e[4])?1:+e[4],n,l,s;if(r===0)n=l=s=i;else{let c=i<.5?i*(1+r):i+r-i*r,m=2*i-c;n=L(Hr(m,c,o+1/3)*255,0),l=L(Hr(m,c,o)*255,0),s=L(Hr(m,c,o-1/3)*255,0)}return[n,l,s,a]},da=t=>Or(t)?On(t):Br(t)?Un(t):Ur(t)?qn(t):[0,0,0,1];var N=(t,e)=>S(t)?e:t,ua=(t,e)=>{let o=t.match(Qi),r=e[Se]?e:document.documentElement,i=getComputedStyle(r)?.getPropertyValue(o[1]);return(!i||i.trim()===Ee)&&o[2]&&(i=o[2].trim()),i||0},ze=(t,e,o,r,i,a)=>{if(Ue(t)){if(!i){let l=t(e,o,r,a);return isNaN(+l)?l||0:+l}let n=()=>{let l=t(e,o,r,a);return isNaN(+l)?l||0:+l};return i.func=n,n()}if(Oe(t)&&_e(t,Ui)){if(!i)return ua(t,e);let n=()=>ua(t,e);return i.func=n,n()}return t},Wr=(t,e)=>t[Se]?t[Io]&&ra(t,e)?z.ATTRIBUTE:Rt.includes(e)||Po.get(e)?z.TRANSFORM:_e(e,"--")?z.CSS_VAR:e in t.style?z.CSS:e in t?z.OBJECT:z.ATTRIBUTE:z.OBJECT,fa=(t,e,o)=>{let r=t.style[e];r&&o&&(o[e]=r);let i=r||getComputedStyle(t[Oi]||t).getPropertyValue(e);return i==="auto"?"0":i},Vt=(t,e,o,r)=>{let i=S(o)?Wr(t,e):o,a=Bo(t,e);if(a){let n=a.get(t);return n&&r&&(r[e]=n),n??0}if(i===z.OBJECT){let n=t[e];return n&&r&&(r[e]=n),n||0}if(i===z.ATTRIBUTE){let n=t.getAttribute(e);return n&&r&&(r[e]=n),n}return i===z.TRANSFORM?ma(t,e,r):i===z.CSS_VAR?fa(t,e,r).trimStart():fa(t,e,r)},Oo=(t,e,o)=>o==="-"?t-e:o==="+"?t+e:t*e,Uo=()=>({t:v.NUMBER,n:0,u:null,o:null,d:null,s:null}),ie=(t,e)=>{if(e.t=v.NUMBER,e.n=0,e.u=null,e.o=null,e.d=null,e.s=null,!t)return e;let o=+t;if(!isNaN(o))return e.n=o,e;let r=t;r[1]==="="&&(e.o=r[0],r=r.slice(2));let i=r.includes(" ")?!1:Zi.exec(r);if(i)return e.t=v.UNIT,e.n=+i[1],e.u=i[2],e;if(e.o)return e.n=+r,e;if(oa(r))return e.t=v.COLOR,e.d=da(r),e;{let a=r.match(Vr);return e.t=v.COMPLEX,e.d=a?a.map(Number):[],e.s=r.split(Vr)||[],e}},jr=(t,e)=>(e.t=t._valueType,e.n=t._toNumber,e.u=t._unit,e.o=null,e.d=P(t._toNumbers),e.s=P(t._strings),e),me=Uo(),qo=(t,e,o)=>{let r=t._modifier,i=t._fromNumbers,a=t._toNumbers,n=t._strings,l=n[0];for(let s=0,c=a.length;s<c;s++){let m=r(L(Pt(i[s],a[s],e),o)),d=n[s+1];l+=`${d?m+d:m}`,t._numbers[s]=m}return l};var no=(t,e,o,r,i)=>{let a=t.parent,n=t.duration,l=t.completed,s=t.iterationDuration,c=t.iterationCount,m=t._currentIteration,d=t._loopDelay,f=t._reversed,p=t._alternate,_=t._hasChildren,y=t._delay,B=t._currentTime,mt=y+s,ee=e-y,be=re(B,-y,n),X=re(ee,-y,n),ye=ee-B,k=X>0,xe=X>=n,Me=n<=C,Fe=i===W.FORCE,Re=0,Je=ee,Ie=0;if(c>1){let Qe=s+(xe?0:d),Y=~~(X/Qe);t._currentIteration=re(Y,0,c),xe&&t._currentIteration--,Re=t._currentIteration%2,Je=X-Y*Qe||0}let St=f^(p&&Re),At=t._ease,R=xe?St?0:n:St?s-Je:Je;At&&(R=s*At(R/s)||0);let U=(a?a.backwards:ee<B)?!St:!!St;if(t._currentTime=ee,t._iterationTime=R,t.backwards=U,k&&!t.began?(t.began=!0,!o&&!(a&&(U||!a.began))&&t.onBegin(t)):ee<=0&&(t.began=!1),!o&&!_&&k&&t._currentIteration!==m&&t.onLoop(t),Fe||i===W.AUTO&&(e>=(a&&y>0?0:y)&&e<=mt||e<=y&&be>y||e>=mt&&be!==n)||R>=mt&&be!==n||R<=y&&be>0&&!xe||e<=be&&be===n&&l||xe&&!l&&Me){if(k&&(t.computeDeltaTime(be),o||t.onBeforeUpdate(t)),!_){let Qe=Fe||(U?ye*-1:ye)>=M.tickThreshold,Y=L(t._offset+(a?a._offset:0)+y+R,12),g=t._head,A,te,ue,dt,Et=0;for(;g;){let fe=g._composition,G=g._currentTime,et=g._changeDuration,pe=g._absoluteStartTime+g._changeDuration,E=g._nextRep,oe=g._prevRep,Pe=fe!==I.none,ne=oe?oe._absoluteStartTime+oe._changeDuration:0,Te=oe&&oe.parent!==g.parent,Ve=!E||E._isOverridden?pe:E.parent===g.parent?pe+E._delay:E._absoluteStartTime<E._absoluteUpdateStartTime?E._absoluteStartTime:E._absoluteUpdateStartTime;if((Qe||(G!==et||Y<=Ve||oe&&!Te&&(!E||E.parent!==g.parent))&&(G!==0||Y>=g._absoluteStartTime||Te&&!g._hasFromValue&&!oe._isOverridden&&Y>=ne||E&&!E._isOverridden&&E.parent===g.parent&&E._currentTime!==0&&R<E._startTime))&&(!oe||Te||R>=g._startTime)&&(!Pe||!g._isOverridden&&(!g._isOverlapped||Y<=pe)&&(!E||E._isOverridden||Y<=Ve)&&(!oe||oe._isOverridden||(Te?Y>=g._absoluteStartTime||!g._hasFromValue&&Y>=ne:Y>=ne+g._delay)))){let ut=g._currentTime=re(R-g._startTime,0,et),q=g._ease(ut/g._updateDuration),se=g._modifier,he=g._valueType,le=g._tweenType,zt=le===z.OBJECT,Ce=he===v.NUMBER,De=Ce&&zt||q===0||q===1?-1:M.precision,D,Ne;if(Ce)D=Ne=se(L(Pt(g._fromNumber,g._toNumber,q),De));else if(he===v.UNIT)Ne=se(L(Pt(g._fromNumber,g._toNumber,q),De)),D=`${Ne}${g._unit}`;else if(he===v.COLOR){let H=g._numbers,tt=g._fromNumbers,Le=g._toNumbers,$t=1-q,Lo=tt[0],So=tt[1],kt=tt[2],Mt=Le[0],ft=Le[1],jt=Le[2];H[0]=se(Math.sqrt(Lo*Lo*$t+Mt*Mt*q)),H[1]=se(Math.sqrt(So*So*$t+ft*ft*q)),H[2]=se(Math.sqrt(kt*kt*$t+jt*jt*q)),H[3]=se(Pt(tt[3],Le[3],q)),(!g._setter||r)&&(D=`rgba(${L(H[0],0)},${L(H[1],0)},${L(H[2],0)},${H[3]})`)}else he===v.COMPLEX&&(D=qo(g,q,De));if(Pe&&(g._number=Ne),!r&&fe!==I.blend){let H=g.property;A=g.target,g._setter?g._setter(A,Ne,g):zt?A[H]=D:le===z.ATTRIBUTE?A.setAttribute(H,D):(te=A.style,le===z.TRANSFORM?(A!==ue&&(ue=A,dt=A[rt]),dt[H]=D,Et=1):le===z.CSS?te[H]=D:le===z.CSS_VAR&&te.setProperty(H,D)),k&&(Ie=1)}else g._value=D}else G&&oe&&!Te&&R<g._startTime&&(g._currentTime=0);Et&&g._renderTransforms&&(te.transform=No(dt),Et=0),g=g._next}!o&&Ie&&t.onRender(t)}!o&&k&&t.onUpdate(t)}return a&&Me?!o&&(a.began&&!U&&ee>0&&!l||U&&ee<=C&&l)&&(t.onComplete(t),t.completed=!U):k&&xe?c===1/0?t._startTime+=t.duration:t._currentIteration>=c-1&&(t.paused=!0,!l&&!_&&(t.completed=!0,!o&&!(a&&(U||!a.began))&&(t.onComplete(t),t._resolve(t)))):t.completed=!1,Ie},nt=(t,e,o,r,i)=>{let a=t._currentIteration;if(no(t,e,o,r,i),t._hasChildren){let n=t,l=n.backwards,s=r?e:n._iterationTime,c=Be(),m=0,d=!0;if(!r&&n._currentIteration!==a){let f=n.iterationDuration;$(n,p=>{if(!l)!p.completed&&!p.backwards&&p._currentTime<p.iterationDuration&&no(p,f,o,1,W.FORCE),p.began=!1,p.completed=!1;else{let _=p.duration,y=p._offset+p._delay,B=y+_;!o&&_<=C&&(!y||B===f)&&p.onComplete(p)}}),o||n.onLoop(n)}$(n,f=>{let p=L((s-f._offset)*f._speed,12);if(l&&p>f._delay+f.duration)return;let _=f._fps<n._fps?f.requestTick(c):i;m+=no(f,p,o,r,_),!f.completed&&d&&(d=!1)},l),!o&&m&&n.onRender(n),(d||l)&&n._currentTime>=n.duration&&(n.paused=!0,n.completed||(n.completed=!0,o||(n.onComplete(n),n._resolve(n))))}};var pa={},ha=(t,e,o)=>{if(o===z.TRANSFORM){let r=Po.get(t);return r||t}else if(o===z.CSS||o===z.ATTRIBUTE&&Do(e)&&t in e.style){let r=pa[t];if(r)return r;{let i=t&&Nr(t);return pa[t]=i,i}}else return t},Kr=(t,e=!1)=>{if(t._hasChildren)$(t,o=>Kr(o,e),!0);else{let o=t;o.pause(),$(o,r=>{let i=r.property,a=r.target,n=r._tweenType,l=r._inlineValue,s=at(l)||l===Ee;if(r._setter){if(!e&&!s){if(ie(l,me),me.d){let c=me.d,m=r._numbers;for(let d=0,f=c.length;d<f;d++)m[d]=c[d]}else r._number=me.n;r._setter(r.target,r._number,r)}}else if(n===z.OBJECT)!e&&!s&&(a[i]=l);else if(a[Se])if(n===z.ATTRIBUTE)e||(s?a.removeAttribute(i):a.setAttribute(i,l));else{let c=a.style;if(n===z.TRANSFORM){let m=a[rt];s?delete m[i]:m[i]=l,r._renderTransforms&&(Object.keys(m).length?c.transform=No(m):c.removeProperty("transform"))}else s?c.removeProperty(Nr(i)):c[i]=l}a[Se]&&o._tail===r&&o.targets.forEach(c=>{c.getAttribute&&c.getAttribute("style")===Ee&&c.removeAttribute("style")})})}return t};var Dt=class{constructor(e=0){this.deltaTime=0,this._currentTime=e,this._lastTickTime=e,this._startTime=e,this._lastTime=e,this._frameDuration=Ae/eo,this._fps=eo,this._speed=1,this._hasChildren=!1,this._head=null,this._tail=null}get fps(){return this._fps}set fps(e){let o=+e,r=o<C?C:o,i=Ae/r;r>It.frameRate&&(It.frameRate=r),this._fps=r,this._frameDuration=i}get speed(){return this._speed}set speed(e){let o=+e;this._speed=o<C?C:o}requestTick(e){let o=this._frameDuration,r=e-this._lastTickTime,i=o*.25,a=i<4?i:4;return r+a<o?W.NONE:(this._lastTickTime=r>=o?e-r%o:e,W.AUTO)}computeDeltaTime(e){let o=e-this._lastTime;return this.deltaTime=o,this._lastTime=e,o}};var He={animation:null,update:J},ga=t=>{let e=He.animation;return e||(e={duration:C,computeDeltaTime:J,_offset:0,_delay:0,_head:null,_tail:null},He.animation=e,He.update=()=>{t.forEach(o=>{for(let r in o){let i=o[r],a=i._head;if(a){let n=a._valueType,l=n===v.COMPLEX||n===v.COLOR?P(a._fromNumbers):null,s=a._fromNumber,c=i._tail;for(;c&&c!==a;){if(l)for(let m=0,d=c._numbers.length;m<d;m++)l[m]+=c._numbers[m];else s+=c._number;c=c._prevAdd}a._toNumber=s,a._toNumbers=l}}}),no(e,1,1,0,W.FORCE)}),e};var wa=we?requestAnimationFrame:setImmediate,Hn=we?cancelAnimationFrame:clearImmediate,Xr=class extends Dt{constructor(e){super(e),this.useDefaultMainLoop=!0,this.pauseOnDocumentHidden=!0,this.defaults=It,this.paused=!0,this.reqId=0}update(){let e=this._currentTime=Be();if(this.requestTick(e)){this.computeDeltaTime(e);let o=this._speed,r=this._fps,i=this._head;for(;i;){let a=i._next;i.paused?(wt(this,i),this._hasChildren=!!this._tail,i._running=!1,i.completed&&!i._cancelled&&i.cancel()):nt(i,(e-i._startTime)*i._speed*o,0,0,i._fps<r?i.requestTick(e):W.AUTO),i=a}He.update()}}wake(){return this.useDefaultMainLoop&&!this.reqId&&(this.requestTick(Be()),this.reqId=wa(va)),this}pause(){if(this.reqId)return this.paused=!0,Wn()}resume(){if(this.paused)return this.paused=!1,$(this,e=>e.resetTime()),this.wake()}get speed(){return this._speed*(M.timeScale===1?1:Ae)}set speed(e){let o=e*M.timeScale;this._speed!==o&&(this._speed=o,$(this,r=>r.speed=r._speed))}get timeUnit(){return M.timeScale===1?"ms":"s"}set timeUnit(e){let r=e==="s",i=r?.001:1;if(M.timeScale!==i){M.timeScale=i,M.tickThreshold=200*i;let a=r?.001:Ae;this.defaults.duration*=a,this._speed*=a}}get precision(){return M.precision}set precision(e){M.precision=e}},j=(()=>{let t=new Xr(Be());return we&&(Dr.engine=t,ot.addEventListener("visibilitychange",()=>{t.pauseOnDocumentHidden&&(ot.hidden?t.pause():t.resume())})),t})(),va=()=>{j._head?(j.reqId=wa(va),j.update()):j.reqId=0},Wn=()=>(Hn(j.reqId),j.reqId=0,j);var Ho={_rep:new WeakMap,_add:new Map},lo=(t,e,o="_rep")=>{let r=Ho[o],i=r.get(t);return i||(i={},r.set(t,i)),i[e]?i[e]:i[e]={_head:null,_tail:null}},jn=(t,e)=>t._isOverridden||t._absoluteStartTime>e._absoluteStartTime,so=t=>{t._isOverlapped=1,t._isOverridden=1,t._changeDuration=C,t._currentTime=C},Wo=(t,e)=>{let o=t._composition;if(o===I.replace){let r=t._absoluteStartTime;qe(e,t,jn,"_prevRep","_nextRep");let i=t._prevRep;if(i){let a=i.parent,n=i._absoluteEndTime;if(t.parent.id!==a.id&&a.iterationCount>1&&n+(a.duration-a.iterationDuration)>r){so(i);let c=i._prevRep;for(;c&&c.parent.id===a.id;)so(c),c=c._prevRep}let l=t._absoluteUpdateStartTime;if(n>l){let c=i._startTime,m=n-(c+i._updateDuration),d=L(l-m-c,12);i._changeDuration=d,i._currentTime=d,i._isOverlapped=1,d<C&&so(i)}let s=t.parent.parent;if(!s||s!==a.parent){let c=!0;if($(a,m=>{m._isOverlapped||(c=!1)}),c){let m=a.parent;if(m){let d=!0;$(m,f=>{f!==a&&$(f,p=>{p._isOverlapped||(d=!1)})}),d&&m.cancel()}else a.cancel()}}}}else if(o===I.blend){let r=lo(t.target,t.property,"_add"),i=ga(Ho._add),a=r._head;a||(a={...t},a._composition=I.replace,a._updateDuration=C,a._startTime=0,a._numbers=P(t._fromNumbers),a._number=0,a._next=null,a._prev=null,qe(r,a),qe(i,a));let n=t._toNumber;if(t._fromNumber=a._fromNumber-n,t._toNumber=0,t._numbers=P(t._fromNumbers),t._number=0,a._fromNumber=n,t._toNumbers.length){let l=P(t._toNumbers);l.forEach((s,c)=>{t._fromNumbers[c]=a._fromNumbers[c]-s,t._toNumbers[c]=0}),a._fromNumbers=l}qe(r,t,null,"_prevAdd","_nextAdd")}return t},ba=t=>{let e=t._composition;if(e!==I.none){let o=t.target,r=t.property,n=Ho._rep.get(o)[r];if(wt(n,t,"_prevRep","_nextRep"),e===I.blend){let l=Ho._add,s=l.get(o);if(!s)return;let c=s[r],m=He.animation;wt(c,t,"_prevAdd","_nextAdd");let d=c._head;if(d&&d===c._tail){wt(c,d,"_prevAdd","_nextAdd"),wt(m,d);let f=!0;for(let p in s)if(s[p]._head){f=!1;break}f&&l.delete(o)}}}return t};var ya=t=>(t.paused=!0,t.began=!1,t.completed=!1,t),Yr=t=>(t._cancelled&&(t._hasChildren?$(t,Yr):$(t,e=>{e._composition!==I.none&&Wo(e,lo(e.target,e.property))}),t._cancelled=0),t),xa=0,Kn=(t,e)=>t._priority>e._priority,jo=class extends Dt{constructor(e={},o=null,r=0){super(0),++xa;let{id:i,delay:a,duration:n,reversed:l,alternate:s,loop:c,loopDelay:m,autoplay:d,frameRate:f,playbackRate:p,priority:_,onComplete:y,onLoop:B,onPause:mt,onBegin:ee,onBeforeUpdate:be,onUpdate:X}=e;oo.current&&oo.current.register(this);let ye=o?0:j._lastTickTime,k=o?o.defaults:M.defaults,xe=Ue(a)||S(a)?k.delay:+a,Me=Ue(n)||S(n)?1/0:+n,Fe=N(c,k.loop),Re=N(m,k.loopDelay),Je=Fe===!0||Fe===1/0||Fe<0?1/0:Fe+1,Ie=0;o?Ie=r:(j.reqId||j.requestTick(Be()),Ie=(j._lastTickTime-j._startTime)*M.timeScale),this.id=S(i)?xa:i,this.parent=o,this.duration=ao((Me+Re)*Je-Re)||C,this.backwards=!1,this.paused=!0,this.began=!1,this.completed=!1,this.onBegin=ee||k.onBegin,this.onBeforeUpdate=be||k.onBeforeUpdate,this.onUpdate=X||k.onUpdate,this.onLoop=B||k.onLoop,this.onPause=mt||k.onPause,this.onComplete=y||k.onComplete,this.iterationDuration=Me,this.iterationCount=Je,this._autoplay=o?!1:N(d,k.autoplay),this._offset=Ie,this._delay=xe,this._loopDelay=Re,this._iterationTime=0,this._currentIteration=0,this._resolve=J,this._running=!1,this._reversed=+N(l,k.reversed),this._reverse=this._reversed,this._cancelled=0,this._alternate=N(s,k.alternate),this._prev=null,this._next=null,this._lastTickTime=ye,this._startTime=ye,this._lastTime=ye,this._fps=N(f,k.frameRate),this._speed=N(p,k.playbackRate),this._priority=+N(_,1)}get cancelled(){return!!this._cancelled}set cancelled(e){e?this.cancel():this.reset(!0).play()}get currentTime(){return re(L(this._currentTime,M.precision),-this._delay,this.duration)}set currentTime(e){let o=this.paused;this.pause().seek(+e),o||this.resume()}get iterationCurrentTime(){return re(L(this._iterationTime,M.precision),0,this.iterationDuration)}set iterationCurrentTime(e){this.currentTime=this.iterationDuration*this._currentIteration+e}get progress(){return re(L(this._currentTime/this.duration,10),0,1)}set progress(e){this.currentTime=this.duration*e}get iterationProgress(){return re(L(this._iterationTime/this.iterationDuration,10),0,1)}set iterationProgress(e){let o=this.iterationDuration;this.currentTime=o*this._currentIteration+o*e}get currentIteration(){return this._currentIteration}set currentIteration(e){this.currentTime=this.iterationDuration*re(+e,0,this.iterationCount-1)}get reversed(){return!!this._reversed}set reversed(e){e?this.reverse():this.play()}get speed(){return super.speed}set speed(e){super.speed=e,this.resetTime()}reset(e=!1){return Yr(this),this._reversed&&!this._reverse&&(this.reversed=!1),this._iterationTime=this.iterationDuration,nt(this,0,1,~~e,W.FORCE),ya(this),this._hasChildren&&$(this,ya),this}init(e=!1){this.fps=this._fps,this.speed=this._speed,!e&&this._hasChildren&&nt(this,this.duration,1,~~e,W.FORCE),this.reset(e);let o=this._autoplay;return o===!0?this.resume():o&&!S(o.linked)&&o.link(this),this}resetTime(){let e=1/(this._speed*j._speed);return this._startTime=Be()-(this._currentTime+this._delay)*e,this}pause(){return this.paused?this:(this.paused=!0,this.onPause(this),this)}resume(){return this.paused?(this.paused=!1,this.duration<=C&&!this._hasChildren?nt(this,C,0,0,W.FORCE):(this._running||(qe(j,this,Kn),j._hasChildren=!0,this._running=!0),this.resetTime(),this._startTime-=12,j.wake()),this):this}restart(){return this.reset().resume()}seek(e,o=0,r=0){Yr(this),this.completed=!1;let i=this.paused;return this.paused=!0,nt(this,e+this._delay,~~o,~~r,W.AUTO),i?this:this.resume()}alternate(){let e=this._reversed,o=this.iterationCount,r=this.iterationDuration,i=o===1/0?sa(Qt/r):o;return this._reversed=+(this._alternate&&!(i%2)?e:!e),o===1/0?this.iterationProgress=this._reversed?1-this.iterationProgress:this.iterationProgress:this.seek(r*i-this._currentTime),this.resetTime(),this}play(){return this._reversed&&this.alternate(),this.resume()}reverse(){return this._reversed||this.alternate(),this.resume()}cancel(){return this._hasChildren?$(this,e=>e.cancel(),!0):$(this,ba),this._cancelled=1,this.pause()}stretch(e){let o=this.duration,r=gt(e);if(o===r)return this;let i=e/o,a=e<=C;return this.duration=a?C:r,this.iterationDuration=a?C:gt(this.iterationDuration*i),this._offset*=i,this._delay*=i,this._loopDelay*=i,this}revert(){nt(this,0,1,0,W.AUTO);let e=this._autoplay;return e&&e.linked&&e.linked===this&&e.revert(),this.cancel()}complete(e=0){return this.seek(this.duration,e).cancel()}then(e=J){let o=this.then,r=()=>{this.then=null,e(this),this.then=o,this._resolve=J};return new Promise(i=>(this._resolve=()=>i(r()),this.completed&&this._resolve(),this))}};function Ca(t){let e=Oe(t)?oo.root.querySelectorAll(t):t;if(e instanceof NodeList||e instanceof HTMLCollection)return e}function Xn(t){if(at(t))return[];if(!we)return it(t)&&t.flat(1/0)||[t];if(it(t)){let o=t.flat(1/0),r=[];for(let i=0,a=o.length;i<a;i++){let n=o[i];if(!at(n)){let l=Ca(n);if(l)for(let s=0,c=l.length;s<c;s++){let m=l[s];if(!at(m)){let d=!1;for(let f=0,p=r.length;f<p;f++)if(r[f]===m){d=!0;break}d||r.push(m)}}else{let s=!1;for(let c=0,m=r.length;c<m;c++)if(r[c]===n){s=!0;break}s||r.push(n)}}}return r}let e=Ca(t);return e?Array.from(e):[t]}function _a(t){let e=Xn(t),o=e.length;for(let r=0;r<o;r++){let i=e[r];if(!i[Pr]){i[Pr]=!0;let a=Do(i);(i.nodeType||a)&&(i[Se]=!0,i[Io]=a,i[rt]={})}}return e}var Gr={deg:1,rad:180/io,turn:360},Ta={},Zr=(t,e,o,r=!1)=>{let i=e.u,a=e.n;if(e.t===v.UNIT&&i===o)return e;let n=a+i+o,l=Ta[n];if(!S(l)&&!r)e.n=l;else{let s;if(i in Gr)s=a*Gr[i]/Gr[o];else{let m=t.cloneNode(),d=t.parentNode,f=d&&d!==ot?d:ot.body;f.appendChild(m);let p=m.style;p.width=100+i;let _=m.offsetWidth||100;p.width=100+o;let y=m.offsetWidth||100,B=_/y;f.removeChild(m),s=B*a}e.n=s,Ta[n]=s}return e.t,v.UNIT,e.u=o,e};var We=t=>t;var co=(t=1.68)=>e=>ht(e,+t),Qr={in:t=>e=>t(e),out:t=>e=>1-t(1-e),inOut:t=>e=>e<.5?t(e*2)/2:1-t(e*-2+2)/2,outIn:t=>e=>e<.5?(1-t(1-e*2))/2:(t(e*2-1)+1)/2},Yn=io/2,La=io*2,Sa={[Ee]:co,Quad:co(2),Cubic:co(3),Quart:co(4),Quint:co(5),Sine:t=>1-na(t*Yn),Circ:t=>1-ia(1-t*t),Expo:t=>t?ht(2,10*t-10):0,Bounce:t=>{let e,o=4;for(;t<((e=ht(2,--o))-1)/11;);return 1/ht(4,3-o)-7.5625*ht((e*3-2)/22-t,2)},Back:(t=1.7)=>e=>(+t+1)*e*e*e-+t*e*e,Elastic:(t=1,e=.3)=>{let o=re(+t,1,10),r=re(+e,C,2),i=r/La*la(1/o),a=La/r;return n=>n===0||n===1?n:-o*ht(2,-10*(1-n))*aa((1-n-i)*a)}},Jr=(()=>{let t={linear:We,none:We};for(let e in Qr)for(let o in Sa){let r=Sa[o],i=Qr[e];t[e+o]=o===Ee||o==="Back"||o==="Elastic"?(a,n)=>i(r(a,n)):i(r)}return t})(),Ko={linear:We,none:We},Gn=t=>{if(Ko[t])return Ko[t];if(t.indexOf("(")<=-1){let o=Qr[t]||t.includes("Back")||t.includes("Elastic")?Jr[t]():Jr[t];return o?Ko[t]=o:We}else{let e=t.slice(0,-1).split("("),o=Jr[e[0]];return o?Ko[t]=o(...e[1].split(",")):We}},Aa=["steps(","irregular(","linear(","cubicBezier("],ei=t=>{if(Oe(t)){for(let o=0,r=Aa.length;o<r;o++)if(_e(t,Aa[o]))return console.warn(`String syntax for \`ease: "${t}"\` has been removed from the core and replaced by importing and passing the easing function directly: \`ease: ${t}\``),We}return Ue(t)?t:Oe(t)?Gn(t):We};var w=Uo(),b=Uo(),Nt={},Xo={func:null},Yo={func:null},Go=[null],Bt=[null,null],Zo={to:null},Zn=0,Ea=0,st,$e,Jn=(t,e)=>{let o={};if(it(t)){let r=[].concat(...t.map(i=>Object.keys(i))).filter(ro);for(let i=0,a=r.length;i<a;i++){let n=r[i],l=t.map(s=>{let c={};for(let m in s){let d=s[m];ro(m)?m===n&&(c.to=d):c[m]=d}return c});o[n]=l}}else{let r=N(e.duration,M.defaults.duration);Object.keys(t).map(a=>({o:parseFloat(a)/100,p:t[a]})).sort((a,n)=>a.o-n.o).forEach(a=>{let n=a.o,l=a.p;for(let s in l)if(ro(s)){let c=o[s];c||(c=o[s]=[]);let m=n*r,d=c.length,f=c[d-1],p={to:l[s]},_=0;for(let y=0;y<d;y++)_+=c[y].duration;d===1&&(p.from=f.to),l.ease&&(p.ease=l.ease),p.duration=m-(d?_:0),c.push(p)}return a});for(let a in o){let n=o[a],l;for(let s=0,c=n.length;s<c;s++){let m=n[s],d=m.ease;m.ease=l||void 0,l=d}n[0].duration||n.shift()}}return o},Jo=class extends jo{constructor(e,o,r,i,a=!1,n=0,l){super(o,r,i),this._head,this._tail,++Ea;let s=_a(e),c=s.length,m=o.keyframes,d=m?ca(Jn(m,o),o):o,{id:f,delay:p,duration:_,ease:y,playbackEase:B,modifier:mt,composition:ee,onRender:be}=d,X=r?r.defaults:M.defaults,ye=N(y,X.ease),k=N(B,X.playbackEase),xe=k?ei(k):null,Me=!S(ye.ease),Fe=Me?ye.ease:N(y,xe?"linear":X.ease),Re=Me?ye.settlingDuration:N(_,X.duration),Je=N(p,X.delay),Ie=mt||X.modifier,St=S(ee)&&c>=Ae?I.none:S(ee)?X.composition:ee,At=this._offset+(r?r._offset:0);Me&&(ye.parent=this);let R=NaN,U=NaN,Qe=0,Y=0;for(let g=0;g<c;g++){let A=s[g],te=n||g,ue=l||s,dt=NaN,Et=NaN;for(let fe in d)if(ro(fe)){let G=Wr(A,fe),et=Bo(A,fe),pe=ha(fe,A,G),E=d[fe],oe=it(E);if(a&&!oe&&(Bt[0]=E,Bt[1]=E,E=Bt),oe){let q=E.length,se=!Vo(E[0]);q===2&&se?(Zo.to=E,Go[0]=Zo,st=Go):q>2&&se?(st=[],E.forEach((he,le)=>{le?le===1?(Bt[1]=he,st.push(Bt)):st.push(he):Bt[0]=he})):st=E}else Go[0]=E,st=Go;let Pe=null,ne=null,Te=NaN,Ve=0,ut=0;for(let q=st.length;ut<q;ut++){let se=st[ut];Vo(se)?$e=se:(Zo.to=se,$e=Zo),Xo.func=null,Yo.func=null;let he=ze(N($e.composition,St),A,te,ue,null,null),le=ta(he)?he:I[he];!Pe&&le!==I.none&&(Pe=lo(A,pe));let zt=Pe?Pe._tail:null,Ce=r&&zt&&zt.parent.parent===r?zt:ne,De=ze($e.to,A,te,ue,Xo,Ce),D;Vo(De)&&!S(De.to)?($e=De,D=De.to):D=De;let Ne=ze($e.from,A,te,ue,Yo,Ce),H=$e.ease||Fe,tt=ze(H,A,te,ue,null,Ce),Le=Ue(tt)||Oe(tt)?tt:H,$t=!S(Le)&&!S(Le.ease),Lo=$t?Le.ease:Le,So=$t?Le.settlingDuration:ze(N($e.duration,q>1?ze(Re,A,te,ue,null,Ce)/q:Re),A,te,ue,null,Ce),kt=ze(N($e.delay,ut?0:Je),A,te,ue,null,Ce),Mt=$e.modifier||Ie,ft=!S(Ne),jt=!S(D),Kt=it(D),Rn=Kt||ft&&jt,In=ne?Ve:0,xr=ne?Ve+kt:kt,Cr=L(At+xr,12),Pn=L(At+In,12);!Y&&(ft||Kt)&&(Y=1);let ge=ne;if(le!==I.none){let T=Pe._head;for(;T&&T._absoluteStartTime<=Cr;)if(T._isOverridden||(ge=T),T=T._nextRep,T&&T._absoluteStartTime>=Cr)for(;T;)so(T),T=T._nextRep}if(Rn){ie(Kt?ze(D[0],A,te,ue,Yo,Ce):Ne,w),ie(Kt?ze(D[1],A,te,ue,Xo,Ce):D,b);let T=Vt(A,pe,G,Nt);w.t===v.NUMBER&&(ge?ge._valueType===v.UNIT&&(w.t=v.UNIT,w.u=ge._unit):(ie(T,me),me.t===v.UNIT&&(w.t=v.UNIT,w.u=me.u)))}else jt?ie(D,b):ne?jr(ne,b):ie(r&&ge&&ge.parent.parent===r?ge._value:Vt(A,pe,G,Nt),b),ft?ie(Ne,w):ne?jr(ne,w):ie(r&&ge&&ge.parent.parent===r?ge._value:Vt(A,pe,G,Nt),w);if(w.o&&(w.n=Oo(ge?ge._toNumber:ie(Vt(A,pe,G,Nt),me).n,w.n,w.o)),b.o&&(b.n=Oo(w.n,b.n,b.o)),w.t!==b.t){if(w.t===v.COMPLEX||b.t===v.COMPLEX){let T=w.t===v.COMPLEX?w:b,Z=w.t===v.COMPLEX?b:w;Z.t=v.COMPLEX,Z.s=P(T.s),Z.d=T.d.map(()=>Z.n)}else if(w.t===v.UNIT||b.t===v.UNIT){let T=w.t===v.UNIT?w:b,Z=w.t===v.UNIT?b:w;Z.t=v.UNIT,Z.u=T.u}else if(w.t===v.COLOR||b.t===v.COLOR){let T=w.t===v.COLOR?w:b,Z=w.t===v.COLOR?b:w;Z.t=v.COLOR,Z.d=T.d.map(()=>0)}}if(w.u!==b.u){let T=b.u?w:b;T=Zr(A,T,b.u?b.u:w.u,!1)}if(b.d&&w.d&&b.d.length!==w.d.length){let T=w.d.length>b.d.length?w:b,Z=T===w?b:w;Z.d=T.d.map((Ms,Si)=>S(Z.d[Si])?0:Z.d[Si]),Z.s=P(T.s)}let _r=L(+So||C,12),_i=Nt[pe];at(_i)||(Nt[pe]=null);let Vn=et?et.set:null;Ve=L(xr+_r,12);let Ao=w.d,Ti=b.d,Li=b.s,ce={parent:this,id:Zn++,property:pe,target:A,_value:null,_toFunc:Xo.func,_fromFunc:Yo.func,_ease:ei(Lo),_fromNumbers:Ao?P(Ao):to,_toNumbers:Ti?P(Ti):to,_strings:Li?P(Li):to,_fromNumber:w.n,_toNumber:b.n,_numbers:Ao?P(Ao):to,_number:w.n,_unit:b.u,_modifier:Mt,_currentTime:0,_startTime:xr,_delay:+kt,_updateDuration:_r,_changeDuration:_r,_absoluteStartTime:Cr,_absoluteUpdateStartTime:Pn,_absoluteEndTime:L(At+Ve,12),_hasFromValue:ft||Kt?1:0,_tweenType:G,_setter:Vn,_valueType:b.t,_composition:le,_isOverlapped:0,_isOverridden:0,_renderTransforms:0,_inlineValue:_i,_prevRep:null,_nextRep:null,_prevAdd:null,_nextAdd:null,_prev:null,_next:null};le!==I.none&&Wo(ce,Pe);let Tr=ce._valueType;if(Tr===v.COMPLEX)ce._value=qo(ce,1,-1);else if(Tr===v.UNIT)ce._value=`${Mt(ce._toNumber)}${ce._unit}`;else if(Tr===v.COLOR){let T=b.d;ce._value=`rgba(${L(T[0],0)},${L(T[1],0)},${L(T[2],0)},${T[3]})`}else ce._value=Mt(ce._toNumber);isNaN(Te)&&(Te=ce._startTime),ne=ce,Qe++,qe(this,ce)}(isNaN(U)||Te<U)&&(U=Te),(isNaN(R)||Ve>R)&&(R=Ve),G===z.TRANSFORM&&(dt=Qe-ut,Et=Qe)}if(!isNaN(dt)){let fe=0;$(this,G=>{fe>=dt&&fe<Et&&(G._renderTransforms=1,G._composition===I.blend&&$(He.animation,et=>{et.id===G.id&&(et._renderTransforms=1)})),fe++})}}c||console.warn("No target found. Make sure the element you're trying to animate is accessible before creating your animation."),U?($(this,g=>{g._startTime-g._delay||(g._delay-=U),g._startTime-=U}),R-=U):U=0,R||(R=C,this.iterationCount=0),this.targets=s,this.id=S(f)?Ea:f,this.duration=R===C?C:ao((R+this._loopDelay)*this.iterationCount-this._loopDelay)||C,this.onRender=be||X.onRender,this._ease=xe,this._delay=U,this.iterationDuration=R,!this._autoplay&&Y&&this.onRender(this)}stretch(e){let o=this.duration;if(o===gt(e))return this;let r=e/o;return $(this,i=>{i._updateDuration=gt(i._updateDuration*r),i._changeDuration=gt(i._changeDuration*r),i._currentTime*=r,i._delay*=r,i._startTime*=r,i._absoluteStartTime*=r,i._absoluteUpdateStartTime*=r,i._absoluteEndTime*=r}),super.stretch(e)}refresh(){return $(this,e=>{let o=e._toFunc,r=e._fromFunc;(o||r)&&(r?(ie(r(),w),w.u!==e._unit&&e.target[Se]&&Zr(e.target,w,e._unit,!0),e._fromNumbers=P(w.d),e._fromNumber=w.n):o&&(ie(Vt(e.target,e.property,e._tweenType),me),e._fromNumbers=P(me.d),e._fromNumber=me.n),o&&(ie(o(),b),e._toNumbers=P(b.d),e._strings=P(b.s),e._toNumber=b.o?Oo(e._fromNumber,b.n,b.o):b.n))}),this.duration===C&&this.restart(),this}revert(){return super.revert(),Kr(this)}then(e){return super.then(e)}},ti=(t,e)=>M.editor?M.editor.addAnimation(t,e):new Jo(t,e,null,0,!1).init();var Qo=()=>({checkValidity(t){let e=t.input,o={message:"",isValid:!0,invalidKeys:[]};if(!e)return o;let r=!0;if("checkValidity"in e&&(r=e.checkValidity()),r)return o;if(o.isValid=!1,"validationMessage"in e&&(o.message=e.validationMessage),!("validity"in e))return o.invalidKeys.push("customError"),o;for(let i in e.validity){if(i==="valid")continue;let a=i;e.validity[a]&&o.invalidKeys.push(a)}return o}});var er=class extends Event{constructor(){super("wa-invalid",{bubbles:!0,cancelable:!1,composed:!0})}};var Qn=Object.defineProperty,es=Object.getOwnPropertyDescriptor,za=t=>{throw TypeError(t)},u=(t,e,o,r)=>{for(var i=r>1?void 0:r?es(e,o):e,a=t.length-1,n;a>=0;a--)(n=t[a])&&(i=(r?n(e,o,i):n(i))||i);return r&&i&&Qn(e,o,i),i},$a=(t,e,o)=>e.has(t)||za("Cannot "+o),ka=(t,e,o)=>($a(t,e,"read from private field"),o?o.call(t):e.get(t)),Ma=(t,e,o)=>e.has(t)?za("Cannot add the same private member more than once"):e instanceof WeakSet?e.add(t):e.set(t,o),Fa=(t,e,o,r)=>($a(t,e,"write to private field"),r?r.call(t,o):e.set(t,o),o);var tr=globalThis,or=tr.ShadowRoot&&(tr.ShadyCSS===void 0||tr.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,oi=Symbol(),Ra=new WeakMap,mo=class{constructor(e,o,r){if(this._$cssResult$=!0,r!==oi)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=o}get styleSheet(){let e=this.o,o=this.t;if(or&&e===void 0){let r=o!==void 0&&o.length===1;r&&(e=Ra.get(o)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),r&&Ra.set(o,e))}return e}toString(){return this.cssText}},Ia=t=>new mo(typeof t=="string"?t:t+"",void 0,oi),K=(t,...e)=>{let o=t.length===1?t[0]:e.reduce((r,i,a)=>r+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[a+1],t[0]);return new mo(o,t,oi)},Pa=(t,e)=>{if(or)t.adoptedStyleSheets=e.map(o=>o instanceof CSSStyleSheet?o:o.styleSheet);else for(let o of e){let r=document.createElement("style"),i=tr.litNonce;i!==void 0&&r.setAttribute("nonce",i),r.textContent=o.cssText,t.appendChild(r)}},ri=or?t=>t:t=>t instanceof CSSStyleSheet?(e=>{let o="";for(let r of e.cssRules)o+=r.cssText;return Ia(o)})(t):t;var{is:ts,defineProperty:os,getOwnPropertyDescriptor:rs,getOwnPropertyNames:is,getOwnPropertySymbols:as,getPrototypeOf:ns}=Object,rr=globalThis,Va=rr.trustedTypes,ss=Va?Va.emptyScript:"",ls=rr.reactiveElementPolyfillSupport,uo=(t,e)=>t,fo={toAttribute(t,e){switch(e){case Boolean:t=t?ss:null;break;case Object:case Array:t=t==null?t:JSON.stringify(t)}return t},fromAttribute(t,e){let o=t;switch(e){case Boolean:o=t!==null;break;case Number:o=t===null?null:Number(t);break;case Object:case Array:try{o=JSON.parse(t)}catch{o=null}}return o}},ir=(t,e)=>!ts(t,e),Da={attribute:!0,type:String,converter:fo,reflect:!1,useDefault:!1,hasChanged:ir};Symbol.metadata??=Symbol("metadata"),rr.litPropertyMetadata??=new WeakMap;var je=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,o=Da){if(o.state&&(o.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((o=Object.create(o)).wrapped=!0),this.elementProperties.set(e,o),!o.noAccessor){let r=Symbol(),i=this.getPropertyDescriptor(e,r,o);i!==void 0&&os(this.prototype,e,i)}}static getPropertyDescriptor(e,o,r){let{get:i,set:a}=rs(this.prototype,e)??{get(){return this[o]},set(n){this[o]=n}};return{get:i,set(n){let l=i?.call(this);a?.call(this,n),this.requestUpdate(e,l,r)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??Da}static _$Ei(){if(this.hasOwnProperty(uo("elementProperties")))return;let e=ns(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(uo("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(uo("properties"))){let o=this.properties,r=[...is(o),...as(o)];for(let i of r)this.createProperty(i,o[i])}let e=this[Symbol.metadata];if(e!==null){let o=litPropertyMetadata.get(e);if(o!==void 0)for(let[r,i]of o)this.elementProperties.set(r,i)}this._$Eh=new Map;for(let[o,r]of this.elementProperties){let i=this._$Eu(o,r);i!==void 0&&this._$Eh.set(i,o)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let o=[];if(Array.isArray(e)){let r=new Set(e.flat(1/0).reverse());for(let i of r)o.unshift(ri(i))}else e!==void 0&&o.push(ri(e));return o}static _$Eu(e,o){let r=o.attribute;return r===!1?void 0:typeof r=="string"?r:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,o=this.constructor.elementProperties;for(let r of o.keys())this.hasOwnProperty(r)&&(e.set(r,this[r]),delete this[r]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Pa(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,o,r){this._$AK(e,r)}_$ET(e,o){let r=this.constructor.elementProperties.get(e),i=this.constructor._$Eu(e,r);if(i!==void 0&&r.reflect===!0){let a=(r.converter?.toAttribute!==void 0?r.converter:fo).toAttribute(o,r.type);this._$Em=e,a==null?this.removeAttribute(i):this.setAttribute(i,a),this._$Em=null}}_$AK(e,o){let r=this.constructor,i=r._$Eh.get(e);if(i!==void 0&&this._$Em!==i){let a=r.getPropertyOptions(i),n=typeof a.converter=="function"?{fromAttribute:a.converter}:a.converter?.fromAttribute!==void 0?a.converter:fo;this._$Em=i;let l=n.fromAttribute(o,a.type);this[i]=l??this._$Ej?.get(i)??l,this._$Em=null}}requestUpdate(e,o,r,i=!1,a){if(e!==void 0){let n=this.constructor;if(i===!1&&(a=this[e]),r??=n.getPropertyOptions(e),!((r.hasChanged??ir)(a,o)||r.useDefault&&r.reflect&&a===this._$Ej?.get(e)&&!this.hasAttribute(n._$Eu(e,r))))return;this.C(e,o,r)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,o,{useDefault:r,reflect:i,wrapped:a},n){r&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,n??o??this[e]),a!==!0||n!==void 0)||(this._$AL.has(e)||(this.hasUpdated||r||(o=void 0),this._$AL.set(e,o)),i===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(o){Promise.reject(o)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[i,a]of this._$Ep)this[i]=a;this._$Ep=void 0}let r=this.constructor.elementProperties;if(r.size>0)for(let[i,a]of r){let{wrapped:n}=a,l=this[i];n!==!0||this._$AL.has(i)||l===void 0||this.C(i,void 0,a,l)}}let e=!1,o=this._$AL;try{e=this.shouldUpdate(o),e?(this.willUpdate(o),this._$EO?.forEach(r=>r.hostUpdate?.()),this.update(o)):this._$EM()}catch(r){throw e=!1,this._$EM(),r}e&&this._$AE(o)}willUpdate(e){}_$AE(e){this._$EO?.forEach(o=>o.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(o=>this._$ET(o,this[o])),this._$EM()}updated(e){}firstUpdated(e){}};je.elementStyles=[],je.shadowRootOptions={mode:"open"},je[uo("elementProperties")]=new Map,je[uo("finalized")]=new Map,ls?.({ReactiveElement:je}),(rr.reactiveElementVersions??=[]).push("2.1.2");var ai=globalThis,Na=t=>t,ar=ai.trustedTypes,Ba=ar?ar.createPolicy("lit-html",{createHTML:t=>t}):void 0,ni="$lit$",Ke=`lit$${Math.random().toFixed(9).slice(2)}$`,si="?"+Ke,cs=`<${si}>`,yt=document,ho=()=>yt.createComment(""),go=t=>t===null||typeof t!="object"&&typeof t!="function",li=Array.isArray,ja=t=>li(t)||typeof t?.[Symbol.iterator]=="function",ii=`[ 	
\f\r]`,po=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Oa=/-->/g,Ua=/>/g,vt=RegExp(`>|${ii}(?:([^\\s"'>=/]+)(${ii}*=${ii}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),qa=/'/g,Ha=/"/g,Ka=/^(?:script|style|textarea|title)$/i,ci=t=>(e,...o)=>({_$litType$:t,strings:e,values:o}),Xe=ci(1),Xa=ci(2),Ya=ci(3),ae=Symbol.for("lit-noChange"),F=Symbol.for("lit-nothing"),Wa=new WeakMap,bt=yt.createTreeWalker(yt,129);function Ga(t,e){if(!li(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return Ba!==void 0?Ba.createHTML(e):e}var Za=(t,e)=>{let o=t.length-1,r=[],i,a=e===2?"<svg>":e===3?"<math>":"",n=po;for(let l=0;l<o;l++){let s=t[l],c,m,d=-1,f=0;for(;f<s.length&&(n.lastIndex=f,m=n.exec(s),m!==null);)f=n.lastIndex,n===po?m[1]==="!--"?n=Oa:m[1]!==void 0?n=Ua:m[2]!==void 0?(Ka.test(m[2])&&(i=RegExp("</"+m[2],"g")),n=vt):m[3]!==void 0&&(n=vt):n===vt?m[0]===">"?(n=i??po,d=-1):m[1]===void 0?d=-2:(d=n.lastIndex-m[2].length,c=m[1],n=m[3]===void 0?vt:m[3]==='"'?Ha:qa):n===Ha||n===qa?n=vt:n===Oa||n===Ua?n=po:(n=vt,i=void 0);let p=n===vt&&t[l+1].startsWith("/>")?" ":"";a+=n===po?s+cs:d>=0?(r.push(c),s.slice(0,d)+ni+s.slice(d)+Ke+p):s+Ke+(d===-2?l:p)}return[Ga(t,a+(t[o]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),r]},wo=class t{constructor({strings:e,_$litType$:o},r){let i;this.parts=[];let a=0,n=0,l=e.length-1,s=this.parts,[c,m]=Za(e,o);if(this.el=t.createElement(c,r),bt.currentNode=this.el.content,o===2||o===3){let d=this.el.content.firstChild;d.replaceWith(...d.childNodes)}for(;(i=bt.nextNode())!==null&&s.length<l;){if(i.nodeType===1){if(i.hasAttributes())for(let d of i.getAttributeNames())if(d.endsWith(ni)){let f=m[n++],p=i.getAttribute(d).split(Ke),_=/([.?@])?(.*)/.exec(f);s.push({type:1,index:a,name:_[2],strings:p,ctor:_[1]==="."?sr:_[1]==="?"?lr:_[1]==="@"?cr:Ct}),i.removeAttribute(d)}else d.startsWith(Ke)&&(s.push({type:6,index:a}),i.removeAttribute(d));if(Ka.test(i.tagName)){let d=i.textContent.split(Ke),f=d.length-1;if(f>0){i.textContent=ar?ar.emptyScript:"";for(let p=0;p<f;p++)i.append(d[p],ho()),bt.nextNode(),s.push({type:2,index:++a});i.append(d[f],ho())}}}else if(i.nodeType===8)if(i.data===si)s.push({type:2,index:a});else{let d=-1;for(;(d=i.data.indexOf(Ke,d+1))!==-1;)s.push({type:7,index:a}),d+=Ke.length-1}a++}}static createElement(e,o){let r=yt.createElement("template");return r.innerHTML=e,r}};function xt(t,e,o=t,r){if(e===ae)return e;let i=r!==void 0?o._$Co?.[r]:o._$Cl,a=go(e)?void 0:e._$litDirective$;return i?.constructor!==a&&(i?._$AO?.(!1),a===void 0?i=void 0:(i=new a(t),i._$AT(t,o,r)),r!==void 0?(o._$Co??=[])[r]=i:o._$Cl=i),i!==void 0&&(e=xt(t,i._$AS(t,e.values),i,r)),e}var nr=class{constructor(e,o){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=o}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:o},parts:r}=this._$AD,i=(e?.creationScope??yt).importNode(o,!0);bt.currentNode=i;let a=bt.nextNode(),n=0,l=0,s=r[0];for(;s!==void 0;){if(n===s.index){let c;s.type===2?c=new Ot(a,a.nextSibling,this,e):s.type===1?c=new s.ctor(a,s.name,s.strings,this,e):s.type===6&&(c=new mr(a,this,e)),this._$AV.push(c),s=r[++l]}n!==s?.index&&(a=bt.nextNode(),n++)}return bt.currentNode=yt,i}p(e){let o=0;for(let r of this._$AV)r!==void 0&&(r.strings!==void 0?(r._$AI(e,r,o),o+=r.strings.length-2):r._$AI(e[o])),o++}},Ot=class t{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,o,r,i){this.type=2,this._$AH=F,this._$AN=void 0,this._$AA=e,this._$AB=o,this._$AM=r,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,o=this._$AM;return o!==void 0&&e?.nodeType===11&&(e=o.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,o=this){e=xt(this,e,o),go(e)?e===F||e==null||e===""?(this._$AH!==F&&this._$AR(),this._$AH=F):e!==this._$AH&&e!==ae&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):ja(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==F&&go(this._$AH)?this._$AA.nextSibling.data=e:this.T(yt.createTextNode(e)),this._$AH=e}$(e){let{values:o,_$litType$:r}=e,i=typeof r=="number"?this._$AC(e):(r.el===void 0&&(r.el=wo.createElement(Ga(r.h,r.h[0]),this.options)),r);if(this._$AH?._$AD===i)this._$AH.p(o);else{let a=new nr(i,this),n=a.u(this.options);a.p(o),this.T(n),this._$AH=a}}_$AC(e){let o=Wa.get(e.strings);return o===void 0&&Wa.set(e.strings,o=new wo(e)),o}k(e){li(this._$AH)||(this._$AH=[],this._$AR());let o=this._$AH,r,i=0;for(let a of e)i===o.length?o.push(r=new t(this.O(ho()),this.O(ho()),this,this.options)):r=o[i],r._$AI(a),i++;i<o.length&&(this._$AR(r&&r._$AB.nextSibling,i),o.length=i)}_$AR(e=this._$AA.nextSibling,o){for(this._$AP?.(!1,!0,o);e!==this._$AB;){let r=Na(e).nextSibling;Na(e).remove(),e=r}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},Ct=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,o,r,i,a){this.type=1,this._$AH=F,this._$AN=void 0,this.element=e,this.name=o,this._$AM=i,this.options=a,r.length>2||r[0]!==""||r[1]!==""?(this._$AH=Array(r.length-1).fill(new String),this.strings=r):this._$AH=F}_$AI(e,o=this,r,i){let a=this.strings,n=!1;if(a===void 0)e=xt(this,e,o,0),n=!go(e)||e!==this._$AH&&e!==ae,n&&(this._$AH=e);else{let l=e,s,c;for(e=a[0],s=0;s<a.length-1;s++)c=xt(this,l[r+s],o,s),c===ae&&(c=this._$AH[s]),n||=!go(c)||c!==this._$AH[s],c===F?e=F:e!==F&&(e+=(c??"")+a[s+1]),this._$AH[s]=c}n&&!i&&this.j(e)}j(e){e===F?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},sr=class extends Ct{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===F?void 0:e}},lr=class extends Ct{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==F)}},cr=class extends Ct{constructor(e,o,r,i,a){super(e,o,r,i,a),this.type=5}_$AI(e,o=this){if((e=xt(this,e,o,0)??F)===ae)return;let r=this._$AH,i=e===F&&r!==F||e.capture!==r.capture||e.once!==r.once||e.passive!==r.passive,a=e!==F&&(r===F||i);i&&this.element.removeEventListener(this.name,this,r),a&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},mr=class{constructor(e,o,r){this.element=e,this.type=6,this._$AN=void 0,this._$AM=o,this.options=r}get _$AU(){return this._$AM._$AU}_$AI(e){xt(this,e)}},Ja={M:ni,P:Ke,A:si,C:1,L:Za,R:nr,D:ja,V:xt,I:Ot,H:Ct,N:lr,U:cr,B:sr,F:mr},ms=ai.litHtmlPolyfillSupport;ms?.(wo,Ot),(ai.litHtmlVersions??=[]).push("3.3.3");var Qa=(t,e,o)=>{let r=o?.renderBefore??e,i=r._$litPart$;if(i===void 0){let a=o?.renderBefore??null;r._$litPart$=i=new Ot(e.insertBefore(ho(),a),a,void 0,o??{})}return i._$AI(t),i};var mi=globalThis,lt=class extends je{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let o=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Qa(o,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return ae}};lt._$litElement$=!0,lt.finalized=!0,mi.litElementHydrateSupport?.({LitElement:lt});var ds=mi.litElementPolyfillSupport;ds?.({LitElement:lt});(mi.litElementVersions??=[]).push("4.2.2");var ct=t=>(e,o)=>{o!==void 0?o.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)};var us={attribute:!0,type:String,converter:fo,reflect:!1,hasChanged:ir},fs=(t=us,e,o)=>{let{kind:r,metadata:i}=o,a=globalThis.litPropertyMetadata.get(i);if(a===void 0&&globalThis.litPropertyMetadata.set(i,a=new Map),r==="setter"&&((t=Object.create(t)).wrapped=!0),a.set(o.name,t),r==="accessor"){let{name:n}=o;return{set(l){let s=e.get.call(this);e.set.call(this,l),this.requestUpdate(n,s,t,!0,l)},init(l){return l!==void 0&&this.C(n,void 0,t,l),l}}}if(r==="setter"){let{name:n}=o;return function(l){let s=this[n];e.call(this,l),this.requestUpdate(n,s,t,!0,l)}}throw Error("Unsupported decorator location: "+r)};function h(t){return(e,o)=>typeof o=="object"?fs(t,e,o):((r,i,a)=>{let n=i.hasOwnProperty(a);return i.constructor.createProperty(a,r),n?Object.getOwnPropertyDescriptor(i,a):void 0})(t,e,o)}function vo(t){return h({...t,state:!0,attribute:!1})}var _t=(t,e,o)=>(o.configurable=!0,o.enumerable=!0,Reflect.decorate&&typeof e!="object"&&Object.defineProperty(t,e,o),o);function bo(t,e){return(o,r,i)=>{let a=n=>n.renderRoot?.querySelector(t)??null;if(e){let{get:n,set:l}=typeof r=="object"?o:i??(()=>{let s=Symbol();return{get(){return this[s]},set(c){this[s]=c}}})();return _t(o,r,{get(){let s=n.call(this);return s===void 0&&(s=a(this),(s!==null||this.hasUpdated)&&l.call(this,s)),s}})}return _t(o,r,{get(){return a(this)}})}}var ps=K`
  :host {
    box-sizing: border-box;
  }

  :host *,
  :host *::before,
  :host *::after {
    box-sizing: inherit;
  }

  [hidden],
  :host([hidden]) {
    display: none !important;
  }
`,hs=/;\s+$/;function gs(t){return t.replace(/[A-Z]/g,e=>`-${e.toLowerCase()}`)}function en(t){let{property:e,value:o,element:r}=t;if(o){let i=r.getAttribute("style")||"";i&&(i.match(hs)||(i+=";"),i+=" ");let a=`${e}: ${o}`;return i.includes(a)?void 0:`${i}${a};`}return null}var dr,Ye=class extends lt{constructor(){super(),Ma(this,dr,!1),this.initialReflectedProperties=new Map,this.didSSR=!!this.shadowRoot,this.customStates={set:(e,o)=>{if(this.internals?.states)try{o?this.internals.states.add(e):this.internals.states.delete(e)}catch(r){if(String(r).includes("must start with '--'"))console.error("Your browser implements an outdated version of CustomStateSet. Consider using a polyfill");else throw r}},has:e=>{if(!this.internals?.states)return!1;try{return this.internals.states.has(e)}catch{return!1}}};try{this.internals=this.attachInternals()}catch{console.error("Element internals are not supported in your browser. Consider using a polyfill")}this.customStates.set("wa-defined",!0);let t=this.constructor;for(let[e,o]of t.elementProperties)o.default==="inherit"&&o.initial!==void 0&&typeof e=="string"&&this.customStates.set(`initial-${e}-${o.initial}`,!0)}static get styles(){let t=Array.isArray(this.css)?this.css:this.css?[this.css]:[];return[ps,...t]}connectedCallback(){super.connectedCallback(),this.didSSR||this.shadowRoot?.prepend(document.createComment(` Web Awesome: https://webawesome.com/docs/components/${this.localName.replace("wa-","")} `)),this.didSSR&&this.updateComplete.then(()=>{this.shadowRoot?.prepend(document.createComment(` Web Awesome: https://webawesome.com/docs/components/${this.localName.replace("wa-","")} `))})}attributeChangedCallback(t,e,o){ka(this,dr)||(this.constructor.elementProperties.forEach((r,i)=>{r.reflect&&this[i]!=null&&this.initialReflectedProperties.set(i,this[i])}),Fa(this,dr,!0)),super.attributeChangedCallback(t,e,o)}willUpdate(t){super.willUpdate(t),this.initialReflectedProperties.forEach((e,o)=>{t.has(o)&&this[o]==null&&(this[o]=e)})}firstUpdated(t){super.firstUpdated(t),this.didSSR&&this.shadowRoot?.querySelectorAll("slot").forEach(e=>{e.dispatchEvent(new Event("slotchange",{bubbles:!0,composed:!1,cancelable:!1}))})}update(t){try{super.update(t)}catch(e){if(this.didSSR&&!this.hasUpdated){let o=new Event("lit-hydration-error",{bubbles:!0,composed:!0,cancelable:!1});o.error=e,this.dispatchEvent(o)}throw e}}setStyle(t,e){if(!this.style){let o=en({property:gs(t),value:e,element:this});o&&this.setAttribute("style",o);return}this.style[t]=e}setStyleProperty(t,e){if(!this.style){let o=en({property:t,value:e,element:this});o&&this.setAttribute("style",o);return}this.style.setProperty(t,e)}relayNativeEvent(t,e){t.stopImmediatePropagation(),this.dispatchEvent(new t.constructor(t.type,{...t,...e}))}};dr=new WeakMap;u([h()],Ye.prototype,"dir",2);u([h()],Ye.prototype,"lang",2);u([h({type:Boolean,reflect:!0,attribute:"did-ssr"})],Ye.prototype,"didSSR",2);var ws=()=>({observedAttributes:["custom-error"],checkValidity(t){let e={message:"",isValid:!0,invalidKeys:[]};return t.customError&&(e.message=t.customError,e.isValid=!1,e.invalidKeys=["customError"]),e}}),de=class extends Ye{constructor(){super(),this.name=null,this.disabled=!1,this.required=!1,this.assumeInteractionOn=["input"],this.validators=[],this.valueHasChanged=!1,this.hasInteracted=!1,this.customError=null,this.emittedEvents=[],this.emitInvalid=t=>{t.target===this&&(this.hasInteracted=!0,this.dispatchEvent(new er))},this.handleInteraction=t=>{let e=this.emittedEvents;e.includes(t.type)||e.push(t.type),e.length===this.assumeInteractionOn?.length&&(this.hasInteracted=!0)},"addEventListener"in this&&this.addEventListener("invalid",this.emitInvalid)}static get validators(){return[ws()]}static get observedAttributes(){let t=new Set(super.observedAttributes||[]);for(let e of this.validators)if(e.observedAttributes)for(let o of e.observedAttributes)t.add(o);return[...t]}connectedCallback(){super.connectedCallback(),this.didSSR&&!this.hasUpdated?this.updateComplete.then(()=>{this.updateValidity()}):this.updateValidity(),this.assumeInteractionOn.forEach(t=>{this.addEventListener?.(t,this.handleInteraction)})}firstUpdated(...t){super.firstUpdated(...t),this.updateValidity()}willUpdate(t){if(!!1&&t.has("customError")&&(this.customError||(this.customError=null),this.setCustomValidity(this.customError||"")),t.has("value")||t.has("disabled")||t.has("defaultValue")){let e=this.value;this.updateFormValue(e)}t.has("disabled")&&(this.customStates.set("disabled",this.disabled),(this.hasAttribute("disabled")||!!1&&!this.matches(":disabled"))&&this.toggleAttribute("disabled",this.disabled)),super.willUpdate(t),this.didSSR&&!this.hasUpdated?this.updateComplete.then(()=>this.updateValidity()):this.updateValidity()}updateFormValue(t){if(Array.isArray(t)){if(this.name){let e=new FormData;for(let o of t)e.append(this.name,o);this.setValue(e,e)}}else this.setValue(t,t)}get labels(){return this.internals.labels}getForm(){return this.internals.form}set form(t){t?this.setAttribute("form",t):this.removeAttribute("form")}get form(){return this.internals.form}get validity(){return this.internals.validity}get willValidate(){return this.internals.willValidate}get validationMessage(){return this.internals.validationMessage}checkValidity(){return this.updateValidity(),this.internals.checkValidity()}reportValidity(){return this.updateValidity(),this.hasInteracted=!0,this.internals.reportValidity()}get validationTarget(){return this.input||void 0}setValidity(...t){let e=t[0],o=t[1],r=t[2];r||(r=this.validationTarget),this.internals.setValidity(e,o,r||void 0),this.requestUpdate("validity"),this.setCustomStates()}setCustomStates(){let t=!!this.required,e=this.internals.validity.valid,o=this.hasInteracted;this.customStates.set("required",t),this.customStates.set("optional",!t),this.customStates.set("invalid",!e),this.customStates.set("valid",e),this.customStates.set("user-invalid",!e&&o),this.customStates.set("user-valid",e&&o)}setCustomValidity(t){if(!t){this.customError=null,this.setValidity({});return}this.customError=t,this.setValidity({customError:!0},t,this.validationTarget)}formResetCallback(){this.resetValidity(),this.hasInteracted=!1,this.valueHasChanged=!1,this.emittedEvents=[],this.updateValidity()}formDisabledCallback(t){this.disabled=t,this.updateValidity()}formStateRestoreCallback(t,e){this.didSSR&&!this.hasUpdated?this.updateComplete.then(()=>{this.value=t,e==="restore"&&this.resetValidity(),this.updateValidity()}):(this.value=t,e==="restore"&&this.resetValidity(),this.updateValidity())}setValue(...t){let[e,o]=t;this.internals.setFormValue(e,o)}get allValidators(){let t=this.constructor.validators||[],e=this.validators||[];return[...t,...e]}resetValidity(){this.setCustomValidity(""),this.setValidity({})}updateValidity(){if(this.disabled||this.hasAttribute("disabled")||!this.willValidate){this.resetValidity();return}let t=this.allValidators;if(!t?.length)return;let e={customError:!!this.customError},o=this.validationTarget||this.input||void 0,r="";for(let i of t){let{isValid:a,message:n,invalidKeys:l}=i.checkValidity(this);a||(r||(r=n),l?.length>=0&&l.forEach(s=>e[s]=!0))}r||(r=this.validationMessage),this.setValidity(e,r,o)}};de.formAssociated=!0;u([h({reflect:!0})],de.prototype,"name",2);u([h({type:Boolean})],de.prototype,"disabled",2);u([h({state:!0,attribute:!1})],de.prototype,"valueHasChanged",2);u([h({state:!0,attribute:!1})],de.prototype,"hasInteracted",2);u([h({attribute:"custom-error",reflect:!0})],de.prototype,"customError",2);u([h({attribute:!1,state:!0,type:Object})],de.prototype,"validity",1);var tn={small:"s",medium:"m",large:"l"},on=new Set;function ur(t,e){e in tn&&!on.has(`${t}:${e}`)&&(on.add(`${t}:${e}`),console.warn(`[${t}] size="${e}" is deprecated. Use size="${tn[e]}" instead. The long-form value will be removed in the next major version.`))}var fr=class{constructor(t,...e){this.slotNames=[],this.handleSlotChange=o=>{let r=o.target;(this.slotNames.includes("[default]")&&!r.name||r.name&&this.slotNames.includes(r.name))&&this.host.requestUpdate()},(this.host=t).addController(this),this.slotNames=e}hasDefaultSlot(){return this.host.childNodes?[...this.host.childNodes].some(t=>{if(t.nodeType===Node.TEXT_NODE&&t.textContent.trim()!=="")return!0;if(t.nodeType===Node.ELEMENT_NODE){let e=t;if(e.tagName.toLowerCase()==="wa-visually-hidden")return!1;if(!e.hasAttribute("slot"))return!0}return!1}):!1}hasNamedSlot(t){return this.host.querySelector?.(`:scope > [slot="${t}"]`)!==null}test(t,e){return e&&this.host.didSSR&&!this.host.hasUpdated?!!this.host[e]:t==="[default]"?this.hasDefaultSlot():this.hasNamedSlot(t)}hostConnected(){let t=this.host.shadowRoot;t&&"addEventListener"in t&&t.addEventListener("slotchange",this.handleSlotChange)}hostDisconnected(){let t=this.host.shadowRoot;t&&"removeEventListener"in t&&t.removeEventListener("slotchange",this.handleSlotChange)}};var pr=K`
  :host([size='xs']) {
    font-size: var(--wa-font-size-xs);
  }

  :host([size='s']),
  :host([size='small']) {
    font-size: var(--wa-font-size-s);
  }

  :host([size='m']),
  :host([size='medium']) {
    font-size: var(--wa-font-size-m);
  }

  :host([size='l']),
  :host([size='large']) {
    font-size: var(--wa-font-size-l);
  }

  :host([size='xl']) {
    font-size: var(--wa-font-size-xl);
  }
`;var rn=K`
  @layer wa-component {
    :host {
      display: inline-block;

      /* Workaround because Chrome doesn't like :host(:has()) below
       * https://issues.chromium.org/issues/40062355
       * Firefox doesn't like this nested rule, so both are needed */
      &:has(wa-badge) {
        position: relative;
      }
    }

    /* Apply relative positioning only when needed to position wa-badge
     * This avoids creating a new stacking context for every button */
    :host(:has(wa-badge)) {
      position: relative;
    }
  }

  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    user-select: none;
    -webkit-user-select: none;
    white-space: nowrap;
    vertical-align: middle;
    transition-property: background, border, box-shadow, color, opacity, transform;
    transition-duration: var(--wa-transition-fast);
    transition-timing-function: var(--wa-transition-easing);
    transform-origin: center;
    cursor: pointer;
    padding: 0 var(--wa-form-control-padding-inline);
    font-family: inherit;
    font-size: inherit;
    font-weight: var(--wa-font-weight-action);
    height: var(--wa-form-control-height);
    width: 100%;

    background-color: var(--wa-color-fill-loud, var(--wa-color-neutral-fill-loud));

    border-color: transparent;
    color: var(--wa-color-on-loud, var(--wa-color-neutral-on-loud));
    border-start-start-radius: var(--_button-start-start-radius, var(--wa-form-control-border-radius));
    border-start-end-radius: var(--_button-start-end-radius, var(--wa-form-control-border-radius));
    border-end-start-radius: var(--_button-end-start-radius, var(--wa-form-control-border-radius));
    border-end-end-radius: var(--_button-end-end-radius, var(--wa-form-control-border-radius));
    border-style: var(--wa-form-control-border-style);
    border-width: var(--wa-form-control-border-width);
  }

  /* Hover and active transforms */
  .button:not(.disabled):not(.loading) {
    @media (hover: hover) {
      &:hover {
        transform: var(--wa-button-transform-hover);
      }
    }
    &:active {
      transform: var(--wa-button-transform-active);
    }

    @media (prefers-reduced-motion: reduce) {
      &:hover,
      &:active {
        transform: none;
      }
    }
  }

  /* Appearance modifiers */
  :host([appearance='plain']) {
    /* Indentation overrides for grouping */
    margin-inline-start: var(--_button-horizontal-indent);
    margin-block-start: var(--_button-vertical-indent);

    .button {
      color: var(--wa-color-on-quiet, var(--wa-color-neutral-on-quiet));
      background-color: transparent;
      border-color: transparent;
    }
    @media (hover: hover) {
      .button:not(.disabled):not(.loading):hover {
        color: var(--wa-color-on-quiet, var(--wa-color-neutral-on-quiet));
        background-color: var(--wa-color-fill-quiet, var(--wa-color-neutral-fill-quiet));
      }
    }
    .button:not(.disabled):not(.loading):active {
      color: var(--wa-color-on-quiet, var(--wa-color-neutral-on-quiet));
      background-color: color-mix(
        in oklab,
        var(--wa-color-fill-quiet, var(--wa-color-neutral-fill-quiet)),
        var(--wa-color-mix-active)
      );
    }
  }

  :host([appearance='outlined']) {
    /* Indentation overrides for grouping outlined */
    margin-inline-start: var(--_button-horizontal-indent-outlined);
    margin-block-start: var(--_button-vertical-indent-outlined);

    .button {
      color: var(--wa-color-on-quiet, var(--wa-color-neutral-on-quiet));
      background-color: transparent;
      border-color: var(--wa-color-border-loud, var(--wa-color-neutral-border-loud));
    }
    @media (hover: hover) {
      .button:not(.disabled):not(.loading):hover {
        color: var(--wa-color-on-quiet, var(--wa-color-neutral-on-quiet));
        background-color: var(--wa-color-fill-quiet, var(--wa-color-neutral-fill-quiet));
      }
    }
    .button:not(.disabled):not(.loading):active {
      color: var(--wa-color-on-quiet, var(--wa-color-neutral-on-quiet));
      background-color: color-mix(
        in oklab,
        var(--wa-color-fill-quiet, var(--wa-color-neutral-fill-quiet)),
        var(--wa-color-mix-active)
      );
    }
  }

  :host([appearance='filled']) {
    /* Indentation overrides for grouping */
    margin-inline-start: var(--_button-horizontal-indent);
    margin-block-start: var(--_button-vertical-indent);

    .button {
      color: var(--wa-color-on-normal, var(--wa-color-neutral-on-normal));
      background-color: var(--wa-color-fill-normal, var(--wa-color-neutral-fill-normal));
      border-color: transparent;
    }
    @media (hover: hover) {
      .button:not(.disabled):not(.loading):hover {
        color: var(--wa-color-on-normal, var(--wa-color-neutral-on-normal));
        background-color: color-mix(
          in oklab,
          var(--wa-color-fill-normal, var(--wa-color-neutral-fill-normal)),
          var(--wa-color-mix-hover)
        );
      }
    }
    .button:not(.disabled):not(.loading):active {
      color: var(--wa-color-on-normal, var(--wa-color-neutral-on-normal));
      background-color: color-mix(
        in oklab,
        var(--wa-color-fill-normal, var(--wa-color-neutral-fill-normal)),
        var(--wa-color-mix-active)
      );
    }
  }

  :host([appearance='filled-outlined']) {
    /* Indentation overrides for grouping outlined */
    margin-inline-start: var(--_button-horizontal-indent-outlined);
    margin-block-start: var(--_button-vertical-indent-outlined);

    .button {
      color: var(--wa-color-on-normal, var(--wa-color-neutral-on-normal));
      background-color: var(--wa-color-fill-normal, var(--wa-color-neutral-fill-normal));
      border-color: var(--wa-color-border-normal, var(--wa-color-neutral-border-normal));
    }
    @media (hover: hover) {
      .button:not(.disabled):not(.loading):hover {
        color: var(--wa-color-on-normal, var(--wa-color-neutral-on-normal));
        background-color: color-mix(
          in oklab,
          var(--wa-color-fill-normal, var(--wa-color-neutral-fill-normal)),
          var(--wa-color-mix-hover)
        );
      }
    }
    .button:not(.disabled):not(.loading):active {
      color: var(--wa-color-on-normal, var(--wa-color-neutral-on-normal));
      background-color: color-mix(
        in oklab,
        var(--wa-color-fill-normal, var(--wa-color-neutral-fill-normal)),
        var(--wa-color-mix-active)
      );
    }
  }

  :host([appearance='accent']) {
    /* Indentation overrides for grouping */
    margin-inline-start: var(--_button-horizontal-indent);
    margin-block-start: var(--_button-vertical-indent);

    .button {
      color: var(--wa-color-on-loud, var(--wa-color-neutral-on-loud));
      background-color: var(--wa-color-fill-loud, var(--wa-color-neutral-fill-loud));
      border-color: transparent;
    }
    @media (hover: hover) {
      .button:not(.disabled):not(.loading):hover {
        background-color: color-mix(
          in oklab,
          var(--wa-color-fill-loud, var(--wa-color-neutral-fill-loud)),
          var(--wa-color-mix-hover)
        );
      }
    }
    .button:not(.disabled):not(.loading):active {
      background-color: color-mix(
        in oklab,
        var(--wa-color-fill-loud, var(--wa-color-neutral-fill-loud)),
        var(--wa-color-mix-active)
      );
    }
  }

  /* Focus states */
  .button:focus {
    outline: none;
  }

  .button:focus-visible {
    outline: var(--wa-focus-ring);
    outline-offset: var(--wa-focus-ring-offset);
  }

  /* Disabled state */
  :host([disabled]) {
    opacity: 0.5;
    cursor: not-allowed;

    /* When disabled, prevent mouse events from bubbling up from children */
    .button {
      pointer-events: none;
    }
  }

  /* Keep it last so Safari doesn't stop parsing this block */
  .button::-moz-focus-inner {
    border: 0;
  }

  /* Icon buttons */
  .button.is-icon-button {
    outline-offset: 2px;
    width: var(--wa-form-control-height);
    aspect-ratio: 1;
  }

  /* Icon buttons with a caret need to grow to fit both the icon and the caret */
  .button.is-icon-button.caret {
    width: auto;
    aspect-ratio: auto;
    min-width: var(--wa-form-control-height);
  }

  /* Pill modifier */
  :host([pill]) .button {
    border-start-start-radius: var(--_button-start-start-radius, var(--wa-border-radius-pill));
    border-start-end-radius: var(--_button-start-end-radius, var(--wa-border-radius-pill));
    border-end-start-radius: var(--_button-end-start-radius, var(--wa-border-radius-pill));
    border-end-end-radius: var(--_button-end-end-radius, var(--wa-border-radius-pill));
  }

  /*
   * Label
   */

  .start,
  .end {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    pointer-events: none;
  }

  .label {
    display: inline-block;
  }

  .is-icon-button .label {
    display: flex;
    justify-content: center;
  }

  .label::slotted(wa-icon) {
    align-self: center;
  }

  /*
   * Caret modifier
   */

  wa-icon[part='caret'] {
    display: flex;
    align-self: center;
    align-items: center;

    &::part(svg) {
      width: 0.875em;
      height: 0.875em;
    }

    .button:has(&) .end {
      display: none;
    }
  }

  /*
   * Loading modifier
   */

  .loading {
    position: relative;
    cursor: wait;

    .start,
    .label,
    .end,
    .caret {
      /* Hidden with opacity, not visibility, so the label stays in the accessibility tree */
      opacity: 0;

      /* Unlike visibility: hidden, opacity leaves the content clickable */
      pointer-events: none;
    }

    wa-spinner {
      --indicator-color: currentColor;
      --track-color: color-mix(in oklab, currentColor, transparent 90%);

      position: absolute;
      font-size: 1em;
      height: 1em;
      width: 1em;
      top: calc(50% - 0.5em);
      left: calc(50% - 0.5em);
    }
  }

  /*
   * Badges
   */

  .button ::slotted(wa-badge) {
    border-color: var(--wa-color-surface-default);
    position: absolute;
    inset-block-start: 0;
    inset-inline-end: 0;
    translate: 50% -50%;
    pointer-events: none;
  }

  :host(:dir(rtl)) ::slotted(wa-badge) {
    translate: -50% -50%;
  }

  /*
  * Button spacing
  */

  slot[name='start']::slotted(*) {
    margin-inline-end: 0.75em;
  }

  slot[name='end']::slotted(*),
  .button:not(.visually-hidden-label) [part='caret'] {
    margin-inline-start: 0.75em;
  }
`;var an=K`
  :where(:root),
  .wa-neutral,
  :host([variant='neutral']) {
    --wa-color-fill-loud: var(--wa-color-neutral-fill-loud);
    --wa-color-fill-normal: var(--wa-color-neutral-fill-normal);
    --wa-color-fill-quiet: var(--wa-color-neutral-fill-quiet);
    --wa-color-border-loud: var(--wa-color-neutral-border-loud);
    --wa-color-border-normal: var(--wa-color-neutral-border-normal);
    --wa-color-border-quiet: var(--wa-color-neutral-border-quiet);
    --wa-color-on-loud: var(--wa-color-neutral-on-loud);
    --wa-color-on-normal: var(--wa-color-neutral-on-normal);
    --wa-color-on-quiet: var(--wa-color-neutral-on-quiet);
  }

  .wa-brand,
  :host([variant='brand']) {
    --wa-color-fill-loud: var(--wa-color-brand-fill-loud);
    --wa-color-fill-normal: var(--wa-color-brand-fill-normal);
    --wa-color-fill-quiet: var(--wa-color-brand-fill-quiet);
    --wa-color-border-loud: var(--wa-color-brand-border-loud);
    --wa-color-border-normal: var(--wa-color-brand-border-normal);
    --wa-color-border-quiet: var(--wa-color-brand-border-quiet);
    --wa-color-on-loud: var(--wa-color-brand-on-loud);
    --wa-color-on-normal: var(--wa-color-brand-on-normal);
    --wa-color-on-quiet: var(--wa-color-brand-on-quiet);
  }

  .wa-success,
  :host([variant='success']) {
    --wa-color-fill-loud: var(--wa-color-success-fill-loud);
    --wa-color-fill-normal: var(--wa-color-success-fill-normal);
    --wa-color-fill-quiet: var(--wa-color-success-fill-quiet);
    --wa-color-border-loud: var(--wa-color-success-border-loud);
    --wa-color-border-normal: var(--wa-color-success-border-normal);
    --wa-color-border-quiet: var(--wa-color-success-border-quiet);
    --wa-color-on-loud: var(--wa-color-success-on-loud);
    --wa-color-on-normal: var(--wa-color-success-on-normal);
    --wa-color-on-quiet: var(--wa-color-success-on-quiet);
  }

  .wa-warning,
  :host([variant='warning']) {
    --wa-color-fill-loud: var(--wa-color-warning-fill-loud);
    --wa-color-fill-normal: var(--wa-color-warning-fill-normal);
    --wa-color-fill-quiet: var(--wa-color-warning-fill-quiet);
    --wa-color-border-loud: var(--wa-color-warning-border-loud);
    --wa-color-border-normal: var(--wa-color-warning-border-normal);
    --wa-color-border-quiet: var(--wa-color-warning-border-quiet);
    --wa-color-on-loud: var(--wa-color-warning-on-loud);
    --wa-color-on-normal: var(--wa-color-warning-on-normal);
    --wa-color-on-quiet: var(--wa-color-warning-on-quiet);
  }

  .wa-danger,
  :host([variant='danger']) {
    --wa-color-fill-loud: var(--wa-color-danger-fill-loud);
    --wa-color-fill-normal: var(--wa-color-danger-fill-normal);
    --wa-color-fill-quiet: var(--wa-color-danger-fill-quiet);
    --wa-color-border-loud: var(--wa-color-danger-border-loud);
    --wa-color-border-normal: var(--wa-color-danger-border-normal);
    --wa-color-border-quiet: var(--wa-color-danger-border-quiet);
    --wa-color-on-loud: var(--wa-color-danger-on-loud);
    --wa-color-on-normal: var(--wa-color-danger-on-normal);
    --wa-color-on-quiet: var(--wa-color-danger-on-quiet);
  }
`;function ve(t,e){let o={waitUntilFirstUpdate:!1,...e};return(r,i)=>{let{update:a}=r,n=Array.isArray(t)?t:[t];r.update=function(l){n.forEach(s=>{let c=s;if(l.has(c)){let m=l.get(c),d=this[c];m!==d&&(!o.waitUntilFirstUpdate||this.hasUpdated)&&this[i](m,d)}}),a.call(this,l)}}}var di=new Set,Ut=new Map,Ge,ui="ltr",fi="en",nn=typeof MutationObserver<"u"&&typeof document<"u"&&typeof document.documentElement<"u";if(nn){let t=new MutationObserver(sn);ui=document.documentElement.dir||"ltr",fi=document.documentElement.lang||navigator.language,t.observe(document.documentElement,{attributes:!0,attributeFilter:["dir","lang"]})}function yo(...t){t.map(e=>{let o=e.$code.toLowerCase();Ut.has(o)?Ut.set(o,Object.assign(Object.assign({},Ut.get(o)),e)):Ut.set(o,e),Ge||(Ge=e)}),sn()}function sn(){nn&&(ui=document.documentElement.dir||"ltr",fi=document.documentElement.lang||navigator.language),[...di.keys()].map(t=>{typeof t.requestUpdate=="function"&&t.requestUpdate()})}var hr=class{constructor(e){this.host=e,this.host.addController(this)}hostConnected(){di.add(this.host)}hostDisconnected(){di.delete(this.host)}dir(){return`${this.host.dir||ui}`.toLowerCase()}lang(){let e=`${this.host.lang||fi}`.toLowerCase().replace(/_/g,"-");try{return new Intl.Locale(e),e}catch{return Ge?Ge.$code.toLowerCase():"en"}}getTranslationData(e){var o,r;let i;try{i=new Intl.Locale(e.replace(/_/g,"-"))}catch{return{locale:void 0,language:"",region:"",primary:void 0,secondary:void 0}}let a=i.language.toLowerCase(),n=(r=(o=i.region)===null||o===void 0?void 0:o.toLowerCase())!==null&&r!==void 0?r:"",l=Ut.get(`${a}-${n}`),s=Ut.get(a);return{locale:i,language:a,region:n,primary:l,secondary:s}}exists(e,o){var r;let{primary:i,secondary:a}=this.getTranslationData((r=o.lang)!==null&&r!==void 0?r:this.lang());return o=Object.assign({includeFallback:!1},o),!!(i&&i[e]||a&&a[e]||o.includeFallback&&Ge&&Ge[e])}term(e,...o){let{primary:r,secondary:i}=this.getTranslationData(this.lang()),a;if(r&&r[e])a=r[e];else if(i&&i[e])a=i[e];else if(Ge&&Ge[e])a=Ge[e];else return console.error(`No translation found for: ${String(e)}`),String(e);return typeof a=="function"?a(...o):a}date(e,o){return e=new Date(e),new Intl.DateTimeFormat(this.lang(),o).format(e)}number(e,o){return e=Number(e),isNaN(e)?"":new Intl.NumberFormat(this.lang(),o).format(e)}relativeTime(e,o,r){return new Intl.RelativeTimeFormat(this.lang(),r).format(e,o)}};var ln={$code:"en",$name:"English",$dir:"ltr",am:"AM",autosizeColumn:"Autosize column",captions:"Captions",carousel:"Carousel",chooseDate:"Choose date",chooseDecade:"Choose decade",chooseMonth:"Choose month",chooseTime:"Choose time",chooseYear:"Choose year",clearEntry:"Clear entry",clearFilter:"Clear filter",clearSort:"Clear sort",close:"Close",closeCalendar:"Close calendar",closeTimeInput:"Close time picker",collapseRow:"Collapse row",columnMenu:"Column options",columnMovedToPosition:(t,e,o)=>`${t} moved to position ${e} of ${o}`,columns:"Columns",compactPageXOfY:(t,e)=>`${t} of ${e}`,copied:"Copied",copy:"Copy",createOption:t=>`Create "${t}"`,currentlyPlaying:"currently playing",currentValue:"Current value",date:"Date",datePickerKeyboardHelp:"Use arrow keys to change values; press Alt+Down Arrow to open the calendar.",day:"Day",dayPeriod:"AM/PM",decrement:"Decrement",deselectAllRows:"Deselect all rows",dropFileHere:"Drop file here or click to browse",dropFilesHere:"Drop files here or click to browse",empty:"Empty",endDate:"End date",enterFullscreen:"Enter fullscreen",error:"Error",exitFullscreen:"Exit fullscreen",expandRow:"Expand row",filterByColumn:t=>`Filter by ${t}`,filterFrom:"From",filterMax:"Max",filterMin:"Min",filterTo:"To",firstPage:"First page",goToSlide:(t,e)=>`Go to slide ${t} of ${e}`,hideColumn:"Hide column",hidePassword:"Hide password",hour:"Hour",incompleteDate:"Enter a valid date.",increment:"Increment",jumpBackwardX:t=>`Jump back ${t} pages`,jumpForwardX:t=>`Jump forward ${t} pages`,lastPage:"Last page",loading:"Loading",minute:"Minute",month:"Month",moreOptions:"More Options",mute:"Mute",nextDecade:"Next decade",nextMonth:"Next month",nextPage:"Next page",nextSlide:"Next slide",nextVideo:"Next Video",nextYear:"Next year",noData:"No data",noResults:"No matching results",now:"Now",numCharacters:t=>t===1?"1 character":`${t} characters`,numCharactersRemaining:t=>t===1?"1 character remaining":`${t} characters remaining`,numOptionsSelected:t=>t===0?"No options selected":t===1?"1 option selected":`${t} options selected`,numRowsCopied:t=>t===1?"1 row copied":`${t} rows copied`,numRowsSelected:t=>t===1?"1 row selected":`${t} rows selected`,pageXOfY:(t,e)=>`Page ${t} of ${e}`,pagination:"Pagination",pause:"Pause",pauseAnimation:"Pause animation",pictureInPicture:"Picture in picture",pinLeft:"Pin left",pinRight:"Pin right",play:"Play",playAnimation:"Play animation",playbackSpeed:"Playback speed",playlist:"Playlist",pm:"PM",previousDecade:"Previous decade",previousMonth:"Previous month",previousPage:"Previous page",previousSlide:"Previous slide",previousVideo:"Previous video",previousYear:"Previous year",progress:"Progress",rangeTooLong:t=>t===1?"Select a range no longer than 1 day":`Select a range no longer than ${t} days`,rangeTooShort:t=>t===1?"Select a range at least 1 day long":`Select a range at least ${t} days long`,readonly:"Read-only",remove:"Remove",resetColumns:"Reset columns",resize:"Resize",resizeColumn:"Resize column",rowsPerPage:"Rows per page",scrollableRegion:"Scrollable region",scrollToEnd:"Scroll to end",scrollToStart:"Scroll to start",search:"Search",second:"Second",seek:"Seek",seekProgress:(t,e)=>`${t} of ${e}`,selectAColorFromTheScreen:"Select a color from the screen",selectAllRows:"Select all rows",selected:"Selected",selectedDateLabel:t=>`Selected: ${t}`,selectedRangeLabel:t=>`Selected range: ${t}`,selectGroup:"Select group",selectionCleared:"Selection cleared",selectRow:"Select row",showingNofMRows:(t,e)=>`Showing ${t} of ${e} rows`,showingXtoYofZ:(t,e,o)=>`${t}\u2013${e} of ${o}`,showPassword:"Show password",slideNum:t=>`Slide ${t}`,sortAscending:"Sort ascending",sortColumn:"Sort column",sortDescending:"Sort descending",startDate:"Start date",time:"Time",timeInputKeyboardHelp:"Use arrow keys to change values; press Alt+Down Arrow to open the time picker.",today:"Today",toggleColorFormat:"Toggle color format",unmute:"Unmute",unpin:"Unpin",unpinColumn:"Unpin column",videoPlayer:"Video player",volume:"Volume",year:"Year",zoomIn:"Zoom in",zoomOut:"Zoom out"};yo(ln);var cn=ln;var qt=class extends hr{lang(){return this.host.didSSR&&!this.host.hasUpdated?this.host.lang||"en":super.lang()}};yo(cn);var Ze={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},gr=t=>(...e)=>({_$litDirective$:t,values:e}),Ht=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,o,r){this._$Ct=e,this._$AM=o,this._$Ci=r}_$AS(e,o){return this.update(e,o)}update(e,o){return this.render(...o)}};var xo=gr(class extends Ht{constructor(t){if(super(t),t.type!==Ze.ATTRIBUTE||t.name!=="class"||t.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(t){return" "+Object.keys(t).filter(e=>t[e]).join(" ")+" "}update(t,[e]){if(this.st===void 0){this.st=new Set,t.strings!==void 0&&(this.nt=new Set(t.strings.join(" ").split(/\s/).filter(r=>r!=="")));for(let r in e)e[r]&&!this.nt?.has(r)&&this.st.add(r);return this.render(e)}let o=t.element.classList;for(let r of this.st)r in e||(o.remove(r),this.st.delete(r));for(let r in e){let i=!!e[r];i===this.st.has(r)||this.nt?.has(r)||(i?(o.add(r),this.st.add(r)):(o.remove(r),this.st.delete(r)))}return ae}});var Q=t=>t??F;var dn=Symbol.for(""),vs=t=>{if(t?.r===dn)return t?._$litStatic$};var pi=(t,...e)=>({_$litStatic$:e.reduce((o,r,i)=>o+(a=>{if(a._$litStatic$!==void 0)return a._$litStatic$;throw Error(`Value passed to 'literal' function must be a 'literal' result: ${a}. Use 'unsafeStatic' to pass non-literal values, but
            take care to ensure page security.`)})(r)+t[i+1],t[0]),r:dn}),mn=new Map,hi=t=>(e,...o)=>{let r=o.length,i,a,n=[],l=[],s,c=0,m=!1;for(;c<r;){for(s=e[c];c<r&&(a=o[c],(i=vs(a))!==void 0);)s+=i+e[++c],m=!0;c!==r&&l.push(a),n.push(s),c++}if(c===r&&n.push(e[r]),m){let d=n.join("$$lit$$");(e=mn.get(d))===void 0&&(n.raw=n,mn.set(d,e=n)),o=l}return t(e,...o)},wr=hi(Xe),bu=hi(Xa),yu=hi(Ya);var x=class extends de{constructor(){super(...arguments),this.assumeInteractionOn=["click"],this.hasSlotController=new fr(this,"[default]","start","end"),this.localize=new qt(this),this.invalid=!1,this.isIconButton=!1,this.title="",this.variant="neutral",this.appearance="accent",this.size="m",this.withCaret=!1,this.withStart=!1,this.withEnd=!1,this.disabled=!1,this.loading=!1,this.pill=!1,this.type="button"}static get validators(){return[...super.validators,Qo()]}handleSizeChange(){ur(this.localName,this.size)}constructLightDOMButton(){let t=document.createElement("button");for(let e of this.attributes)e.name!=="style"&&t.setAttribute(e.name,e.value);return t.type=this.type,t.style.position="absolute !important",t.style.width="0 !important",t.style.height="0 !important",t.style.clipPath="inset(50%) !important",t.style.overflow="hidden !important",t.style.whiteSpace="nowrap !important",this.name&&(t.name=this.name),t.value=this.value||"",t}handleClick(t){if(this.disabled||this.loading){t.preventDefault(),t.stopImmediatePropagation();return}if(this.type!=="submit"&&this.type!=="reset"||!this.getForm())return;let o=this.constructLightDOMButton();this.parentElement?.append(o),o.click(),o.remove()}handleInvalid(){this.dispatchEvent(new er)}handleLabelSlotChange(){let t=this.labelSlot.assignedNodes({flatten:!0}),e=!1,o=!1,r=!1,i=!1;[...t].forEach(a=>{if(a.nodeType===Node.ELEMENT_NODE){let n=a;n.localName==="wa-icon"?(o=!0,e||(e=n.label!==void 0)):i=!0}else a.nodeType===Node.TEXT_NODE&&(a.textContent?.trim()||"").length>0&&(r=!0)}),this.isIconButton=o&&!r&&!i,this.customStates.set("icon-button",this.isIconButton),this.isIconButton&&!e&&console.warn('Icon buttons must have a label for screen readers. Add <wa-icon label="..."> to remove this warning.',this)}isButton(){return!this.href}isLink(){return!!this.href}handleDisabledChange(){this.customStates.set("disabled",this.disabled),this.updateValidity()}handleHrefChange(){this.customStates.set("link",this.isLink())}handleLoadingChange(){this.customStates.set("loading",this.loading)}setValue(...t){}click(){this.button.click()}focus(t){this.button.focus(t)}blur(){this.button.blur()}render(){let t=this.isLink(),e=t?pi`a`:pi`button`;return wr`
      <${e}
        part="base button"
        class=${xo({button:!0,caret:this.withCaret,disabled:this.disabled,loading:this.loading,rtl:this.localize.dir()==="rtl","has-label":this.hasSlotController.test("[default]"),"has-start":this.hasSlotController.test("start","withStart"),"has-end":this.hasSlotController.test("end","withEnd"),"is-icon-button":this.isIconButton})}
        ?disabled=${Q(t?void 0:this.disabled)}
        type=${Q(t?void 0:this.type)}
        title=${this.title}
        name=${Q(t?void 0:this.name)}
        value=${Q(t?void 0:this.value)}
        href=${Q(t?this.href:void 0)}
        target=${Q(t?this.target:void 0)}
        download=${Q(t?this.download:void 0)}
        rel=${Q(t&&this.rel?this.rel:void 0)}
        role=${Q(t?void 0:"button")}
        aria-disabled=${Q(t&&this.disabled?"true":void 0)}
        aria-busy=${this.loading?"true":"false"}
        tabindex=${this.disabled?"-1":"0"}
        @invalid=${this.isButton()?this.handleInvalid:null}
        @click=${this.handleClick}
      >
        <slot name="start" part="start" class="start"></slot>
        <slot part="label" class="label" @slotchange=${this.handleLabelSlotChange}></slot>
        <slot name="end" part="end" class="end"></slot>
        ${this.withCaret?wr`
                <wa-icon part="caret" class="caret" library="system" name="chevron-down" variant="solid"></wa-icon>
              `:""}
        ${this.loading?wr`<wa-spinner part="spinner"></wa-spinner>`:""}
      </${e}>
    `}};x.shadowRootOptions={...de.shadowRootOptions,delegatesFocus:!0};x.css=[rn,an,pr];u([bo(".button")],x.prototype,"button",2);u([bo("slot:not([name])")],x.prototype,"labelSlot",2);u([vo()],x.prototype,"invalid",2);u([vo()],x.prototype,"isIconButton",2);u([h()],x.prototype,"title",2);u([h({reflect:!0})],x.prototype,"variant",2);u([h({reflect:!0})],x.prototype,"appearance",2);u([h({reflect:!0})],x.prototype,"size",2);u([ve("size")],x.prototype,"handleSizeChange",1);u([h({attribute:"with-caret",type:Boolean,reflect:!0})],x.prototype,"withCaret",2);u([h({attribute:"with-start",type:Boolean})],x.prototype,"withStart",2);u([h({attribute:"with-end",type:Boolean})],x.prototype,"withEnd",2);u([h({type:Boolean})],x.prototype,"disabled",2);u([h({type:Boolean,reflect:!0})],x.prototype,"loading",2);u([h({type:Boolean,reflect:!0})],x.prototype,"pill",2);u([h()],x.prototype,"type",2);u([h({reflect:!0})],x.prototype,"name",2);u([h({reflect:!0})],x.prototype,"value",2);u([h({reflect:!0})],x.prototype,"href",2);u([h()],x.prototype,"target",2);u([h()],x.prototype,"rel",2);u([h()],x.prototype,"download",2);u([h({attribute:"formaction"})],x.prototype,"formAction",2);u([h({attribute:"formenctype"})],x.prototype,"formEnctype",2);u([h({attribute:"formmethod"})],x.prototype,"formMethod",2);u([h({attribute:"formnovalidate",type:Boolean})],x.prototype,"formNoValidate",2);u([h({attribute:"formtarget"})],x.prototype,"formTarget",2);u([ve("disabled",{waitUntilFirstUpdate:!0})],x.prototype,"handleDisabledChange",1);u([ve("href")],x.prototype,"handleHrefChange",1);u([ve("loading",{waitUntilFirstUpdate:!0})],x.prototype,"handleLoadingChange",1);x=u([ct("wa-button")],x);x.disableWarning?.("change-in-update");var un=K`
  :host {
    --track-width: 2px;
    --track-color: var(--wa-color-neutral-fill-normal);
    --indicator-color: var(--wa-color-brand-fill-loud);
    --speed: 2s;
    --size: 1em;

    /*
      Resizing a spinner element using anything but font-size will break the animation because the animation uses em
      units. Therefore, if a spinner is used in a flex container without \`flex: none\` applied, the spinner can
      grow/shrink and break the animation. The use of \`flex: none\` on the host element prevents this by always having
      the spinner sized according to its actual dimensions.
    */
    flex: none;
    display: inline-flex;
    width: var(--size);
    height: var(--size);
  }

  svg {
    width: 100%;
    height: 100%;
    aspect-ratio: 1;
    animation: spin var(--speed) linear infinite;
  }

  .track,
  .indicator {
    --radius: calc(var(--size) / 2 - var(--track-width) / 2);
    --circumference: calc(var(--radius) * 2 * 3.141592654);

    cx: calc(var(--size) / 2);
    cy: calc(var(--size) / 2);
    r: var(--radius);
    fill: none;
    stroke-width: var(--track-width);
  }

  .track {
    stroke: var(--track-color);
  }

  .indicator {
    stroke: var(--indicator-color);
    stroke-linecap: round;
    stroke-dasharray: calc(0.597 * var(--circumference)), calc(0.796 * var(--circumference));
    stroke-dashoffset: calc(-0.04 * var(--circumference));
    animation: dash 1.5s ease-in-out infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes dash {
    0% {
      stroke-dasharray: calc(0.008 * var(--circumference)), calc(1.194 * var(--circumference));
      stroke-dashoffset: 0;
    }
    50% {
      stroke-dasharray: calc(0.716 * var(--circumference)), calc(1.194 * var(--circumference));
      stroke-dashoffset: calc(-0.278 * var(--circumference));
    }
    100% {
      stroke-dasharray: calc(0.716 * var(--circumference)), calc(1.194 * var(--circumference));
      stroke-dashoffset: calc(-0.987 * var(--circumference));
    }
  }
`;var gi=class extends Ye{constructor(){super(...arguments),this.localize=new qt(this)}render(){return Xe`
      <svg
        part="base spinner"
        role="progressbar"
        aria-label=${this.localize.term("loading")}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle class="track" />
        <circle class="indicator" />
      </svg>
    `}};gi.css=un;gi=u([ct("wa-spinner")],gi);var fn=class extends Event{constructor(){super("wa-error",{bubbles:!0,cancelable:!1,composed:!0})}};var pn=class extends Event{constructor(){super("wa-load",{bubbles:!0,cancelable:!1,composed:!0})}};var hn=K`
  :host {
    --primary-color: currentColor;
    --primary-opacity: 1;
    --secondary-color: currentColor;
    --secondary-opacity: 0.4;
    --rotate-angle: 0deg;

    box-sizing: content-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    vertical-align: -0.125em;
  }

  /* #region Canvas — the box the icon is centered within (mirrors Font Awesome's icon canvas). Orthogonal to font-size. */

  /* Fixed width (default): 1.25em × 1em (20 × 16px) */
  :host(:not([canvas])),
  :host([canvas='fixed']) {
    width: 1.25em;
    height: 1em;
    min-width: 1.25em; /* <-- this is what Safari respects for intrinsic */
    min-height: 1em;
  }

  /* Auto: hug the icon's width. \`auto-width\` is the deprecated alias for canvas="auto". */
  :host([canvas='auto']),
  :host([auto-width]:not([canvas])) {
    width: auto;
    height: 1em;
  }

  /* Square: 1.25em × 1.25em (20 × 20px) */
  :host([canvas='square']) {
    width: 1.25em;
    height: 1.25em;
    min-width: 1.25em;
    min-height: 1.25em;
  }

  /* Roomy: 1.5em × 1.5em (24 × 24px) */
  :host([canvas='roomy']) {
    width: 1.5em;
    height: 1.5em;
    min-width: 1.5em;
    min-height: 1.5em;
  }

  /* #endregion */

  svg {
    /* NOTE: Avoid setting fill here. A stylesheet rule beats SVG presentation attributes, breaking stroke-based
       libraries like Lucide (fill="none" stroke="currentColor") and attribute-based mutators (issue #1733). The default
       library applies fill="currentColor" in its mutator instead. */
    height: 1em;
    overflow: visible;
    width: auto;

    /* Duotone colors with path-specific opacity fallback */
    path[data-duotone-primary] {
      color: var(--primary-color);
      opacity: var(--path-opacity, var(--primary-opacity));
    }

    path[data-duotone-secondary] {
      color: var(--secondary-color);
      opacity: var(--path-opacity, var(--secondary-opacity));
    }
  }

  /* Rotation */
  :host([rotate]) {
    transform: rotate(var(--rotate-angle, 0deg));
  }

  /* Flipping */
  :host([flip='x']) {
    transform: scaleX(-1);
  }
  :host([flip='y']) {
    transform: scaleY(-1);
  }
  :host([flip='both']) {
    transform: scale(-1, -1);
  }

  /* Rotation and Flipping combined */
  :host([rotate][flip='x']) {
    transform: rotate(var(--rotate-angle, 0deg)) scaleX(-1);
  }
  :host([rotate][flip='y']) {
    transform: rotate(var(--rotate-angle, 0deg)) scaleY(-1);
  }
  :host([rotate][flip='both']) {
    transform: rotate(var(--rotate-angle, 0deg)) scale(-1, -1);
  }

  /* #region Animations — ported from Font Awesome 7.3 (--fa-* props mapped to wa-icon's --* names) */

  :host([animation='beat']) {
    animation-name: beat;
    animation-delay: var(--animation-delay, 0s);
    animation-direction: var(--animation-direction, normal);
    animation-duration: var(--animation-duration, 1s);
    animation-iteration-count: var(--animation-iteration-count, infinite);
    animation-timing-function: var(--animation-timing, ease-in-out);
  }

  :host([animation='bounce']) {
    animation-name: bounce;
    animation-delay: var(--animation-delay, 0s);
    animation-direction: var(--animation-direction, normal);
    animation-duration: var(--animation-duration, 1s);
    animation-iteration-count: var(--animation-iteration-count, infinite);
    animation-timing-function: var(--animation-timing, cubic-bezier(0.28, 0.84, 0.42, 1));
  }

  :host([animation='fade']) {
    animation-name: fade;
    animation-delay: var(--animation-delay, 0s);
    animation-direction: var(--animation-direction, normal);
    animation-duration: var(--animation-duration, 1s);
    animation-iteration-count: var(--animation-iteration-count, infinite);
    animation-timing-function: var(--animation-timing, ease-in-out);
  }

  :host([animation='beat-fade']) {
    animation-name: beat-fade;
    animation-delay: var(--animation-delay, 0s);
    animation-direction: var(--animation-direction, normal);
    animation-duration: var(--animation-duration, 1s);
    animation-iteration-count: var(--animation-iteration-count, infinite);
    animation-timing-function: var(--animation-timing, ease-in-out);
  }

  :host([animation='flip']) {
    animation-name: flip;
    animation-delay: var(--animation-delay, 0s);
    animation-direction: var(--animation-direction, normal);
    animation-duration: var(--animation-duration, 1.5s);
    animation-iteration-count: var(--animation-iteration-count, infinite);
    animation-timing-function: var(--animation-timing, ease-in-out);
  }

  :host([animation='flip-360']) {
    animation-name: flip-360;
    animation-delay: var(--animation-delay, 0s);
    animation-direction: var(--animation-direction, normal);
    animation-duration: var(--animation-duration, 1s);
    animation-iteration-count: var(--animation-iteration-count, infinite);
    animation-timing-function: var(--animation-timing, ease-in-out);
  }

  :host([animation='shake']) {
    animation-name: shake;
    animation-delay: var(--animation-delay, 0s);
    animation-direction: var(--animation-direction, normal);
    animation-duration: var(--animation-duration, 0.75s);
    animation-iteration-count: var(--animation-iteration-count, infinite);
    animation-timing-function: var(--animation-timing, ease-in-out);
  }

  :host([animation='spin']) {
    animation-name: spin;
    animation-delay: var(--animation-delay, 0s);
    animation-direction: var(--animation-direction, normal);
    animation-duration: var(--animation-duration, 2s);
    animation-iteration-count: var(--animation-iteration-count, infinite);
    animation-timing-function: var(--animation-timing, linear);
  }

  :host([animation='spin-pulse']) {
    animation-name: spin;
    animation-delay: var(--animation-delay, 0s);
    animation-direction: var(--animation-direction, normal);
    animation-duration: var(--animation-duration, 1s);
    animation-iteration-count: var(--animation-iteration-count, infinite);
    animation-timing-function: var(--animation-timing, steps(8));
  }

  /* spin-reverse is FA's reverse modifier expressed as a standalone value; reverse any spin via --animation-direction: reverse */
  :host([animation='spin-reverse']) {
    animation-name: spin;
    animation-delay: var(--animation-delay, 0s);
    animation-direction: var(--animation-direction, reverse);
    animation-duration: var(--animation-duration, 2s);
    animation-iteration-count: var(--animation-iteration-count, infinite);
    animation-timing-function: var(--animation-timing, linear);
  }

  :host([animation='spin-snap']) {
    animation-name: spin-snap;
    animation-delay: var(--animation-delay, 0s);
    animation-direction: var(--animation-direction, normal);
    animation-duration: var(--animation-duration, 3s);
    animation-iteration-count: var(--animation-iteration-count, infinite);
    animation-timing-function: var(--animation-timing, linear);
  }

  :host([animation='spin-snap-4']) {
    animation-name: spin-snap-4;
    animation-delay: var(--animation-delay, 0s);
    animation-direction: var(--animation-direction, normal);
    animation-duration: var(--animation-duration, 2.4s);
    animation-iteration-count: var(--animation-iteration-count, infinite);
    animation-timing-function: var(--animation-timing, linear);
  }

  :host([animation='spin-snap-8']) {
    animation-name: spin-snap-8;
    animation-delay: var(--animation-delay, 0s);
    animation-direction: var(--animation-direction, normal);
    animation-duration: var(--animation-duration, 4s);
    animation-iteration-count: var(--animation-iteration-count, infinite);
    animation-timing-function: var(--animation-timing, linear);
  }

  :host([animation='buzz']) {
    animation-name: buzz;
    animation-delay: var(--animation-delay, 0s);
    animation-direction: var(--animation-direction, normal);
    animation-duration: var(--animation-duration, 0.6s);
    animation-iteration-count: var(--animation-iteration-count, infinite);
    animation-timing-function: var(--animation-timing, linear);
  }

  :host([animation='wag']) {
    animation-name: wag;
    animation-delay: var(--animation-delay, 0s);
    animation-direction: var(--animation-direction, normal);
    animation-duration: var(--animation-duration, 0.9s);
    animation-iteration-count: var(--animation-iteration-count, infinite);
    animation-timing-function: var(--animation-timing, ease-out);
    transform-origin: bottom center;
  }

  :host([animation='float']) {
    animation-name: float;
    animation-delay: var(--animation-delay, 0s);
    animation-direction: var(--animation-direction, normal);
    animation-duration: var(--animation-duration, 3s);
    animation-iteration-count: var(--animation-iteration-count, infinite);
    animation-timing-function: var(--animation-timing, ease-in-out);
    will-change: transform;
  }

  :host([animation='swing']) {
    animation-name: swing;
    animation-delay: var(--animation-delay, 0s);
    animation-direction: var(--animation-direction, normal);
    animation-duration: var(--animation-duration, 1.2s);
    animation-iteration-count: var(--animation-iteration-count, infinite);
    animation-timing-function: var(--animation-timing, ease-out);
    transform-origin: top center;
  }

  :host([animation='jello']) {
    animation-name: jello;
    animation-delay: var(--animation-delay, 0s);
    animation-direction: var(--animation-direction, normal);
    animation-duration: var(--animation-duration, 0.9s);
    animation-iteration-count: var(--animation-iteration-count, infinite);
    animation-timing-function: var(--animation-timing, ease-out);
  }

  @media (prefers-reduced-motion: reduce) {
    :host([animation='beat']),
    :host([animation='bounce']),
    :host([animation='fade']),
    :host([animation='beat-fade']),
    :host([animation='flip']),
    :host([animation='flip-360']),
    :host([animation='shake']),
    :host([animation='spin']),
    :host([animation='spin-pulse']),
    :host([animation='spin-reverse']),
    :host([animation='spin-snap']),
    :host([animation='spin-snap-4']),
    :host([animation='spin-snap-8']),
    :host([animation='buzz']),
    :host([animation='wag']),
    :host([animation='float']),
    :host([animation='swing']),
    :host([animation='jello']) {
      animation: none !important;
      transition: none !important;
    }
  }

  /* #endregion */

  /* #region Keyframes — ported verbatim from Font Awesome 7.3 */

  @keyframes beat {
    0% {
      transform: scale(1);
    }
    25% {
      transform: scale(calc(1.25 * var(--beat-scale, 1.25)));
    }
    45% {
      transform: scale(calc(1.22 * var(--beat-scale, 1.22)));
    }
    65% {
      transform: scale(calc(1.25 * var(--beat-scale, 1.25)));
    }
    90% {
      transform: scale(1);
    }
  }

  @keyframes bounce {
    0% {
      transform: scale(1, 1) translateY(0);
      /* No fallback by design (ported from FA 7.3): the first segment uses the user's --animation-timing or the CSS
         initial ease, while the explicit cubic-beziers on later stops drive the bounce physics. */
      animation-timing-function: var(--animation-timing);
    }
    14% {
      transform: scale(var(--bounce-start-scale-x, 1.06), var(--bounce-start-scale-y, 0.94))
        translateY(var(--bounce-anticipation, 3px));
      animation-timing-function: cubic-bezier(0.33, 0, 0.66, 0.33);
    }
    32% {
      transform: scale(var(--bounce-jump-scale-x, 0.94), var(--bounce-jump-scale-y, 1.12))
        translateY(calc(-1 * var(--bounce-height, 0.5em)));
      animation-timing-function: cubic-bezier(0.33, 0.66, 0.66, 1);
    }
    52% {
      transform: scale(1, 1) translateY(calc(-1 * var(--bounce-height, 0.5em) * 1.1));
      animation-timing-function: cubic-bezier(0.5, 0, 1, 0.5);
    }
    70% {
      transform: scale(var(--bounce-land-scale-x, 1.06), var(--bounce-land-scale-y, 0.92)) translateY(0);
      animation-timing-function: cubic-bezier(0.33, 0.33, 0.66, 1);
    }
    85% {
      transform: scale(0.98, 1.04) translateY(calc(-2px * var(--bounce-rebound, 1)));
      animation-timing-function: cubic-bezier(0.33, 0, 0.66, 1);
    }
    100% {
      transform: scale(1, 1) translateY(0);
    }
  }

  @keyframes fade {
    0% {
      opacity: 1;
      transform: scale(1);
      animation-timing-function: cubic-bezier(0.2, 0, 0.4, 1);
    }
    40% {
      opacity: var(--fade-opacity, 0.4);
      transform: scale(0.98);
      animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes beat-fade {
    0% {
      opacity: var(--beat-fade-opacity, 0.4);
      transform: scale(1);
      animation-timing-function: cubic-bezier(0.2, 0, 0.4, 1);
    }
    25% {
      opacity: calc(var(--beat-fade-opacity, 0.4) + 0.4);
      transform: scale(var(--beat-fade-scale, 1.28));
      animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
    }
    45% {
      opacity: 1;
      transform: scale(var(--beat-fade-scale, 1.25));
      animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }
    65% {
      opacity: calc(var(--beat-fade-opacity, 0.4) + 0.4);
      transform: scale(var(--beat-fade-scale, 1.28));
      animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
    }
    100% {
      opacity: var(--beat-fade-opacity, 0.4);
      transform: scale(1);
    }
  }

  @keyframes flip {
    0% {
      transform: perspective(2em) scale(1) rotate3d(var(--flip-x, 0), var(--flip-y, 1), var(--flip-z, 0), 0deg);
      animation-timing-function: cubic-bezier(0.2, 0, 0.4, 1);
    }
    8% {
      transform: perspective(2em) scale(var(--flip-anticipation-scale, 0.95))
        rotate3d(var(--flip-x, 0), var(--flip-y, 1), var(--flip-z, 0), 0deg);
      animation-timing-function: cubic-bezier(0.33, 0, 0.66, 0.33);
    }
    35% {
      transform: perspective(2em) scale(1)
        rotate3d(var(--flip-x, 0), var(--flip-y, 1), var(--flip-z, 0), calc(var(--flip-angle, -360deg) * 0.6));
      animation-timing-function: linear;
    }
    65% {
      transform: perspective(2em) scale(1)
        rotate3d(var(--flip-x, 0), var(--flip-y, 1), var(--flip-z, 0), calc(var(--flip-angle, -360deg) * 0.5));
      animation-timing-function: cubic-bezier(0.33, 0.66, 0.66, 1);
    }
    92% {
      transform: perspective(2em) scale(1)
        rotate3d(
          var(--flip-x, 0),
          var(--flip-y, 1),
          var(--flip-z, 0),
          calc(var(--flip-angle, -360deg) * var(--flip-overshoot, 1.04))
        );
      animation-timing-function: cubic-bezier(0.33, 0, 0.66, 1);
    }
    100% {
      transform: perspective(2em) scale(1)
        rotate3d(var(--flip-x, 0), var(--flip-y, 1), var(--flip-z, 0), var(--flip-angle, -360deg));
    }
  }

  @keyframes flip-360 {
    0% {
      transform: perspective(2em) scale(1) rotate3d(var(--flip-x, 0), var(--flip-y, 1), var(--flip-z, 0), 0deg);
      animation-timing-function: cubic-bezier(0.2, 0, 0.4, 1);
    }
    8% {
      transform: perspective(2em) scale(var(--flip-anticipation-scale, 0.95))
        rotate3d(var(--flip-x, 0), var(--flip-y, 1), var(--flip-z, 0), 0deg);
      animation-timing-function: cubic-bezier(0.33, 0, 0.66, 0.33);
    }
    50% {
      transform: perspective(2em) scale(1)
        rotate3d(var(--flip-x, 0), var(--flip-y, 1), var(--flip-z, 0), calc(var(--flip-angle, -360deg) * 0.6));
      animation-timing-function: cubic-bezier(0.33, 0.66, 0.66, 1);
    }
    80% {
      transform: perspective(2em) scale(1)
        rotate3d(
          var(--flip-x, 0),
          var(--flip-y, 1),
          var(--flip-z, 0),
          calc(var(--flip-angle, -360deg) * var(--flip-overshoot, 1.04))
        );
      animation-timing-function: cubic-bezier(0.33, 0, 0.66, 1);
    }
    100% {
      transform: perspective(2em) scale(1)
        rotate3d(var(--flip-x, 0), var(--flip-y, 1), var(--flip-z, 0), var(--flip-angle, -360deg));
    }
  }

  @keyframes shake {
    0% {
      transform: rotate(0deg);
      animation-timing-function: cubic-bezier(0.2, 0, 0.8, 1);
    }
    8% {
      transform: rotate(35deg) translateX(1px);
      animation-timing-function: cubic-bezier(0.3, 0, 0.7, 1);
    }
    20% {
      transform: rotate(-22deg) translateX(-1px);
      animation-timing-function: cubic-bezier(0.3, 0, 0.7, 1);
    }
    35% {
      transform: rotate(15deg) translateX(1px);
      animation-timing-function: cubic-bezier(0.3, 0, 0.7, 1);
    }
    50% {
      transform: rotate(-9deg);
      animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
    }
    65% {
      transform: rotate(5deg);
      animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
    }
    78% {
      transform: rotate(-3deg);
      animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
    }
    90% {
      transform: rotate(1deg);
      animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }
    100% {
      transform: rotate(0deg);
    }
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes spin-snap {
    0% {
      transform: rotate(0deg);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
    12% {
      transform: rotate(60deg);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    16.67% {
      transform: rotate(60deg);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
    28.67% {
      transform: rotate(120deg);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    33.33% {
      transform: rotate(120deg);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
    45.33% {
      transform: rotate(180deg);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    50% {
      transform: rotate(180deg);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
    62% {
      transform: rotate(240deg);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    66.67% {
      transform: rotate(240deg);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
    78.67% {
      transform: rotate(300deg);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    83.33% {
      transform: rotate(300deg);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
    95.33% {
      transform: rotate(360deg);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes spin-snap-4 {
    0% {
      transform: rotate(0deg);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
    15% {
      transform: rotate(90deg);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    25% {
      transform: rotate(90deg);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
    40% {
      transform: rotate(180deg);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    50% {
      transform: rotate(180deg);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
    65% {
      transform: rotate(270deg);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    75% {
      transform: rotate(270deg);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
    90% {
      transform: rotate(360deg);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes spin-snap-8 {
    0% {
      transform: rotate(0deg);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
    9% {
      transform: rotate(45deg);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    12.5% {
      transform: rotate(45deg);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
    21.5% {
      transform: rotate(90deg);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    25% {
      transform: rotate(90deg);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
    34% {
      transform: rotate(135deg);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    37.5% {
      transform: rotate(135deg);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
    46.5% {
      transform: rotate(180deg);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    50% {
      transform: rotate(180deg);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
    59% {
      transform: rotate(225deg);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    62.5% {
      transform: rotate(225deg);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
    71.5% {
      transform: rotate(270deg);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    75% {
      transform: rotate(270deg);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
    84% {
      transform: rotate(315deg);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    87.5% {
      transform: rotate(315deg);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
    96.5% {
      transform: rotate(360deg);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes buzz {
    0% {
      transform: translateX(0) rotate(0deg);
      animation-timing-function: cubic-bezier(0.1, 0, 0.9, 1);
    }
    5% {
      transform: translateX(var(--buzz-distance, 4px)) rotate(0.5deg);
    }
    10% {
      transform: translateX(calc(-1 * var(--buzz-distance, 4px))) rotate(-0.5deg);
    }
    15% {
      transform: translateX(var(--buzz-distance, 4px)) rotate(0.3deg);
    }
    20% {
      transform: translateX(calc(-1 * var(--buzz-distance, 4px))) rotate(-0.3deg);
    }
    25% {
      transform: translateX(calc(var(--buzz-distance, 4px) * 0.7)) rotate(0.2deg);
    }
    30% {
      transform: translateX(calc(-1 * var(--buzz-distance, 4px) * 0.7)) rotate(-0.2deg);
    }
    35% {
      transform: translateX(calc(var(--buzz-distance, 4px) * 0.4)) rotate(0.1deg);
    }
    40% {
      transform: translateX(0) rotate(0deg);
    }
    100% {
      transform: translateX(0) rotate(0deg);
    }
  }

  @keyframes wag {
    0% {
      transform: rotate(0deg);
      animation-timing-function: cubic-bezier(0.2, 0, 0.6, 1);
    }
    12% {
      transform: rotate(var(--wag-angle, 12deg));
      animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }
    24% {
      transform: rotate(2deg);
      animation-timing-function: cubic-bezier(0.2, 0, 0.6, 1);
    }
    36% {
      transform: rotate(calc(var(--wag-angle, 12deg) * 0.85));
      animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }
    48% {
      transform: rotate(1deg);
      animation-timing-function: cubic-bezier(0.2, 0, 0.6, 1);
    }
    58% {
      transform: rotate(calc(var(--wag-angle, 12deg) * 0.6));
      animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }
    68% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(0deg);
    }
  }

  @keyframes float {
    0% {
      transform: translateY(0) translateX(0) rotate(0deg)
        scale(var(--float-squash-x, 1.02), var(--float-squash-y, 0.98));
      animation-timing-function: cubic-bezier(0.33, 0, 0.66, 0.33);
    }
    15% {
      transform: translateY(calc(-0.4 * var(--float-height, 6px))) translateX(var(--float-drift, 1px))
        rotate(var(--float-tilt, 1deg)) scale(1, 1);
      animation-timing-function: cubic-bezier(0.33, 0.66, 0.66, 1);
    }
    35% {
      transform: translateY(calc(-1 * var(--float-height, 6px))) translateX(0) rotate(0deg)
        scale(var(--float-stretch-x, 0.98), var(--float-stretch-y, 1.03));
      animation-timing-function: cubic-bezier(0.5, 0, 0.5, 0);
    }
    50% {
      transform: translateY(calc(-0.92 * var(--float-height, 6px))) translateX(calc(-0.5 * var(--float-drift, 1px)))
        rotate(calc(-0.5 * var(--float-tilt, 1deg))) scale(0.995, 1.01);
      animation-timing-function: cubic-bezier(0.33, 0, 0.66, 0.33);
    }
    70% {
      transform: translateY(calc(-0.3 * var(--float-height, 6px))) translateX(calc(-1 * var(--float-drift, 1px)))
        rotate(calc(-1 * var(--float-tilt, 1deg))) scale(1, 1);
      animation-timing-function: cubic-bezier(0.33, 0.66, 0.66, 1);
    }
    90% {
      transform: translateY(calc(0.05 * var(--float-height, 6px))) translateX(0) rotate(0deg)
        scale(var(--float-squash-x, 1.02), var(--float-squash-y, 0.98));
      animation-timing-function: cubic-bezier(0.33, 0, 0.66, 1);
    }
    100% {
      transform: translateY(0) translateX(0) rotate(0deg)
        scale(var(--float-squash-x, 1.02), var(--float-squash-y, 0.98));
    }
  }

  @keyframes swing {
    0% {
      transform: rotate(0deg);
      animation-timing-function: cubic-bezier(0.2, 0, 0.8, 1);
    }
    8% {
      transform: rotate(var(--swing-angle, 22deg));
      animation-timing-function: cubic-bezier(0.3, 0, 0.7, 1);
    }
    18% {
      transform: rotate(calc(-1 * var(--swing-angle, 22deg) * 0.85));
      animation-timing-function: cubic-bezier(0.3, 0, 0.7, 1);
    }
    28% {
      transform: rotate(calc(var(--swing-angle, 22deg) * 0.65));
      animation-timing-function: cubic-bezier(0.35, 0, 0.65, 1);
    }
    38% {
      transform: rotate(calc(-1 * var(--swing-angle, 22deg) * 0.45));
      animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
    }
    48% {
      transform: rotate(calc(var(--swing-angle, 22deg) * 0.25));
      animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
    }
    56% {
      transform: rotate(calc(-1 * var(--swing-angle, 22deg) * 0.1));
      animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
    }
    64% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(0deg);
    }
  }

  @keyframes jello {
    0% {
      transform: scale(1, 1);
      animation-timing-function: cubic-bezier(0.2, 0, 0.8, 1);
    }
    12% {
      transform: scale(var(--jello-scale-x, 1.15), calc(2 - var(--jello-scale-x, 1.15)));
      animation-timing-function: cubic-bezier(0.3, 0, 0.7, 1);
    }
    24% {
      transform: scale(calc(2 - var(--jello-scale-y, 1.12)), var(--jello-scale-y, 1.12));
      animation-timing-function: cubic-bezier(0.3, 0, 0.7, 1);
    }
    36% {
      transform: scale(
        calc(1 + (var(--jello-scale-x, 1.15) - 1) * 0.5),
        calc(2 - (1 + (var(--jello-scale-x, 1.15) - 1) * 0.5))
      );
      animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
    }
    48% {
      transform: scale(
        calc(2 - (1 + (var(--jello-scale-y, 1.12) - 1) * 0.3)),
        calc(1 + (var(--jello-scale-y, 1.12) - 1) * 0.3)
      );
      animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
    }
    58% {
      transform: scale(1.02, 0.98);
      animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }
    68% {
      transform: scale(1, 1);
    }
    100% {
      transform: scale(1, 1);
    }
  }

  /* #endregion */
`;var bs="",wi="";function gn(){return bs.replace(/\/$/,"")}function ys(t){wi=t}function wn(){if(!wi){let t=document.querySelector("[data-fa-kit-code]");t&&ys(t.getAttribute("data-fa-kit-code")||"")}return wi}var vn="7.3.0";function xs(t,e,o){let r="solid";return e==="chisel"&&(r="chisel-regular"),e==="etch"&&(r="etch-solid"),e==="graphite"&&(r="graphite-thin"),e==="jelly"&&(r="jelly-regular",o==="duo-regular"&&(r="jelly-duo-regular"),o==="fill-regular"&&(r="jelly-fill-regular")),e==="jelly-duo"&&(r="jelly-duo-regular"),e==="jelly-fill"&&(r="jelly-fill-regular"),e==="notdog"&&(o==="solid"&&(r="notdog-solid"),o==="duo-solid"&&(r="notdog-duo-solid")),e==="notdog-duo"&&(r="notdog-duo-solid"),e==="slab"&&((o==="solid"||o==="regular")&&(r="slab-regular"),o==="press-regular"&&(r="slab-press-regular")),e==="slab-press"&&(r="slab-press-regular"),e==="slab-duo"&&(r="slab-duo-regular"),e==="slab-press-duo"&&(r="slab-press-duo-regular"),e==="thumbprint"&&(r="thumbprint-light"),e==="utility"&&(r="utility-semibold"),e==="utility-duo"&&(r="utility-duo-semibold"),e==="utility-fill"&&(r="utility-fill-semibold"),e==="whiteboard"&&(r="whiteboard-semibold"),e==="mosaic"&&(r="mosaic-solid"),e==="pixel"&&(r="pixel-regular"),e==="vellum"&&(r="vellum-solid"),e==="classic"&&(o==="thin"&&(r="thin"),o==="light"&&(r="light"),o==="regular"&&(r="regular"),o==="solid"&&(r="solid")),e==="duotone"&&(o==="thin"&&(r="duotone-thin"),o==="light"&&(r="duotone-light"),o==="regular"&&(r="duotone-regular"),o==="solid"&&(r="duotone")),e==="sharp"&&(o==="thin"&&(r="sharp-thin"),o==="light"&&(r="sharp-light"),o==="regular"&&(r="sharp-regular"),o==="solid"&&(r="sharp-solid")),e==="sharp-duotone"&&(o==="thin"&&(r="sharp-duotone-thin"),o==="light"&&(r="sharp-duotone-light"),o==="regular"&&(r="sharp-duotone-regular"),o==="solid"&&(r="sharp-duotone-solid")),e==="brands"&&(r="brands"),r}function Cs(t,e,o){let r=xs(t,e,o),i=gn();if(i)return`${i}/${r}/${t}.svg`;let a=wn();return a.length>0?`https://ka-p.fontawesome.com/releases/v${vn}/svgs/${r}/${t}.svg?token=${encodeURIComponent(a)}`:`https://ka-f.fontawesome.com/releases/v${vn}/svgs/${r}/${t}.svg`}var _s={name:"default",resolver:(t,e="classic",o="solid")=>Cs(t,e,o),mutator:(t,e)=>{if(t.hasAttribute("fill")||t.setAttribute("fill","currentColor"),e?.family&&!t.hasAttribute("data-duotone-initialized")){let{family:o,variant:r}=e;if(o==="duotone"||o==="sharp-duotone"||o==="notdog-duo"||o==="notdog"&&r==="duo-solid"||o==="jelly-duo"||o==="jelly"&&r==="duo-regular"||o==="utility-duo"||o==="slab-duo"||o==="slab-press-duo"||o==="thumbprint"){let i=[...t.querySelectorAll("path")],a=i.find(l=>!l.hasAttribute("opacity")),n=i.find(l=>l.hasAttribute("opacity"));if(!a||!n)return;if(a.setAttribute("data-duotone-primary",""),n.setAttribute("data-duotone-secondary",""),e.swapOpacity&&a&&n){let l=n.getAttribute("opacity")||"0.4";a.style.setProperty("--path-opacity",l),n.style.setProperty("--path-opacity","1")}t.setAttribute("data-duotone-initialized","")}}}},bn=_s;function Ts(t){return`data:image/svg+xml,${encodeURIComponent(t)}`}var vi={solid:{backward:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M236.3 107.1C247.9 96 265 92.9 279.7 99.2C294.4 105.5 304 120 304 136L304 272.3L476.3 107.2C487.9 96 505 92.9 519.7 99.2C534.4 105.5 544 120 544 136L544 504C544 520 534.4 534.5 519.7 540.8C505 547.1 487.9 544 476.3 532.9L304 367.7L304 504C304 520 294.4 534.5 279.7 540.8C265 547.1 247.9 544 236.3 532.9L44.3 348.9C36.5 341.3 32 330.9 32 320C32 309.1 36.5 298.7 44.3 291.1L236.3 107.1z"/></svg>',"backward-step":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M491 100.8C478.1 93.8 462.3 94.5 450 102.6L192 272.1L192 128C192 110.3 177.7 96 160 96C142.3 96 128 110.3 128 128L128 512C128 529.7 142.3 544 160 544C177.7 544 192 529.7 192 512L192 367.9L450 537.5C462.3 545.6 478 546.3 491 539.3C504 532.3 512 518.8 512 504.1L512 136.1C512 121.4 503.9 107.9 491 100.9z"/></svg>',"angles-left":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path d="M77.3 256 214.7 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256zm192 0L406.7 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L269.3 256z"/></svg>',"angles-right":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path d="M434.7 256 297.3 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L434.7 256zm-192 0L105.3 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256z"/></svg>',check:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path d="M434.8 70.1c14.3 10.4 17.5 30.4 7.1 44.7l-256 352c-5.5 7.6-14 12.3-23.4 13.1s-18.5-2.7-25.1-9.3l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l101.5 101.5 234-321.7c10.4-14.3 30.4-17.5 44.7-7.1z"/></svg>',"chevron-down":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path d="M201.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 338.7 54.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"/></svg>',"chevron-left":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z"/></svg>',"chevron-right":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path d="M311.1 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L243.2 256 73.9 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"/></svg>',circle:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path d="M0 256a256 256 0 1 1 512 0 256 256 0 1 1 -512 0z"/></svg>',"closed-captioning":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M64 192C64 156.7 92.7 128 128 128L512 128C547.3 128 576 156.7 576 192L576 448C576 483.3 547.3 512 512 512L128 512C92.7 512 64 483.3 64 448L64 192zM216 272L248 272C252.4 272 256 275.6 256 280C256 293.3 266.7 304 280 304C293.3 304 304 293.3 304 280C304 249.1 278.9 224 248 224L216 224C185.1 224 160 249.1 160 280L160 360C160 390.9 185.1 416 216 416L248 416C278.9 416 304 390.9 304 360C304 346.7 293.3 336 280 336C266.7 336 256 346.7 256 360C256 364.4 252.4 368 248 368L216 368C211.6 368 208 364.4 208 360L208 280C208 275.6 211.6 272 216 272zM384 280C384 275.6 387.6 272 392 272L424 272C428.4 272 432 275.6 432 280C432 293.3 442.7 304 456 304C469.3 304 480 293.3 480 280C480 249.1 454.9 224 424 224L392 224C361.1 224 336 249.1 336 280L336 360C336 390.9 361.1 416 392 416L424 416C454.9 416 480 390.9 480 360C480 346.7 469.3 336 456 336C442.7 336 432 346.7 432 360C432 364.4 428.4 368 424 368L392 368C387.6 368 384 364.4 384 360L384 280z"/></svg>',"closed-captioning-slash":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M39 39.1C48.4 29.7 63.6 29.7 72.9 39.1L161.8 128L512 128C547.3 128 576 156.7 576 192L576 448C576 473.5 561.1 495.4 539.6 505.8L601 567.1C610.4 576.5 610.4 591.7 601 601C591.6 610.3 576.4 610.4 567.1 601L39 73.1C29.7 63.7 29.7 48.5 39 39.1zM384 350.1L384 279.9C384 275.5 387.6 271.9 392 271.9L424 271.9C428.4 271.9 432 275.5 432 279.9C432 293.2 442.7 303.9 456 303.9C469.3 303.9 480 293.2 480 279.9C480 249 454.9 223.9 424 223.9L392 223.9C361.1 223.9 336 249 336 279.9L336 302.1L384 350.1zM445.5 411.6C465.7 403.2 480 383.2 480 359.9C480 346.6 469.3 335.9 456 335.9C442.7 335.9 432 346.6 432 359.9C432 364.3 428.4 367.9 424 367.9L401.8 367.9L445.5 411.6zM162.3 264.1C160.8 269.1 160 274.5 160 280L160 360C160 390.9 185.1 416 216 416L248 416C266.1 416 282.1 407.5 292.4 394.2L410.2 512L128 512C92.7 512 64 483.3 64 448L64 192C64 184.2 65.4 176.7 68 169.8L162.3 264.1zM256.1 357.9C256 358.6 256 359.3 256 360C256 364.4 252.4 368 248 368L216 368C211.6 368 208 364.4 208 360L208 309.8L256.1 357.9z"/></svg>',compress:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M160 64c0-17.7-14.3-32-32-32S96 46.3 96 64l0 64-64 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l96 0c17.7 0 32-14.3 32-32l0-96zM32 320c-17.7 0-32 14.3-32 32s14.3 32 32 32l64 0 0 64c0 17.7 14.3 32 32 32s32-14.3 32-32l0-96c0-17.7-14.3-32-32-32l-96 0zM352 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 96c0 17.7 14.3 32 32 32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0 0-64zM320 320c-17.7 0-32 14.3-32 32l0 96c0 17.7 14.3 32 32 32s32-14.3 32-32l0-64 64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0z"/></svg>',ellipsis:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M96 320C96 289.1 121.1 264 152 264C182.9 264 208 289.1 208 320C208 350.9 182.9 376 152 376C121.1 376 96 350.9 96 320zM264 320C264 289.1 289.1 264 320 264C350.9 264 376 289.1 376 320C376 350.9 350.9 376 320 376C289.1 376 264 350.9 264 320zM488 264C518.9 264 544 289.1 544 320C544 350.9 518.9 376 488 376C457.1 376 432 350.9 432 320C432 289.1 457.1 264 488 264z"/></svg>',"ellipsis-vertical":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M320 208C289.1 208 264 182.9 264 152C264 121.1 289.1 96 320 96C350.9 96 376 121.1 376 152C376 182.9 350.9 208 320 208zM320 432C350.9 432 376 457.1 376 488C376 518.9 350.9 544 320 544C289.1 544 264 518.9 264 488C264 457.1 289.1 432 320 432zM376 320C376 350.9 350.9 376 320 376C289.1 376 264 350.9 264 320C264 289.1 289.1 264 320 264C350.9 264 376 289.1 376 320z"/></svg>',expand:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M128 96C110.3 96 96 110.3 96 128L96 224C96 241.7 110.3 256 128 256C145.7 256 160 241.7 160 224L160 160L224 160C241.7 160 256 145.7 256 128C256 110.3 241.7 96 224 96L128 96zM160 416C160 398.3 145.7 384 128 384C110.3 384 96 398.3 96 416L96 512C96 529.7 110.3 544 128 544L224 544C241.7 544 256 529.7 256 512C256 494.3 241.7 480 224 480L160 480L160 416zM416 96C398.3 96 384 110.3 384 128C384 145.7 398.3 160 416 160L480 160L480 224C480 241.7 494.3 256 512 256C529.7 256 544 241.7 544 224L544 128C544 110.3 529.7 96 512 96L416 96zM544 416C544 398.3 529.7 384 512 384C494.3 384 480 398.3 480 416L480 480L416 480C398.3 480 384 494.3 384 512C384 529.7 398.3 544 416 544L512 544C529.7 544 544 529.7 544 512L544 416z"/></svg>',eyedropper:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path d="M341.6 29.2l-101.6 101.6-9.4-9.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-9.4-9.4 101.6-101.6c39-39 39-102.2 0-141.1s-102.2-39-141.1 0zM55.4 323.3c-15 15-23.4 35.4-23.4 56.6l0 42.4-26.6 39.9c-8.5 12.7-6.8 29.6 4 40.4s27.7 12.5 40.4 4l39.9-26.6 42.4 0c21.2 0 41.6-8.4 56.6-23.4l109.4-109.4-45.3-45.3-109.4 109.4c-3 3-7.1 4.7-11.3 4.7l-36.1 0 0-36.1c0-4.2 1.7-8.3 4.7-11.3l109.4-109.4-45.3-45.3-109.4 109.4z"/></svg>',forward:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M403.7 107.1C392.1 96 375 92.9 360.3 99.2C345.6 105.5 336 120 336 136L336 272.3L163.7 107.2C152.1 96 135 92.9 120.3 99.2C105.6 105.5 96 120 96 136L96 504C96 520 105.6 534.5 120.3 540.8C135 547.1 152.1 544 163.7 532.9L336 367.7L336 504C336 520 345.6 534.5 360.3 540.8C375 547.1 392.1 544 403.7 532.9L595.7 348.9C603.6 341.4 608 330.9 608 320C608 309.1 603.5 298.7 595.7 291.1L403.7 107.1z"/></svg>',file:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free 7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M192 64C156.7 64 128 92.7 128 128L128 512C128 547.3 156.7 576 192 576L448 576C483.3 576 512 547.3 512 512L512 234.5C512 217.5 505.3 201.2 493.3 189.2L386.7 82.7C374.7 70.7 358.5 64 341.5 64L192 64zM453.5 240L360 240C346.7 240 336 229.3 336 216L336 122.5L453.5 240z"/></svg>',"file-audio":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free 7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M128 128C128 92.7 156.7 64 192 64L341.5 64C358.5 64 374.8 70.7 386.8 82.7L493.3 189.3C505.3 201.3 512 217.6 512 234.6L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 128zM336 122.5L336 216C336 229.3 346.7 240 360 240L453.5 240L336 122.5zM389.8 307.7C380.7 301.4 368.3 303.6 362 312.7C355.7 321.8 357.9 334.2 367 340.5C390.9 357.2 406.4 384.8 406.4 416C406.4 447.2 390.8 474.9 367 491.5C357.9 497.8 355.7 510.3 362 519.3C368.3 528.3 380.8 530.6 389.8 524.3C423.9 500.5 446.4 460.8 446.4 416C446.4 371.2 424 331.5 389.8 307.7zM208 376C199.2 376 192 383.2 192 392L192 440C192 448.8 199.2 456 208 456L232 456L259.2 490C262.2 493.8 266.8 496 271.7 496L272 496C280.8 496 288 488.8 288 480L288 352C288 343.2 280.8 336 272 336L271.7 336C266.8 336 262.2 338.2 259.2 342L232 376L208 376zM336 448.2C336 458.9 346.5 466.4 354.9 459.8C367.8 449.5 376 433.7 376 416C376 398.3 367.8 382.5 354.9 372.2C346.5 365.5 336 373.1 336 383.8L336 448.3z"/></svg>',"file-code":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free 7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M128 128C128 92.7 156.7 64 192 64L341.5 64C358.5 64 374.8 70.7 386.8 82.7L493.3 189.3C505.3 201.3 512 217.6 512 234.6L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 128zM336 122.5L336 216C336 229.3 346.7 240 360 240L453.5 240L336 122.5zM282.2 359.6C290.8 349.5 289.7 334.4 279.6 325.8C269.5 317.2 254.4 318.3 245.8 328.4L197.8 384.4C190.1 393.4 190.1 406.6 197.8 415.6L245.8 471.6C254.4 481.7 269.6 482.8 279.6 474.2C289.6 465.6 290.8 450.4 282.2 440.4L247.6 400L282.2 359.6zM394.2 328.4C385.6 318.3 370.4 317.2 360.4 325.8C350.4 334.4 349.2 349.6 357.8 359.6L392.4 400L357.8 440.4C349.2 450.5 350.3 465.6 360.4 474.2C370.5 482.8 385.6 481.7 394.2 471.6L442.2 415.6C449.9 406.6 449.9 393.4 442.2 384.4L394.2 328.4z"/></svg>',"file-excel":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free 7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M128 128C128 92.7 156.7 64 192 64L341.5 64C358.5 64 374.8 70.7 386.8 82.7L493.3 189.3C505.3 201.3 512 217.6 512 234.6L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 128zM336 122.5L336 216C336 229.3 346.7 240 360 240L453.5 240L336 122.5zM292 330.7C284.6 319.7 269.7 316.7 258.7 324C247.7 331.3 244.7 346.3 252 357.3L291.2 416L252 474.7C244.6 485.7 247.6 500.6 258.7 508C269.8 515.4 284.6 512.4 292 501.3L320 459.3L348 501.3C355.4 512.3 370.3 515.3 381.3 508C392.3 500.7 395.3 485.7 388 474.7L348.8 416L388 357.3C395.4 346.3 392.4 331.4 381.3 324C370.2 316.6 355.4 319.6 348 330.7L320 372.7L292 330.7z"/></svg>',"file-image":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free 7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M128 128C128 92.7 156.7 64 192 64L341.5 64C358.5 64 374.8 70.7 386.8 82.7L493.3 189.3C505.3 201.3 512 217.6 512 234.6L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 128zM336 122.5L336 216C336 229.3 346.7 240 360 240L453.5 240L336 122.5zM256 320C256 302.3 241.7 288 224 288C206.3 288 192 302.3 192 320C192 337.7 206.3 352 224 352C241.7 352 256 337.7 256 320zM220.6 512L419.4 512C435.2 512 448 499.2 448 483.4C448 476.1 445.2 469 440.1 463.7L343.3 361.9C337.3 355.6 328.9 352 320.1 352L319.8 352C311 352 302.7 355.6 296.6 361.9L199.9 463.7C194.8 469 192 476.1 192 483.4C192 499.2 204.8 512 220.6 512z"/></svg>',"file-pdf":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free 7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M128 64C92.7 64 64 92.7 64 128L64 512C64 547.3 92.7 576 128 576L208 576L208 464C208 428.7 236.7 400 272 400L448 400L448 234.5C448 217.5 441.3 201.2 429.3 189.2L322.7 82.7C310.7 70.7 294.5 64 277.5 64L128 64zM389.5 240L296 240C282.7 240 272 229.3 272 216L272 122.5L389.5 240zM272 444C261 444 252 453 252 464L252 592C252 603 261 612 272 612C283 612 292 603 292 592L292 564L304 564C337.1 564 364 537.1 364 504C364 470.9 337.1 444 304 444L272 444zM304 524L292 524L292 484L304 484C315 484 324 493 324 504C324 515 315 524 304 524zM400 444C389 444 380 453 380 464L380 592C380 603 389 612 400 612L432 612C460.7 612 484 588.7 484 560L484 496C484 467.3 460.7 444 432 444L400 444zM420 572L420 484L432 484C438.6 484 444 489.4 444 496L444 560C444 566.6 438.6 572 432 572L420 572zM508 464L508 592C508 603 517 612 528 612C539 612 548 603 548 592L548 548L576 548C587 548 596 539 596 528C596 517 587 508 576 508L548 508L548 484L576 484C587 484 596 475 596 464C596 453 587 444 576 444L528 444C517 444 508 453 508 464z"/></svg>',"file-powerpoint":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free 7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M128 128C128 92.7 156.7 64 192 64L341.5 64C358.5 64 374.8 70.7 386.8 82.7L493.3 189.3C505.3 201.3 512 217.6 512 234.6L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 128zM336 122.5L336 216C336 229.3 346.7 240 360 240L453.5 240L336 122.5zM280 320C266.7 320 256 330.7 256 344L256 488C256 501.3 266.7 512 280 512C293.3 512 304 501.3 304 488L304 464L328 464C367.8 464 400 431.8 400 392C400 352.2 367.8 320 328 320L280 320zM328 416L304 416L304 368L328 368C341.3 368 352 378.7 352 392C352 405.3 341.3 416 328 416z"/></svg>',"file-video":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free 7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M128 128C128 92.7 156.7 64 192 64L341.5 64C358.5 64 374.8 70.7 386.8 82.7L493.3 189.3C505.3 201.3 512 217.6 512 234.6L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 128zM336 122.5L336 216C336 229.3 346.7 240 360 240L453.5 240L336 122.5zM208 368L208 464C208 481.7 222.3 496 240 496L336 496C353.7 496 368 481.7 368 464L368 440L403 475C406.2 478.2 410.5 480 415 480C424.4 480 432 472.4 432 463L432 368.9C432 359.5 424.4 351.9 415 351.9C410.5 351.9 406.2 353.7 403 356.9L368 391.9L368 367.9C368 350.2 353.7 335.9 336 335.9L240 335.9C222.3 335.9 208 350.2 208 367.9z"/></svg>',"file-word":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free 7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M128 128C128 92.7 156.7 64 192 64L341.5 64C358.5 64 374.8 70.7 386.8 82.7L493.3 189.3C505.3 201.3 512 217.6 512 234.6L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 128zM336 122.5L336 216C336 229.3 346.7 240 360 240L453.5 240L336 122.5zM263.4 338.8C260.5 325.9 247.7 317.7 234.8 320.6C221.9 323.5 213.7 336.3 216.6 349.2L248.6 493.2C250.9 503.7 260 511.4 270.8 512C281.6 512.6 291.4 505.9 294.8 495.6L320 419.9L345.2 495.6C348.6 505.8 358.4 512.5 369.2 512C380 511.5 389.1 503.8 391.4 493.2L423.4 349.2C426.3 336.3 418.1 323.4 405.2 320.6C392.3 317.8 379.4 325.9 376.6 338.8L363.4 398.2L342.8 336.4C339.5 326.6 330.4 320 320 320C309.6 320 300.5 326.6 297.2 336.4L276.6 398.2L263.4 338.8z"/></svg>',"file-zipper":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free 7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M128 128C128 92.7 156.7 64 192 64L341.5 64C358.5 64 374.8 70.7 386.8 82.7L493.3 189.3C505.3 201.3 512 217.6 512 234.6L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 128zM336 122.5L336 216C336 229.3 346.7 240 360 240L453.5 240L336 122.5zM192 136C192 149.3 202.7 160 216 160L264 160C277.3 160 288 149.3 288 136C288 122.7 277.3 112 264 112L216 112C202.7 112 192 122.7 192 136zM192 232C192 245.3 202.7 256 216 256L264 256C277.3 256 288 245.3 288 232C288 218.7 277.3 208 264 208L216 208C202.7 208 192 218.7 192 232zM256 304L224 304C206.3 304 192 318.3 192 336L192 384C192 410.5 213.5 432 240 432C266.5 432 288 410.5 288 384L288 336C288 318.3 273.7 304 256 304zM240 368C248.8 368 256 375.2 256 384C256 392.8 248.8 400 240 400C231.2 400 224 392.8 224 384C224 375.2 231.2 368 240 368z"/></svg>',"forward-step":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M21 36.8c12.9-7 28.7-6.3 41 1.8L320 208.1 320 64c0-17.7 14.3-32 32-32s32 14.3 32 32l0 384c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-144.1-258 169.6c-12.3 8.1-28 8.8-41 1.8S0 454.7 0 440L0 72C0 57.3 8.1 43.8 21 36.8z"/></svg>',gauge:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M0 256a256 256 0 1 1 512 0 256 256 0 1 1 -512 0zm320 96c0-26.9-16.5-49.9-40-59.3L280 120c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 172.7c-23.5 9.5-40 32.5-40 59.3 0 35.3 28.7 64 64 64s64-28.7 64-64zM144 176a32 32 0 1 0 0-64 32 32 0 1 0 0 64zm-16 80a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm288 32a32 32 0 1 0 0-64 32 32 0 1 0 0 64zM400 144a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"/></svg>',gear:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M259.1 73.5C262.1 58.7 275.2 48 290.4 48L350.2 48C365.4 48 378.5 58.7 381.5 73.5L396 143.5C410.1 149.5 423.3 157.2 435.3 166.3L503.1 143.8C517.5 139 533.3 145 540.9 158.2L570.8 210C578.4 223.2 575.7 239.8 564.3 249.9L511 297.3C511.9 304.7 512.3 312.3 512.3 320C512.3 327.7 511.8 335.3 511 342.7L564.4 390.2C575.8 400.3 578.4 417 570.9 430.1L541 481.9C533.4 495 517.6 501.1 503.2 496.3L435.4 473.8C423.3 482.9 410.1 490.5 396.1 496.6L381.7 566.5C378.6 581.4 365.5 592 350.4 592L290.6 592C275.4 592 262.3 581.3 259.3 566.5L244.9 496.6C230.8 490.6 217.7 482.9 205.6 473.8L137.5 496.3C123.1 501.1 107.3 495.1 99.7 481.9L69.8 430.1C62.2 416.9 64.9 400.3 76.3 390.2L129.7 342.7C128.8 335.3 128.4 327.7 128.4 320C128.4 312.3 128.9 304.7 129.7 297.3L76.3 249.8C64.9 239.7 62.3 223 69.8 209.9L99.7 158.1C107.3 144.9 123.1 138.9 137.5 143.7L205.3 166.2C217.4 157.1 230.6 149.5 244.6 143.4L259.1 73.5zM320.3 400C364.5 399.8 400.2 363.9 400 319.7C399.8 275.5 363.9 239.8 319.7 240C275.5 240.2 239.8 276.1 240 320.3C240.2 364.5 276.1 400.2 320.3 400z"/></svg>',"grip-vertical":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path d="M128 40c0-22.1-17.9-40-40-40L40 0C17.9 0 0 17.9 0 40L0 88c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48zm0 192c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48zM0 424l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40zM320 40c0-22.1-17.9-40-40-40L232 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48zM192 232l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40zM320 424c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48z"/></svg>',indeterminate:'<svg part="indeterminate-icon" class="icon" viewBox="0 0 16 16"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round"><g stroke="currentColor" stroke-width="2"><g transform="translate(2.285714 6.857143)"><path d="M10.2857143,1.14285714 L1.14285714,1.14285714"/></g></g></g></svg>',minus:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path d="M0 256c0-17.7 14.3-32 32-32l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 288c-17.7 0-32-14.3-32-32z"/></svg>',pause:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path d="M48 32C21.5 32 0 53.5 0 80L0 432c0 26.5 21.5 48 48 48l64 0c26.5 0 48-21.5 48-48l0-352c0-26.5-21.5-48-48-48L48 32zm224 0c-26.5 0-48 21.5-48 48l0 352c0 26.5 21.5 48 48 48l64 0c26.5 0 48-21.5 48-48l0-352c0-26.5-21.5-48-48-48l-64 0z"/></svg>',"picture-in-picture":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M448 32c35.3 0 64 28.7 64 64l0 112-64 0 0-112-384 0 0 320 144 0 0 64-144 0-6.5-.3c-30.1-3.1-54.1-27-57.1-57.1L0 416 0 96C0 62.9 25.2 35.6 57.5 32.3L64 32 448 32zm16 224c26.5 0 48 21.5 48 48l0 128c0 26.5-21.5 48-48 48l-160 0c-26.5 0-48-21.5-48-48l0-128c0-26.5 21.5-48 48-48l160 0z"/></svg>',play:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path d="M91.2 36.9c-12.4-6.8-27.4-6.5-39.6 .7S32 57.9 32 72l0 368c0 14.1 7.5 27.2 19.6 34.4s27.2 7.5 39.6 .7l336-184c12.8-7 20.8-20.5 20.8-35.1s-8-28.1-20.8-35.1l-336-184z"/></svg>',"play-circle":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M0 256a256 256 0 1 1 512 0 256 256 0 1 1 -512 0zM188.3 147.1c-7.6 4.2-12.3 12.3-12.3 20.9l0 176c0 8.7 4.7 16.7 12.3 20.9s16.8 4.1 24.3-.5l144-88c7.1-4.4 11.5-12.1 11.5-20.5s-4.4-16.1-11.5-20.5l-144-88c-7.4-4.5-16.7-4.7-24.3-.5z"/></svg>',plus:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free 7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M352 128C352 110.3 337.7 96 320 96C302.3 96 288 110.3 288 128L288 288L128 288C110.3 288 96 302.3 96 320C96 337.7 110.3 352 128 352L288 352L288 512C288 529.7 302.3 544 320 544C337.7 544 352 529.7 352 512L352 352L512 352C529.7 352 544 337.7 544 320C544 302.3 529.7 288 512 288L352 288L352 128z"/></svg>',star:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path d="M309.5-18.9c-4.1-8-12.4-13.1-21.4-13.1s-17.3 5.1-21.4 13.1L193.1 125.3 33.2 150.7c-8.9 1.4-16.3 7.7-19.1 16.3s-.5 18 5.8 24.4l114.4 114.5-25.2 159.9c-1.4 8.9 2.3 17.9 9.6 23.2s16.9 6.1 25 2L288.1 417.6 432.4 491c8 4.1 17.7 3.3 25-2s11-14.2 9.6-23.2L441.7 305.9 556.1 191.4c6.4-6.4 8.6-15.8 5.8-24.4s-10.1-14.9-19.1-16.3L383 125.3 309.5-18.9z"/></svg>',upload:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free 7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M352 173.3L352 384C352 401.7 337.7 416 320 416C302.3 416 288 401.7 288 384L288 173.3L246.6 214.7C234.1 227.2 213.8 227.2 201.3 214.7C188.8 202.2 188.8 181.9 201.3 169.4L297.3 73.4C309.8 60.9 330.1 60.9 342.6 73.4L438.6 169.4C451.1 181.9 451.1 202.2 438.6 214.7C426.1 227.2 405.8 227.2 393.3 214.7L352 173.3zM320 464C364.2 464 400 428.2 400 384L480 384C515.3 384 544 412.7 544 448L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 448C96 412.7 124.7 384 160 384L240 384C240 428.2 275.8 464 320 464zM464 488C477.3 488 488 477.3 488 464C488 450.7 477.3 440 464 440C450.7 440 440 450.7 440 464C440 477.3 450.7 488 464 488z"/></svg>',user:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path d="M224 248a120 120 0 1 0 0-240 120 120 0 1 0 0 240zm-29.7 56C95.8 304 16 383.8 16 482.3 16 498.7 29.3 512 45.7 512l356.6 0c16.4 0 29.7-13.3 29.7-29.7 0-98.5-79.8-178.3-178.3-178.3l-59.4 0z"/></svg>',volume:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M48 352l48 0 134.1 119.2c6.4 5.7 14.6 8.8 23.1 8.8 19.2 0 34.8-15.6 34.8-34.8l0-378.4c0-19.2-15.6-34.8-34.8-34.8-8.5 0-16.7 3.1-23.1 8.8L96 160 48 160c-26.5 0-48 21.5-48 48l0 96c0 26.5 21.5 48 48 48zM441.1 107c-10.3-8.4-25.4-6.8-33.8 3.5s-6.8 25.4 3.5 33.8C443.3 170.7 464 210.9 464 256s-20.7 85.3-53.2 111.8c-10.3 8.4-11.8 23.5-3.5 33.8s23.5 11.8 33.8 3.5c43.2-35.2 70.9-88.9 70.9-149s-27.7-113.8-70.9-149zm-60.5 74.5c-10.3-8.4-25.4-6.8-33.8 3.5s-6.8 25.4 3.5 33.8C361.1 227.6 368 241 368 256s-6.9 28.4-17.7 37.3c-10.3 8.4-11.8 23.5-3.5 33.8s23.5 11.8 33.8 3.5C402.1 312.9 416 286.1 416 256s-13.9-56.9-35.5-74.5z"/></svg>',"volume-low":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M48 352l48 0 134.1 119.2c6.4 5.7 14.6 8.8 23.1 8.8 19.2 0 34.8-15.6 34.8-34.8l0-378.4c0-19.2-15.6-34.8-34.8-34.8-8.5 0-16.7 3.1-23.1 8.8L96 160 48 160c-26.5 0-48 21.5-48 48l0 96c0 26.5 21.5 48 48 48zM380.6 181.5c-10.3-8.4-25.4-6.8-33.8 3.5s-6.8 25.4 3.5 33.8C361.1 227.6 368 241 368 256s-6.9 28.4-17.7 37.3c-10.3 8.4-11.8 23.5-3.5 33.8s23.5 11.8 33.8 3.5C402.1 312.9 416 286.1 416 256s-13.9-56.9-35.5-74.5z"/></svg>',"volume-xmark":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M48 352l48 0 134.1 119.2c6.4 5.7 14.6 8.8 23.1 8.8 19.2 0 34.8-15.6 34.8-34.8l0-378.4c0-19.2-15.6-34.8-34.8-34.8-8.5 0-16.7 3.1-23.1 8.8L96 160 48 160c-26.5 0-48 21.5-48 48l0 96c0 26.5 21.5 48 48 48zM367 175c-9.4 9.4-9.4 24.6 0 33.9l47 47-47 47c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l47-47 47 47c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-47-47 47-47c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-47 47-47-47c-9.4-9.4-24.6-9.4-33.9 0z"/></svg>',xmark:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path d="M55.1 73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L147.2 256 9.9 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192.5 301.3 329.9 438.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.8 256 375.1 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192.5 210.7 55.1 73.4z"/></svg>'},regular:{calendar:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M216 64C229.3 64 240 74.7 240 88L240 128L400 128L400 88C400 74.7 410.7 64 424 64C437.3 64 448 74.7 448 88L448 128L480 128C515.3 128 544 156.7 544 192L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 192C96 156.7 124.7 128 160 128L192 128L192 88C192 74.7 202.7 64 216 64zM216 176L160 176C151.2 176 144 183.2 144 192L144 240L496 240L496 192C496 183.2 488.8 176 480 176L216 176zM144 288L144 480C144 488.8 151.2 496 160 496L480 496C488.8 496 496 488.8 496 480L496 288L144 288z"/></svg>',"circle-question":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path d="M464 256a208 208 0 1 0 -416 0 208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0 256 256 0 1 1 -512 0zm256-80c-17.7 0-32 14.3-32 32 0 13.3-10.7 24-24 24s-24-10.7-24-24c0-44.2 35.8-80 80-80s80 35.8 80 80c0 47.2-36 67.2-56 74.5l0 3.8c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-8.1c0-20.5 14.8-35.2 30.1-40.2 6.4-2.1 13.2-5.5 18.2-10.3 4.3-4.2 7.7-10 7.7-19.6 0-17.7-14.3-32-32-32zM224 368a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"/></svg>',"circle-xmark":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464a256 256 0 1 0 0-512 256 256 0 1 0 0 512zM167 167c-9.4 9.4-9.4 24.6 0 33.9l55 55-55 55c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l55-55 55 55c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-55-55 55-55c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-55 55-55-55c-9.4-9.4-24.6-9.4-33.9 0z"/></svg>',clock:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M528 320C528 434.9 434.9 528 320 528C205.1 528 112 434.9 112 320C112 205.1 205.1 112 320 112C434.9 112 528 205.1 528 320zM64 320C64 461.4 178.6 576 320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320zM296 184L296 320C296 328 300 335.5 306.7 340L402.7 404C413.7 411.4 428.6 408.4 436 397.3C443.4 386.2 440.4 371.4 429.3 364L344 307.2L344 184C344 170.7 333.3 160 320 160C306.7 160 296 170.7 296 184z"/></svg>',copy:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path d="M384 336l-192 0c-8.8 0-16-7.2-16-16l0-256c0-8.8 7.2-16 16-16l133.5 0c4.2 0 8.3 1.7 11.3 4.7l58.5 58.5c3 3 4.7 7.1 4.7 11.3L400 320c0 8.8-7.2 16-16 16zM192 384l192 0c35.3 0 64-28.7 64-64l0-197.5c0-17-6.7-33.3-18.7-45.3L370.7 18.7C358.7 6.7 342.5 0 325.5 0L192 0c-35.3 0-64 28.7-64 64l0 256c0 35.3 28.7 64 64 64zM64 128c-35.3 0-64 28.7-64 64L0 448c0 35.3 28.7 64 64 64l192 0c35.3 0 64-28.7 64-64l0-16-48 0 0 16c0 8.8-7.2 16-16 16L64 464c-8.8 0-16-7.2-16-16l0-256c0-8.8 7.2-16 16-16l16 0 0-48-16 0z"/></svg>',eye:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path d="M288 80C222.8 80 169.2 109.6 128.1 147.7 89.6 183.5 63 226 49.4 256 63 286 89.6 328.5 128.1 364.3 169.2 402.4 222.8 432 288 432s118.8-29.6 159.9-67.7C486.4 328.5 513 286 526.6 256 513 226 486.4 183.5 447.9 147.7 406.8 109.6 353.2 80 288 80zM95.4 112.6C142.5 68.8 207.2 32 288 32s145.5 36.8 192.6 80.6c46.8 43.5 78.1 95.4 93 131.1 3.3 7.9 3.3 16.7 0 24.6-14.9 35.7-46.2 87.7-93 131.1-47.1 43.7-111.8 80.6-192.6 80.6S142.5 443.2 95.4 399.4c-46.8-43.5-78.1-95.4-93-131.1-3.3-7.9-3.3-16.7 0-24.6 14.9-35.7 46.2-87.7 93-131.1zM288 336c44.2 0 80-35.8 80-80 0-29.6-16.1-55.5-40-69.3-1.4 59.7-49.6 107.9-109.3 109.3 13.8 23.9 39.7 40 69.3 40zm-79.6-88.4c2.5 .3 5 .4 7.6 .4 35.3 0 64-28.7 64-64 0-2.6-.2-5.1-.4-7.6-37.4 3.9-67.2 33.7-71.1 71.1zm45.6-115c10.8-3 22.2-4.5 33.9-4.5 8.8 0 17.5 .9 25.8 2.6 .3 .1 .5 .1 .8 .2 57.9 12.2 101.4 63.7 101.4 125.2 0 70.7-57.3 128-128 128-61.6 0-113-43.5-125.2-101.4-1.8-8.6-2.8-17.5-2.8-26.6 0-11 1.4-21.8 4-32 .2-.7 .3-1.3 .5-1.9 11.9-43.4 46.1-77.6 89.5-89.5z"/></svg>',"eye-slash":'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path d="M41-24.9c-9.4-9.4-24.6-9.4-33.9 0S-2.3-.3 7 9.1l528 528c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-96.4-96.4c2.7-2.4 5.4-4.8 8-7.2 46.8-43.5 78.1-95.4 93-131.1 3.3-7.9 3.3-16.7 0-24.6-14.9-35.7-46.2-87.7-93-131.1-47.1-43.7-111.8-80.6-192.6-80.6-56.8 0-105.6 18.2-146 44.2L41-24.9zM176.9 111.1c32.1-18.9 69.2-31.1 111.1-31.1 65.2 0 118.8 29.6 159.9 67.7 38.5 35.7 65.1 78.3 78.6 108.3-13.6 30-40.2 72.5-78.6 108.3-3.1 2.8-6.2 5.6-9.4 8.4L393.8 328c14-20.5 22.2-45.3 22.2-72 0-70.7-57.3-128-128-128-26.7 0-51.5 8.2-72 22.2l-39.1-39.1zm182 182l-108-108c11.1-5.8 23.7-9.1 37.1-9.1 44.2 0 80 35.8 80 80 0 13.4-3.3 26-9.1 37.1zM103.4 173.2l-34-34c-32.6 36.8-55 75.8-66.9 104.5-3.3 7.9-3.3 16.7 0 24.6 14.9 35.7 46.2 87.7 93 131.1 47.1 43.7 111.8 80.6 192.6 80.6 37.3 0 71.2-7.9 101.5-20.6L352.2 422c-20 6.4-41.4 10-64.2 10-65.2 0-118.8-29.6-159.9-67.7-38.5-35.7-65.1-78.3-78.6-108.3 10.4-23.1 28.6-53.6 54-82.8z"/></svg>',star:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><!--! Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. --><path d="M288.1-32c9 0 17.3 5.1 21.4 13.1L383 125.3 542.9 150.7c8.9 1.4 16.3 7.7 19.1 16.3s.5 18-5.8 24.4L441.7 305.9 467 465.8c1.4 8.9-2.3 17.9-9.6 23.2s-17 6.1-25 2L288.1 417.6 143.8 491c-8 4.1-17.7 3.3-25-2s-11-14.2-9.6-23.2L134.4 305.9 20 191.4c-6.4-6.4-8.6-15.8-5.8-24.4s10.1-14.9 19.1-16.3l159.9-25.4 73.6-144.2c4.1-8 12.4-13.1 21.4-13.1zm0 76.8L230.3 158c-3.5 6.8-10 11.6-17.6 12.8l-125.5 20 89.8 89.9c5.4 5.4 7.9 13.1 6.7 20.7l-19.8 125.5 113.3-57.6c6.8-3.5 14.9-3.5 21.8 0l113.3 57.6-19.8-125.5c-1.2-7.6 1.3-15.3 6.7-20.7l89.8-89.9-125.5-20c-7.6-1.2-14.1-6-17.6-12.8L288.1 44.8z"/></svg>'}},Ls={name:"system",resolver:(t,e="classic",o="solid")=>{let i=vi[o][t]??vi.regular[t]??vi.regular["circle-question"];return i?Ts(i):""},mutator:t=>{t.hasAttribute("fill")||t.setAttribute("fill","currentColor")}},yn=Ls;var Ss="classic",As=[bn,yn],xn=new Set;function Cn(t){xn.add(t)}function _n(t){xn.delete(t)}function vr(t){return As.find(e=>e.name===t)}function Tn(){return Ss}var{I:uf}=Ja;var Ln=(t,e)=>e===void 0?t?._$litType$!==void 0:t?._$litType$===e;var Sn=t=>t.strings===void 0;var Es={},An=(t,e=Es)=>t._$AH=e;var Co=Symbol(),br=Symbol(),bi,yi=new Map,O=class extends Ye{constructor(){super(...arguments),this.svg=null,this.autoWidth=!1,this.swapOpacity=!1,this.label="",this.library="default",this.rotate=0,this.resolveIcon=async(t,e)=>{let o;if(e?.spriteSheet){this.hasUpdated||await this.updateComplete,this.svg=Xe`<svg part="svg">
        <use part="use" href="${t}"></use>
      </svg>`,await this.updateComplete;let r=this.shadowRoot.querySelector("[part='svg']");return typeof e.mutator=="function"&&e.mutator(r,this),this.svg}try{if(o=await fetch(t,{mode:"cors"}),!o.ok)return o.status===410?Co:br}catch{return br}try{let r=document.createElement("div");r.innerHTML=await o.text();let i=r.firstElementChild;if(i?.tagName?.toLowerCase()!=="svg")return Co;bi||(bi=new DOMParser);let n=bi.parseFromString(i.outerHTML,"text/html").body.querySelector("svg");return n?(n.part.add("svg"),document.adoptNode(n)):Co}catch{return Co}}}connectedCallback(){super.connectedCallback(),Cn(this)}firstUpdated(t){super.firstUpdated(t),this.hasAttribute("rotate")&&this.style.setProperty("--rotate-angle",`${this.rotate}deg`),this.setIcon()}disconnectedCallback(){super.disconnectedCallback(),_n(this)}async getIconSource(){let t=vr(this.library),e=this.family||Tn();if(this.name&&t){let o=this.canvas==="auto"||this.autoWidth,r;try{r=await t.resolver(this.name,e,this.variant,o)}catch{r=void 0}return{url:r,fromLibrary:!0}}return{url:this.src,fromLibrary:!1}}handleLabelChange(){typeof this.label=="string"&&this.label.length>0?(this.setAttribute("role","img"),this.setAttribute("aria-label",this.label),this.removeAttribute("aria-hidden")):(this.removeAttribute("role"),this.removeAttribute("aria-label"),this.setAttribute("aria-hidden","true"))}async setIcon(){let{url:t,fromLibrary:e}=await this.getIconSource(),o=e?vr(this.library):void 0;if(!t){this.svg=null;return}let r=yi.get(t);r||(r=this.resolveIcon(t,o),yi.set(t,r));let i=await r;i===br&&yi.delete(t);let a=await this.getIconSource();if(t===a.url){if(Ln(i)){this.svg=i;return}switch(i){case br:case Co:this.svg=null,this.dispatchEvent(new fn);break;default:this.svg=i.cloneNode(!0),o?.mutator?.(this.svg,this),this.dispatchEvent(new pn)}}}willUpdate(t){return this.style||this.setStyleProperty("--rotate-angle",`${this.rotate}deg`),super.willUpdate(t)}updated(t){super.updated(t);let e=vr(this.library);this.hasAttribute("rotate")&&this.style.setProperty("--rotate-angle",`${this.rotate}deg`);let o=this.shadowRoot?.querySelector("svg");o&&e?.mutator?.(o,this)}render(){return this.hasUpdated?this.svg:Xe`<svg part="svg" width="16" height="16" viewBox="0 0 16 16"></svg>`}};O.css=hn;u([vo()],O.prototype,"svg",2);u([h({reflect:!0})],O.prototype,"name",2);u([h({reflect:!0})],O.prototype,"family",2);u([h({reflect:!0})],O.prototype,"variant",2);u([h({reflect:!0})],O.prototype,"canvas",2);u([h({attribute:"auto-width",type:Boolean,reflect:!0})],O.prototype,"autoWidth",2);u([h({attribute:"swap-opacity",type:Boolean,reflect:!0})],O.prototype,"swapOpacity",2);u([h()],O.prototype,"src",2);u([h()],O.prototype,"label",2);u([h({reflect:!0})],O.prototype,"library",2);u([h({type:Number,reflect:!0})],O.prototype,"rotate",2);u([h({type:String,reflect:!0})],O.prototype,"flip",2);u([h({type:String,reflect:!0})],O.prototype,"animation",2);u([ve("label")],O.prototype,"handleLabelChange",1);u([ve(["family","name","library","variant","src","autoWidth","canvas","swapOpacity"],{waitUntilFirstUpdate:!0})],O.prototype,"setIcon",1);O=u([ct("wa-icon")],O);var En=K`
  :host {
    --height: var(--wa-form-control-toggle-size);
    --width: calc(var(--height) * 1.75);
    --thumb-size: 0.75em;

    display: inline-flex;
    line-height: var(--wa-form-control-value-line-height);
  }

  label {
    position: relative;
    display: flex;
    align-items: center;
    font: inherit;
    color: var(--wa-form-control-value-color);
    vertical-align: middle;
    cursor: pointer;
  }

  .switch {
    flex: 0 0 auto;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--width);
    height: var(--height);
    background-color: var(--wa-form-control-background-color);
    border-color: var(--wa-form-control-border-color);
    border-radius: var(--height);
    border-style: var(--wa-form-control-border-style);
    border-width: var(--wa-form-control-border-width);
    transition-property: translate, background, border-color, box-shadow;
    transition-duration: var(--wa-transition-normal);
    transition-timing-function: var(--wa-transition-easing);
  }

  :host([did-ssr]:not(:defined)) .switch {
    transition-property: unset;
    transition-duration: unset;
    transition-timing-function: unset;
  }

  .switch .thumb {
    aspect-ratio: 1 / 1;
    width: var(--thumb-size);
    height: var(--thumb-size);
    background-color: var(--wa-form-control-border-color);
    border-radius: 50%;
    translate: calc((var(--width) - var(--height)) / -2);
    transition: inherit;
  }
  .switch .thumb:dir(rtl) {
    translate: calc((var(--width) - var(--height)) / 2);
  }

  .input {
    position: absolute;
    opacity: 0;
    padding: 0;
    margin: 0;
    pointer-events: none;
  }

  /* Focus */
  label:not(.disabled) .input:focus-visible ~ [part~='control'] {
    outline: var(--wa-focus-ring);
    outline-offset: var(--wa-focus-ring-offset);
  }

  /* Checked */
  .checked .switch {
    background-color: var(--wa-form-control-activated-color);
    border-color: var(--wa-form-control-activated-color);
  }

  .checked .switch .thumb {
    background-color: var(--wa-color-surface-default);
    translate: calc((var(--width) - var(--height)) / 2);
  }
  .checked .switch .thumb:dir(rtl) {
    translate: calc((var(--width) - var(--height)) / -2);
  }

  /* Disabled */
  label:has(> :disabled) {
    opacity: 0.5;
    cursor: not-allowed;
  }

  [part~='label'] {
    display: inline-block;
    line-height: var(--height);
    margin-inline-start: 0.5em;
    user-select: none;
    -webkit-user-select: none;
  }

  :host([required]) [part~='label']::after {
    content: var(--wa-form-control-required-content);
    color: var(--wa-form-control-required-content-color);
    margin-inline-start: var(--wa-form-control-required-content-offset);
  }

  @media (forced-colors: active) {
    :checked:enabled + .switch:hover .thumb,
    :checked + .switch .thumb {
      background-color: ButtonText;
    }
  }
`;var zn=K`
  :host {
    display: flex;
    flex-direction: column;
  }

  /* Treat wrapped labels, inputs, and hints as direct children of the host element */
  [part~='form-control'] {
    display: contents;
  }

  /* Label */
  :is([part~='form-control-label'], [part~='label']):has(*:not(:empty)),
  :is([part~='form-control-label'], [part~='label']).has-label {
    display: inline-flex;
    color: var(--wa-form-control-label-color);
    font-weight: var(--wa-form-control-label-font-weight);
    line-height: var(--wa-form-control-label-line-height);
    margin-block-end: 0.5em;
  }

  :host([required]) :is([part~='form-control-label'], [part~='label'])::after {
    content: var(--wa-form-control-required-content);
    margin-inline-start: var(--wa-form-control-required-content-offset);
    color: var(--wa-form-control-required-content-color);
  }

  /* Help text */
  [part~='hint'] {
    display: block;
    color: var(--wa-form-control-hint-color);
    font-weight: var(--wa-form-control-hint-font-weight);
    line-height: var(--wa-form-control-hint-line-height);
    margin-block-start: 0.5em;
    font-size: var(--wa-font-size-smaller);

    &:not(.has-slotted, .has-hint, .has-count) {
      display: none;
    }
  }
`;var $n=gr(class extends Ht{constructor(t){if(super(t),t.type!==Ze.PROPERTY&&t.type!==Ze.ATTRIBUTE&&t.type!==Ze.BOOLEAN_ATTRIBUTE)throw Error("The `live` directive is not allowed on child or event bindings");if(!Sn(t))throw Error("`live` bindings can only contain a single expression")}render(t){return t}update(t,[e]){if(e===ae||e===F)return e;let o=t.element,r=t.name;if(t.type===Ze.PROPERTY){if(e===o[r])return ae}else if(t.type===Ze.BOOLEAN_ATTRIBUTE){if(!!e===o.hasAttribute(r))return ae}else if(t.type===Ze.ATTRIBUTE&&o.getAttribute(r)===e+"")return ae;return An(t),e}});var V=class extends de{constructor(){super(...arguments),this.hasSlotController=new fr(this,"hint"),this.localize=new qt(this),this.title="",this.name=null,this._value=this.getAttribute("value")??null,this.size="m",this.disabled=!1,this._checked=null,this.defaultChecked=this.hasAttribute("checked"),this.required=!1,this.hint="",this.withHint=!1}static get validators(){return[...super.validators,Qo()]}get value(){return this._value??"on"}set value(t){this._value=t}handleSizeChange(){ur(this.localName,this.size)}get checked(){return this.valueHasChanged?!!this._checked:this._checked??this.defaultChecked}set checked(t){this._checked=!!t,this.valueHasChanged=!0}handleClick(){this.hasInteracted=!0,this.checked=!this.checked,this.updateComplete.then(()=>{this.dispatchEvent(new Event("change",{bubbles:!0,composed:!0}))})}handleKeyDown(t){let e=this.localize.dir()==="rtl";t.key==="ArrowLeft"&&(t.preventDefault(),this.checked=e,this.updateComplete.then(()=>{this.dispatchEvent(new Event("change",{bubbles:!0,composed:!0})),this.dispatchEvent(new InputEvent("input",{bubbles:!0,composed:!0}))})),t.key==="ArrowRight"&&(t.preventDefault(),this.checked=!e,this.updateComplete.then(()=>{this.dispatchEvent(new Event("change",{bubbles:!0,composed:!0})),this.dispatchEvent(new InputEvent("input",{bubbles:!0,composed:!0}))}))}willUpdate(t){super.willUpdate(t),(t.has("value")||t.has("checked")||t.has("defaultChecked")||t.has("disabled"))&&this.handleValueOrCheckedChange()}handleValueOrCheckedChange(){if(this.didSSR&&!this.hasUpdated){this.updateComplete.then(()=>{this.handleValueOrCheckedChange()});return}this.setValue(this.checked?this.value:null,this._value),this.updateValidity()}handleStateChange(){this.hasUpdated&&(this.input.checked=this.checked),this.customStates.set("checked",this.checked),this.updateValidity()}handleDisabledChange(){this.updateValidity()}click(){this.input.click()}focus(t){this.input.focus(t)}blur(){this.input.blur()}setValue(t,e){if(!this.checked){this.internals.setFormValue(null,null);return}this.internals.setFormValue(t??"on",e)}formResetCallback(){this._checked=null,super.formResetCallback(),this.handleValueOrCheckedChange()}render(){let t=this.hasSlotController.test("hint","withHint"),e=this.hint?!0:!!t,o=this.didSSR&&!this.hasUpdated?this.checked:this.defaultChecked,r=this.didSSR&&!this.hasUpdated?null:$n(this.checked);return Xe`
      <label
        part="base switch"
        class=${xo({checked:this.checked,disabled:this.disabled})}
      >
        <input
          class="input"
          type="checkbox"
          title=${this.title}
          name=${Q(this.name)}
          value=${Q(this.value)}
          .checked=${Q(r)}
          ?checked=${o}
          ?disabled=${this.disabled}
          ?required=${this.required}
          role="switch"
          aria-checked=${this.checked?"true":"false"}
          aria-describedby="hint"
          @click=${this.handleClick}
          @keydown=${this.handleKeyDown}
        />

        <span part="control" class="switch">
          <span part="thumb" class="thumb"></span>
        </span>

        <slot part="label" class="label"></slot>
      </label>

      <slot
        id="hint"
        name="hint"
        part="hint"
        class=${xo({"has-slotted":e})}
        aria-hidden=${e?"false":"true"}
        >${this.hint}</slot
      >
    `}};V.shadowRootOptions={...de.shadowRootOptions,delegatesFocus:!0};V.css=[zn,pr,En];u([bo('input[type="checkbox"]')],V.prototype,"input",2);u([h()],V.prototype,"title",2);u([h({reflect:!0})],V.prototype,"name",2);u([h({reflect:!0})],V.prototype,"value",1);u([h({reflect:!0})],V.prototype,"size",2);u([ve("size")],V.prototype,"handleSizeChange",1);u([h({type:Boolean})],V.prototype,"disabled",2);u([h({type:Boolean,attribute:!1})],V.prototype,"checked",1);u([h({type:Boolean,attribute:"checked",reflect:!0})],V.prototype,"defaultChecked",2);u([h({type:Boolean,reflect:!0})],V.prototype,"required",2);u([h({attribute:"hint"})],V.prototype,"hint",2);u([h({attribute:"with-hint",type:Boolean})],V.prototype,"withHint",2);u([ve(["checked","defaultChecked"])],V.prototype,"handleStateChange",1);u([ve("disabled",{waitUntilFirstUpdate:!0})],V.prototype,"handleDisabledChange",1);V=u([ct("wa-switch")],V);V.disableWarning?.("change-in-update");var xi=matchMedia("(prefers-reduced-motion: reduce)"),Mn="applied-ai-interface-motion",_o=!0;try{_o=localStorage.getItem(Mn)!=="off"}catch{}var kn,Wt,yr,ke=new Map,Lt=()=>_o&&!xi.matches&&!document.hidden;function Fn(){Wt?.cancel(),Wt=void 0;let t=document.querySelector("#content");t?.style.removeProperty("transform"),t?.style.removeProperty("opacity"),yr?.revert(),yr=void 0;for(let[e,o]of ke)o.cancel(),e.style.removeProperty("transform");ke.clear()}function To(){document.documentElement.dataset.motion=Lt()?"on":"off";let t=document.querySelector("#interface-motion");t&&(t.checked=_o);let e=document.querySelector("#motion-note");e&&(e.textContent=xi.matches?"Windows reduced-motion preference is active. Decorative motion is off.":"Gentle page transitions, button feedback and a brief welcome animation."),Lt()||Fn()}function Ci(){if(!Lt())return;let t=document.querySelector(".brand-mark");t&&(yr?.revert(),yr=ti(t,{keyframes:[{scale:1.06,filter:"brightness(1.5)",duration:360},{scale:1,filter:"brightness(1)",duration:540}],ease:"inOutSine",onComplete:()=>{t.style.removeProperty("transform"),t.style.removeProperty("filter")}}))}function zs(t){let e=t!==kn;if(kn=t,Fn(),To(),e&&Lt()){Wt=Jt(document.querySelector("#content"),{opacity:[.75,1],transform:["translateY(7px)","translateY(0px)"]},{duration:.22,ease:"easeOut"});let o=Wt;o.then(()=>{if(Wt===o){o.cancel(),Wt=void 0;let r=document.querySelector("#content");r?.style.removeProperty("transform"),r?.style.removeProperty("opacity")}}),t==="Home"&&Ci()}}function $s(t){let e=t.target.closest?.("button");return e&&!e.disabled&&!e.closest("wa-button")?e:null}function ks(t){let e=ke.get(t);if(!e)return;if(e.cancel(),ke.delete(t),!Lt()||!t.isConnected){t.style.removeProperty("transform");return}let o=Jt(t,{transform:["scale(.975)","scale(1)"]},{duration:.16});ke.set(t,o),o.then(()=>{ke.get(t)===o&&(o.cancel(),t.style.removeProperty("transform"),ke.delete(t))})}document.addEventListener("pointerdown",t=>{if(!Lt()||t.button!==0)return;let e=$s(t);e&&(ke.get(e)?.cancel(),ke.set(e,Jt(e,{transform:"scale(.975)"},{duration:.08})))});for(let t of["pointerup","pointercancel","blur"])window.addEventListener(t,()=>{for(let e of[...ke.keys()])ks(e)});document.addEventListener("change",t=>{if(t.target.id==="interface-motion"){_o=t.target.checked;try{localStorage.setItem(Mn,_o?"on":"off")}catch{}To()}});document.addEventListener("click",t=>{t.target.closest?.("#replay-motion")&&Ci()});xi.addEventListener("change",To);document.addEventListener("visibilitychange",To);window.appEffects={render:zs,welcome:Ci,permitsMotion:Lt};To();})();
/*! For license information please see ui-effects.js.LEGAL.txt */
