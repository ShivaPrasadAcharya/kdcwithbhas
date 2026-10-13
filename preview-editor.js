(function (root) {
  "use strict";
  const SETTINGS_KEY = "kdcwithbhas:preview-settings:v1";
  const defaults = {toolbar:true, marks:false, askPaste:true, pasteMode:"match", normalize:true, recovery:true, interval:30, retain:10, review:"changed", tabWidth:4};
  const labels = {normal:"सामान्य अनुच्छेद", heading:"शीर्षक", bahas:"बहस", thahar:"ठहर", tapasil:"तपसिल", signature:"हस्ताक्षर"};
  const baseStyle = {font:"Kalimati", size:13, bold:false, italic:false, underline:false, color:"#111111", align:"justify", line:1.15, before:0, after:0, left:0, right:0, first:0, keepNext:false, keepLines:false, tabs:""};
  const initialStyles = {
    normal:Object.assign({},baseStyle),
    heading:Object.assign({},baseStyle,{bold:true,align:"center",before:6,after:6,keepNext:true}),
    bahas:Object.assign({},baseStyle,{first:36}),
    thahar:Object.assign({},baseStyle,{first:36}),
    tapasil:Object.assign({},baseStyle,{left:18,first:-18}),
    signature:Object.assign({},baseStyle,{align:"right",keepLines:true})
  };
  function clamp(value, min, max, fallback) { const n=Number(value); return Number.isFinite(n)?Math.max(min,Math.min(max,n)):fallback; }
  function escapeHtml(text) { return String(text==null?"":text).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function normalized(text, enabled) {
    const chars=[], map=[]; let offset=0;
    const mappings={"ी":"ि","ू":"ु","ृ":"ि","ऋ":"रि","श":"स","ष":"स","ङ":"न","ण":"न","ञ":"न","ं":"न","व":"ब"};
    for(const ch of String(text)) {
      let part=enabled?(mappings[ch]||ch).replace(/[०-९]/g,c=>String("०१२३४५६७८९".indexOf(c))):ch;
      if(enabled && /[\u200b-\u200d\ufeff]/.test(ch)) part="";
      part=part.toLocaleLowerCase();
      for(let n=0;n<part.length;n++){chars.push(part[n]);map.push({start:offset,end:offset+ch.length});}
      offset+=ch.length;
    }
    return {text:chars.join(""),map};
  }
  function findOffsets(text, query, enabled) {
    const source=normalized(text,enabled), needle=normalized(query,enabled).text, results=[];
    if(!needle) return results;
    let at=0;
    while((at=source.text.indexOf(needle,at))!==-1) {
      const start=source.map[at].start, end=source.map[at+needle.length-1].end;
      if(!results.some(item=>item.start===start&&item.end===end))results.push({start,end});
      at+=needle.length;
    }
    return results;
  }
  function sanitizeStyle(value) {
    const s=Object.assign({},baseStyle,value||{});
    s.font=String(s.font||"Kalimati").replace(/[;<>{}\r\n]/g,"").slice(0,80);
    s.size=clamp(s.size,8,48,13);s.line=clamp(s.line,1,3,1.15);
    ["before","after","left","right"].forEach(k=>s[k]=clamp(s[k],0,144,0));
    s.first=clamp(s.first,-144,144,0);
    s.align=["left","center","right","justify"].includes(s.align)?s.align:"justify";
    s.color=/^#[a-f0-9]{6}$/i.test(s.color)?s.color:"#111111";
    ["bold","italic","underline","keepNext","keepLines"].forEach(k=>s[k]=s[k]===true);
    s.tabs=String(s.tabs||"").split(",").map(n=>Number(n.trim())).filter(n=>Number.isFinite(n)&&n>0&&n<=720).sort((a,b)=>a-b).filter((n,i,a)=>i===0||a[i-1]!==n).slice(0,20).join(", ");
    return s;
  }
  function sanitizeLayout(value) {
    const layout=Object.assign({paper:"A4",orientation:"portrait",top:20,right:20,bottom:20,left:20},value||{});
    layout.paper=layout.paper==="Letter"?"Letter":"A4";
    layout.orientation=layout.orientation==="landscape"?"landscape":"portrait";
    ["top","right","bottom","left"].forEach(k=>layout[k]=clamp(layout[k],0,60,20));
    return layout;
  }
  function pageGeometry(value) {
    const l=sanitizeLayout(value), size=l.paper==="Letter"?[215.9,279.4]:[210,297];
    if(l.orientation==="landscape")size.reverse();
    const twips=mm=>Math.round(mm*1440/25.4);
    return {width:twips(size[0]),height:twips(size[1]),mmWidth:size[0],mmHeight:size[1],top:twips(l.top),right:twips(l.right),bottom:twips(l.bottom),left:twips(l.left),landscape:l.orientation==="landscape"};
  }
  function attach(options) {
    const draft=options.draft, panel=options.panel, backdrop=options.backdrop;
    if(!draft||!panel||draft.dataset.previewEditorReady)return null;
    draft.dataset.previewEditorReady="1";
    let settings=Object.assign({},defaults), styles={}, snippets=[];
    try {
      const saved=JSON.parse(localStorage.getItem(SETTINGS_KEY)||"null");
      if(saved){
        Object.keys(defaults).forEach(k=>{if(typeof saved.preferences?.[k]===typeof defaults[k])settings[k]=saved.preferences[k];});
        styles=saved.styles||{};snippets=Array.isArray(saved.snippets)?saved.snippets.slice(0,50):[];
      }
    } catch (_) {}
    settings.interval=clamp(settings.interval,10,300,30);settings.retain=clamp(settings.retain,2,30,10);settings.tabWidth=clamp(settings.tabWidth,1,12,4);
    if(!["keep","match","plain"].includes(settings.pasteMode))settings.pasteMode="match";
    if(!["changed","always"].includes(settings.review))settings.review="changed";
    Object.keys(initialStyles).forEach(k=>styles[k]=sanitizeStyle(styles[k]||initialStyles[k]));
    snippets=snippets.filter(s=>s&&typeof s.name==="string"&&typeof s.text==="string").map(s=>({name:s.name.slice(0,80),text:s.text.slice(0,20000)}));
    let layout=null, key="", lastRange=null, composing=false, restoring=false, history=[], historyIndex=-1, historyTimer, recoveryTimer, findResults=[], findIndex=-1, pendingDialog=null, lastRecovery="";
    const status=document.createElement("p");
    status.className="pe-status";status.setAttribute("role","status");status.setAttribute("aria-live","polite");
    const toolbar=document.createElement("div");toolbar.className="pe-toolbar";toolbar.setAttribute("role","toolbar");toolbar.setAttribute("aria-label","Text formatting");
    toolbar.innerHTML='<select aria-label="Paragraph style" class="pe-quick-style">'+Object.keys(labels).map(k=>'<option value="'+k+'">'+labels[k]+'</option>').join("")+'</select><button type="button" data-pe-action="apply-style">Apply style</button><button type="button" data-pe-inline="bold" title="Bold (Ctrl+B)"><b>B</b></button><button type="button" data-pe-inline="italic" title="Italic (Ctrl+I)"><i>I</i></button><button type="button" data-pe-inline="underline" title="Underline (Ctrl+U)"><u>U</u></button><button type="button" data-pe-action="undo" aria-label="Undo">↶</button><button type="button" data-pe-action="redo" aria-label="Redo">↷</button><button type="button" data-pe-action="find">Find</button><button type="button" data-pe-action="marks" aria-label="Show formatting marks" aria-pressed="false">¶</button>';
    draft.parentElement.before(toolbar,status);
    const section=document.createElement("div");section.className="pe-tools";
    const field=(name,label,type,value,extra)=>'<label>'+label+'<input data-pe-field="'+name+'" type="'+(type||"number")+'" value="'+escapeHtml(value)+'" '+(extra||"")+'></label>';
    section.innerHTML=[
      '<details class="pe-section" open><summary>Paragraph styles & formatting</summary><div class="pe-fields">',
      '<label>Style<select data-pe-field="preset">'+Object.keys(labels).map(k=>'<option value="'+k+'">'+labels[k]+'</option>').join("")+'</select></label>',
      field("font","Font","text","Kalimati",'list="peFontNames"'),
      '<datalist id="peFontNames"><option>Kalimati</option><option>Nirmala UI</option><option>Noto Serif Devanagari</option><option>Noto Sans Devanagari</option><option>Arial</option><option>Times New Roman</option></datalist>',
      field("size","Size (pt)","number",13,'min="8" max="48" step="0.5"'),
      '<label>Alignment<select data-pe-field="align"><option value="justify">Justify</option><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></label>',
      field("color","Text colour","color","#111111"),
      field("line","Line spacing","number",1.15,'min="1" max="3" step="0.05"'),
      field("before","Space before (pt)","number",0,'min="0" max="144"'),
      field("after","Space after (pt)","number",0,'min="0" max="144"'),
      field("left","Left indent (pt)","number",0,'min="0" max="144"'),
      field("right","Right indent (pt)","number",0,'min="0" max="144"'),
      field("first","First line (− = hanging, pt)","number",0,'min="-144" max="144"'),
      field("tabs","Tab stops (pt, comma-separated)","text",""),
      '<label class="pe-check"><input data-pe-field="bold" type="checkbox">Bold</label><label class="pe-check"><input data-pe-field="italic" type="checkbox">Italic</label><label class="pe-check"><input data-pe-field="underline" type="checkbox">Underline</label>',
      '<label class="pe-check"><input data-pe-field="keepNext" type="checkbox">Keep with next</label><label class="pe-check"><input data-pe-field="keepLines" type="checkbox">Keep paragraph together</label>',
      '</div><div class="pe-buttons"><button type="button" data-pe-action="apply-format">Apply to paragraphs</button><button type="button" data-pe-action="save-style">Save this style</button><button type="button" data-pe-action="reset-style">Reset this style</button></div><small>Styles are customizable and saved in this browser. Applying a style affects selected paragraphs only.</small></details>',
      '<details class="pe-section" id="peFindSection"><summary>Find & replace</summary><div class="pe-fields">'+field("query","Find","text","")+field("replacement","Replace with","text","")+'<label>Scope<select data-pe-field="scope"><option value="body">Body text</option><option value="all">Whole document</option></select></label><label class="pe-check"><input data-pe-pref="normalize" type="checkbox">Nepali normalized search</label></div><div class="pe-buttons"><button type="button" data-pe-action="search">Find</button><button type="button" data-pe-action="previous">↑</button><button type="button" data-pe-action="next">↓</button><button type="button" data-pe-action="replace">Replace</button><button type="button" data-pe-action="replace-all">Replace all</button></div><output id="peFindCount" aria-live="polite">0 matches</output></details>',
      '<details class="pe-section"><summary>Page layout & paragraph breaks</summary><div class="pe-fields"><label>Paper<select data-pe-layout="paper"><option>A4</option><option>Letter</option></select></label><label>Orientation<select data-pe-layout="orientation"><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select></label>',
      ["top","right","bottom","left"].map(k=>'<label>'+k[0].toUpperCase()+k.slice(1)+' margin (mm)<input data-pe-layout="'+k+'" type="number" min="0" max="60" value="20"></label>').join(""),
      '</div><div class="pe-buttons"><button type="button" data-pe-action="apply-layout">Apply page layout</button><button type="button" data-pe-action="reset-layout">Original layout</button><button type="button" data-pe-action="page-break">Page break before paragraph</button><button type="button" data-pe-action="remove-break">Remove page break</button><button type="button" data-pe-action="keep-group">Keep selected paragraphs together</button></div><small>Margins, page breaks and keep options are included in DOCX. Automatic page flow is determined by Word or your print browser.</small></details>',
      '<details class="pe-section"><summary>Reusable text snippets</summary><div class="pe-fields"><label class="pe-full">Saved snippets<select data-pe-field="snippet"></select></label>'+field("snippetName","Name","text","")+'<label class="pe-full">Text<textarea data-pe-field="snippetText" rows="4" placeholder="तपाईंको नियमित प्रयोग हुने व्यहोरा"></textarea></label></div><div class="pe-buttons"><button type="button" data-pe-action="insert-snippet">Insert at cursor</button><button type="button" data-pe-action="save-snippet">Save snippet</button><button type="button" data-pe-action="remove-snippet">Remove snippet</button></div></details>',
      '<details class="pe-section"><summary>Recovery versions</summary><label>Saved versions<select data-pe-field="version"></select></label><div class="pe-buttons"><button type="button" data-pe-action="snapshot">Save version now</button><button type="button" data-pe-action="compare-version">Compare</button><button type="button" data-pe-action="restore-version">Restore</button></div><small id="peRecoveryNote">Recovery versions are kept in this browser, separately for each case.</small></details>',
      '<details class="pe-section"><summary>Customize editor</summary><div class="pe-fields"><label class="pe-check"><input data-pe-pref="toolbar" type="checkbox">Compact formatting toolbar</label><label class="pe-check"><input data-pe-pref="marks" type="checkbox">Show ¶ and tab marks</label><label class="pe-check"><input data-pe-pref="askPaste" type="checkbox">Ask how to paste</label><label>Default paste<select data-pe-pref="pasteMode"><option value="match">Paste as destination formatting</option><option value="keep">Paste as source formatting</option><option value="plain">Paste as text</option></select></label><label class="pe-check"><input data-pe-pref="recovery" type="checkbox">Automatic recovery versions</label>'+'<label>Save after idle (seconds)<input data-pe-pref="interval" type="number" min="10" max="300"></label><label>Versions per case<input data-pe-pref="retain" type="number" min="2" max="30"></label><label>Tab width (spaces)<input data-pe-pref="tabWidth" type="number" min="1" max="12"></label><label>Review imports<select data-pe-pref="review"><option value="changed">When text was edited</option><option value="always">Every re-import</option></select></label></div><small>Ctrl+B/I/U: formatting · Ctrl+Z/Y: undo/redo · Ctrl+F/H: find/replace · Ctrl+S: Save · Enter: new paragraph · Tab: insert tab.</small></details>'
    ].join("");
    panel.querySelector(".cob-tools-status").before(section);
    const continuation=document.createElement("button");continuation.type="button";continuation.textContent="Continue previous numbering";continuation.addEventListener("mousedown",e=>e.preventDefault());continuation.addEventListener("click",()=>transact(()=>options.continueNumbering?.()));
    panel.querySelector(".cob-numbering-tools")?.append(continuation);
    const fieldNode=name=>section.querySelector('[data-pe-field="'+name+'"]');
    function tell(message) {status.textContent=message||"";}
    function persistPreferences() {
      try{localStorage.setItem(SETTINGS_KEY,JSON.stringify({preferences:settings,styles,snippets}));}
      catch(_){tell("Settings could not be saved: browser storage is full or unavailable.");}
    }
    function viewPreferences() {
      toolbar.hidden=!settings.toolbar;draft.classList.toggle("pe-show-marks",settings.marks);draft.style.tabSize=String(settings.tabWidth);
      toolbar.querySelector('[data-pe-action="marks"]').setAttribute("aria-pressed",String(settings.marks));
      section.querySelectorAll("[data-pe-pref]").forEach(el=>{const value=settings[el.dataset.pePref];el.type==="checkbox"?el.checked=!!value:el.value=String(value);});
    }
    function styleForm(value) {const s=sanitizeStyle(value);Object.keys(s).forEach(k=>{const el=fieldNode(k);if(el)el.type==="checkbox"?el.checked=s[k]:el.value=s[k];});}
    function readStyle() {const s={};Object.keys(baseStyle).forEach(k=>{const el=fieldNode(k);s[k]=el.type==="checkbox"?el.checked:el.value;});return sanitizeStyle(s);}
    function saveRange() {const s=getSelection();if(s?.rangeCount&&draft.contains(s.getRangeAt(0).commonAncestorContainer))lastRange=s.getRangeAt(0).cloneRange();}
    function activeRange() {
      saveRange();
      if(lastRange&&draft.contains(lastRange.commonAncestorContainer))return lastRange.cloneRange();
      return null;
    }
    function selectRange(range, focus) {
      if(focus)draft.focus();
      const s=getSelection();s.removeAllRanges();s.addRange(range);lastRange=range.cloneRange();options.rememberRange?.();
    }
    function blockFor(node) {const el=node?.nodeType===1?node:node?.parentElement;const block=el?.closest("p,li,h1,h2,h3,h4,h5,h6,[data-docx-p]");return block&&draft.contains(block)?block:null;}
    function blocksFor(range) {
      if(!range)return [];
      if(range.collapsed){const b=blockFor(range.startContainer);return b?[b]:[];}
      return Array.from(draft.querySelectorAll("p,li,h1,h2,h3,h4,h5,h6,[data-docx-p]")).filter(b=>!b.querySelector("p,li,[data-docx-p]")&&range.intersectsNode(b));
    }
    function textNodes(element) {
      const walker=document.createTreeWalker(element,NodeFilter.SHOW_TEXT),nodes=[];let n;
      while((n=walker.nextNode()))if(!n.parentElement.closest('[data-cob-list-marker],[contenteditable="false"]'))nodes.push(n);
      return nodes;
    }
    function bookmark() {
      const r=activeRange();if(!r)return null;
      function point(node,offset){const path=[];while(node&&node!==draft){path.unshift(Array.prototype.indexOf.call(node.parentNode.childNodes,node));node=node.parentNode;}return node===draft?{path,offset}:null;}
      return {start:point(r.startContainer,r.startOffset),end:point(r.endContainer,r.endOffset)};
    }
    function restoreBookmark(saved) {
      if(!saved?.start||!saved?.end){lastRange=null;return;}
      function point(p){let node=draft;for(const index of p.path){node=node.childNodes[index];if(!node)return null;}return {node,offset:Math.min(p.offset,node.nodeType===3?node.length:node.childNodes.length)};}
      const a=point(saved.start),b=point(saved.end);if(!a||!b)return;
      const r=document.createRange();try{r.setStart(a.node,a.offset);r.setEnd(b.node,b.offset);selectRange(r,false);}catch(_){lastRange=null;}
    }
    function snapshot() {return {state:options.getState(),layout:layout?Object.assign({},layout):null,caret:bookmark()};}
    function fingerprint(s) {return JSON.stringify({state:s.state,layout:s.layout});}
    function rememberHistory() {
      clearTimeout(historyTimer);
      if(restoring||!key)return;
      const s=snapshot();if(historyIndex>=0&&fingerprint(history[historyIndex])===fingerprint(s))return;
      history=history.slice(0,historyIndex+1);history.push(s);if(history.length>100)history.shift();historyIndex=history.length-1;updateUndo();
    }
    function updateUndo() {toolbar.querySelector('[data-pe-action="undo"]').disabled=historyIndex<=0;toolbar.querySelector('[data-pe-action="redo"]').disabled=historyIndex>=history.length-1;}
    function applyLayout(value) {
      layout=value?sanitizeLayout(value):null;
      if(layout) {
        const g=pageGeometry(layout);draft.style.padding=layout.top+"mm "+layout.right+"mm "+layout.bottom+"mm "+layout.left+"mm";
        draft.style.width=g.mmWidth+"mm";draft.style.minHeight=g.mmHeight+"mm";draft.classList.add("pe-page-layout");
      } else {["padding","width","min-height"].forEach(k=>draft.style.removeProperty(k));draft.classList.remove("pe-page-layout");}
      const l=layout||options.defaultLayout();
      section.querySelectorAll("[data-pe-layout]").forEach(el=>el.value=l[el.dataset.peLayout]);
      let printStyle=document.getElementById("pePrintPageStyle");
      if(!printStyle){printStyle=document.createElement("style");printStyle.id="pePrintPageStyle";document.head.append(printStyle);}
      printStyle.textContent=layout?"@page {size:"+layout.paper+" "+layout.orientation+";margin:"+layout.top+"mm "+layout.right+"mm "+layout.bottom+"mm "+layout.left+"mm;}":"";
    }
    function restoreSnapshot(s) {
      restoring=true;options.restoreState(s.state);applyLayout(s.layout);viewPreferences();draft.dispatchEvent(new Event("input",{bubbles:true}));restoring=false;restoreBookmark(s.caret);findResults=[];clearHighlights();scheduleRecovery();
    }
    function undo(delta) {rememberHistory();const target=historyIndex+delta;if(target<0||target>=history.length)return;historyIndex=target;restoreSnapshot(history[target]);updateUndo();tell(delta<0?"Undo":"Redo");}
    function transact(action) {rememberHistory();action();draft.dispatchEvent(new Event("input",{bubbles:true}));rememberHistory();saveRange();}
    function applyParagraph(style, name) {
      const blocks=blocksFor(activeRange());if(!blocks.length){tell("पहिले paragraph मा cursor राख्नुहोस् वा paragraphs छान्नुहोस्।");return;}
      const s=sanitizeStyle(style);
      blocks.forEach(b=>{
        b.dataset.docxP="1";if(name)b.dataset.peStyle=name;
        Object.assign(b.style,{fontFamily:s.font,fontSize:s.size+"pt",fontWeight:s.bold?"700":"400",fontStyle:s.italic?"italic":"normal",textDecoration:s.underline?"underline":"none",color:s.color,textAlign:s.align,lineHeight:String(s.line),marginTop:s.before+"pt",marginBottom:s.after+"pt",marginLeft:s.left+"pt",marginRight:s.right+"pt",textIndent:s.first+"pt"});
        b.dataset.cobCustomIndent=String(s.left);b.dataset.cobCustomFirst=String(s.first);b.dataset.docxLeft=String(Math.round(s.left*20));b.dataset.peTabs=s.tabs;
        b.dataset.peKeepNext=s.keepNext?"1":"0";b.dataset.peKeepLines=s.keepLines?"1":"0";
      });
      tell("Paragraph formatting applied.");
      updateTabs();
    }
    function inline(property,value) {
      const range=activeRange();if(!range){tell("पहिले text छान्नुहोस्।");return;}
      const blocks=blocksFor(range);
      const target=range.cloneRange();if(target.collapsed&&blocks[0])target.selectNodeContents(blocks[0]);
      if(target.collapsed)return;
      const parts=textNodes(draft).filter(n=>target.intersectsNode(n)).map(n=>({node:n,start:n===target.startContainer?target.startOffset:0,end:n===target.endContainer?target.endOffset:n.length})).filter(p=>p.end>p.start);
      parts.reverse().forEach(p=>{if(p.end<p.node.length)p.node.splitText(p.end);const n=p.start?p.node.splitText(p.start):p.node;const span=document.createElement("span");span.style[property]=value;n.before(span);span.append(n);});
      if(parts.length){const r=document.createRange();r.setStartBefore(parts[parts.length-1].node.parentElement);r.setEndAfter(parts[0].node.parentElement);selectRange(r,true);}
    }
    function toggleInline(mode) {
      const r=activeRange(),b=r&&blockFor(r.startContainer);if(!r||!b){tell("पहिले text वा paragraph छान्नुहोस्।");return;}
      const el=r.startContainer.nodeType===1?r.startContainer:r.startContainer.parentElement,s=getComputedStyle(el);
      if(mode==="bold")inline("fontWeight",Number(s.fontWeight)>=600?"400":"700");
      if(mode==="italic")inline("fontStyle",s.fontStyle==="italic"?"normal":"italic");
      if(mode==="underline")inline("textDecoration",s.textDecorationLine.includes("underline")?"none":"underline");
    }
    function refreshSnippets() {
      const select=fieldNode("snippet"), selected=select.value;select.replaceChildren(new Option("Select or create a snippet",""));
      snippets.forEach((s,i)=>select.add(new Option(s.name,String(i))));select.value=selected;
    }
    function clearHighlights(){if(root.CSS?.highlights)root.CSS.highlights.delete("pe-search");}
    function rangeFromOffsets(nodes,start,end) {
      let offset=0,a,b;
      for(const n of nodes){const next=offset+n.length;if(!a&&start<next)a={n,offset:start-offset};if(end<=next&&end>offset){b={n,offset:end-offset};break;}offset=next;}
      if(!a||!b)return null;const r=document.createRange();r.setStart(a.n,a.offset);r.setEnd(b.n,b.offset);return r;
    }
    function search(selectFirst) {
      clearHighlights();findResults=[];findIndex=-1;
      const scope=fieldNode("scope").value==="all"?draft:(draft.querySelector("[data-cob-main-body]")||draft);
      Array.from(scope.querySelectorAll("p,li,h1,h2,h3,h4,h5,h6,[data-docx-p]")).filter(b=>!b.querySelector("p,li,[data-docx-p]")).forEach(b=>{
        const nodes=textNodes(b),text=nodes.map(n=>n.nodeValue).join("");
        findOffsets(text,fieldNode("query").value,settings.normalize).forEach(hit=>{const r=rangeFromOffsets(nodes,hit.start,hit.end);if(r)findResults.push(r);});
      });
      if(root.CSS?.highlights&&root.Highlight)root.CSS.highlights.set("pe-search",new root.Highlight(...findResults.slice(0,1000)));
      if(selectFirst&&findResults.length)jump(1);else showCount();
    }
    function showCount(){section.querySelector("#peFindCount").textContent=findResults.length?(Math.max(0,findIndex)+1)+" / "+findResults.length:"0 matches";}
    function jump(delta) {if(!findResults.length){search(false);if(!findResults.length)return;}findIndex=(findIndex+delta+findResults.length)%findResults.length;selectRange(findResults[findIndex],true);blockFor(findResults[findIndex].startContainer)?.scrollIntoView({block:"nearest"});showCount();}
    function replace(all) {
      search(false);if(!findResults.length)return;
      const ranges=all?findResults.slice().reverse():[findResults.find(r=>lastRange&&r.startContainer===lastRange.startContainer&&r.startOffset===lastRange.startOffset)||findResults[0]];
      const replacement=fieldNode("replacement").value;
      ranges.forEach(r=>{r.deleteContents();const text=document.createTextNode(replacement);r.insertNode(text);r.setStartAfter(text);r.collapse(true);lastRange=r.cloneRange();});
      const count=ranges.length;findResults=[];clearHighlights();tell(count+" replacement(s) applied.");showCount();
    }
    function newParagraph(text) {const p=document.createElement("p");p.dataset.docxP="1";if(text)p.append(document.createTextNode(text));else p.append(document.createElement("br"));return p;}
    function updateTabs() {
      draft.querySelectorAll("[data-pe-tab]").forEach(tab=>{
        const block=blockFor(tab),stops=String(block?.dataset.peTabs||"").split(",").map(Number).filter(n=>n>0&&n<=720);
        tab.style.removeProperty("width");tab.style.removeProperty("display");
        if(!block||!stops.length)return;
        const position=tab.getBoundingClientRect().left-block.getBoundingClientRect().left;
        const next=stops.map(n=>n*4/3).find(n=>n>position+1);
        if(next){tab.style.display="inline-block";tab.style.width=Math.max(1,next-position)+"px";}
      });
    }
    function insertParagraphs(paragraphs,range) {
      range=range||activeRange();if(!range||!paragraphs.length){tell("पहिले body text मा cursor राख्नुहोस्।");return;}
      let block=blockFor(range.startContainer);if(!block){tell("पहिले paragraph मा cursor राख्नुहोस्।");return;}
      range.deleteContents();block=blockFor(range.startContainer)||block;
      const tailRange=document.createRange();tailRange.selectNodeContents(block);tailRange.setStart(range.startContainer,range.startOffset);const tail=tailRange.extractContents();
      const first=paragraphs.shift();if(!block.textContent.trim()&&!block.querySelector("[data-cob-list-marker]")){block.replaceChildren();block.style.cssText=first.style.cssText||block.style.cssText;}
      Array.from(first.childNodes).forEach(n=>block.append(n));
      let last=block;paragraphs.forEach(p=>{["cobBahas","cobAdesh"].forEach(k=>{if(block.dataset[k])p.dataset[k]=block.dataset[k];});last.after(p);last=p;});
      const caret=document.createRange();caret.selectNodeContents(last);caret.collapse(false);
      if(tail.textContent||tail.querySelector("br,img")) {
        const next=block.cloneNode(false);next.removeAttribute("id");next.querySelectorAll?.("[data-cob-list-marker]").forEach(n=>n.remove());next.append(tail);last.after(next);
      }
      selectRange(caret,true);
    }
    function sanitizedPaste(html, mode, text) {
      if(mode==="plain"||!html)return String(text||"").replace(/\r/g,"").split("\n").map(newParagraph);
      const template=document.createElement("template");template.innerHTML=html;
      template.content.querySelectorAll("script,style,iframe,object,embed,svg,math,img,video,audio,link,meta,form,input,button,textarea").forEach(n=>n.remove());
      const output=[];
      function inlineContent(node,parent) {
        if(node.nodeType===3){parent.append(document.createTextNode(node.nodeValue));return;}
        if(node.nodeType!==1)return;
        if(node.tagName==="BR"){parent.append(document.createTextNode(" "));return;}
        const el=document.createElement(mode==="keep"&&/^(B|STRONG|I|EM|U|S|SUP|SUB)$/.test(node.tagName)?node.tagName.toLowerCase():"span");
        if(mode==="keep"){
          const allowed=["fontFamily","fontSize","fontWeight","fontStyle","textDecoration","color","backgroundColor","verticalAlign"];
          allowed.forEach(k=>{const v=node.style?.[k];if(v&&!/url\s*\(|expression|javascript:/i.test(v))el.style[k]=v;});
        }
        Array.from(node.childNodes).forEach(n=>inlineContent(n,el));parent.append(el);
      }
      const selector="p,div,li,h1,h2,h3,h4,h5,h6,blockquote";
      let pending=document.createElement("p");pending.dataset.docxP="1";
      function flush(){if(pending.childNodes.length){output.push(pending);pending=document.createElement("p");pending.dataset.docxP="1";}}
      function visit(node) {
        if(node.nodeType===1&&node.matches(selector)){
          flush();
          if(Array.from(node.children).some(c=>c.matches(selector)||c.matches("ul,ol,table,tbody,tr")))Array.from(node.childNodes).forEach(visit);
          else {
            const p=document.createElement("p");p.dataset.docxP="1";
            if(mode==="keep"){["textAlign","lineHeight","marginTop","marginBottom","marginLeft","marginRight","textIndent"].forEach(k=>{const v=node.style?.[k];if(v&&!/url\s*\(|expression/i.test(v))p.style[k]=v;});}
            Array.from(node.childNodes).forEach(n=>inlineContent(n,p));if(!p.childNodes.length)p.append(document.createElement("br"));output.push(p);
          }
        }else if(node.nodeType===1&&node.matches("ul,ol,table,tbody,tr,td,th")){flush();Array.from(node.childNodes).forEach(visit);flush();}
        else inlineContent(node,pending);
      }
      Array.from(template.content.childNodes).forEach(visit);flush();
      return output.length?output:String(text||"").split("\n").map(newParagraph);
    }
    function orderParagraphs(text,preserveFormatting=true) {
      const source=String(text||"").replace(/\r/g,"");
      const rich=/<\/?(?:b|strong|i|em|u|s|sup|sub|span|br|p|div|h[1-6]|blockquote|li|ul|ol)\b[^>]*>/i.test(source);
      const paragraphs=rich?sanitizedPaste(source,"keep","").flatMap(p=>{
        // Split actual catalog newlines without losing formatting that spans them.
        const walker=document.createTreeWalker(p,NodeFilter.SHOW_TEXT),nodes=[];let node;
        while((node=walker.nextNode()))nodes.push(node);
        const range=document.createRange(),parts=[];range.setStart(p,0);
        function appendPart(){const part=p.cloneNode(false);part.append(range.cloneContents());parts.push(part);}
        nodes.forEach(n=>{for(let i=0;i<n.nodeValue.length;i++)if(n.nodeValue[i]==="\n"){range.setEnd(n,i);appendPart();range.setStart(n,i+1);}});
        range.setEnd(p,p.childNodes.length);appendPart();return parts;
      }):source.split("\n").map(newParagraph);
      return paragraphs.filter(p=>p.textContent.trim()).map(p=>preserveFormatting?p:newParagraph(p.textContent));
    }
    function dialog(title, build, actions) {
      if(pendingDialog)return Promise.resolve(null);
      const overlay=document.createElement("div");overlay.className="pe-dialog-backdrop";
      const card=document.createElement("section");card.className="pe-dialog";card.setAttribute("role","dialog");card.setAttribute("aria-modal","true");card.setAttribute("aria-label",title);
      const head=document.createElement("h3");head.textContent=title;card.append(head);build(card);
      const footer=document.createElement("div");footer.className="pe-buttons";card.append(footer);overlay.append(card);backdrop.append(overlay);
      const modal=backdrop.querySelector(".cob-modal"),wasInert=modal.inert;modal.inert=true;
      return new Promise(resolve=>{
        function close(value){overlay.remove();modal.inert=wasInert;pendingDialog=null;resolve(value);}
        pendingDialog={close};
        actions.forEach(a=>{const button=document.createElement("button");button.type="button";button.textContent=a.label;if(a.primary)button.className="pe-primary";button.addEventListener("click",()=>close(typeof a.value==="function"?a.value(card):a.value));footer.append(button);});
        overlay.addEventListener("keydown",e=>{
          if(e.key==="Escape"){e.preventDefault();e.stopPropagation();close(null);}
          if(e.key==="Tab"){const focusable=Array.from(card.querySelectorAll("button,textarea,input,select")).filter(el=>!el.disabled),first=focusable[0],last=focusable[focusable.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
        });footer.querySelector("button")?.focus();
      });
    }
    function comparison(card,before,after,editable) {
      const grid=document.createElement("div");grid.className="pe-compare";
      [["Current text",before,false],["Proposed text",after,editable]].forEach(([label,text,edit])=>{
        const wrapper=document.createElement("label");wrapper.textContent=label;
        const area=document.createElement("textarea");area.value=text;area.readOnly=!edit;if(edit)area.dataset.peProposed="1";wrapper.append(area);grid.append(wrapper);
      });card.append(grid);
      const oldLines=before.split("\n"),newLines=after.split("\n"),changes=document.createElement("div");changes.className="pe-diff";changes.setAttribute("aria-label","Changed paragraphs");
      oldLines.filter(l=>l&&!newLines.includes(l)).slice(0,80).forEach(line=>{const p=document.createElement("p");p.className="pe-deleted";p.textContent="− "+line;changes.append(p);});
      newLines.filter(l=>l&&!oldLines.includes(l)).slice(0,80).forEach(line=>{const p=document.createElement("p");p.className="pe-added";p.textContent="+ "+line;changes.append(p);});
      if(!changes.childNodes.length)changes.textContent="Text is unchanged; formatting may differ.";card.append(changes);
    }
    function importedText(kind) {return Array.from(draft.querySelectorAll('[data-cob-'+kind+'="1"]')).map(p=>{const clone=p.cloneNode(true);clone.querySelectorAll("[data-cob-list-marker]").forEach(n=>n.remove());return clone.textContent.replace(/\s+/g," ").trim();}).join("\n");}
    function importedHtml(kind) {return Array.from(draft.querySelectorAll('[data-cob-'+kind+'="1"]')).map(p=>{const clone=p.cloneNode(true);clone.removeAttribute("data-cob-import-baseline");clone.removeAttribute("data-cob-import-format");return clone.outerHTML;}).join("");}
    function markImported(kind) {const p=draft.querySelector('[data-cob-'+kind+'="1"]');if(p){p.dataset.cobImportBaseline=encodeURIComponent(importedText(kind));p.dataset.cobImportFormat=encodeURIComponent(importedHtml(kind));}}
    async function reviewImport(kind,incoming) {
      const first=draft.querySelector('[data-cob-'+kind+'="1"]');if(!first)return incoming;
      const current=importedText(kind);let baseline=null,formatBaseline=null;try{baseline=decodeURIComponent(first.dataset.cobImportBaseline||"");formatBaseline=decodeURIComponent(first.dataset.cobImportFormat||"");}catch(_){}
      if(settings.review==="changed"&&baseline&&formatBaseline&&current===baseline&&importedHtml(kind)===formatBaseline)return incoming;
      saveVersion("Before "+kind+" re-import");
      const proposed=kind==="adesh"?orderParagraphs(incoming).map(p=>p.textContent).join("\n"):incoming;
      return dialog((kind==="bahas"?"बहस":"आदेश")+" — review before replacing",card=>comparison(card,current,proposed,true),[
        {label:"Keep current text",value:null},
        {label:"Replace with proposed text",primary:true,value:card=>{const edited=card.querySelector("[data-pe-proposed]").value;return edited===proposed?incoming:edited;}}
      ]);
    }
    function versions() {try{const v=JSON.parse(localStorage.getItem(key+":recovery:v1")||"[]");return Array.isArray(v)?v.filter(x=>x&&x.snapshot?.state?.draftHtml).slice(-30):[];}catch(_){return [];}}
    function versionList() {const select=fieldNode("version"),selected=select.value;select.replaceChildren(new Option("Select a recovery version",""));versions().slice().reverse().forEach(v=>select.add(new Option(new Date(v.time).toLocaleString()+" · "+v.label,v.id)));if(Array.from(select.options).some(o=>o.value===selected))select.value=selected;}
    function selectedVersion(){return versions().find(v=>v.id===fieldNode("version").value);}
    function saveVersion(label) {
      clearTimeout(recoveryTimer);if(!key||!draft.innerHTML)return;
      rememberHistory();const s=snapshot(),fp=fingerprint(s);
      if(fp===lastRecovery&&label==="Automatic recovery")return;
      const list=versions();list.push({id:Date.now()+"-"+Math.random().toString(36).slice(2,7),time:new Date().toISOString(),label:label||"Manual version",snapshot:s});
      try{localStorage.setItem(key+":recovery:v1",JSON.stringify(list.slice(-settings.retain)));lastRecovery=fp;versionList();section.querySelector("#peRecoveryNote").textContent="Recovery saved "+new Date().toLocaleTimeString()+" · this browser only.";}
      catch(_){tell("Recovery could not be saved: browser storage is full or unavailable. Use Save or download your document.");}
    }
    function scheduleRecovery(){clearTimeout(recoveryTimer);if(settings.recovery&&key)recoveryTimer=setTimeout(()=>saveVersion("Automatic recovery"),settings.interval*1000);}
    function visibleText(html) {const template=document.createElement("template");template.innerHTML=options.sanitize(html);return Array.from(template.content.querySelectorAll("p,li,h1,h2,h3")).map(p=>p.textContent).join("\n");}
    function open(keyValue,stored) {
      clearTimeout(historyTimer);clearTimeout(recoveryTimer);key=keyValue;lastRange=null;history=[];historyIndex=-1;lastRecovery="";findResults=[];clearHighlights();
      applyLayout(stored?.previewLayout||null);viewPreferences();updateTabs();rememberHistory();versionList();tell("");
      const last=versions().at(-1);
      if(last&&(!stored?.savedAt||new Date(last.time)>new Date(stored.savedAt)))tell("A newer recovery version is available in Tools → Recovery versions.");
    }
    function close(){if(key&&settings.recovery)saveVersion("Before closing");clearTimeout(historyTimer);clearTimeout(recoveryTimer);pendingDialog?.close(null);key="";lastRange=null;clearHighlights();}
    section.addEventListener("change",e=>{
      if(e.target.matches("[data-pe-pref]")){
        const pref=e.target.dataset.pePref;settings[pref]=e.target.type==="checkbox"?e.target.checked:typeof defaults[pref]==="number"?clamp(e.target.value,pref==="retain"?2:pref==="tabWidth"?1:10,pref==="retain"?30:pref==="tabWidth"?12:300,defaults[pref]):e.target.value;
        persistPreferences();viewPreferences();scheduleRecovery();if(pref==="normalize")search(false);
      }
      if(e.target===fieldNode("preset"))styleForm(styles[e.target.value]);
      if(e.target===fieldNode("snippet")){const s=snippets[Number(e.target.value)];fieldNode("snippetName").value=e.target.value!==""&&s?s.name:"";fieldNode("snippetText").value=e.target.value!==""&&s?s.text:"";}
    });
    fieldNode("query").addEventListener("input",()=>search(false));
    section.querySelectorAll("button").forEach(button=>button.addEventListener("mousedown",e=>e.preventDefault()));
    toolbar.querySelectorAll("button").forEach(button=>button.addEventListener("mousedown",e=>e.preventDefault()));
    function runAction(action) {
      if(action==="undo")return undo(-1);if(action==="redo")return undo(1);
      if(action==="marks"){settings.marks=!settings.marks;persistPreferences();viewPreferences();return;}
      if(action==="find"){options.showTools();section.querySelector("#peFindSection").open=true;fieldNode("query").focus();return;}
      if(action==="apply-style"){const name=toolbar.querySelector("select").value;return transact(()=>applyParagraph(styles[name],name));}
      if(action==="apply-format")return transact(()=>applyParagraph(readStyle(),fieldNode("preset").value));
      if(action==="save-style"){styles[fieldNode("preset").value]=readStyle();persistPreferences();tell("Custom style saved.");return;}
      if(action==="reset-style"){const name=fieldNode("preset").value;styles[name]=Object.assign({},initialStyles[name]);styleForm(styles[name]);persistPreferences();return;}
      if(action==="search")return search(true);if(action==="previous")return jump(-1);if(action==="next")return jump(1);
      if(action==="replace"||action==="replace-all")return transact(()=>replace(action==="replace-all"));
      if(action==="apply-layout")return transact(()=>{const value={};section.querySelectorAll("[data-pe-layout]").forEach(el=>value[el.dataset.peLayout]=el.value);applyLayout(value);tell("Page layout applied to preview and exports.");});
      if(action==="reset-layout")return transact(()=>applyLayout(null));
      if(["page-break","remove-break","keep-group"].includes(action))return transact(()=>{const blocks=blocksFor(activeRange());blocks.forEach((b,i)=>{if(action==="keep-group"){b.dataset.peKeepLines="1";b.dataset.peKeepNext=i<blocks.length-1?"1":"0";}else b.dataset.pePageBefore=action==="page-break"?"1":"0";});tell(blocks.length+" paragraph(s) updated.");});
      if(action==="save-snippet"){
        const name=fieldNode("snippetName").value.trim(),text=fieldNode("snippetText").value;if(!name||!text.trim()){tell("Enter a snippet name and text.");return;}
        const existing=snippets.findIndex(s=>s.name===name),snippet={name:name.slice(0,80),text:text.slice(0,20000)};if(existing>=0)snippets[existing]=snippet;else if(snippets.length<50)snippets.push(snippet);else{tell("Maximum 50 snippets.");return;}persistPreferences();refreshSnippets();tell("Snippet saved.");return;
      }
      if(action==="remove-snippet"){const index=fieldNode("snippet").value;if(index!==""){snippets.splice(Number(index),1);persistPreferences();refreshSnippets();fieldNode("snippetName").value="";fieldNode("snippetText").value="";}return;}
      if(action==="insert-snippet")return transact(()=>insertParagraphs(fieldNode("snippetText").value.replace(/\r/g,"").split("\n").map(newParagraph)));
      if(action==="snapshot"){saveVersion("Manual version");tell("Recovery version saved.");return;}
      if(action==="compare-version"){const v=selectedVersion();if(v)return dialog("Compare recovery version",card=>comparison(card,visibleText(draft.innerHTML),visibleText(v.snapshot.state.draftHtml),false),[{label:"Close",value:null}]);}
      if(action==="restore-version"){const v=selectedVersion();if(v){saveVersion("Before restore");rememberHistory();restoreSnapshot(v.snapshot);rememberHistory();tell("Recovery version restored. Undo is available.");}return;}
    }
    section.addEventListener("click",e=>{const b=e.target.closest("[data-pe-action]");if(b)runAction(b.dataset.peAction);});
    toolbar.addEventListener("click",e=>{const b=e.target.closest("button");if(b?.dataset.peInline)transact(()=>toggleInline(b.dataset.peInline));else if(b?.dataset.peAction)runAction(b.dataset.peAction);});
    document.addEventListener("selectionchange",saveRange);
    draft.addEventListener("compositionstart",()=>composing=true);
    draft.addEventListener("compositionend",()=>{composing=false;rememberHistory();scheduleRecovery();});
    draft.addEventListener("input",()=>{
      updateTabs();if(restoring)return;clearHighlights();findResults=[];showCount();
      clearTimeout(historyTimer);if(!composing)historyTimer=setTimeout(rememberHistory,350);
      scheduleRecovery();
    });
    draft.addEventListener("keydown",e=>{
      if(e.isComposing||composing)return;
      const mod=e.ctrlKey||e.metaKey,k=e.key.toLowerCase();
      if(mod&&e.key==="Enter"){e.preventDefault();e.stopImmediatePropagation();runAction("page-break");return;}
      if(mod&&["z","y","b","i","u","f","h","s"].includes(k)){
        e.preventDefault();e.stopImmediatePropagation();
        if(k==="z")undo(e.shiftKey?1:-1);else if(k==="y")undo(1);
        else if(k==="s")options.save();
        else if(k==="f"||k==="h"){runAction("find");if(k==="h")fieldNode("replacement").focus();}
        else transact(()=>toggleInline({b:"bold",i:"italic",u:"underline"}[k]));
        return;
      }
      if(e.key==="Tab"&&!mod&&!e.altKey&&!e.shiftKey){e.preventDefault();transact(()=>{const r=activeRange();if(!r)return;r.deleteContents();const tab=document.createElement("span");tab.dataset.peTab="1";tab.textContent="\t";r.insertNode(tab);r.setStartAfter(tab);r.collapse(true);selectRange(r,true);});return;}
      if(e.key==="Enter"&&!mod&&!e.altKey){
        const r=activeRange(),block=r&&blockFor(r.startContainer);if(!r||!block)return;
        if(block.dataset.cobList)return; // Existing list continuation owns numbered/bullet paragraphs.
        e.preventDefault();e.stopImmediatePropagation();
        transact(()=>{r.deleteContents();const tail=document.createRange();tail.selectNodeContents(block);tail.setStart(r.startContainer,r.startOffset);const next=block.cloneNode(false);next.removeAttribute("id");next.removeAttribute("data-pe-page-before");next.append(tail.extractContents());if(!next.textContent&&!next.querySelector("br,img"))next.replaceChildren(document.createElement("br"));if(!block.textContent&&!block.querySelector("br,img"))block.replaceChildren(document.createElement("br"));block.after(next);const caret=document.createRange();caret.selectNodeContents(next);caret.collapse(true);selectRange(caret,true);});
      }
    },true);
    draft.addEventListener("paste",async e=>{
      if(!e.clipboardData)return;e.preventDefault();if(composing)return;
      const text=e.clipboardData.getData("text/plain"),html=e.clipboardData.getData("text/html"),range=activeRange();
      if(!range)return;
      const destination=blockFor(range.startContainer),at=range.startContainer.nodeType===1?range.startContainer:range.startContainer.parentElement;
      const destinationStyle=at&&getComputedStyle(at),inlineStyle={};
      if(destinationStyle)["fontFamily","fontSize","fontWeight","fontStyle","textDecoration","color","backgroundColor","verticalAlign"].forEach(k=>{inlineStyle[k]=destinationStyle[k];});
      // Underline and strike decorations can be set on an ancestor of the cursor.
      let decorated=at;const decorations=new Set();
      while(decorated&&draft.contains(decorated)){getComputedStyle(decorated).textDecorationLine.split(" ").filter(v=>v!=="none").forEach(v=>decorations.add(v));decorated=decorated.parentElement;}
      inlineStyle.textDecoration=Array.from(decorations).join(" ")||"none";
      let mode=settings.pasteMode;
      if(settings.askPaste)mode=await dialog("Paste options",card=>{const p=document.createElement("p");p.textContent="Choose how this text should appear in your document.";card.append(p);},[
        {label:"Paste as text",value:"plain"},{label:"Paste as source formatting",value:"keep"},{label:"Paste as destination formatting",value:"match",primary:true},{label:"Cancel",value:null}
      ]);
      if(!mode)return;
      transact(()=>{
        const paragraphs=sanitizedPaste(html,mode,text);
        if(mode!=="keep")paragraphs.forEach(p=>{if(destination)p.style.cssText=destination.style.cssText;});
        if(mode==="match")paragraphs.forEach(p=>{const span=document.createElement("span");Object.assign(span.style,inlineStyle);span.append(...Array.from(p.childNodes));p.append(span);});
        insertParagraphs(paragraphs,range);
      });tell("Pasted with "+mode+" formatting.");
    },true);
    document.addEventListener("visibilitychange",()=>{if(document.hidden&&settings.recovery&&key)saveVersion("Automatic recovery");});
    root.addEventListener("pagehide",()=>{if(settings.recovery&&key)saveVersion("Before leaving");});
    refreshSnippets();styleForm(styles.normal);viewPreferences();updateUndo();
    return {open,close,getLayout:()=>layout?Object.assign({},layout):null,reviewImport,orderParagraphs,imported:markImported,checkpoint:rememberHistory,refresh:()=>{applyLayout(layout);viewPreferences();updateTabs();},saveVersion};
  }
  const api={attach,findOffsets,sanitizeStyle,sanitizeLayout,pageGeometry,normalized};
  root.COBPreviewEnhancements=api;
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof window!=="undefined"?window:globalThis);
