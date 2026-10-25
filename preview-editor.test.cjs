"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const editor = require("./preview-editor.js");

// A normalized search must map back to the original, unmodified Nepali text.
assert.deepEqual(editor.findOffsets("ऋषि तथा ऋषि", "रिसि", true), [{start:0,end:3},{start:8,end:11}]);
assert.deepEqual(editor.findOffsets("Licence २१५५९", "21559", true), [{start:8,end:13}]);
assert.deepEqual(editor.findOffsets("राम\u200dबहादुर", "रामबहादुर", true), [{start:0,end:10}]);
assert.deepEqual(editor.findOffsets("राम तथा राम", "राम", false), [{start:0,end:3},{start:8,end:11}]);
assert.deepEqual(editor.findOffsets("राम", "", true), []);
assert.deepEqual(editor.findOffsets("राम", "शिव", true), []);

// Overlapping/native multi-ranges must never format the same characters twice;
// gaps between independent Ctrl selections must stay unselected.
assert.deepEqual(editor.mergeSelectionSpans([{start:12,end:17},{start:0,end:5},{start:0,end:5},{start:2,end:4}]),[{start:0,end:5},{start:12,end:17}]);
assert.deepEqual(editor.mergeSelectionSpans([{start:0,end:3},{start:2,end:7},{start:7,end:9},{start:10,end:10},{start:-1,end:3}]),[{start:0,end:9}]);

// Custom settings are bounded, but valid user preferences survive.
const style = editor.sanitizeStyle({font:"Nirmala UI",size:16,line:1.5,left:24,right:12,first:-18,tabs:"72,36,72,-5,10000",color:"#123456",keepNext:true});
assert.equal(style.font,"Nirmala UI"); assert.equal(style.first,-18);
assert.equal(style.tabs,"36, 72"); assert.equal(style.line,1.5);
assert.equal(editor.sanitizeStyle({size:999}).size,48);
assert.equal(editor.sanitizeStyle({color:"url(x)"}).color,"#111111");
assert.deepEqual(editor.pageGeometry({paper:"A4",orientation:"landscape",top:25,right:20,bottom:25,left:30}),{
  width:16838,height:11906,mmWidth:297,mmHeight:210,top:1417,right:1134,bottom:1417,left:1701,landscape:true
});

