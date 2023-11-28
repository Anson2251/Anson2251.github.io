(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const l of document.querySelectorAll('link[rel="modulepreload"]'))i(l);new MutationObserver(l=>{for(const s of l)if(s.type==="childList")for(const r of s.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&i(r)}).observe(document,{childList:!0,subtree:!0});function e(l){const s={};return l.integrity&&(s.integrity=l.integrity),l.referrerPolicy&&(s.referrerPolicy=l.referrerPolicy),l.crossOrigin==="use-credentials"?s.credentials="include":l.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(l){if(l.ep)return;l.ep=!0;const s=e(l);fetch(l.href,s)}})();var m;(u=>{u.CONTAINER_CSS_PATH=".tile-container",u.SCORE_CSS_PATH="html body div.container div.heading div.scores-container div.score-container",u.CSS_CLASS_MATCH=/tile-position-[0-9]-[0-9]/g,u.MAP_HEIGHT=4,u.MAP_WIDTH=4,u.INITIAL_WEIGHT={combine:16,feasibleDirection:4,borderDecision:{this:0,side:2,opposite:1}}})(m||(m={}));const o=m;class _{constructor(t=0,e=!1){this.logMode=!1,this.logMode=e,this.initialVal=t,this.container=document.querySelector(o.CONTAINER_CSS_PATH),this.map=new Array(o.MAP_HEIGHT).fill(null).map(()=>new Array(o.MAP_WIDTH).fill(this.initialVal)),this.update()}update(){let t=new Array(o.MAP_HEIGHT).fill(null).map(()=>new Array(o.MAP_WIDTH).fill(this.initialVal));const e=this.container.childNodes;if(e)for(let l=0;l<e.length;l++){const r=(e[l].className.match(o.CSS_CLASS_MATCH)||[""])[0].split("-"),a=parseInt(r.pop())-1,h=parseInt(r.pop())-1,g=parseInt(e[l].innerText);t[a][h]=g}let i=!this.isSameMap(this.map,t);return i&&(this.map=t),i}isSameMap(t,e){e||(e=this.map);for(let i=0;i<o.MAP_HEIGHT;i++)for(let l=0;l<o.MAP_WIDTH;l++)if(t[i][l]!==e[i][l])return!1;return!0}getVal(t,e){return this.map[e][t]||0}getMap(){return this.map}move(t){let e,i;switch(t){case 0:{e=new KeyboardEvent("keydown",{key:"ArrowUp"}),i=new KeyboardEvent("keyup",{key:"ArrowUp"}),this.logMode&&console.log("top");break}case 1:{e=new KeyboardEvent("keydown",{key:"ArrowLeft"}),i=new KeyboardEvent("keyup",{key:"ArrowLeft"}),this.logMode&&console.log("left");break}case 2:{e=new KeyboardEvent("keydown",{key:"ArrowDown"}),i=new KeyboardEvent("keyup",{key:"ArrowDown"}),this.logMode&&console.log("down");break}case 3:{e=new KeyboardEvent("keydown",{key:"ArrowRight"}),i=new KeyboardEvent("keyup",{key:"ArrowRight"}),this.logMode&&console.log("right");break}}e&&i?(document.dispatchEvent(e),document.dispatchEvent(i)):console.error(`[gameMap.emitMoveCmd] 方向代号 ${t} 无效`)}isEmptyCol(t){for(let e=0;e<o.MAP_HEIGHT;e++)if(this.map[e][t]!==0)return!1;return!0}isEmptyRow(t){for(let e=0;e<o.MAP_HEIGHT;e++)if(this.map[t][e]!==0)return!1;return!0}isFullCol(t){for(let e=0;e<o.MAP_HEIGHT;e++)if(this.map[e][t]===0)return!1;return!0}isFullRow(t){for(let e=0;e<o.MAP_HEIGHT;e++)if(this.map[t][e]===0)return!1;return!0}}var T;(u=>{(t=>{t[t.UPWARD=0]="UPWARD",t[t.LEFT=1]="LEFT",t[t.DOWNWARD=2]="DOWNWARD",t[t.RIGHT=3]="RIGHT"})(u.DIRECTION_CODE||(u.DIRECTION_CODE={})),(t=>{t[t.VERTICAL=0]="VERTICAL",t[t.HORIZONTAL=1]="HORIZONTAL"})(u.VRTCL_HRZNTL_DIRECTION_CODE||(u.VRTCL_HRZNTL_DIRECTION_CODE={}))})(T||(T={}));const n=T;class C{constructor(t){this.map=t,this.data=this.update()}update(){let t={boxAtEdges:this.getBoxesAtEdge(),drctnBoxCanCmbn:this.getDirectionBoxesCanCombine(),drctnFsblty:this.getDirectionsFeasibility()};return this.data=t,t}getBoxesAtEdge(){let t=[0,0,0,0];for(let e=0;e<o.MAP_WIDTH;e++)this.map.getVal(e,0)!==0&&t[n.DIRECTION_CODE.UPWARD]++;for(let e=0;e<o.MAP_WIDTH;e++)this.map.getVal(e,o.MAP_HEIGHT-1)!==0&&t[n.DIRECTION_CODE.DOWNWARD]++;for(let e=0;e<o.MAP_HEIGHT;e++)this.map.getVal(0,e)!==0&&t[n.DIRECTION_CODE.LEFT]++;for(let e=0;e<o.MAP_HEIGHT;e++)this.map.getVal(o.MAP_WIDTH-1,e)!==0&&t[n.DIRECTION_CODE.RIGHT]++;return t}getDirectionsFeasibility(){let t=[0,0,0,0],e=0;for(let r=0;r<o.MAP_WIDTH;r++){let a=!1;for(let h=0;h<o.MAP_HEIGHT&&!(this.map.isEmptyCol(r)||this.map.isFullCol(r));h++)if(this.map.getVal(r,h)===0)if(h===0){e++;break}else a=!0;else if(a){e++,a=!1;break}}let i=0;for(let r=0;r<o.MAP_WIDTH;r++){let a=!1;for(let h=o.MAP_HEIGHT-1;h>=0&&!(this.map.isEmptyCol(r)||this.map.isFullCol(r));h--)if(this.map.getVal(r,h)===0)if(h===o.MAP_HEIGHT-1){i++;break}else a=!0;else if(a){i++,a=!1;break}}let l=0;for(let r=0;r<o.MAP_HEIGHT;r++){let a=!1;for(let h=0;h<o.MAP_WIDTH&&!(this.map.isEmptyRow(r)||this.map.isFullRow(r));h++)if(this.map.getVal(h,r)===0)if(h===0){l++;break}else a=!0;else if(a){l++,a=!1;break}}let s=0;for(let r=0;r<o.MAP_HEIGHT;r++){let a=!1;for(let h=o.MAP_WIDTH-1;h>=0&&!(this.map.isEmptyRow(r)||this.map.isFullRow(r));h--)if(this.map.getVal(h,r)===0)if(h===o.MAP_WIDTH-1){s++;break}else a=!0;else if(a){s++,a=!1;break}}return t[n.DIRECTION_CODE.UPWARD]=e,t[n.DIRECTION_CODE.DOWNWARD]=i,t[n.DIRECTION_CODE.LEFT]=l,t[n.DIRECTION_CODE.RIGHT]=s,t}getDirectionBoxesCanCombine(){let t=[0,0];for(let e=0;e<o.MAP_HEIGHT;e++)for(let i=0;i<o.MAP_WIDTH;i++)if(this.map.getVal(i,e)!==0){let l=this.getContiniousValueDirections(i,e);t[n.VRTCL_HRZNTL_DIRECTION_CODE.VERTICAL]+=l[n.VRTCL_HRZNTL_DIRECTION_CODE.VERTICAL]*Math.log2(this.map.getVal(i,e)),t[n.VRTCL_HRZNTL_DIRECTION_CODE.HORIZONTAL]+=l[n.VRTCL_HRZNTL_DIRECTION_CODE.HORIZONTAL]*Math.log2(this.map.getVal(i,e))}return t}getContiniousValueDirections(t,e){const i=this.map.getVal(t,e);if(i===0)return[0,0];let l=[0,0];for(let s=t-1;s>=0;s--){const r=this.map.getVal(s,e);if(r!==0)if(r===i)l[n.VRTCL_HRZNTL_DIRECTION_CODE.HORIZONTAL]++;else break}for(let s=t+1;s<o.MAP_WIDTH;s++){const r=this.map.getVal(s,e);if(r!==0)if(r===i)l[n.VRTCL_HRZNTL_DIRECTION_CODE.HORIZONTAL]++;else break}for(let s=e-1;s>=0;s--){const r=this.map.getVal(t,s);if(r!==0)if(r===i)l[n.VRTCL_HRZNTL_DIRECTION_CODE.VERTICAL]++;else break}for(let s=e+1;s<o.MAP_HEIGHT;s++){const r=this.map.getVal(t,s);if(r!==0)if(r===i)l[n.VRTCL_HRZNTL_DIRECTION_CODE.VERTICAL]++;else break}return l}}class E{constructor(t,e=!1){this.inited=!1,this.logMode=e,t&&(this.weights=t)}importMapFrom2048Map(t){this.observer=new C(t)}importMapFromSimulationMap(t){this.SmltinMAP=t}decisionMaker_single(){if(this.observer||console.error("[solver.decisionMaker_single] 单步决策依赖于 observer 对象, 请先使用 importMapFrom2048Map 创建该对象"),this.weights||console.error("[solver.decisionMaker_single] 单步决策依赖于 weights  对象, 请在构造时提供"),!this.observer||!this.weights)return null;let t=new Array(4).fill(0);this.observer.update();let e=this.observer.data.boxAtEdges,i=this.observer.data.drctnFsblty,l=this.observer.data.drctnBoxCanCmbn;l[n.VRTCL_HRZNTL_DIRECTION_CODE.VERTICAL]>l[n.VRTCL_HRZNTL_DIRECTION_CODE.HORIZONTAL]?(t[n.DIRECTION_CODE.UPWARD]+=l[n.VRTCL_HRZNTL_DIRECTION_CODE.VERTICAL]*this.weights.combine,t[n.DIRECTION_CODE.DOWNWARD]+=l[n.VRTCL_HRZNTL_DIRECTION_CODE.VERTICAL]*this.weights.combine):l[n.VRTCL_HRZNTL_DIRECTION_CODE.HORIZONTAL]>l[n.VRTCL_HRZNTL_DIRECTION_CODE.VERTICAL]&&(t[n.DIRECTION_CODE.LEFT]+=l[n.VRTCL_HRZNTL_DIRECTION_CODE.HORIZONTAL]*this.weights.combine,t[n.DIRECTION_CODE.RIGHT]+=l[n.VRTCL_HRZNTL_DIRECTION_CODE.HORIZONTAL]*this.weights.combine);for(let r=0;r<4;r++)t[r]+=i[r]*this.weights.feasibleDirection;let s=Math.max(...e);if(s!==0)for(let r=0;r<e.length;r++)s===e[r]&&(t[r]+=this.weights.borderDecision.this,t[r-2>=0?r-2:r+2]+=this.weights.borderDecision.opposite,t[r-1>=0?r-1:r+3]+=this.weights.borderDecision.side,t[r+1<4?r+1:r-3]+=this.weights.borderDecision.side);return this.logMode&&console.log(`NCB: 	[${l.join(", ")}]
NLB: 	[${e.join(", ")}]
NFR: 	[${i.join(", ")}]
FDW: 	[${t.join(", ")}]`),t.indexOf(Math.max(...t))}decisionMaker_multiple(t=4){if(!this.SmltinMAP)return console.error("[solver.decisionMaker_multiple] 多步决策基于 simulationMap 对象, 请先使用 importMapFromSimulationMap 创建该对象"),-1;function e(r){let a=0;return r.forEach(h=>{a+=h}),a}function i(r){return JSON.parse(JSON.stringify(r))}function l(r,a,h){a++;let g=i(r.getMap()),p=new Array(4).fill(0);for(let c=0;c<4;c++){if(!r.getDirectionFeasibility(c))continue;let d=r.move(c,!1).score;a>=h?p[c]=d:p[c]=(e(l(r,a,h))+d)/Math.pow(a,2),r.setMapFrom2048Map(g)}return r.setMapFrom2048Map(g),p}let s=l(this.SmltinMAP,0,t);for(let r=0;r<4;r++)this.SmltinMAP.getDirectionFeasibility(r)||(s[r]=-1e4);return s.indexOf(Math.max(...s))}}class D{constructor(t=0,e=!1){this.map=[],this.logMode=!1,this.score=0,this.gameover=!1,this.logMode=e,this.initialVal=t,this.initMap()}getScore(){return this.score}getIfGameover(){return this.gameover}getMap(){return this.map}setMapFrom2048Map(t){this.map=JSON.parse(JSON.stringify(t))}setMapFromGameMap(t){this.map=t.getMap()}move(t,e=!0){let i=0,l={score:0,gameover:!0};if(this.gameover)return l;let s=JSON.parse(JSON.stringify(this.map));switch(t){case n.DIRECTION_CODE.LEFT:{i+=this.combineToLeft();break}case n.DIRECTION_CODE.RIGHT:{i+=this.combineToRight();break}case n.DIRECTION_CODE.UPWARD:{i+=this.combineToTop();break}case n.DIRECTION_CODE.DOWNWARD:{i+=this.combineToBottom();break}}return e&&(!this.isSameMap(s,this.map)||i)&&!this.isFullMap()&&this.fillRandomCell(),this.score+=i,this.gameover=this.isFullMap()&&!this.canCombine(),l.score=i,l.gameover=this.gameover,l}getDirectionFeasibility(t){return!!(this.getDirectionFeasibilityWithoutCombine(t)||this.getDirectionBoxesCanCombine()[t%2])}getDirectionFeasibilityWithoutCombine(t){let e=0;switch(t){case n.DIRECTION_CODE.UPWARD:{for(let i=0;i<o.MAP_WIDTH;i++){let l=!1;for(let s=0;s<o.MAP_HEIGHT&&!(this.isEmptyCol(i)||this.isFullCol(i));s++)if(this.getVal(i,s)===0)if(s===0){e++;break}else l=!0;else if(l){e++,l=!1;break}}break}case n.DIRECTION_CODE.DOWNWARD:{for(let i=0;i<o.MAP_WIDTH;i++){let l=!1;for(let s=o.MAP_HEIGHT-1;s>=0&&!(this.isEmptyCol(i)||this.isFullCol(i));s--)if(this.getVal(i,s)===0)if(s===o.MAP_HEIGHT-1){e++;break}else l=!0;else if(l){e++,l=!1;break}}break}case n.DIRECTION_CODE.LEFT:{for(let i=0;i<o.MAP_HEIGHT;i++){let l=!1;for(let s=0;s<o.MAP_WIDTH&&!(this.isEmptyRow(i)||this.isFullRow(i));s++)if(this.getVal(s,i)===0)if(s===0){e++;break}else l=!0;else if(l){e++,l=!1;break}}break}case n.DIRECTION_CODE.RIGHT:{for(let i=0;i<o.MAP_HEIGHT;i++){let l=!1;for(let s=o.MAP_WIDTH-1;s>=0&&!(this.isEmptyRow(i)||this.isFullRow(i));s--)if(this.getVal(s,i)===0)if(s===o.MAP_WIDTH-1){e++;break}else l=!0;else if(l){e++,l=!1;break}}break}}return e>0}getCellContiniousValueDirections(t,e){const i=this.getVal(t,e);if(i===0)return[0,0];let l=[0,0];for(let s=t-1;s>=0;s--){const r=this.getVal(s,e);if(r!==0)if(r===i)l[n.VRTCL_HRZNTL_DIRECTION_CODE.HORIZONTAL]++;else break}for(let s=t+1;s<o.MAP_WIDTH;s++){const r=this.getVal(s,e);if(r!==0)if(r===i)l[n.VRTCL_HRZNTL_DIRECTION_CODE.HORIZONTAL]++;else break}for(let s=e-1;s>=0;s--){const r=this.getVal(t,s);if(r!==0)if(r===i)l[n.VRTCL_HRZNTL_DIRECTION_CODE.VERTICAL]++;else break}for(let s=e+1;s<o.MAP_HEIGHT;s++){const r=this.getVal(t,s);if(r!==0)if(r===i)l[n.VRTCL_HRZNTL_DIRECTION_CODE.VERTICAL]++;else break}return l}getDirectionBoxesCanCombine(){let t=[0,0];for(let e=0;e<o.MAP_HEIGHT;e++)for(let i=0;i<o.MAP_WIDTH;i++)if(this.getVal(i,e)!==0){let l=this.getCellContiniousValueDirections(i,e);t[n.VRTCL_HRZNTL_DIRECTION_CODE.VERTICAL]+=l[n.VRTCL_HRZNTL_DIRECTION_CODE.VERTICAL]*Math.log2(this.getVal(i,e)),t[n.VRTCL_HRZNTL_DIRECTION_CODE.HORIZONTAL]+=l[n.VRTCL_HRZNTL_DIRECTION_CODE.HORIZONTAL]*Math.log2(this.getVal(i,e))}return t}initMap(){this.map=new Array(o.MAP_HEIGHT).fill(null).map(()=>new Array(o.MAP_WIDTH).fill(this.initialVal)),this.fillRandomCell(),this.fillRandomCell()}combineToLeft(){let t=0;for(let e=0;e<o.MAP_HEIGHT;e++){for(let i=0;i<o.MAP_WIDTH;i++){if(this.getVal(i,e)===0)continue;let l=(()=>{for(let s=i+1;s<o.MAP_WIDTH;s++)if(this.getVal(s,e))return s;return o.MAP_WIDTH})();if(l<o.MAP_WIDTH){let s=this.getVal(i,e),r=this.getVal(l,e);s===r&&(this.setVal(i,e,s*2),t+=s*2,this.setVal(l,e,0))}}for(let i=0;i<o.MAP_WIDTH;i++)if(this.getVal(i,e)===0){let l=(()=>{for(let s=i;s<o.MAP_WIDTH;s++)if(this.getVal(s,e)!==0)return{val:this.getVal(s,e),pos:s};return{val:0,pos:0}})();if(l.val===0)break;this.setVal(i,e,l.val),this.setVal(l.pos,e,0)}}return t}combineToRight(){let t=0;for(let e=0;e<o.MAP_HEIGHT;e++){for(let i=o.MAP_WIDTH-1;i>=0;i--){if(this.getVal(i,e)===0)continue;let l=(()=>{for(let s=i-1;s>=0;s--)if(this.getVal(s,e))return s;return-1})();if(l>=0){let s=this.getVal(i,e),r=this.getVal(l,e);s===r&&(this.setVal(i,e,s*2),t+=s*2,this.setVal(l,e,0))}}for(let i=o.MAP_WIDTH-1;i>=0;i--)if(this.getVal(i,e)===0){let l=(()=>{for(let s=i;s>=0;s--)if(this.getVal(s,e)!==0)return{val:this.getVal(s,e),pos:s};return{val:0,pos:0}})();if(l.val===0)break;this.setVal(i,e,l.val),this.setVal(l.pos,e,0)}}return t}combineToTop(){let t=0;for(let e=0;e<o.MAP_WIDTH;e++){for(let i=0;i<o.MAP_HEIGHT;i++){if(this.getVal(e,i)===0)continue;let l=(()=>{for(let s=i+1;s<o.MAP_HEIGHT;s++)if(this.getVal(e,s))return s;return o.MAP_HEIGHT})();if(l<o.MAP_HEIGHT){let s=this.getVal(e,i),r=this.getVal(e,l);s===r&&(this.setVal(e,i,s*2),t+=s*2,this.setVal(e,l,0))}}for(let i=0;i<o.MAP_HEIGHT;i++)if(this.getVal(e,i)===0){let l=(()=>{for(let s=i;s<o.MAP_HEIGHT;s++)if(this.getVal(e,s)!==0)return{val:this.getVal(e,s),pos:s};return{val:0,pos:0}})();if(l.val===0)break;this.setVal(e,i,l.val),this.setVal(e,l.pos,0)}}return t}combineToBottom(){let t=0;for(let e=0;e<o.MAP_WIDTH;e++){for(let i=o.MAP_HEIGHT-1;i>=0;i--){if(this.getVal(e,i)===0)continue;let l=(()=>{for(let s=i-1;s>=0;s--)if(this.getVal(e,s))return s;return-1})();if(l>=0){let s=this.getVal(e,i),r=this.getVal(e,l);s===r&&(this.setVal(e,i,s*2),t+=s*2,this.setVal(e,l,0))}}for(let i=o.MAP_HEIGHT-1;i>=0;i--)if(this.getVal(e,i)===0){let l=(()=>{for(let s=i;s>=0;s--)if(this.getVal(e,s)!==0)return{val:this.getVal(e,s),pos:s};return{val:0,pos:0}})();if(l.val===0)break;this.setVal(e,i,l.val),this.setVal(e,l.pos,0)}}return t}canCombine(){for(let t=0;t<o.MAP_WIDTH;t++)for(let e=0;e<o.MAP_HEIGHT-1;e++)if(this.getVal(t,e)===this.getVal(t,e+1))return!0;for(let t=0;t<o.MAP_HEIGHT;t++)for(let e=0;e<o.MAP_WIDTH-1;e++)if(this.getVal(e,t)===this.getVal(e+1,t))return!0;return!1}fillRandomCell(){let t=this.getRandomNumber(0,10);t>=8?t=4:t=2;const e=this.getRandomCell();e&&this.setVal(e.col,e.row,t)}getRandomCell(){const t=this.getEmptyCell();if(t.length>0){const e=this.getRandomNumber(0,t.length);return t[e]}else return null}getRandomNumber(t,e){return Math.floor(Math.random()*10*e)%(e-t)+t}getEmptyCell(){let t=[];for(let e=0;e<o.MAP_HEIGHT;e++)for(let i=0;i<o.MAP_WIDTH;i++)this.getVal(i,e)||t.push({col:i,row:e});return t}isSameMap(t,e){e||(e=this.map);for(let i=0;i<o.MAP_HEIGHT;i++)for(let l=0;l<o.MAP_WIDTH;l++)if(t[i][l]!==e[i][l])return!1;return!0}getVal(t,e){return this.map[e][t]||0}setVal(t,e,i){return this.map[e][t]=i}isEmptyCol(t){for(let e=0;e<o.MAP_HEIGHT;e++)if(this.map[e][t]!==0)return!1;return!0}isEmptyRow(t){for(let e=0;e<o.MAP_HEIGHT;e++)if(this.map[t][e]!==0)return!1;return!0}isFullCol(t){for(let e=0;e<o.MAP_HEIGHT;e++)if(this.map[e][t]===0)return!1;return!0}isFullRow(t){for(let e=0;e<o.MAP_HEIGHT;e++)if(this.map[t][e]===0)return!1;return!0}isFullMap(){for(let t=0;t<o.MAP_WIDTH;t++)if(!this.isFullCol(t))return!1;return!0}}class I{constructor(t){this.combine=t.combine,this.feasibleDirection=t.feasibleDirection,this.borderDecision=t.borderDecision}generateNewRandomWeights(){const t={combine:this.combine+this.generateRandomWeightDiff(-1,1),feasibleDirection:this.feasibleDirection+this.generateRandomWeightDiff(-1,1),borderDecision:{this:this.borderDecision.this+this.generateRandomWeightDiff(-1,1),side:this.borderDecision.side+this.generateRandomWeightDiff(-1,1),opposite:this.borderDecision.opposite+this.generateRandomWeightDiff(-1,1)}};return new I(t)}generateRandomWeightDiff(t,e){return Math.floor(Math.random()*10*e)%(e-t)+t}}class f{constructor(t){this.multipleLimit=t||4,this.using_multiple=!1,this.map=new _(0,!1),this.weight=new I(o.INITIAL_WEIGHT),this.smmap=new D(0,!1),this.solverSingle=new E(this.weight,!1),this.solverSingle.importMapFrom2048Map(this.map),this.solverMultiple=new E,this.solverMultiple.importMapFromSimulationMap(this.smmap),this.suggestionBox=this.initSuggestionBox();let e=document.querySelector("body"),i=document.createElement("div");i.className="displayPanel";let s=this.initLimitInput().container;i.appendChild(this.initModeSwitch()),i.appendChild(s),i.appendChild(this.suggestionBox),e==null||e.appendChild(i),this.setAutoUpdateSuggestion(),this.getSuggestion()}initModeSwitch(){let t=document.createElement("div");t.className="modeSwitch";let e=f.createRadioInput("single","Single Mode"),i=f.createRadioInput("multiple","Multiple Mode"),l=e.container,s=i.container;t.appendChild(l),t.appendChild(s);let r=e.input,a=i.input;return r.checked=!0,r.onclick=()=>{this.using_multiple=a.checked,this.getSuggestion()},a.onclick=()=>{this.using_multiple=a.checked,this.getSuggestion()},t}initSuggestionBox(){let t=document.createElement("div");return t.className="suggestionBox",t}initLimitInput(){let t=document.createElement("input");t.type="number",t.className="limitInput",t.value=this.multipleLimit.toString(),t.onchange=()=>{this.multipleLimit=parseInt(t.value),this.multipleLimit>10&&alert("Large number is not recommended, it will significantly slow down the speed"),this.getSuggestion()};let e=document.createElement("label");return e.title="The depth limit of the decision tree, larger value will significantly slow down the speed",e.className="limitInputContainer",e.innerHTML="Depth Limit: ",e.appendChild(t),{input:t,container:e}}getSuggestionSingle(){this.map.update();let t=this.solverSingle.decisionMaker_single();return t||t===0?t:(console.error("solver(single) returns a null value"),-1)}getSuggestionMultiple(){this.map.update(),this.smmap.setMapFrom2048Map(this.map.getMap());let t=this.solverMultiple.decisionMaker_multiple(this.multipleLimit);return t||t===0?t:(console.error("solver(multiple) returns a null value"),-1)}getSuggestion(){let t=-2;this.using_multiple?(this.suggestionBox.innerHTML=`Suggestion[${this.using_multiple?"M":"S"}]: Calculating`,t=this.getSuggestionMultiple(),console.log(t)):t=this.getSuggestionSingle(),t<0&&console.error("internal error in displayPanel.getSuggestion()"),this.updateSuggestion(t)}updateSuggestion(t){0<=t&&t<=3?this.suggestionBox.innerHTML=`Suggestion[${this.using_multiple?"M":"S"}]: ${f.directionMap[t]}`:this.suggestionBox.innerHTML=`Suggestion[${this.using_multiple?"M":"S"}]: No suggestion or Internal error`}setAutoUpdateSuggestion(){document.onkeyup=t=>{setTimeout(()=>this.getSuggestion(),200)}}}(u=>{u.directionMap={[n.DIRECTION_CODE.UPWARD]:"↑",[n.DIRECTION_CODE.DOWNWARD]:"↓",[n.DIRECTION_CODE.LEFT]:"←",[n.DIRECTION_CODE.RIGHT]:"→"};function t(e,i){let l=document.createElement("div"),s=document.createElement("input"),r=document.createElement("label");return s.type="radio",s.name="2048modeSwich",s.id=e,r.setAttribute("for",e),r.innerHTML=i,l.appendChild(s),l.appendChild(r),{container:l,input:s}}u.createRadioInput=t})(f||(f={}));window.displayPanel=f;window.initPanel=()=>{new f};