// Exercise the real DOCX serializer, with deterministic computed styles.
const source = fs.readFileSync("cause-list-runtime.js","utf8");
const serializer = source.slice(source.indexOf("        function wordParagraphXml("),source.indexOf("        function draftDocxBlocks("));
const computed = {fontFamily:'"Nirmala UI", serif',fontSize:"21.333333px",fontWeight:"700",fontStyle:"italic",textDecorationLine:"underline",color:"rgb(18, 52, 86)",backgroundColor:"rgba(0, 0, 0, 0)",verticalAlign:"baseline",textAlign:"justify",lineHeight:"32px",marginTop:"8px",marginBottom:"4px",marginLeft:"32px",marginRight:"16px",textIndent:"-24px"};
const element = {
  nodeType:1,tagName:"P",dataset:{cobCustomIndent:"24",peTabs:"36,72",peKeepNext:"1",peKeepLines:"1",pePageBefore:"1"},
  closest:()=>true,querySelector:()=>null,matches:()=>false,parentElement:null
};
element.childNodes=[{nodeType:3,nodeValue:"पाठ\tअर्को",parentElement:element}];
const context={getComputedStyle:()=>computed,w:{contains:()=>true},g:{value:"आदेश"},s:t=>String(t).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;"),previewEnhancer:null,window:{},console};
vm.createContext(context);vm.runInContext(serializer+"\nthis.serialize = wordParagraphXml;",context);
const xml=context.serialize(element);
for(const expected of [
  'w:ascii="Nirmala UI"','w:sz w:val="32"','<w:b/>','<w:i/>','<w:u w:val="single"/>',
  '<w:color w:val="123456"/>','<w:tab/>','w:pos="720"','w:pos="1440"',
  '<w:keepNext/>','<w:keepLines/>','<w:pageBreakBefore/>','w:line="360"',
  'w:before="120"','w:after="60"','w:left="480"','w:right="240"','w:hanging="360"'
]) assert.ok(xml.includes(expected),expected+" absent in "+xml);
fs.writeFileSync(".preview-test-paragraph.xml",'<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>'+xml+'</w:body></w:document>');
// Decorations are not inherited in computed styles. The serializer must follow
// ancestor tags so nested B/U/I/S retain every format in a single Word run.
const paragraph={nodeType:1,tagName:"P",dataset:{},parentElement:null,matches:()=>false,querySelector:()=>null,closest:selector=>selector.includes("cob-main-body")?paragraph:null};
let parent=paragraph;
for(const tag of ["B","U","I","S"]){const child={nodeType:1,tagName:tag,dataset:{},parentElement:parent,matches:()=>false,closest:()=>null};parent.childNodes=[child];parent=child;}
parent.childNodes=[{nodeType:3,nodeValue:"सबै ढाँचा",parentElement:parent}];
context.getComputedStyle=node=>{
  const ancestors=[];for(let p=node;p;p=p.parentElement)ancestors.push(p.tagName);
  return Object.assign({},computed,{fontWeight:ancestors.includes("B")?"700":"400",fontStyle:ancestors.includes("I")?"italic":"normal",textDecorationLine:node.tagName==="U"?"underline":node.tagName==="S"?"line-through":"none"});
};
const nestedXml=context.serialize(paragraph);
for(const format of ["<w:b/>","<w:i/>",'<w:u w:val="single"/>',"<w:strike/>"])assert.ok(nestedXml.includes(format),format+" missing for nested catalog tags");
assert.ok(nestedXml.includes("सबै ढाँचा"));
const index=fs.readFileSync("index.html","utf8");
assert.ok(index.indexOf('editorRuntime.async = false')<index.indexOf('runtime.async = false'));
assert.ok(index.includes('preview-editor.js?v=10'));
assert.ok(source.includes('previewEnhancer?.open(A,n)'));
assert.ok(source.includes('previewEnhancer.reviewImport("bahas"'));
assert.ok(source.includes('previewEnhancer.reviewImport("adesh"'));
console.log("Passed normalized-search mapping, customization bounds, page geometry, and DOCX formatting checks (including nested B/U/I/S).");


const editorSource=fs.readFileSync("preview-editor.js","utf8");
const strip=vm.runInNewContext("("+editorSource.match(/function stripParagraphNumber\(text\) \{[\s\S]*?\n    \}/)[0]+")");
for(const [input,expected] of [["१. तथ्य","तथ्य"],["10. Text","Text"],["१.२) तथ्य","तथ्य"],["(क) तथ्य","तथ्य"],["iv. Text","Text"],["२०८३ साल","२०८३ साल"],["3.14 value","3.14 value"]])assert.equal(strip(input),expected);
console.log("Passed manual paragraph numbering and ordinary-number preservation checks.");

// Paragraph-only format transfer must preserve every character style and content.
const paragraphSource={dataset:{peTabs:"36, 72",peKeepNext:"1"}};
const paragraphComputed={textAlign:"right",lineHeight:"30px",fontSize:"20px",marginTop:"8px",marginBottom:"12px",marginLeft:"24px",marginRight:"16px",textIndent:"-8px",tabSize:"4",fontWeight:"700",color:"rgb(255, 0, 0)",fontFamily:"Kalimati"};
const paragraphFormat=editor.captureParagraphFormat(paragraphSource,paragraphComputed);
const paragraphTarget={style:{fontWeight:"400",fontStyle:"italic",textDecoration:"underline",fontFamily:"Arial",fontSize:"11pt",color:"blue"},dataset:{cobList:"number"},textContent:"Unchanged text"};
editor.applyParagraphFormatTo(paragraphTarget,paragraphFormat);
assert.equal(paragraphTarget.style.textAlign,"right");assert.equal(paragraphTarget.style.lineHeight,"1.5");assert.equal(paragraphTarget.style.marginLeft,"24px");
assert.equal(paragraphTarget.style.fontWeight,"400");assert.equal(paragraphTarget.style.fontStyle,"italic");assert.equal(paragraphTarget.style.textDecoration,"underline");assert.equal(paragraphTarget.style.fontFamily,"Arial");assert.equal(paragraphTarget.style.fontSize,"11pt");assert.equal(paragraphTarget.style.color,"blue");assert.equal(paragraphTarget.textContent,"Unchanged text");assert.equal(paragraphTarget.dataset.cobList,"number");assert.equal(paragraphTarget.dataset.peTabs,"36, 72");
const paragraphPayload=editor.sanitizeParagraphFormat({style:{fontWeight:"700",fontSize:"72pt",color:"red",marginLeft:"url(x)",textAlign:"left"},data:{bold:"1",peTabs:"36,invalid,9000",peKeepNext:"1"}});
assert.deepEqual(paragraphPayload.style,{textAlign:"left"});assert.equal(paragraphPayload.data.peTabs,"36");assert.equal(paragraphPayload.data.bold,undefined);
console.log("Passed paragraph-only transfer: character styles, text and numbering preserved; paragraph geometry and tab stops copied.");
