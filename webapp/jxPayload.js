
function jxMakeButtonCallback(idstr,cb) {
  var id2 = idstr + '-inner';
  return function () {
    if (cb) cb();
  }
}

function jxMakeButton(cfg) {
  var idstr = cfg["id"];
  var lblstr = cfg["label"];
  var cb = cfg["callback"]||function () {};
  var o = jxMakeWidget('div',{
    "id": idstr,
    "class": "jx-hover",
    "border": "1px solid transparent"
  });
  jxApplyConfig(o,cfg,["color", "callback"],true);
  jxGradient(o);
  var o2 = jxMakeWidget('div',{
    "id": idstr + '-inner',
    "height": "calc(100% - 2px)"
  });
  jxPositionChildren(o2);
  var o3=null;
  if (jxIsImage(lblstr)) {
    o3 = jxMakeWidget('img',{
      "id": idstr+'-icon',
      "src": lblstr,
      "width": "75%",
      "height": "75%",
      "object-fit": "contain",
      "filter": jxColorToFilter(jxPal(1.0).hex())
    });
  } else {
    o3 = jxMakeWidget('div', {
      "id": idstr+'-text',
      "innerHTML": lblstr
    });
  }
  jxPosition(o3);
  var o4 = jxMakeWidget('div',{
    "id": idstr + '-highlight',
    "width": "100%",
    "height": "100%",
    "opacity": 0.5
  });
  jxAppend(o2,o4);
  jxAppend(o2,o3);
  jxAppend(o,o2);
  jxEvent(o,'click',jxMakeButtonCallback(idstr,cb));
  jxEvent(o,'mouseup',function () { 
    jxStyle(idstr+'-inner','background','none'); 
  });
  jxEvent(o,'mouseout',function () { 
    jxStyle(idstr+'-inner','background','none'); 
  });
  jxEvent(o,'mousedown',function () { 
    jxStyle(idstr+'-inner','background',jxPal(0.3).alpha(0.75).hex()) 
  });
  return o;
}


function jxCSS () {
  var o = document.body;
  jxStyle(o,'overscroll-behaviour-x','none');
  jxStyle(o,'margin','0px');
  jxStyle(o,'box-sizing','border-box');
  o = jxMakeWidget('style');
// ---------------------
  var css = `

@keyframes blinker { 50% { opacity: 0.5; } }

@keyframes bouncer {
  0% { transform: translate(-50%,-50%); }
  50% { transform: translate(-50%,calc(-50% - 10px)); }
  100% { transform: translate(-50%,-50%); }
}

.jx-no-select {
  -webkit-touch-callout: none !important;
    -webkit-user-select: none !important;
     -khtml-user-select: none !important;
       -moz-user-select: none !important;
        -ms-user-select: none !important;
            user-select: none !important;
  touch-action: none;
}

.jx-no-scrollbar { scrollbar-width: none; }
.jx-no-scrollbar::-webkit-scrollbar { display: none; }
.jx-no-scrollbar::-moz-scrollbar { display: none; }
.jx-no-scrollbar::scrollbar { display: none; }

input:focus { outline:none!important; }

`;
// ---------------------
  //css = css + '.jx-hover:hover { background: ' + jxPal(0.3).alpha(0.75).hex() + ' !important; }';
  css = css + '.jx-hover:hover { border: 1px solid ' + jxPal(0.7).hex() + ' !important; }';
  jxHTML(o,css);
  document.head.appendChild(o);
}


function jxMakeCanvasResizer(idstr) {
  return function () {
    // allow flex box to work
    jxAttr(idstr+'-canvas','width','1');
    jxAttr(idstr+'-canvas','height','1');
    setTimeout(function() {
      jxAttr(idstr+'-canvas','width',jxWidth(idstr));
      jxAttr(idstr+'-canvas','height',jxHeight(idstr));
    },10);
  }
}

function jxMakeCanvas(idstr) {
  var o = jxMakeWidget('div',{
   "id": idstr,
   "position": "relative",
   "background": jxPal(0.2).hex()
  });
  var o1 = jxMakeWidget('canvas',{
    "id": idstr+'-canvas',
    "position": "absolute",
    "top": '0',
    "left": '0',
    "z-index": '2'
  });
  jxAttr(o1,'width','1');
  jxAttr(o1,'height','1');
  jxAppend(o,o1);
  jxEvent(window,'resize',jxMakeCanvasResizer(idstr));
  return o;
}

function jxCanvasClear(obj) {
  var canvas = jxEnsureElement(obj);
  var ctx = canvas.getContext('2d');
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.restore();
}


class jxColor {
  constructor(r, g, b) {
    this.set(r, g, b);
  }
  toString() {
    return `rgb(${Math.round(this.r)}, ${Math.round(this.g)}, ${Math.round(this.b)})`;
  }
  toHex() {
    var res = '#';
    var vals = [this.r,this.g,this.b];
    for (var i=0;i<3;i++) {
      var vstr=Math.round(vals[i]).toString(16);
      if (vstr.length==1) vstr='0'+vstr;
      res+=vstr;
    }
    return res;
  }
  set(r, g, b) {
    this.r = this.clamp(r);
    this.g = this.clamp(g);
    this.b = this.clamp(b);
  }
  hueRotate(angle = 0) {
    angle = angle / 180 * Math.PI;
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);
    this.multiply([
      0.213 + cos * 0.787 - sin * 0.213,
      0.715 - cos * 0.715 - sin * 0.715,
      0.072 - cos * 0.072 + sin * 0.928,
      0.213 - cos * 0.213 + sin * 0.143,
      0.715 + cos * 0.285 + sin * 0.140,
      0.072 - cos * 0.072 - sin * 0.283,
      0.213 - cos * 0.213 - sin * 0.787,
      0.715 - cos * 0.715 + sin * 0.715,
      0.072 + cos * 0.928 + sin * 0.072,
    ]);
  }
  grayscale(value = 1) {
    this.multiply([
      0.2126 + 0.7874 * (1 - value),
      0.7152 - 0.7152 * (1 - value),
      0.0722 - 0.0722 * (1 - value),
      0.2126 - 0.2126 * (1 - value),
      0.7152 + 0.2848 * (1 - value),
      0.0722 - 0.0722 * (1 - value),
      0.2126 - 0.2126 * (1 - value),
      0.7152 - 0.7152 * (1 - value),
      0.0722 + 0.9278 * (1 - value),
    ]);
  }
  sepia(value = 1) {
    this.multiply([
      0.393 + 0.607 * (1 - value),
      0.769 - 0.769 * (1 - value),
      0.189 - 0.189 * (1 - value),
      0.349 - 0.349 * (1 - value),
      0.686 + 0.314 * (1 - value),
      0.168 - 0.168 * (1 - value),
      0.272 - 0.272 * (1 - value),
      0.534 - 0.534 * (1 - value),
      0.131 + 0.869 * (1 - value),
    ]);
  }
  saturate(value = 1) {
    this.multiply([
      0.213 + 0.787 * value,
      0.715 - 0.715 * value,
      0.072 - 0.072 * value,
      0.213 - 0.213 * value,
      0.715 + 0.285 * value,
      0.072 - 0.072 * value,
      0.213 - 0.213 * value,
      0.715 - 0.715 * value,
      0.072 + 0.928 * value,
    ]);
  }
  multiply(matrix) {
    const newR = this.clamp(this.r * matrix[0] + this.g * matrix[1] + this.b * matrix[2]);
    const newG = this.clamp(this.r * matrix[3] + this.g * matrix[4] + this.b * matrix[5]);
    const newB = this.clamp(this.r * matrix[6] + this.g * matrix[7] + this.b * matrix[8]);
    this.r = newR;
    this.g = newG;
    this.b = newB;
  }
  brightness(value = 1) {
    this.linear(value);
  }
  contrast(value = 1) {
    this.linear(value, -(0.5 * value) + 0.5);
  }
  linear(slope = 1, intercept = 0) {
    this.r = this.clamp(this.r * slope + intercept * 255);
    this.g = this.clamp(this.g * slope + intercept * 255);
    this.b = this.clamp(this.b * slope + intercept * 255);
  }
  invert(value = 1) {
    this.r = this.clamp((value + this.r / 255 * (1 - 2 * value)) * 255);
    this.g = this.clamp((value + this.g / 255 * (1 - 2 * value)) * 255);
    this.b = this.clamp((value + this.b / 255 * (1 - 2 * value)) * 255);
  }
  hsl() {
    const r = this.r / 255;
    const g = this.g / 255;
    const b = this.b / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;

        case g:
          h = (b - r) / d + 2;
          break;

        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }
    return {
      h: h * 100,
      s: s * 100,
      l: l * 100,
    };
  }
  clamp(value) {
    if (value > 255) {
      value = 255;
    } else if (value < 0) {
      value = 0;
    }
    return value;
  }
}

class jxColorFilter {
  constructor(target, baseColor) {
    this.target = target;
    this.targetHSL = target.hsl();
    this.reusedColor = new jxColor(0, 0, 0);
  }
  solve() {
    const result = this.solveNarrow(this.solveWide());
    return {
      values: result.values,
      loss: result.loss,
      filter: this.css(result.values),
    };
  }
  solveWide() {
    const A = 5;
    const c = 15;
    const a = [60, 180, 18000, 600, 1.2, 1.2];

    let best = { loss: Infinity };
    for (let i = 0; best.loss > 25 && i < 3; i++) {
      const initial = [50, 20, 3750, 50, 100, 100];
      const result = this.spsa(A, a, c, initial, 1000);
      if (result.loss < best.loss) {
        best = result;
      }
    }
    return best;
  }
  solveNarrow(wide) {
    const A = wide.loss;
    const c = 2;
    const A1 = A + 1;
    const a = [0.25 * A1, 0.25 * A1, A1, 0.25 * A1, 0.2 * A1, 0.2 * A1];
    return this.spsa(A, a, c, wide.values, 500);
  }
  spsa(A, a, c, values, iters) {
    const alpha = 1;
    const gamma = 0.16666666666666666;
    let best = null;
    let bestLoss = Infinity;
    const deltas = new Array(6);
    const highArgs = new Array(6);
    const lowArgs = new Array(6);
    for (let k = 0; k < iters; k++) {
      const ck = c / Math.pow(k + 1, gamma);
      for (let i = 0; i < 6; i++) {
        deltas[i] = Math.random() > 0.5 ? 1 : -1;
        highArgs[i] = values[i] + ck * deltas[i];
        lowArgs[i] = values[i] - ck * deltas[i];
      }
      const lossDiff = this.loss(highArgs) - this.loss(lowArgs);
      for (let i = 0; i < 6; i++) {
        const g = lossDiff / (2 * ck) * deltas[i];
        const ak = a[i] / Math.pow(A + k + 1, alpha);
        values[i] = fix(values[i] - ak * g, i);
      }
      const loss = this.loss(values);
      if (loss < bestLoss) {
        best = values.slice(0);
        bestLoss = loss;
      }
    }
    return { values: best, loss: bestLoss };
    function fix(value, idx) {
      let max = 100;
      if (idx === 2 /* saturate */) {
        max = 7500;
      } else if (idx === 4 /* brightness */ || idx === 5 /* contrast */) {
        max = 200;
      }

      if (idx === 3 /* hue-rotate */) {
        if (value > max) {
          value %= max;
        } else if (value < 0) {
          value = max + value % max;
        }
      } else if (value < 0) {
        value = 0;
      } else if (value > max) {
        value = max;
      }
      return value;
    }
  }
  loss(filters) {
    const color = this.reusedColor;
    color.set(0, 0, 0);
    color.invert(filters[0] / 100);
    color.sepia(filters[1] / 100);
    color.saturate(filters[2] / 100);
    color.hueRotate(filters[3] * 3.6);
    color.brightness(filters[4] / 100);
    color.contrast(filters[5] / 100);
    const colorHSL = color.hsl();
    return (
      Math.abs(color.r - this.target.r) +
      Math.abs(color.g - this.target.g) +
      Math.abs(color.b - this.target.b) +
      Math.abs(colorHSL.h - this.targetHSL.h) +
      Math.abs(colorHSL.s - this.targetHSL.s) +
      Math.abs(colorHSL.l - this.targetHSL.l)
    );
  }
  css(filters) {
    function fmt(idx, multiplier = 1) {
      return Math.round(filters[idx] * multiplier);
    }
    return 'brightness(0) saturate(100%) ' +  `invert(${fmt(0)}%) sepia(${fmt(1)}%) saturate(${fmt(2)}%) hue-rotate(${fmt(3, 3.6)}deg) brightness(${fmt(4)}%) contrast(${fmt(5)}%)`;
  }
}

/** convert any color representation to [r,g,b]
* @param {string} color Any represenation of color including CSS variable
* @return {Array} color triple
* 
* @example
* jxColorToRGB('red');
* > [255,0,0]
* jxColorToRGB('#fff');
* > [255,255,255]
* jxColorToRGB('var(--jxDanger)');
* > [229,62,62]
*/
function jxColorToRGB(color) {
  var o = jxMakeWidget('div','color-expander');
  jxStyle(o,'color',color);
  jxStyle(o,'display','none');
  //jxAppend('jx-top',o);
  jxAppend(document.body,o);
  var res = jxStyle(o,'color');
  jxDelete(o);
  if (res.slice(3,4)=='a') {
    return res.slice(5,-1).split(',').map(parseFloat).slice(0,-1);
  } else {
    return res.slice(4,-1).split(',').map(parseFloat);
  }
}

/** generate CSS filter from color
* @param {string} color Any represenation of color including CSS variable
* @return {string} CSS filter
*
* @example
* jxColorToFilter('red');
* > 'invert(14%) sepia(78%) saturate(7227%) hue-rotate(6deg) brightness(116%) contrast(125%);'
*/
function jxColorToFilter (c) {
  const rgb = jxColorToRGB(c);
  const color = new jxColor(rgb[0], rgb[1], rgb[2]);
  const filter = new jxColorFilter(color);
  const result = filter.solve();
  return result.filter; 
}










class jxConsole {
  constructor (id,cb) {
    this.iter = 0;
    this.lastCommands = [];
    this.id = id;
    this.callback = cb || function () {};
  }
  consoleInput () {
    return jxEnsureElement(this.id+'-input');
  }
  consoleOutput () {
    return jxEnsureElement(this.id+'-output');
  }
  println (str) {
    if (str!='') {
      var o = jxMakeWidget('div');
      o.innerHTML=str;
      jxAppend(this.consoleOutput(),o);
      o = jxEnsureElement(this.id);
      o.scrollTop = o.scrollHeight;
    }
  }
  execute (str) {
    if (this.lastCommands.length>0) {
      if (this.lastCommands[this.lastCommands.length - 1]!=str) 
        this.lastCommands.push(str);
    } else {
      this.lastCommands.push(str);
    }
    this.iter=0;
    this.println(this.callback(str)+'');
  }
  history (o,e) {
    if (e.key === "ArrowUp") {
      if (o.lastCommands.length > 0 && o.iter < o.lastCommands.length) {
        o.iter += 1;
        o.consoleInput().innerHTML = o.lastCommands[o.lastCommands.length - o.iter];
      }
    }
    if (e.key === "ArrowDown") {
      if (o.lastCommands.length > 0 && o.iter > 1) {
        o.iter -= 1;
        o.consoleInput().innerHTML = o.lastCommands[o.lastCommands.length - o.iter];
      }
    }
  }
  enter (o,e) {
    if (e.key === "Enter") {
      const data = o.consoleInput().innerText;
      if (data!="") o.execute(data);
      o.consoleInput().innerHTML = "";
      e.preventDefault();
      return;
    } 
  }
}

/** create console widget
* @param {Object} cfg Console properties
* @return {Object} Console element
*/
function jxMakeConsole(cfg) {
  var id = cfg["id"];
  var o = jxMakeWidget('div', {
    "overflow-y": "auto",
    "overflow-x": "hidden",
    "font-family": "jxMono",
    "font-size": "16px"
  });
  o.console = new jxConsole(id,cfg["callback"]);
  jxApplyConfig(o,cfg);
  var o1 = jxMakeWidget('div',{
    "id": id + '-output'
  });
  var o2 = jxMakeWidget('div',{
    "id": id + '-line',
    "display": "inline-block"
  });
  jxHTML(o2,"$ ");
  var o3 = jxMakeWidget('div',{
    "id": id + '-input',
    "contenteditable": "true",
    "display": "inline-block",
    "border": "none",
    "text-decoration": "none",
    "outline": "none",
    "tabindex": "0"
  });
  jxAppend(o,o1);
  jxAppend(o2,o3);
  jxAppend(o,o2);
  jxEvent(o,'click',function () { jxEnsureElement(id+'-input').focus() });
  jxEvent(o,'keydown',function (e) { o.console.history(o.console,e); });
  jxEvent(o,'keypress',function (e) { o.console.enter(o.console,e); });
  jxStyle(o,'height','100%');
  return o;
}


function jxMakeContainer(idstr,elems) {
  var obj = jxMakeWidget('div',idstr,'jx-container'); 
  if (elems) {
    for (var i=0;i<elems.length;i++) {
      jxClassAdd(elems[i],'jx-container-element');
      jxAppend(obj,elems[i]);
    }
  }
  return obj;
}


function jxSaveAsCSV (fname,csvdata,sep) {
  var separator = sep||",";
  let csvContent = "data:text/csv;charset=utf-8,"
    + csvdata.map(e => e.join(separator)).join("\n");
  var encodedUri = encodeURI(csvContent);
  var link = jxMakeWidget('a',{
    "id": "jx-file-save-as-csv-link",
    "href": encodedUri,
    "download": fname
  });
  document.body.appendChild(link);
  link.click();
  jxDelete('jx-file-save-as-csv-link');
}

function jxMakeLoadHandler(fname,handler) {
  return function(e) {
    if (handler) handler(fname,e.target.result);
    jxDelete('jx-load-from-file');
  }
}

function jxLoadFromFile(handler) {
  var o = jxMakeWidget('form',{
    "id": "jx-load-from-file"
  });
  var i = jxMakeWidget('input',{
    "id": "jx-load-from-file-input",
    "type": "file"
  });
  i.onchange = function (e) {
    var files = e.target.files;
    if (files) {
      var reader = new FileReader();
      reader.onload = jxMakeLoadHandler(files[0],handler);
      reader.readAsArrayBuffer(files[0]);
    }
  }
  jxAppend(o,i);
  jxAppend(o);
  jxClick(i);
} 


function jxSaveFile(data, filename) {
  if (window.navigator.msSaveOrOpenBlob) {
    return window.navigator.msSaveOrOpenBlob(data, filename);
  } else {
    var a = document.createElement('a');
    a.style.display='none';
    var url = window.URL.createObjectURL(new Blob([data],{
          //'type': 'text/plain'
          'type': 'application/octet-stream'
    }));
    document.body.appendChild(a);
    a.href = url;
    a.download = filename;
    a.click();
    return setTimeout(function() {
      window.URL.revokeObjectURL(url);
      return document.body.removeChild(a);
    }, 0);
  };
}

function jxLoadFile(handler) {
  var frm = document.createElement('form');
  frm.style.display='none';
  frm.id = 'temp-load-file';
  frm.innerHTML = '<input id=\'temp-load-file-input\' type=\'file\'>';
  document.body.append(frm);
  document.getElementById('temp-load-file-input').onchange = function(e) {
    var files = e.target.files;
    if (files) {
      var reader = new FileReader();
      var fname = files[0].name;
      reader.onload = function(e) {
        var res = e.target.result;
        handler(fname, res);
        return document.body.removeChild(document.getElementById('temp-load-file'));
      }
      return reader.readAsArrayBuffer(files[0]);
    }
  }
  return document.getElementById('temp-load-file-input').click();
}

function jxLoadJS () {
  jxLoadFile( function (fname, data) { 
    var context = {};
    var str = jxEnsureString(data);
    // function (s) { return eval(s); }.call(context,str);
    eval(str);
  });
}

function jxAjax (url,handler) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      handler(xhr.responseText);
    }
  };
  xhr.open('GET', url + '?' + performance.now());
  xhr.send();
}


function jxMakeFlex(cfg,dir) {
  var obj = jxMakeWidget('div',cfg);
  jxStyle(obj,'display','flex');
  jxStyle(obj,'flex-direction',dir);
  jxStyle(obj,'flex-wrap','nowrap');
  jxStyle(obj,'justify-content','space-evenly');
  jxStyle(obj,'padding','0px');
  jxStyle(obj,'margin','0px');
  var cs = cfg["children"];
  if (cs) {
    for (var i=0;i<cs.length;i++) {
      if (!cfg["noflex"]) jxStyle(cs[i],'flex','1');
     // jxStyle(cs[i],'padding','0px');
     // jxStyle(cs[i],'margin','0px');
    }
  }
  return obj;
}

function jxMakeRows(cfg) { return jxMakeFlex(cfg,'column'); }
function jxMakeColumns(cfg) { return jxMakeFlex(cfg,'row'); }


function jxMakeFooter(idstr,str) {
  var o = jxMakeWidget('div',idstr,'jx-footer jx-background-gradient');
  var o1 = jxMakeWidget('div',idstr+'-copyright','jx-footer-copyright jx-center');
  jxHTML(o1,str);
  jxAppend(o,o1);
  return o;
}


function jxGridSelection(idstr) {
  var res = [];
  var objs = jxElementsOfClass('jx-grid-'+idstr);
  for (var i=0;i<objs.length;i++) {
    var n = jxAttr(objs[i],'name');
    if (n) {
      if (jxHasClass(objs[i],'jx-grid-selected')) res.push(n);
    }
  }
  return res;
}

function jxMakeGridCallback(idstr,i,cb) {
  return function (e) {
    var id2 = idstr + '-' + i;
    var name = jxAttr(id2,'name');
    if (name) {
      if (jxHasClass(id2,'jx-grid-selected')) {
        jxClassRemove(id2,'jx-grid-selected');
        jxStyle(id2,'background','none');
      } else {
        jxClassAdd(id2,'jx-grid-selected');
        jxStyle(id2,'background',jxPal(0.3).alpha(0.5).hex());
      }
    }
  }
}

function jxMakeGrid(cfg) {
  var idstr = cfg["id"];
  var robjs=[];
  var cobjs=[];
  var content = cfg["content"]||[];
  var selected = cfg["selected"]||[];
  var stride = cfg["columns"]||3;
  var cb = cfg["callback"]||function () {};
  var labelmap = cfg["label-map"];
  var imagemap = cfg["image-map"];
  var r = 1;
  for (var i=0;i<stride*Math.ceil(content.length/stride);i++) {
    if (i&&!(i%stride)) {
      robjs.push(jxMakeColumns({
       "id": idstr+'-row'+r,
       "children": cobjs
      }));
      cobjs=[];
      r++;
    }
    var o = jxMakeWidget('div',{
      "id": idstr+'-'+i,
      "class": 'jx-hover jx-grid-'+idstr,
      "cursor": "pointer",
      "border": "1px solid transparent"
    });
    jxPositionChildren(o);
    if (i<content.length) {
      var cid = content[i];
      jxAttr(o,"name",cid);
      if (selected.includes(cid)) {
        jxClassAdd(o,'jx-grid-selected');
        jxStyle(o,'background',jxPal(0.3).alpha(0.5).hex());
      }
      if (imagemap) jxAppend(o,imagemap(cid));
      if (labelmap) jxAppend(o,labelmap(cid))
      jxEvent(o,'click',jxMakeGridCallback(idstr,i,cb));
    }
    cobjs.push(o);
  }
  if (cobjs.length>0) {
    robjs.push(jxMakeColumns({
      "id": idstr+'-row'+r,
      "children": cobjs
     }));
  }
  var res = jxMakeRows({
    "id": idstr,
    "children": robjs
  });
  return res;
}


function jxMakeInput(idstr,defstr) {
  var o = jxMakeWidget('div',idstr,'jx-widget jx-input');
  jxHTML(o,defstr?defstr:"");
  jxAttr(o,'contenteditable','true');
  return o;
}

function jxInput(obj,str) { 
  return jxText(o,str);
}

function jxInputEnable(obj,state) {
  jxAttr(obj,'contenteditable',(state?'true':'false'));
}


/** create label widget
* @param {Object} cfg Label properties
*/
function jxMakeLabel(cfg) {
  //var o = jxMakeWidget('div',cfg);
  var o = jxMakeWidget('div');
  jxPositionChildren(o);
  jxStyle(o,'text-align','center');
  var o2 = null;
  var idstr = cfg["id"];
  var lblstr = cfg["label"];
  if (!idstr||!lblstr) return;
  if (jxIsImage(lblstr)) {
    o2 = jxMakeWidget('img',{ "id": idstr+'-image'});
    jxAttr(o2,'src',lblstr);
    jxStyle(o2,'height','80%');
    jxStyle(o2,'max-width','80%');
  } else {
    o2 = jxMakeWidget('div',{ "id": idstr+'-text'} );
    jxHTML(o2,lblstr);
  }
  jxPosition(o2);
  jxAppend(o,o2);
  jxApplyConfig(o2,cfg,["background","callback","id"],true);
  jxApplyConfig(o,cfg,["background","callback"]);
  return o;
}


function jxLegendLeftOverlay(obj,config) {
  var idstr = obj.id;
  var wrapper =  jxMakeWidget('div',{
   "id": 'jx-legend-l-wrapper-'+idstr,
   "position": "relative"
  });
  jxAppend(wrapper,obj);
  var legend_tl =  jxMakeWidget('div',{
    "id": 'jx-legend-overlay-tl-'+idstr,
    "innerHTML": config['top']||"",
    "font-size": "12px",
    "text-shadow": "-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black",
    "margin-left": "0px",
    "margin-right": "0px",
    "flex": "0 0 10px",
    "text-align": "center"
  });
  var legend_cl;
  if (jxIsImage(config['center']||"")) {
    legend_cl = jxMakeWidget('img',{
      "id": 'jx-legend-overlay-cl-'+idstr,
      "width": "40px",
      "max-height": "40px",
      "margin-left": "10px",
      "src": config['center'],
      "filter": jxColorToFilter(jxPal(0.95).hex())
      });
  } else {
    legend_cl = jxMakeWidget('div',{
     "id": 'jx-legend-overlay-cl-'+idstr,
     "font-size": "12px",
     "innerHTML": config['center']||"",
    "text-shadow": "-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black",
    "margin-left": "0px",
    "margin-right": "0px",
    "flex": "0 0 10px",
    "text-align": "center"
    });
  }
  var legend_bl =  jxMakeWidget('div',{
    "id": 'jx-legend-overlay-bl-'+idstr,
     "innerHTML": config['bottom']||"",
    "font-size": "12px",
    "text-shadow": "-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black",
    "margin-left": "0px",
    "margin-right": "0px",
    "flex": "0 0 10px",
    "text-align": "center"
  });
  var legend_l = jxMakeRows({
    "id": 'jx-legend-overlay-l-'+idstr,
    "children": [legend_tl,legend_cl,legend_bl],
    "position": "absolute",
    "background-color": jxPal(0.1).hex(),
    "opacity": "0.5",
    "width": "60px",
    "top": "1px",
    "left": "0",
    "height": "calc(100% - 2px)",
    "border-top": "1px solid " + jxPal(0.6).hex(),
    "border-bottom": "1px solid " + jxPal(0.6).hex(),
    "justify-content": "space-between",
    "z-index": "3",
    "noflex": "true"
  });
  jxAppend(wrapper,legend_l);
  return wrapper;
}



function jxMakeListCallback(idstr,i,cb) {
  return function (e) {
    jxClassAdd(idstr + '-' + i,'jx-selected','jx-list-' + idstr);
    if (cb) cb(jxText(idstr+'-'+i));
  }
}

function jxMakeList(idstr,strs,cb) {
  var obj = jxMakeWidget('div',idstr,'jx-widget jx-list'); 
  if (strs) {
    for (var i=0;i<strs.length;i++) {
      var o = jxMakeWidget('div',idstr+'-'+i,'jx-list-entry jx-list-' + idstr); 
      jxText(o,strs[i]);
      if (cb) jxEvent(o,'click',jxMakeListCallback(idstr,i,cb));
      jxAppend(obj,o);
    }
  }
  return obj;
}

function jxMakeFilterList(idstr,strs,cb) {
  var obj2 = jxMakeWidget('div',idstr,'jx-widget jx-filter-list');
  var flt = jxMakeWidget('div',idstr+'-filter','jx-filter-input jx-input');
  jxAttr(flt,'contenteditable','true');
  jxText(flt,'Type to filter');
  jxAppend(obj2,flt);
  idstr+='-list';
  var obj = jxMakeWidget('div',idstr,'jx-list');
  if (strs) {
    for (var i=0;i<strs.length;i++) {
      var o = jxMakeWidget('div',idstr+'-'+i,'jx-list-entry jx-list-' + idstr);
      jxText(o,strs[i]);
      if (cb) jxEvent(o,'click',jxMakeListCallback(idstr,i,cb));
      jxAppend(obj,o);
    }
  }
  jxAppend(obj2,obj);
  return obj2;
}


function jxMakeLog(idstr,n) {
  var obj = jxMakeWidget('div',idstr,'jx-widget jx-log'); 
  for (var i=0;i<n;i++) {
    var o = jxMakeWidget('div',null,'jx-log-entry');
    jxHTML(o,"&nbsp;");
    jxAppend(obj,o);
  }
  return obj;
}

function jxLog(obj,msg,msgtype) {
  //jxDelete(jxFirstChild(obj));
  jxDelete(jxLastChild(obj));
  var o = jxMakeWidget('div',null,'jx-log-entry ' + (msgtype?msgtype:'jx-info'));
  jxText(o,msg);
  jxPrepend(obj,o);
  //jxAppend(obj,o);
  //obj.scrollTop=obj.scrollHeight;
}

function jxLogSuccess(obj,msg) { jxLog(obj,msg,'jx-success'); }
function jxLogInfo(obj,msg) { jxLog(obj,msg,'jx-info'); }
function jxLogWarning(obj,msg) { jxLog(obj,msg,'jx-warning'); }
function jxLogDanger(obj,msg) { jxLog(obj,msg,'jx-danger'); }


function jxMakeDropdownEntryHandler(name,fun) {
  return function () {
    jxClassApply('jx-dropdown',jxDelete);
    fun(name);
  }
}

function jxMakeDropdownMenuHandler(mid,idx) {
  return function () {
    var id = jxDropdownMenus[mid][idx]["id"];
    var entries = jxDropdownMenus[mid][idx]["entries"];
    jxClassApply('jx-dropdown',jxDelete);
    var o = jxEnsureElement(id);
    var offsets = o.getBoundingClientRect();
    var y=offsets.bottom;
    var x=offsets.left;
    var content = jxMakeWidget('div',{
      "id": id + '-dropdown',
      "position": "absolute",
      "top": y + 4 + 'px',
      "left": x + 'px',
      "z-index": "100",
      "min-width": "150px",
      "background": jxPal(0.1).hex(),
      "class": "jx-dropdown",
      "box-shadow": "0px 2px 4px 0px " + jxPal(1.0).hex()
    });
    for (var i=0;i<entries.length;i++) {
      var o = jxMakeWidget('div', {
        "id": id + '-dropdown-' + i,
        "float": "none",
        "text-decoration": "none",
        "text-align": "left",
        "width": "calc(100% - 7px)",
        "padding-left": "5px",
        "class": "jx-hover",
        "border": "1px solid transparent",
        "innerHTML": entries[i][0],
        "background": (entries[i].length==3?jxPal(0.2).hex():'none'),
        "cursor": "pointer"
      });
      jxEvent(o,'click', jxMakeDropdownEntryHandler(entries[i][0],entries[i][1]));
      jxAppend(content,o);
    }
    jxAppend('jx-root',content);
  }
}

function jxMakeDropdownMenuEntry (mid,idx) {
  var id = jxDropdownMenus[mid][idx]["id"];
  var label= jxDropdownMenus[mid][idx]["label"];
  var o = jxMakeWidget('div',{
    "id": id,
    "display": "inline-block",
    "padding-left": "5px",
    "padding-right": "5px",
    "cursor": "pointer",
    "innerHTML": label,
    "class": "jx-dropdown-content"
  });
  jxEvent(o,'click',jxMakeDropdownMenuHandler(mid,idx));
  return o;
}

function jxMakeDropdownMenu (cfg) {
  var mid = cfg["id"];
  var ms = jxDropdownMenus[mid]||[];
  var o = jxMakeWidget('div',cfg);
  if (ms.length>0) {
    for (var i=0;i<ms.length;i++) {
      var id = ms[i]["id"];
      var label = ms[i]["label"];
      jxAppend(o,jxMakeDropdownMenuEntry(mid,i));
    }
  }
  return o;
}

function jxMakeMenubar(cfg) {
  var o = jxMakeWidget('div',cfg);
  if (!cfg["height"]) { jxStyle(o,"height","60px"); }
  if (!cfg["max-height"]) { jxStyle(o,"max-height","60px"); }
  if (!cfg["min-height"]) { jxStyle(o,"min-height","60px"); }
  jxPositionChildren(o);
  jxGradient(o);
  if (cfg&&cfg["title"]) {
    var idstr = cfg["id"];
    if (jxIsImage(cfg["title"])) {
      var o2 = jxMakeWidget('img',{ 
        "id": idstr + '-title',
        "src": cfg["title"],
        "filter": cfg["filter"]||jxColorToFilter(jxPal(1.0).hex())
      });
    } else {
      var o2 = jxMakeWidget('div',{ "id": idstr + '-title' });
      jxStyle(o2,'font-weight','bold');
      jxHTML(o2,cfg["title"]);
    }
    jxStyle(o2,'margin-left','10px');
    jxPositionCL(o2);
    jxAppend(o,o2);
  }
  if (cfg&&cfg["center"]) {
   var o2 = cfg["center"];
   jxPositionCC(o2);
   jxAppend(o,o2);
  }
  if (cfg&&cfg["right"]) {
   var o2 = cfg["right"];
   jxPositionCR(o2);
   jxAppend(o,o2);
  }
  return o;
}


function jxMakeNumeric(config) {
  var idstr = config["id"];
  console.log('jxMakeNumeric ' + idstr);
  var o = jxMakeWidget('div',{
    "id": idstr,
    "background": jxPal(0.2).hex(),
    "border-left": "1px solid " + jxPal(0.1).hex(),
    "border-top": "1px solid " + jxPal(0.1).hex(),
    "overflow": "hidden",
    "position": "relative"
  });
  o.key = config['key']||idstr;
  o.timestamp = config['timestamp']||false;
  o.spin = config['spin']||false;
  o.spinMax = config['spinMax']||1.0;
  o.default = config['default']||"--";
  o.digits = config['digits']||0;
  o.color = config['color']||"red";
  o.min = config['min'];
  o.max = config['max'];
  o.invert = config['invert'];
  var value = jxMakeWidget('div',{
    "id": idstr+'-value',
    "font-size": "50px",
    "font-weight": "bold",
    "position": "absolute",
    "right": "20px",
    "top": "50%",
    "transform": "translate(0,-50%)",
    "text-align": "right"
  });
  jxText(value,config['value']||"--");
  jxStyle(value,'color',config['color']||"red");
  jxAppend(o,value);
  var legend_tl =  jxMakeWidget('div',{
    "id": 'jx-numeric-legend-tl-'+idstr,
    "font-size": "12px",
    "text-shadow": "-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black",
    "margin-left": "0px",
    "margin-right": "0px",
    "flex": "0 0 10px",
    "text-align": "center"
  });
  // 'jx-numeric-legend-label jx-numeric-legend-label-left'
  var legend_tc;
  if (config['icon']) {
    legend_tc = jxMakeWidget('img',{
      "id": 'jx-numeric-legend-tc-'+idstr,
      "width": "40px",
      "max-height": "40px",
      "margin-left": "10px",
      "src": config['icon'],
      "filter": jxColorToFilter(jxPal(0.95).hex())
      });
      //'jx-numeric-legend-icon jx-numeric-legend-icon-left'
   //  jxAttr(legend_tc,'src',config['icon']);
  } else {
    legend_tc = jxMakeWidget('div',{
     "id": 'jx-numeric-legend-tc-'+idstr,
     "font-size": "12px",
    "text-shadow": "-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black",
    "margin-left": "0px",
    "margin-right": "0px",
    "flex": "0 0 10px",
    "text-align": "center"
    });
     // 'jx-numeric-legend-label jx-numeric-legend-label-left'
  }
  var legend_bl =  jxMakeWidget('div',{
    "id": 'jx-numeric-legend-bl-'+idstr,
    "font-size": "12px",
    "text-shadow": "-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black",
    "margin-left": "0px",
    "margin-right": "0px",
    "flex": "0 0 10px",
    "text-align": "center"
  });
  //'jx-numeric-legend-label jx-numeric-legend-label-left'
  var legend_l = jxMakeRows({
    "id": 'jx-numeric-legend-l-'+idstr,
    "children": [legend_tl,legend_tc,legend_bl],
    "position": "absolute",
    "background-color": jxPal(0.1).hex(),
    "opacity": "0.5",
    "width": "60px",
    "top": "1px",
    "left": "0",
    "height": "calc(100% - 2px)",
    "border-top": "1px solid " + jxPal(0.6).hex(),
    "border-bottom": "1px solid " + jxPal(0.6).hex(),
    "justify-content": "space-between",
    "z-index": "3",
    "noflex": "true"
  });
  //jxClassAdd(legend_l,'jx-numeric-legend jx-numeric-legend-left');
  jxText(legend_tl,config['label']||"LABEL");
  jxText(legend_bl,config['unit']||"UNIT");
  jxAppend(o,legend_l);
  var legend_tr =  jxMakeWidget('div',{
    "id": 'jx-numeric-legend-tr-'+idstr
  });
   // 'jx-numeric-legend-label jx-numeric-legend-label-right'
  var legend_br =  jxMakeWidget('div',{
    "id": 'jx-numeric-legend-br-'+idstr
  });
    //'jx-numeric-legend-label jx-numeric-legend-label-right'
  var legend_r = jxMakeRows({
    "id": 'jx-numeric-legend-r-'+idstr,
    "children": [legend_tr,legend_br],
    "height": "calc(100% - 2px)",
    "border-top": "1px solid " + jxPal(0.6).hex(),
    "border-bottom": "1px solid " + jxPal(0.6).hex(),
    "justify-content": "space-between",
    "z-index": "3",
    "position": "absolute",
    "opacity": "0.5",
    "width": "60px",
    "top": "1px",
    "right": "0",
    "noflex": "true"
  });
  //jxClassAdd(legend_r,'jx-numeric-legend jx-numeric-legend-right');
  jxText(legend_tr,config['max']||"");
  jxText(legend_br,config['min']||"");
  jxAppend(o,legend_r);
  return o;
}

function jxNumericUpdate(obj,data) {
  var o = jxEnsureElement(obj);
  var idstr = o.id;
  var val = data[o.key];
  if (!val&&jxType(val)!='number') val=o.default;
  var invert = o.invert;
  if (jxType(val)=='number') { 
    if (o.timestamp) {
      val = jxElapsedString(val);
    } else {
      if (o.min&&o.min>val) invert=true;
      if (o.max&&o.max<val) invert=true;
      val = jxSigFigures(val,o.digits);
    }
  }
  jxText(idstr+'-value',val);
  if (invert) {
    jxStyle(idstr,'background',o.color);
    jxStyle(idstr+'-value','color','var(--gray900)');
  } else {
    jxStyle(idstr,'background','transparent');
    jxStyle(idstr+'-value','color',o.color);
  }
}


class jxPalette {
  constructor (scale) {
    this.colorscales = {
      "Jet2": [
         'rgb(26,32,44)',
         'rgb(45,55,72)',
         'rgb(0,60,170)', 
         'rgb(255,255,0)',  
         'rgb(250,0,0)', 
         'rgb(128,0,0)'
      ],
      "Jet": [
          'rgb(0,0,131)', 
          'rgb(0,60,170)', 
          'rgb(5,255,255)', 
          'rgb(255,255,0)',  
          'rgb(250,0,0)', 
          'rgb(128,0,0)'
       ],
     "Rainbow": [
         'rgb(45,55,72)',
         // 'rgb(150,0,90)', 
          'rgb(0,0,200)', 
          'rgb(0,25,255)', 
          'rgb(0,152,255)',
          'rgb(44,255,150)',
          'rgb(151,255,0)', 
          'rgb(255,234,0)', 
          'rgb(255,111,0)', 
          'rgb(255,0,0)'
      ]
    };
    this.scale = this.colorscales[scale];
    for (var i=0;i<this.scale.length;i++) {
      this.scale[i]=this.rgbstr2rgb(this.scale[i]);
    }
    this.dx = 1.0/(this.scale.length-1);
  }
  rgbstr2rgb(rgbstr) {
    var tmp = rgbstr.replace("rgb(","").replace(")","").split(",");
    return [parseFloat(tmp[0]),parseFloat(tmp[1]),parseFloat(tmp[2])];
  }
  rgb2rgbstr(rgb) {
    return "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")";
  }
  rgba2rgbastr(rgb,alpha) {
    return "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + "," + alpha + ")";
  }
  mix(c1,c2,x) {
    return [
      Math.round(c1[0]*x+c2[0]*(1-x)),
      Math.round(c1[1]*x+c2[1]*(1-x)),
      Math.round(c1[2]*x+c2[2]*(1-x))
    ];
  }
  rgb(x0) {
    var x  = (x0>1?1:(x0<0?0:x0));
    var i = 0;
    while (i*this.dx<x) { i++; }
    var c2 = this.scale[i];
    var c1 = this.scale[(i==0?0:i-1)];
    var xr = (i*this.dx-x)/this.dx;
    return this.mix(c1,c2,xr);
  }
  rgbstr(x) {
    return this.rgb2rgbstr(this.rgb(x));
  }
  rgbastr(x,a) {
    return this.rgba2rgbastr(this.rgb(x),a);
  }
}
 
function jxPaletteApply(name) {
  var pal = new jxPalette(name);
  var root = document.documentElement;
  for (var i=1;i<10;i++) {
    jxStyleProperty(root,'--gray'+i*100,pal.rgbstr((10-i)/10.0));
  }
  jxStyleProperty(root,'--accent',pal.rgbastr(0.35,0.5));
}


function jxPlotXYInit(idstr) {
  var o = jxEnsureElement(idstr);
  var bg=jxStyle('jx-plot-line-color-'+idstr,'background');
  var fg=jxStyle('jx-plot-line-color-'+idstr,'color');
  var fg_zl=jxStyle('jx-plot-zeroline-color-'+idstr,'color');
  var fg_gl=jxStyle('jx-plot-gridline-color-'+idstr,'color');
  o.plotlyLayout = {
     margin: {
         t: 40,
         b: 40,
         r: 150
       },
/*
    margin: {
       t: 50,
       b: 30,
       r: 110, 
       l: 50
     },
*/
     xaxis: {
       type: "time",
       autorange: true,
       //range: ['00:00:00','00:20:00'],
       //rangeslider: { bgcolor: bg },
       //rangeslider: { range: ['00:10:00', '00:20:00'] },
       showline: true,
       showgrid: true,
       gridcolor: fg_gl,
       linecolor: fg_zl,
       zerolinecolor: fg,
       mirror: true,
       font: { size: 16 },
       tickmode: "auto",
       nticks: 4
     },
     yaxis: {
       autorange: true,
       type: "linear",
       showline: true,
       showgrid: true,
       gridcolor: fg_gl,
       linecolor: fg,
       zerolinecolor: fg_zl,
       mirror: "ticks"
     },
     annotations: [],
     showlegend: true,
     plot_bgcolor: bg,
     paper_bgcolor: bg,
     bgcolor: bg,
     font: { color: fg }
   }; 
  o.plotlyConfig = {
      showSendToCloud: false,
      displaylogo: false,
      displayModeBar: false,
      responsive: true,
      doubleClickDelay: 700
    };
  Plotly.newPlot(idstr,o.plotlyTraces,o.plotlyLayout,o.plotlyConfig);
}


function jxMakePlotXY (config) {
  var idstr = config["id"];
  var o = jxMakeWidget('div',{
    "id": idstr,
    "overflow": "hidden"
  }); // jx-plot
  o.trends = config['trends']||[];
  // make dummy elements to capture colors
  jxAppend(o,jxMakeWidget('div',{
    "id": 'jx-plot-zeroline-color-' + idstr,
    "color": jxPal(0.5).hex()
  }));
  jxAppend(o,jxMakeWidget('div', {
    "id": 'jx-plot-gridline-color-' + idstr,
    "color": jxPal(0.5).hex()
  }));
  jxAppend(o,jxMakeWidget('div', {
    "id": 'jx-plot-line-color-' + idstr,
    "color": jxPal(1.0).hex(),
    "background": jxPal(0.0).hex()
  }));
  jxAppend(o,jxMakeWidget('div',{
    "id": 'jx-plot-arrow-color-' + idstr,
    "color": jxPal(1.0).hex()
  }));
  o.plotlyTraces=[];
  for (var i=0;i<o.trends.length;i++) {
    o.plotlyTraces.push( {
      name: o.trends[i].label,
      line: { color: o.trends[i].color },
      type: 'scatter', mode: 'lines',
      x: [], y: []
    });
  }
  return o;
}

function jxPlotXYAdd(idstr,data) {
  function elapsedstr (elapsed) { 
    var h = Math.floor(elapsed/3600.0);
    elapsed-=h*3600;
    var m = Math.floor(elapsed/60.0);
    elapsed-=m*60;
    var s = Math.floor(elapsed);
    if (h<10) h="0" + h;
    if (m<10) m="0" + m;
    if (s<10) s="0" + s;
    return h+':'+m+':'+s;
  }
  var o = jxEnsureElement(idstr);
  for (var i=0;i<o.trends.length;i++) {
    var name=o.trends[i].name;
    var scale=o.trends[i].scale||1.0;
    var val = data[name]||0.0;
    if (val||jxType(val)=='number') {
      o.plotlyTraces[i].x.push(elapsedstr(data['elapsed']));
      o.plotlyTraces[i].y.push(scale*val);
    }
  }
  //Plotly.update(o,o.plotlyTraces,{datarevision: data['elapsed']});
  Plotly.update(o,o.plotlyTraces,{datarevision: new Date().getTime()});
}

function jxPlotXYAddAnnotation(idstr,xstr,msgstr) {
  var o = jxEnsureElement(idstr);
  var fg=jxStyle('jx-plot-arrow-color-'+idstr,'color');
  o.plotlyLayout.annotations.push( {
    xref: 'x',
    yref: 'paper',
    x: xstr,
    y: 1.0,
    text: msgstr,
    showarrow: true,
    arrowcolor: fg
  } );
}

function jxPlotXYClear(idstr) {
  var o = jxEnsureElement(idstr);
  for (var i =0;i<o.plotlyTraces.length;i++) {
    o.plotlyTraces[i].x=[];
    o.plotlyTraces[i].y=[];
  }
  o.plotlyLayout.annotations=[];
}


//var jxProperties = {};

function jxMakePropertyControlEmpty() {
  var o = jxMakeWidget('div','control',
    'jx-property-list-control jx-property-list-control-empty jx-background-gradient');
  var o2 = jxMakeWidget('div','control-inner',
    'jx-property-list-control-inner jx-property-list-control-inner-empty');
  jxAppend(o,o2);
  return o;
}

var jxPropertyControlTimeout;

function jxMakePropertyControlSuccess(msg) {
  if (jxPropertyControlTimeout) clearTimeout(jxPropertyControlTimeout);
  var o = jxMakePropertyControlEmpty();
  var o2 = jxFirstChild(o);
  jxClassAdd(o2,'jx-property-list-control-success');
  jxText(o2,msg);
  jxPropertyControlTimeout=setTimeout(function () { 
    jxText(o2,'');
    jxClassRemove(o2,'jx-property-list-control-success');
   }, 2000);
  return o;
}

function jxMakePropertyControlFailure(msg) {
  if (jxPropertyControlTimeout) clearTimeout(jxPropertyControlTimeout);
  var o = jxMakePropertyControlEmpty();
  var o2 = jxFirstChild(o);
  jxClassAdd(o2,'jx-property-list-control-error');
  jxText(o2,msg);
  jxPropertyControlTimeout=setTimeout(function () { 
    jxText(o2,'');
    jxClassRemove(o2,'jx-property-list-control-error');
   }, 2000);
  return o;
}

class jxProperty {
  constructor (data) {
    this.key = data["key"];
    this.label = data["label"]||this.key;
    this.values = data["values"]||["OFF","ON"];
    this.labels = data["labels"]||this.values;
    this.type = data["type"]||"integer";
    this.min = data["min"]||0;
    this.max = data["max"]||1;
    this.rangeModifier = data["rangeModifier"]||function (x) { return x; };
    this.step = data["step"]||10;
    this.sigfigs = data["sigfigs"]||0;
    this.color = data["color"]||"var(--gray500)";
    this.cb = data["cb"]||function () { console.log('callback'); };
    this.inactiveWhen = data["inactiveWhen"];
    this.inactiveLabel = data["inactiveLabel"]||"inactive";
    this.ignoreValue = data["ignoreValue"];
    this.invert = data["invert"]||[];
    this.value = data["value"];
   // if (this.type!='marker') {
   //   jxProperties[this.key] = data["value"];
   // }
  }
  sanitize(str) {
    return str.toLowerCase().replace(/ /g,"-").replace(":","");
  }
  read() { 
    return this.value;
  }
  write (val) {
    this.value = val;
  }
  renderKey () {
    var o = jxMakeWidget('div','jx-property-key-' + this.sanitize(this.key),
                           'jx-property-key');
    jxText(o,this.label);
    jxStyle(o,'color',this.color);
    return o;
  }
  renderValue () {
    var o = jxMakeWidget('div','jx-property-value-' + this.sanitize(this.key),
                           'jx-property-value jx-property-type-' + this.type);
    var val = this.value;
    if (val) {
      switch (this.type) { 
        case "list":
          jxHTML(o,val + '');
          break;
        case "number":
          jxText(o,jxSigFigures(val,this.sigfigs));
          break;
        case "boolean":
          jxHTML(o,this.values[val?1:0]);
          break;
        case "marker":
          break;
      }   
    }
    if (val&&this.invert.includes(val)) {
      jxStyle(o,'color','var(--gray900)');
      jxStyle(o,'background',this.color);
      jxStyle(o,'text-align','center');
    } else {
      jxStyle(o,'color',this.color);
      jxStyle(o,'background','transparent');
      jxStyle(o,'text-align','right');
    }
    return o;
  }
  renderControl (idstr) {
    var res = null;
    var that = this;
    var type = this.type;
    if (this.inactiveWhen&&this.inactiveWhen()) type="inactive";
    switch (type) { 
      case "list":
        res = jxMakeToggleBar(idstr,this.values,function (idx) {
          that.value=that.values[idx];
          jxReplace('jx-property-value-' + that.sanitize(that.key), that.renderValue());   
          jxClassAdd(null,'jx-selected','jx-property-list-entry');
          jxReplace(idstr, jxMakePropertyControlSuccess('OK'));
          if (that.cb) that.cb(that.value);
        },this.value,true);
        break;
      case "boolean":
        res = jxMakeButton(idstr,this.labels[this.value?1:0],function() {
          that.value=!that.value;
          jxReplace('jx-property-value-' + that.sanitize(that.key), that.renderValue());   
          jxClassAdd(null,'jx-selected','jx-property-list-entry');
          jxReplace(idstr, jxMakePropertyControlSuccess('OK'));
          if (that.cb) that.cb(that.value);
        },true);
        break;
      case "marker":
        res = jxMakeButton(idstr,that.labels[0],function() {
          jxClassAdd(null,'jx-selected','jx-property-list-entry');
          jxReplace(idstr, jxMakePropertyControlSuccess('OK'));
          if (that.cb) that.cb(that.key);
        },true);
        break;
      case "number":
        var min = this.rangeModifier(that.min);
        var max = this.rangeModifier(that.max);
        res = jxMakeNumberWheel(idstr,[min,max,that.step,that.sigfigs],function(idx) {
          var val = jxText(idstr+'-'+idx);
          if (!that.ignoreValue) { 
            that.value=val;
            jxText('jx-property-value-' + that.sanitize(that.key),that.value);
          }
          jxClassAdd(null,'jx-selected','jx-property-list-entry');
          jxReplace(idstr, jxMakePropertyControlSuccess('OK'));
          if (that.cb) that.cb(that.key,val);
        },this.value,true);
        break;
      case "inactive":
        res = jxMakePropertyControlFailure(this.inactiveLabel);
        break;
      default:
        res = jxMakeLabel(idstr,'??');
        break;
    }
    jxClassAdd(res,'jx-property-list-control');
    return res;
  }
}

function jxMakePropertyListCallback(idstr,i,cb) {
  return function (e) {
    jxClassAdd(idstr + '-' + i,'jx-selected','jx-property-list-' + idstr);
    if (cb) cb(i);
  }
}

function jxMakePropertyList(idstr,data,cb) {
  var obj = jxMakeWidget('div',idstr,'jx-widget jx-property-list'); 
  if (data) {
    for (var i=0;i<data.length;i++) {
      var p =  new jxProperty(data[i]);
      var ok = p.renderKey();
      var ov = p.renderValue();
  //    var o = jxMakeColumns(idstr+'-'+i,[ok,ov]);
  //    jxClassAdd(o,'jx-property-list-entry');
  //    jxClassAdd(o,'jx-property-list-'+idstr);
      var o = jxMakeWidget('div',idstr+'-'+i,'jx-property-list-entry jx-property-list-'+idstr);
      jxAppend(o,ok);
      jxAppend(o,ov);
      o.property = p;
      if (cb) jxEvent(o,'click',jxMakePropertyListCallback(idstr,i,cb));
      if (data[i].color) {
        jxStyle(o,'color',data[i].color);
      }
      jxAppend(obj,o);
    }
  }
  return obj;
}



var jxCfg = {
  "pal-scale": ['#171923','#edf2f7'],
  "pal-mode": 'lab',
  "pal-domain": [0,1]
};

var jxPal = null;

function jxModalBlock(b) {
  jxAttr('jx-modal','blocking',(b?'true':'false'));
}

function jxModalBackgroundCallback (e) {
  if (jxAttr('jx-modal','blocking')=='true') return;
  var obj = document.elementFromPoint(e.pageX,e.pageY);
  if (obj&&obj.id!='jx-modal') return;
  jxModal(false);
}

function jxModal(m) {
  jxStyle('jx-modal','display',(m?'block':'none'));
}

function jxSplashTimeout() {
  jxStyle('jx-splash','display','none');
}

function jxResizeRoot() {
  var w = window.innerWidth;
  var h = window.innerHeight;
  var maxAR = jxCfg["max-ar"];
  var minAR = jxCfg["min-ar"];
  var maxWidth = jxCfg["max-width"];
  var minWidth = jxCfg["min-width"];
  var maxHeight = jxCfg["max-height"];
  var minHeight = jxCfg["min-height"];
  if (maxWidth&&w>maxWidth) w=maxWidth;
  if (minWidth&&w<minWidth) w=minWidth;
  if (maxHeight&&h>maxHeight) h=maxHeight;
  if (minHeight&&h<minHeight) h=minHeight;
  var ar = w/h;
  if (maxAR&&ar>maxAR) { w = maxAR * h; } 
    else if (minAR&&ar<minAR) { h = w / minAR; }
  var wstr = w + 'px';
  var hstr = h + 'px';
  jxStyle('jx-root','width',wstr);
  jxStyle('jx-root','min-width',wstr);
  jxStyle('jx-root','max-width',wstr);
  jxStyle('jx-root','height',hstr);
  jxStyle('jx-root','min-height',hstr);
  jxStyle('jx-root','max-height',hstr);
  jxStyle('jx-splash-root','width', Math.round(0.5*w)+'px');
  jxStyle('jx-modal-root','width', Math.round(0.5*w)+'px');
  jxStyle('jx-top','font-size', jxCfg["font-size"]||'16px');
}

/** Initialize jxWebApp
* @param {Object} cfg Configuration parameters
*/
function jxInit(cfg) {
  jxCfg = jxMerge(jxCfg,cfg||{});
  jxPal = chroma.scale(jxCfg["pal-scale"]).mode(jxCfg["pal-mode"]).domain(jxCfg["pal-domain"]);

  jxCSS();

  // spellcheck has to be disabled globally.. go figure
  jxAttr(document.body,"spellcheck","false");
  jxAttr(document.body,"autocorrect","false");
  jxAttr(document.body,"autocapitalize","false");
  jxAttr(document.body,"autocomplete","false");

  if ('serviceWorker' in navigator) 
    navigator.serviceWorker.register('/service-worker.js').then(() => { }).catch( err => { 
       console.log('Service worker registration failed: ' + err); 
    });

  var top = jxMakeWidget('div',{ "id": 'jx-top' } );
  jxPositionChildren(top);
  jxStyle(top,'font-family','jxDefault');
  jxStyle(top,'background',jxPal(0.0).hex());
  jxStyle(top,'color',jxPal(1.0).hex());
  jxStyle(top,'overflow-x','hidden');
  jxStyle(top,'overflow-y','hidden');
 
  var root= jxMakeWidget('div',{ "id": 'jx-root' });
  jxPosition(root);
  jxAppend(top,root);
  jxStyle(root,'height','inherit');
  jxStyle(root,'width','inherit');
  jxStyle(root,'background',jxPal(0.1).hex());
  jxEvent(window,'resize',jxResizeRoot); 
  jxStyle(modal,'z-index','100');

  var modal = jxMakeWidget('div', { "id": 'jx-modal' } );
  jxPosition(modal);
  jxAppend(root,modal);
  jxStyle(modal,'height','101%');
  jxStyle(modal,'width','101%');
  jxStyle(modal,'z-index','200');
  jxStyle(modal,'display','none');
  jxStyle(modal,'background',jxPal(0.0).alpha(0.5).hex());
  jxEvent(modal,'click',jxModalBackgroundCallback);

  var mRoot = jxMakeWidget('div',{ "id": 'jx-modal-root' } );
  jxPosition(mRoot);
  jxStyle(mRoot,'border','2px solid ' + jxPal(0.0).hex());
  jxAppend(modal,mRoot);

  var splash = jxMakeWidget('div',{ "id": 'jx-splash' });
  jxPosition(splash);
  jxAppend(root,splash);
  jxStyle(splash,'height','101%');
  jxStyle(splash,'width','101%');
  jxStyle(splash,'z-index','300');
  jxStyle(splash,'background',jxPal(0.0).hex());

  if (jxCfg["splash"]) {
    var splashImage = jxMakeWidget('img',{
      "id": "splash-image",
      "width": jxCfg["splash-image-width"]||"50%",
      "src": jxCfg["splash-image"]
    });
    if (jxCfg["splash-filter"]) {
      jxStyle(splashImage,'filter',jxCfg["splash-filter"]);
    }
    jxPositionCC(splashImage);
    jxAppend(splash,splashImage);
    jxStyle(splash,'display','block');
    setTimeout(jxSplashTimeout,jxCfg.splash*1000);
  } else {
    jxStyle(splash,'display','none');
  }

  var sRoot = jxMakeWidget('div',{ "id": 'jx-splash-root'} );
  jxStyle(sRoot,'text-align','center');
  if (jxCfg["splash-logo"]) {
    var img = jxMakeWidget('img');
    jxAttr(img,'src',jxCfg["splash-logo"]);
    jxAppend(sRoot,img);
  }
  if (jxCfg["splash-label"]) {
    var lbl = jxMakeWidget('div');
    jxHTML(lbl,jxCfg["splash-label"]);
    jxStyle(lbl,'margin-top','10%');
    jxAppend(sRoot,lbl);
  }
  jxPosition(sRoot);
  jxAppend(splash,sRoot);

  jxStyle(top,'height','100vh');
  jxStyle(top,'width','100vw');
  document.body.appendChild(top);

  jxEvent(document,'keyup', function (e) {
    if (e.code=='Escape') jxClassApply('jx-dropdown',jxDelete);
  });
  jxEvent(window,'resize', function (e) {
    jxClassApply('jx-dropdown',jxDelete);
  });
  jxEvent(window,'click',function (e) {
    var tgt = e.target;
    if (!tgt.classList.contains('jx-dropdown-content')) jxClassApply('jx-dropdown',jxDelete);
  });

  jxResize();
}


function jxMakeSpacer(idstr,sizestr,colorstr) {
  var o = jxMakeWidget('div',idstr,'jx-spacer');
  jxStyle(o,'flex','0 0 '+ sizestr);
  if (colorstr) {
    jxStyle(o,'background-color',colorstr);
  }
  return o;
}



function jxMakeTimestamp(idstr) {
  var o = jxMakeWidget('div',idstr,'jx-widget jx-timestamp');
  jxHTML(o,"00:00:00");
  return o;
}



function jxToggleBarSelect(idstr,i) {
  var id2 = idstr + '-' + i;
  var objs = jxElementsOfClass('jx-togglebar-'+idstr);
    for (var j=0;j<objs.length;j++) {
      jxStyle(objs[j],"background","none");
      jxClassRemove(objs[j],"jx-togglebar-selected");
  }
  jxStyle(id2,"background",jxPal(0.5).alpha(0.75).hex());
  jxClassAdd(id2,"jx-togglebar-selected");
}

function jxMakeToggleBarCallback(idstr,i,cb) {
  return function (e) {
    jxToggleBarSelect(idstr,i);
    if (cb) cb(i);
  }
}

function jxMakeToggleBarBackgroundEvent(id,bkg) {
  return function () { 
    if (bkg=='none') { 
      if (!jxHasClass(id,'jx-togglebar-selected')) jxStyle(id,'background',bkg); 
    } else jxStyle(id,'background',bkg); 
  }
}

/** Create toggle bar widget
* @param {Object} cfg Properties of toggle widget
* @return {Object} New toggle bar widget
*/
function jxMakeToggleBar(cfg) {
  var objs=[];
  var es = cfg["entries"]||[];
  var cb = cfg["callback"]||function () {};
  var idstr = cfg["id"];
  for (var i=0;i<es.length;i++) {
    var e = es[i];
    var idstr2 = idstr+'-'+i;
    var o = jxMakeWidget('div',{
     "id": idstr2,
     "class": 'jx-hover jx-togglebar-' + idstr,
     "height": "calc(100% - 2px)",
     "border": "1px solid transparent"
    });
    jxEvent(o,'mouseup',jxMakeToggleBarBackgroundEvent(idstr2,'none'));
    jxEvent(o,'mouseout',jxMakeToggleBarBackgroundEvent(idstr2,'none'));
    jxEvent(o,'mousedown',jxMakeToggleBarBackgroundEvent(idstr2,jxPal(0.3).alpha(0.75).hex()));
    if (cfg["default"]&&e==cfg["default"]) { 
      jxStyle(o,"background",jxPal(0.5).alpha(0.75).hex());
      jxClassAdd(o,'jx-togglebar-selected');
    }
    jxPositionChildren(o);
    var o2 = null;
    if (jxIsImage(e)) {
      o2 = jxMakeWidget('img',{ "src": e });
    } else {
      o2 = jxMakeWidget('div');
      jxHTML(o2,e);
    }
    jxPosition(o2);
    jxAppend(o,o2);
    jxEvent(o,'click',jxMakeToggleBarCallback(idstr,i,cb));
    objs.push(o);
  }
  var res = jxMakeColumns({
    "id": idstr, 
    "children": objs,
    "cursor": "pointer"
  });
  jxGradient(res);
  return res;
}


/** Return type of object
* @param {Object} obj The object to type
* @return {'unknown'|'array'|'string'|'number'} The object type
*/
function jxType(obj) {
  var res='unknown';
  if (Array.isArray(obj)) res='array';
    else if (typeof obj === 'string'||obj instanceof String) res='string';
      else if (typeof obj === 'string') res='string';
        else if (typeof obj === 'number') res='number';
  return res;
}

/** Return file extension
* @param {string} str File name
* @return {string} File extension
*/
function jxExt(str) {
  return str.split('.').pop().toLowerCase();
}

/** Make sure object is array
* @param {Object|Array} obj 
* @return {Array} 
*/
function jxEnsureArray(obj) {
  return (jxType(obj)=='array'?obj:[obj]);
}

/** Make sure object is a DOM element
* @param {Object|string} obj The element or the string id of it
* @return {Object} The element
*/
function jxEnsureElement(obj) {
  return (jxType(obj)=='string'?document.getElementById(obj):obj);
}

function jxElementsOfClass(cstr) {
  return document.getElementsByClassName(cstr);
}

function jxFirstChild (obj) {
  return (obj?jxEnsureElement(obj).firstChild:null);
}

function jxLastChild (obj) {
  return (obj?jxEnsureElement(obj).lastChild:null);
}

function jxParent (obj) {
  return jxEnsureElement(obj).parentElement;
}

function jxPrepend(obj1,obj2) {
  if (obj1) {
    if (obj2) { 
      jxEnsureElement(obj1).prepend(obj2);
    } else {
      jxEnsureElement('jx-root').prepend(obj1);
    }
  }
}

function jxAppend(obj1,obj2) { 
  if (obj1) {
    if (obj2) { 
      jxEnsureElement(obj1).append(obj2);
    } else {
      jxEnsureElement('jx-root').append(obj1);
    }
  }
}

function jxSlot(obj,key,def,val) {
  var res = (val?val:def);
  if (obj) {
    obj = jxEnsureElement(obj);
    if (val||jxType(val)=='string') { obj[key]=val; } else { res = obj[key]; }
  }
  return res;
}

function jxClientWidth(obj,val) { return jxSlot(obj,"clientWidth",0,val); }
function jxClientHeight(obj,val) { return jxSlot(obj,"clientHeight",0,val); }
function jxOffsetWidth(obj,val) { return jxSlot(obj,"offsetWidth",0,val); }
function jxOffsetHeight(obj,val) { return jxSlot(obj,"offsetHeight",0,val); }
function jxScrollWidth(obj,val) { return jxSlot(obj,"scrollWidth",0,val); }
function jxScrollHeight(obj,val) { return jxSlot(obj,"scrollHeight",0,val); }
function jxWidth(obj,val) { return jxSlot(obj,"offsetWidth",0,val); }
function jxHeight(obj,val) { return jxSlot(obj,"offsetHeight",0,val); }
function jxTop(obj,val) { return jxSlot(obj,"offsetTop",0,val); }
function jxLeft(obj,val) { return jxSlot(obj,"offsetLeft",0,val); }
function jxScrollLeft(obj,val) { return jxSlot(obj,"scrollLeft",0,val); }
function jxScrollTop(obj,val) { return jxSlot(obj,"scrollTop",0,val); }
function jxText(obj,val) { return jxSlot(obj,"innerText","",val); }
function jxHTML(obj,val) { return jxSlot(obj,"innerHTML","",val); }
function jxTitle(obj,val) { return jxSlot(obj,"title","",val); }
function jxTagName(obj,val) { return jxSlot(obj,"tagName","",val); }
function jxId(obj,val) { return jxSlot(obj,"id","",val); }

function jxAttr(obj,key,val) {
  if (val==null) {
    return jxEnsureElement(obj).getAttribute(key);
  } else {
    return jxEnsureElement(obj).setAttributeNS(null,key,val);
  }
}

function jxStyle(obj,key,val) {
  var res = val;
  if (obj) {
    var o = jxEnsureElement(obj);
    if (o==null) return;
    if (val) {
      o.style[key]=val;
    } else {
      var style = getComputedStyle(o);
      res = style[key];
    }
  }
  return res;
}

// get/set css properties (e.g. --gray100)
function jxStyleProperty(obj,key,val) {
  var res = val;
  if (obj) {
    if (val) {
      jxEnsureElement(obj).style.setProperty(key,val);
    } else {
      var style = getComputedStyle(jxEnsureElement(obj));
      res = style.getPropertyValue(key);
    }
  }
  return res;
}

function jxClassRemove(obj,cstr,groupstr) { 
  var cs = cstr.split(' ');
  for (var j=0;j<cs.length;j++) {
    var c=cs[j];
    if (groupstr) {
      var es = jxElementsOfClass(groupstr);
      for (var i=0;i<es.length;i++) {
        es[i].classList.add(c);
      }
    }
    if (obj) jxEnsureElement(obj).classList.remove(c); 
  }
}

function jxClassAdd(obj,cstr,groupstr) { 
  var cs = cstr.split(' ');
  for (var j=0;j<cs.length;j++) {
    var c=cs[j];
    if (groupstr) {
      var es = jxElementsOfClass(groupstr);
      for (var i=0;i<es.length;i++) {
        es[i].classList.remove(c);
      }
    }
    if (obj) jxEnsureElement(obj).classList.add(c);
  }
}

function jxClassApply(cstr,fun) {
  var es = jxElementsOfClass(cstr);
  for (var i=0;i<es.length;i++) { fun(es[i]); }
}

function jxHasClass(obj,cstr) {
  return jxEnsureElement(obj).classList.contains(cstr);
}

/*
function jxMakeWidget(tag,id,classes,children) {
  var obj = document.createElement(tag);
  if (id) jxId(obj,id);
  if (classes) {
    var cs = (jxType(classes)=='string'?classes.split(" "):classes);
    for (var i=0;i<cs.length;i++) {
      jxClassAdd(obj,cs[i]);
    }
  }
  if (children) {
    var cs = jxEnsureArray(children);
    for (var i=0;i<cs.length;i++) {
      jxAppend(obj,cs[i]);
    }
  }
  return obj;
}
*/


function jxDelete(obj) {
  var o = jxEnsureElement(obj);
  if (o&&o.remove) o.remove();
}

function jxEvent(obj,id,cb,capture) {
  if (obj&&addEventListener) {
    obj.addEventListener(id, cb, capture||false);
  }
}

function jxResize() {
  setTimeout(function() {
    window.dispatchEvent(new Event('resize'));
  },10);
}

function jxDimension(obj,key) {
  var r = obj.getBoundingClientRect();
  return r[key];
}

// this is hackish : flex box does not update properly, so
// we lock the height of the new element to that of the old element
// this requires box-sizing: border-box to avoid accumulating margin
// also note that this breaks resizing (solution?)
function jxReplace(o1,o2) {
  o1=jxEnsureElement(o1);
  var h = jxHeight(o1);
  o2=jxEnsureElement(o2);
  if (o1&&o1.parentNode&&o2) {
    o1.parentNode.replaceChild(o2,o1);
    jxStyle(o2,'flex','0 0 ' + h + 'px');
  }
}

// swap foreground and background
function jxInvertColor(o1,transparentBackground) {
  var fg = jxStyle(o1,'color');
  var bg = jxStyle(o1,'background-color');
  if (transparentBackground) {
    if  (bg=='rgba(0, 0, 0, 0)') {
      jxStyle(o1,'color','var(--gray900)');
      jxStyle(o1,'background-color',fg); 
    } else {
      jxStyle(o1,'color',bg);
      jxStyle(o1,'background-color','rgba(0,0,0,0)');
    }
    // if fg is black, back
  } else {
    jxStyle(o1,'color',bg);
    jxStyle(o1,'background-color',fg); 
  }
}

function jxElapsedString (elapsed) {
  if (elapsed==-1) return "--:--:--";
  var h = Math.floor(elapsed/3600.0);
  elapsed-=h*3600;
  var m = Math.floor(elapsed/60.0);
  elapsed-=m*60;
  var s = Math.floor(elapsed);
  if (h<10) h="0" + h;
  if (m<10) m="0" + m;
  if (s<10) s="0" + s;
  return h+':'+m+':'+s;
}

function jxSpin (obj,secs) {
  var o = jxEnsureElement(obj);
  jxStyle(o,'-webkit-animation','spinning ' + secs + 's linear infinite');
  jxStyle(o,'-moz-animation','spinning ' + secs + 's linear infinite');
  jxStyle(o,'-ms-animation','spinning ' + secs + 's linear infinite');
  jxStyle(o,'-o-animation','spinning ' + secs + 's linear infinite');
  jxStyle(o,'animation','spinning ' + secs + 's linear infinite');
}

function jxSigFigures(val,n) {
  var thres = 1;
  while (thres<val) { n-=1; thres*=10; }
  if (n<0) n=0;
  return val.toFixed(n);  
}

function jxAssertNumber(val,min,max) {
  var res=val;
  if (jxType(res)=='string') res=parseFloat(res);
  if (res) {
    if ((min||jxType(min)=='number')&&res<min) res=null;
    if ((max||jxType(max)=='number')&&res>max) res=null;
  } 
  if (!res) console.error('jxAssert: invalid value');
  return res;
}

function jxEnsureNumber(val) {
  var res=val;
  if (jxType(res)=='string') res=parseFloat(res);
  if (!jxType(res)=='number') res=0;
  return res;
}

function jxBrowser () {
  var userAgent = navigator.userAgent;
  var res = 'unknown';
  if(userAgent.match(/chrome|chromium/i)) {
    res = "chrome";
  } else if (userAgent.match(/firefox/i)) {
    res = "firefox";
  }  else if (userAgent.match(/safari|crios|fxios/i)) {
    res = "safari";
  } else if (userAgent.match(/opr\//i)) {
    res = "opera";
  } else if (userAgent.match(/edg/i)) {
    res  = "edge";
  }
  return res;
}

function jxReload () {
  window.location.reload();
}

function jxPositionChildren (elem) {
  jxStyle(elem,'position','relative');
  jxStyle(elem,'top','0');
  jxStyle(elem,'left','0');
}

function jxPosition (elem,x,y) {
  jxStyle(elem,'position','absolute');
  jxStyle(elem,'top',y||'50%');
  jxStyle(elem,'left',x||'50%');
  jxStyle(elem,'transform','translate(-50%,-50%)');
}

function jxPositionBL(elem) { jxApplyConfig(elem, {
  "position": "absolute", "bottom": "0px", "left": "0px"
}); }
function jxPositionBR(elem) { jxApplyConfig(elem, {
  "position": "absolute", "bottom": "0px", "right": "0px"
}); }
function jxPositionBC(elem) { jxApplyConfig(elem, {
  "position": "absolute", "bottom": "0px", "left": "50%", "transform": "translatex(-50%)" 
}); }
function jxPositionTL(elem) { jxApplyConfig(elem, {
  "position": "absolute", "top": "0px", "left": "0px"
}); }
function jxPositionTR(elem) { jxApplyConfig(elem, {
  "position": "absolute", "top": "0px", "right": "0px"
}); }
function jxPositionTC(elem) { jxApplyConfig(elem, {
  "position": "absolute", "top": "0px", "left": "50%", "transform": "translatex(-50%)"
}); }
function jxPositionCC(elem) { jxApplyConfig(elem, {
  "position": "absolute", "top": "50%", "left": "50%", "transform": "translate(-50%,-50%)"
}); }
function jxPositionCL(elem) { jxApplyConfig(elem, {
  "position": "absolute", "top": "50%", "left": "0px", "transform": "translatey(-50%)"
}); }
function jxPositionCR(elem) { jxApplyConfig(elem, {
  "position": "absolute", "top": "50%", "right": "0px", "transform": "translatey(-50%)"
}); }

function jxIsImage(str) {
  str = str.split('?').shift();
  var ext = str.split('.').pop().toUpperCase();
  var imgfmt = [ "SVG", "PNG", "JPG", "GIF" ];
  return imgfmt.includes(ext);
}

/** Merge multiple objects into one
* @return {Object} A new object containing the properties of input objects
*/
function jxMerge() {
  var res = {};
  for (var i=0;i<arguments.length;i++) {
    var obj = arguments[i];
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        res[key]=obj[key];
      }
    } 
  }
  return res;
}

/** Clone an object
* @param {Object} obj The object to clone
* @return {Object} The cloned object
*/
function jxClone(obj) {
  return jxMerge(obj);
}

/** Apply configuration key-values to object
* 
* @param {Object} obj The object to update
* @param {Object} cfg The configuration data
* @param {Array}  flt Optional filter list of allowed keys
* @param {Boolean}  fltinv If true treat filter as blacklist
*/
function jxApplyConfig(obj,cfg,flt,fltinv) {
  for (const key in cfg) {
    if (flt==null||(!fltinv&&flt.includes(key))||(fltinv&&!flt.includes(key))) {
      var styles = [ "color", "background", "background-color",
                     "font-family", "font-size", "font-weight",
                     "opacity", "border", "border-radius", 
                     "width", "min-width", "max-width",
                     "height", "min-height", "max-height",
                     "text-align", "transform", "position",
                     "flex", "display", "overflow", "overflow-x", "overflow-y",
                     "text-decoration", "outline", "text-shadow",
                     "border-left","border-right","border-top","border-bottom",
                     "top","bottom","left","right", "cursor",
                     "margin","margin-left","margin-right","margin-top","margin-bottom",
                     "justify-content", "z-index","object-fit","filter",
                     "padding", "padding-top", "padding-bottom", "padding-left", "padding-right",
                     "outline", "box-shadow"
                    ];
      var attrs = [ "title", "type", "src", "href", "download", "placeholder",
                    "contenteditable", "id", "tabindex" ];
      if (styles.includes(key)) { 
        jxStyle(obj,key,cfg[key]);
      } else if (attrs.includes(key)) {
        jxAttr(obj,key,cfg[key]);
      } else if (key=='class') {
        var cs = cfg["class"].split(" ");
        for (var i=0;i<cs.length;i++) {
          jxClassAdd(obj,cs[i]);
        }
      } else if (key=='children') {
        var cs = jxEnsureArray(cfg["children"]);
        for (var i=0;i<cs.length;i++) {
          jxAppend(obj,cs[i]);
        }
      } else if (key=='callback') {
        jxEvent(obj,'click',cfg["callback"],cfg["capture"]);
        jxStyle(obj,'cursor','pointer');
      } else if (key=='color-filter') {
        jxStyle(obj,'filter', jxColorToFilter(cfg["color-filter"]));
      } else if (key=='innerHTML') {
        jxHTML(obj,cfg[key]);
      } else if (key=='innerText') {
        jxText(obj,cfg[key]);
      } 
    }
  }
}

/** Apply gradient to the background of the object
* @param {Object} obj The object to set background gradient
*/
function jxGradient(obj) {
  jxStyle(jxEnsureElement(obj),'background','linear-gradient(' +
    jxPal(0.3).hex() + ' 1%,' +
    jxPal(0.2).hex() + ' 5%,' +
    jxPal(0.2).hex() + ' 49%,' +
    jxPal(0.1).hex() + ' 51%,' +
    jxPal(0.1).hex() + ' 95%,' +
    jxPal(0.3).hex() + ' 99%'  + ')');
}

/** Create a widget
* @param {string} tag The element type
* @param {Object} cfg The element properties
*/
function jxMakeWidget(tag,cfg) {
  var obj = document.createElement(tag);
  if (cfg) jxApplyConfig(obj,cfg);
  return obj;
}

function jxSelect(obj,sel) {
  if (sel) {
    jxStyle(obj,'background',jxPal(0.2).hex()); 
  } else {
    jxStyle(obj,'background',jxPal(0.1).hex()); 
  }
}

function jxSaveString(key, val) {
  localStorage.setItem("jx_" + key, val)
}

function jxLoadString(key, _default) {
  return localStorage.getItem("jx_" + key) || _default
}

function jxSaveJSON(key, val) {
  localStorage.setItem("jx_" + key, JSON.stringify(val));
}

function jxLoadJSON(key, _default) {
  var res = localStorage.getItem("jx_" + key);
  return (res?JSON.parse(res):_default);
}

function jxFocusEmpty(obj) {
  setTimeout( function () {
    var p = jxEnsureElement(obj);
    s = window.getSelection(),
    r = document.createRange();
    p.innerHTML = '\u00a0';
    r.selectNodeContents(p);
    s.removeAllRanges();
    s.addRange(r);
    document.execCommand('delete', false, null);
  },0);
}

function jxFocus(obj) {
  setTimeout( function () {
    var p = jxEnsureElement(obj);
    s = window.getSelection(),
    r = document.createRange();
    r.setStart(p, 0);
    r.setEnd(p, 0);
    s.removeAllRanges();
    s.addRange(r);
  }, 0);
}

function jxUnfocus(obj) { jxEnsureElement(obj).blur(); }

function jxClick(obj) { jxEnsureElement(obj).click(); }

function jxEnsureString (data) {
  if (jxType(data)=='string') {
    return data;
  } else if (jxType(data)=='number') {
    return data + '';
  } else {
    var strdata = "";
    var u8data = new Uint8Array(data);
    for (var i=0;i<u8data.length;i++) {
      strdata += String.fromCharCode(u8data[i]);
    }
    return strdata;
  }
}


class jxPowerAsymmetry {
  constructor (config) {
    this.fs=config['srate']||256;
    this.size = config['asymSize']||1024;
    this.data1 = [];
    this.sum1 = 0;
    this.data2 = [];
    this.sum2 = 0;
    this.idx= 0; 
    this.count=0;
    for (var i=0;i<this.size;i++) {
      this.data1.push(0);
      this.data2.push(0);
    }
  }
  add(data1,data2) {
    var res;
    for (var i=0;i<data1.length;i++) {
      var p1 = data1[i]*data1[i];
      this.sum1-=this.data1[this.idx];
      this.data1[this.idx]=p1;
      this.sum1+=p1;
      var p2 = data2[i]*data2[i];
      this.sum2-=this.data2[this.idx];
      this.data2[this.idx]=p2;
      this.sum2+=p2;
      this.idx++;
      this.count++;
      if (this.idx==this.size) this.idx=0;
    }
    if (this.count>this.fs) {
      res =  (this.sum2 - this.sum1) / (this.sum1 + this.sum2);
      this.count-=this.fs;
    }
    return res;
  }
}

class jxCDSA { 
  constructor (config) {
    this.fs=config['srate']||256;
    this.fftSize=config['fftSize']||1024;
    this.fftWindow=config['fftWindow']||'hanning';
    this.cdsaMaxFreq=config['cdsaMaxFrequency']||41;
    this.cdsaSize=Math.ceil(this.cdsaMaxFreq*this.fftSize/this.fs);
    this.fft = new Fili.Fft(this.fftSize);
    this.pipeline=[];
    this.cdsa=[];
    this.dbmax = 100;
    this.dbmin = 10;
    for (var i=0;i<this.cdsaSize;i++) {
      this.cdsa.push(0);
    }
    for (var i=0;i<this.fftSize;i++) {
      this.pipeline.push(0.1);
    }
  }
  calc(data) {
    var cdsa=[];
    var tmp_out = this.fft.magnitude(this.fft.forward(data,this.fftWindow));
    tmp_out[0]=1e-6;
    tmp_out = this.fft.magToDb(tmp_out.slice(0,this.cdsaSize));
    var tmp_min = tmp_out[0];
    var tmp_max = tmp_out[0];
    for (var i=1;i<this.cdsaSize;++i) {
      if (tmp_out[i]>tmp_max) tmp_max = tmp_out[i];
      if (tmp_out[i]<tmp_min) tmp_min = tmp_out[i];
    }
    this.dbmax = 0.1*tmp_max + 0.9*this.dbmax;
    this.dbmin = 0.1*tmp_min + 0.9*this.dbmin;
    for (var i=0;i<this.cdsaSize;++i) {
      var val = tmp_out[i];
      if (val>this.dbmax) val = this.dbmax;
      if (val<this.dbmin) val = this.dbmin;
      val = (val - this.dbmin)/(this.dbmax - this.dbmin);
      cdsa.push(val);
    }
    this.cdsa = cdsa;
  }
  add(data) {
    var res = false;
    for (var i=0;i<data.length;i++) {
      this.pipeline.push(data[i]);
    }
    if (this.pipeline.length>=this.fftSize) {
      this.calc(this.pipeline.slice(0,this.fftSize));
  //    for (var i=0;i<data.length;i++) {this.pipeline.shift();}
      for (var i=0;i<256;i++) {this.pipeline.shift();}
      res = true;
    }
    return res;
  }
}

function jxMakeWaveform(config) {
  var idstr = config["id"];
  var o = jxMakeCanvas(idstr);
  jxClassAdd(o,'jx-waveform');


  var legend_tl =  jxMakeWidget('div','jx-waveform-legend-tl-'+idstr,
                                'jx-waveform-legend-label jx-waveform-legend-label-left');
  var legend_bl =  jxMakeWidget('div','jx-waveform-legend-bl-'+idstr,
                                'jx-waveform-legend-label jx-waveform-legend-label-left');
  var tmp = [];
  tmp.push(legend_tl);
  var axis = config['axis']||[];
  for (var i=0;i<axis.length;i++) { 
    var a = jxMakeWidget('div',null,'jx-waveform-legend-label jx-waveform-legend-label-center');
    jxText(a,axis[i]);
    tmp.push(a);
  }
  tmp.push(legend_bl);
  var legend_l = jxMakeRows('jx-waveform-legend-l-'+idstr,tmp);
  //var legend_l = jxMakeRows('jx-waveform-legend-l-'+idstr,[legend_tl,legend_bl]);
  jxClassAdd(legend_l,'jx-waveform-legend jx-waveform-legend-left');
  jxText(legend_tl,config['label']||"LABEL");
  jxText(legend_bl,config['unit']||"UNIT");
  if (config['type']=='cdsa') jxStyle(legend_l,'background-color','transparent');
  jxAppend(o,legend_l);

  var legend_tr =  jxMakeWidget('div','jx-waveform-legend-tr-'+idstr,
                                'jx-waveform-legend-label jx-waveform-legend-label-right');
  var legend_br =  jxMakeWidget('div','jx-waveform-legend-br-'+idstr,
                                'jx-waveform-legend-label jx-waveform-legend-label-right');
  var legend_r = jxMakeRows('jx-waveform-legend-r-'+idstr,[legend_tr,legend_br]);
  jxClassAdd(legend_r,'jx-waveform-legend jx-waveform-legend-right');
  if (config['type']=='cdsa') {
    if (config['invert']) {
      jxText(legend_tr,"0 Hz");
      jxText(legend_br,"40 Hz");
    } else { 
      jxText(legend_tr,"40 Hz");
      jxText(legend_br,"0 Hz");
    }
  }
  jxAppend(o,legend_r);

  for (var i=0;i<3;i++) {
    var dv = jxMakeWidget('div',{
      "id": idstr +'-divider-'+(i+1),
      "position": "absolute",
      "top": "0",
      "height": "100%",
      "width": "1px",
      "background": jxPal(0.3).hex(),
      "opacity": "0.5",
      "z-index": 1,
      "left": (25+25*i) + '%'
    });
    jxAppend(o,dv);
    if (config['timestamps']) {
      o.timestamps=true;
      var ts = jxMakeWidget('div',{
        "id": idstr +'-timestamp-'+(i+1),
        "position": "absolute",
        "bottom": "0",
        "opacity": "0.5",
        "z-index": "4",
        "font-size": "12px",
        "color": jxPal(1.0).hex(),
        "text-shadow": "-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black",
        "left": (25+25*i) + '%',
        "innerHTML": "00:00:00",
        "transform": "translate(-50%,0)"
      });
      jxAppend(o,ts);
    }
  }
  o.config = config;
  o.xofs=0;
  o.ylast=[0,0,0,0,0,0,0,0];
  if (config['type']=='cdsa') {
    o.cdsa = new jxCDSA(config);
    o.pal = new jxPalette(config['palette']||"Rainbow");
    o.invert = config['invert']||false;
    jxStyle(o,'background',o.pal.rgbstr(0));
  }
  if (config['type']=='asym') {
    o.asym = new jxPowerAsymmetry(config);
  }
  return o;
}

function jxWaveformClear(idstr) {
  var o = jxEnsureElement(idstr);
  if (o.timestamps) {
    jxText(o.id+'-timestamp-1',"00:00:00");
    jxText(o.id+'-timestamp-2',"00:00:00");
    jxText(o.id+'-timestamp-3',"00:00:00");
  }
  var canvas = o.firstChild;
  var ctx = canvas.getContext('2d');
  var h = canvas.height;
  var w = canvas.width;
  var type = o.config['type']||"wave";
  ctx.clearRect(0,0,w-(type=='cdsa'?10:0),h);
  o.ylast=[0,0,0,0,0,0,0,0];
  o.xofs = 0;
}

function jxWaveformTimestamps(o) {
  var res = null;
  if (o.timestamps) {
    var mark1 = Math.floor(o.offsetWidth/4.0);
    var mark2 = 2*mark1;
    var mark3 = 3*mark1;
    if (o.xofs_1<mark1&&o.xofs>=mark1) {
      res = function (t) { jxText(o.id+'-timestamp-1',jxElapsedString(t)); };
    } else if (o.xofs_1<mark2&&o.xofs>=mark2) {
       res = function (t) { jxText(o.id+'-timestamp-2',jxElapsedString(t)); };
    } else if (o.xofs_1<mark3&&o.xofs>=mark3) {
       res = function (t) { jxText(o.id+'-timestamp-3',jxElapsedString(t)); };
    }
  }
  return res;
}

function jxWaveformAdd() {
  var res;
  if (arguments.length<2) return;
  var o = jxEnsureElement(arguments[0]);
  var n = arguments.length - 1;
  var canvas = o.firstChild;
  var ctx = canvas.getContext('2d');
  ctx.strokeStyle=o.config['color']||jxPal(1.0).hex();
  ctx.fillStyle=o.config['color']||jxPal(1.0).hex();
  var ymax = o.config['ymax']||1.5;
  var yscale = canvas.height/(2*n*ymax);
  var type = o.config['type']||"wave";
  var mark1 = Math.floor(o.offsetWidth/4.0);
  var mark2 = 2*mark1;
  var mark3 = 3*mark1;
  switch (type) {
    case "wave":
      var yofs = canvas.height/(n + 1);
      var len = arguments[1].length;
      ctx.clearRect(o.xofs,0,len+20,canvas.height);
      var xofs = o.xofs;
      o.xofs_1 = xofs;
      for (var j=0;j<n;j++) {
        var data = arguments[j+1];
        o.xofs = xofs;
        ctx.beginPath();
        ctx.lineWidth=2;
        ctx.moveTo(o.xofs-1,(j+1)*yofs+o.ylast[j]);
        for (var i=0;i<data.length;i++) {
          o.ylast[j]=yscale*data[i];
          var y=(j+1)*yofs+o.ylast[j];
          if (o.xofs==0) {
            if (j==0) ctx.clearRect(0,0,len+20,canvas.height);
            ctx.moveTo(o.xofs,y);
          } else {
            ctx.lineTo(o.xofs,y);
          }
          res = jxWaveformTimestamps(o);
          o.xofs++;
          if (o.xofs>=canvas.width) o.xofs=0;
        }
        ctx.stroke();
        ctx.fillRect(o.xofs,y-1,5,3);
      }
      break;
    case "asym": 
      var asym = o.asym.add(arguments[1],arguments[2]);
      if (asym||jxType(asym)=='number') {
        var cw = canvas.width;
        var ch = canvas.height;
        var yscale = canvas.height/(2*ymax);
        ctx.clearRect(o.xofs+1,0,20,ch);
        ctx.fillStyle="white";
        var y1 = ch*0.5;
        var y2 = ch*(-0.5*asym+0.5);
        ctx.fillRect(o.xofs,Math.min(y1,y2),1,Math.max(1.0,Math.abs(y2-y1)))
        res = jxWaveformTimestamps(o);
        if (asym>=0) {
          jxText('jx-waveform-legend-tr-'+o.id,'+'+jxSigFigures(100*asym,2)+'%');
          jxText('jx-waveform-legend-br-'+o.id,'');
        } else {
          jxText('jx-waveform-legend-br-'+o.id,jxSigFigures(100*asym,2)+'%');
          jxText('jx-waveform-legend-tr-'+o.id,'');
        }
        if (o.annotation) {
          ctx.beginPath();
          ctx.lineWidth=1;
          ctx.moveTo(o.xofs,0);
          ctx.lineTo(o.xofs,10);
          ctx.stroke();
          ctx.font='jxDefault';
          ctx.fillStyle='white';
          ctx.textAlign='right';
          ctx.fillText(o.annotation,o.xofs-2,10);
          o.annotation=null;
        }
        o.xofs++;
        if (o.xofs>=canvas.width) o.xofs=0;
      }
      break;
    case "cdsa":
      var cw = canvas.width;
      var ch = canvas.height;
      var sy = (ch + 0.0)/o.cdsa.cdsaSize;
      ctx.setTransform(1,0,0,sy,0,0);
      if (o.xofs==0) {
        for (var i=0;i<o.cdsa.cdsaSize;i++) {
          var val = (!o.invert?i/o.cdsa.cdsaSize:(o.cdsa.cdsaSize-i-1)/o.cdsa.cdsaSize);
          ctx.fillStyle=o.pal.rgbstr(val);
          ctx.fillRect(cw-10,i-1,10,1+1);
        }
      }
      if (o.cdsa.add(arguments[1])) {
/*
        if (o.invert) {
          jxText('jx-waveform-legend-tr-'+o.id,o.cdsa.dbmax.toFixed(2)+' dB');
          jxText('jx-waveform-legend-br-'+o.id,o.cdsa.dbmin.toFixed(2)+' dB');
        } else {
          jxText('jx-waveform-legend-tr-'+o.id,o.cdsa.dbmin.toFixed(2)+' dB');
          jxText('jx-waveform-legend-br-'+o.id,o.cdsa.dbmax.toFixed(2)+' dB');
        }
*/
        jxText('jx-waveform-legend-bl-'+o.id,Math.round(o.cdsa.dbmax-o.cdsa.dbmin)+' dB');
        for (var i=0;i<o.cdsa.cdsaSize;i++) {
          var val = o.cdsa.cdsa[(o.invert?i:o.cdsa.cdsaSize-i-1)];
          ctx.fillStyle=o.pal.rgbstr(val);
          ctx.fillRect(o.xofs,i-1,1,1+1);
        }
        ctx.fillStyle=o.config['color']||"var(--gray100)";
        ctx.fillRect(o.xofs+1,0,3,o.cdsa.cdsaSize);
        o.xofs++;
        if (o.xofs>=canvas.width) o.xofs=0;
     }
     break;
  }
  return res;
}


class jxWaveformFilter {
  constructor (name,config) {
    this.name = name;
    this.postfix= config.postfix||'Filtered';
    this.alpha = config.alpha||0.01;
    this.alpha2 = config.alpha2||0.1;
    this.autorange = config.autorange;
    this.max = null;
    this.min = null;
    if (config.decimate) {
      this.decimator = new jxDecimate({ decimation: config.decimate});
    }
    if (config.resample) {
      this.resampler = new jxResampler({ ratio: config.resample});
    }
    if (config.dcblock) {
      this.dcblock = new jxDCBlock({ ratio: config.dcblock });
    }
    if (config.scale) {
      this.scale = config.scale;
    }
  }
  step (state) {
    var data = state[this.name + 'Waveform'];
    var res = [];
    var s = this.scale||1.0;
    for (var i=0;i<data.length;i++) {
      if (!isNaN(data[i])) res.push(s*data[i]);
    } 
    // run the dcblock filter before resampling to avoid artifacts
    if (this.dcblock) { res = this.dcblock.step(res); }
    if (this.decimator) { res = this.decimator.step(res); }
    if (this.resampler) { res = this.resampler.step(res); }
    for (var i=0;i<res.length;i++) {
      var x = res[i];
      if (x>this.max||this.max==null) {
        this.max = this.alpha2*x + (1-this.alpha2)*(this.max||x);
      }  else if (x<this.min||this.min==null) {
        this.min = this.alpha2*x + (1-this.alpha2)*(this.min||x);
      } else { 
            this.max = this.alpha*x + (1-this.alpha)*this.max;
            this.min = this.alpha*x + (1-this.alpha)*this.min;
          }
      if (this.autorange&&this.max!=this.min) {
        x = 2.0*(x - 1.7*this.min)/(1.7*(this.max - this.min)) - 1.0;
      }
      res[i]=x;
    }
    state[this.name + 'Waveform' + this.postfix] = res;
  }
}


var jxWheelScrolling = false;

function jxWheelScroller () {
  jxWheelScrolling=true;
  var pars = document.getElementsByClassName('jx-wheel-scrolling');
  for (var i=0;i<pars.length;i++) {
    var obj = pars[i];
    var scroll_target = parseFloat(jxAttr(obj,'scroll-target'));
    var x = obj.scrollLeft;
    if (x!=scroll_target) {
      var x1 = Math.round(0.1*scroll_target + 0.9*x);
      obj.scrollLeft = x1;
      if (obj.scrollLeft != x1||x1==x) {
        jxClassRemove(obj,'jx-wheel-scrolling');
      }
    } else {
      jxClassRemove(obj,'jx-wheel-scrolling');
    }
  }
  if (pars.length>0) { 
    requestAnimationFrame(jxWheelScroller);
  } else {
    jxWheelScrolling = false;
  }
}

// center the selected volume in ui element
function jxWheelCenter (elem) {
  var obj = jxEnsureElement(elem);
  var par = jxParent(obj);
  var ow = obj.offsetWidth;
  var ol = obj.offsetLeft;
  var pw = par.offsetWidth;
  var pl = par.offsetLeft;
  // current - desired
  scroll_target = ol - (pl + pw/2.0 - ow/2.0);
  jxAttr(par,'scroll-target',scroll_target+'');
  jxClassAdd(par,'jx-wheel-scrolling');
  if (!jxWheelScrolling) jxWheelScroller();
}

function jxWheelSelect(wid,idx) {
  var id = wid + '-' + idx;
  if (idx>=0) jxWheelCenter(id);
  jxClassApply('jx-wheel-'+wid, function (o) {
    if (id==o.id) {
      jxGradient(o);
    } else {
      jxStyle(o,'background','none');
    }
  }); 
}

function jxMakeWheelCallback(idstr,i,cb) {
  var id = idstr + '-' + i;
  var id2 = idstr + '-inner-' + i;
  return function (e) {
    jxClassApply('jx-wheel-'+idstr, function (o) {
      if (id==o.id) { 
        jxGradient(o);
      } else {
        jxStyle(o,'background','none');
      }
    });
    jxWheelCenter(id);
    if (cb) cb(i);
  }
}

/*
function jxMakeWheel(idstr,elems,cb,def,confirm) {
  var objs=[];
  var scrollto;
  if (elems) {
    for (var i=0;i<elems.length;i++) {
      var e = elems[i];
      if (jxType(e)=='string') {
        var o = jxMakeWidget('div',idstr+'-'+i,
                  'jx-wheel-entry jx-wheel-' + idstr); 
        var oi = jxMakeWidget('div',idstr+'-inner-'+i, (confirm?'jx-confirm ':'') +
                  'jx-wheel-entry-inner jx-wheel-inner-'+ idstr);
        if (def&&e==def) { 
          jxClassAdd(o,'jx-background-gradient'); 
          jxClassAdd(oi,'jx-selected'); 
          scrollto=o;
        }
        var o2;
        if (e.split('.').pop()=='svg'||e.split('.').pop()=='png') {
          o2 = jxMakeWidget('img',null,'jx-wheel-icon');
          jxAttr(o2,'src',e);
        } else {
          o2 = jxMakeWidget('div',null,'jx-wheel-text');
          jxText(o2,e);
        }
        jxEvent(o,'click',jxMakeWheelCallback(idstr,i,cb));
        jxAppend(oi,o2);
        jxAppend(o,oi);
        objs.push(o);
      }
    }
  }
  var res = jxMakeWidget('div',idstr,'jx-widget jx-wheel');
  for (var i=0;i<objs.length;i++) jxAppend(res,objs[i]);
  if (scrollto) setTimeout(function() {jxWheelCenter(scrollto)},100);
  return res;
}
*/

function jxMakeWheel(cfg) {
  var objs=[];
  var scrollto=null;
  var idstr = cfg["id"];
  var elems = cfg["entries"]||[];
  for (var i=0;i<elems.length;i++) {
    var e = elems[i];
    var o = jxMakeWidget('div',{ 
      'id': idstr+'-'+i,
      'class': 'jx-wheel-' + idstr
    });
    jxPositionChildren(o);
    var o2 = null;
    if (jxIsImage(e)) {
      o2 = jxMakeWidget('img',{
        "id": idstr+'-inner-'+i,
        "class": 'jx-wheel-inner-'+ idstr
      });
      jxAttr(o2,'src',e);
      // work around safari bug
      if (jxBrowser()=='safari') {
        jxStyle(o2,"width","50%");
        jxStyle(o2,"height","50%");
      } else {
        jxStyle(o2,"width","80%");
        jxStyle(o2,"height","80%");
      }
      jxStyle(o2,"object-fit", "contain");

    } else {
      o2 = jxMakeWidget('div',{
        "id": idstr+'-inner-'+i,
        "class": 'jx-wheel-inner-'+ idstr
      });
      jxHTML(o2,e);
    }
    jxApplyConfig(o2,cfg,["background","callback","border","border-radius"],true);
    jxPosition(o2);
    // work around safari bug
    if (jxBrowser()=='safari') {
      jxStyle(o2,'top','7%');
    }
    jxStyle(o,'display','inline-block');
    jxStyle(o,'width','30%');
    jxStyle(o,'height','100%');
    if (cfg["default"]&&e==cfg["default"]) {
      jxGradient(o);
      scrollto=o;
    }
    jxAppend(o,o2);
    if (cfg["callback"]) {
      jxEvent(o,'click',jxMakeWheelCallback(idstr,i,cfg["callback"]));
    }
    objs.push(o);
  }
  var res = jxMakeWidget('div', { 
    "id": idstr 
  });
  jxApplyConfig(res,cfg,["background"]);
  for (var i=0;i<objs.length;i++) jxAppend(res,objs[i]);
  jxStyle(res,'mask-image', "linear-gradient(transparent, black 20%, black 80%, transparent 100%)");
  jxStyle(res,'-webkit-mask-image', "linear-gradient( to right,transparent, black 20%, black 80%, transparent 100%)");
  jxClassAdd(res,'jx-no-scrollbar');
  jxStyle(res,'overflow-x','auto');
  jxStyle(res,'overflow-y','hidden');
  jxStyle(res,'white-space','nowrap');
  jxStyle(res,'width','100%');
  if (scrollto) setTimeout(function() {jxWheelCenter(scrollto)},100);
  return res;
}

function jxMakeNumberWheel(idstr,range,cb,def,confirm) {
  var elems = [];
  var vmin = range[0];
  var vmax = range[1];
  var step = range[2];
  var sigfigs = (range.length==4?range[3]:0);
  var v=vmin;
  while (v<vmax) {
    elems.push(jxSigFigures(v,sigfigs));
    v+=step;
  }
  return jxMakeWheel(idstr,elems,cb,def,confirm);
}


/**
* @typedef {Object} jxDCBlockOptions
* @property {number} fs - Sampling frequency
* @property {number} fc - Cut-off frequency
* @property {number} ratio - Alternative specification (fc/fs)
*/

/** DC Blocking filter (single pole) 
* This provides a simple way to remove offsets in waveform data.
*
* @example
* var myFilter = new jxDCBlock({ ratio: 0.01 });
* var myFilter = new jxDCBlock({ fs: 64, fc: 0.5 });
*/
class jxDCBlock {
/**
* Create a DC Blocking filter
* @param { jxDCBlockOptions } config - Configuration options
*/
  constructor (config) {
    //var fs = config['srate']||256;
    //var fs = config['srate']||66.66;
    //var fc = config['cutoff']||0.05;
    //this.b = 2 * Math.PI * fc / fs;
    var r = config.ratio||0.001;
    this.b = 2 * Math.PI * r;
    this.a = 1 - this.b/2.0;
    this.x_1=0;
    this.y_1=0;
    this.first = true;
  }
/**
* Process data
* @param {Array} data - chunck of data to filter
* @returns {Array} filtered data
*/
  step (data) {
    var res = [];
    for (var i=0;i<data.length;i++) {
      var x = data[i];
      if (this.first) { 
        this.x_1 = x; 
        this.y_1 = x; 
        this.first = false;
      }
      var y = this.a*x-this.a*this.x_1+(1-this.b)*this.y_1;
      this.y_1=y;
      this.x_1=x;
      res.push(y);
    }
    return res;
  }
}

// minimal decimation filter - meant for driving waveform plots

class jxDecimate {
  constructor (config) {
    this.n = config.decimation||4;
    this.data = [];
    for (var i=0;i<2*this.n;i++) this.data.push(0);
    this.idx = 0;
    this.sum = 0;
    this.count = 0;
    this.first = true;
  }
  step (data) {
    var res = [];
    for (var i=0;i<data.length;i++) {
      if (this.first) {
        for (var j=0;j<2*this.n;j++) this.data[j]=data[i];
        this.sum = data[i]*2*this.n;
        this.first = false;
      }
      this.sum-=this.data[this.idx];
      this.data[this.idx]=data[i];
      this.sum+=this.data[this.idx];
      this.idx++;
      if (this.idx==2*this.n) this.idx=0;
      var vfilter = this.sum/(2*this.n);
      if (this.count%this.n==0) res.push(vfilter);
      this.count++;
    }
    return res;
  }
}


/**
* @typedef {Object} jxLowPassOptions
* @property {number} fs - Sampling Frequency
* @property {number} fc - Cut-off frequency
* @property {number} [order] - Filter order (8)
*/

/** Low Pass IIR Filter
* @example
* var myFilter = new jxLowPass({ fs: 64, fc: 4, order: 4 });
*/
class jxLowPass {
/**
* @param {jxLowPassOptions} config - Configuration options
*/
  constructor (config) {
    this.order = config.order || 8;
    this.fc = config.fc || 10.0;
    this.fs = config.fs || 64.0;
    this.prv_order =0;
    this.prv_fc = 0;
    this.prv_fs = 0;
    this.filter = null;
  }
/**
* @param {Array} data - Data to filter
* @return {Array} Filtered data
*/
  step (data) {
    var order = this.order;
    var fs = this.fs;
    var fc = this.fc;
    if (this.prv_order!=order || this.prv_fs!=fs || this.prv_fc!=fc) {
      var iirCalculator = new Fili.CalcCascades();
      var coefs = new iirCalculator.lowpass( {
        order: order,
        characteristic: 'butterworth',
        Fs: fs,
        Fc: fc,
        BW: 1,
        gain: 0,
        preGain: false
      });
      this.filter = new Fili.IirFilter(coefs);
      this.prv_order = order;
      this.prv_fs = fs;
      this.prv_fc = fc;
    }
    var ys = [];
    for (var i=0;i<data.length;i++) {
      var x = data[i];
      ys.push(this.filter.singleStep(x));
    }
    return ys;
  }
}


/**
* 1D simplex noise generator
* @param { number } x The input coordinate
* @param { Array } [altperm] Alternative permutation table (n=256)
* @return { number } The simplex noise value
*/
function jxNoise (x,altperm) {
  function grad1d ( hash, x ) {
    var h = hash & 15;
    var grad = 1.0 + (h & 7); 
    if (h&8) grad = -grad;  
    return ( grad * x ); 
  }
  var perm = altperm||[151,160,137,91,90,15,
     131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
     190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
     88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
     77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
     102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
     135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
     5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
     223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
     129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
     251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
     49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
     138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180,151,
     160,137,91,90,15, 131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,
     99,37,240,21,10,23,190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,
     35,11,32,57,177,33, 88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,
     71,134,139,48,27,166, 77,146,158,231,83,111,229,122,60,211,133,230,220,105,
     92,41,55,46,245,40,244, 102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,
     208, 89,18,169,200,196, 135,130,116,188,159,86,164,100,109,198,173,186,
     3,64,52,217,226,250,124,123, 5,202,38,147,118,126,255,82,85,212,207,206,59,
     227,47,16,58,17,182,189,28,42, 223,183,170,213,119,248,152, 2,44,154,163, 
     70,221,153,101,155,167, 43,172,9, 129,22,39,253, 19,98,108,110,79,113,224,
     232,178,185, 112,104,218,246,97,228, 251,34,242,193,238,210,144,12,191,179,
     162,241, 81,51,145,235,249,14,239,107, 49,192,214, 31,181,199,106,157,184,
     84,204,176,115,121,50,45,127, 4,150,254, 138,236,205,93,222,114,67,29,24,72,
     243,141,128,195,78,66,215,61,156,180];
  var i0 = Math.floor(x);
  var i1 = i0 + 1;
  var x0 = x - i0;
  var x1 = x0 - 1.0;
  var n0, n1;
  var t0 = 1.0 - x0*x0;
  t0 *= t0;
  n0 = t0 * t0 * grad1d(perm[i0 & 0xff], x0);
  var t1 = 1.0 - x1*x1;
  t1 *= t1;
  n1 = t1 * t1 * grad1d(perm[i1 & 0xff], x1);
  return 0.25 * (n0 + n1);
}


/*
  PID controller with anti-windup, derivative filter and bumpless changes (b=1)

  https://www.ifac-control.org/publications/list-of-professional-briefs/pb_wittenmark_etal_final.pdf

  K 	Proportional gain
  Ti 	Integral time
  Td 	Derivative time
  Tt 	Reset time
  N 	Maximum derivative gain
  b 	Fraction of set point in prop. term
  ulow 	Low output limit
  uhigh High output limit
  h 	Sampling period

  uc 	Input: Set Point
  y 	Input: Measured Variable
  v 	Output: Controller output
  u 	Output: Limited controller output

  I 	Integral part
  D 	Derivative part
  yold 	Delayed measured variable

*/

class jxPID {
  constructor(config) {
    this.K = config['K']||-1.0;
    this.Ti = config['Ti']||200.0;
    this.Td = config['Td']||0.02;
    this.Tt = config['Tt']||60.0;
    this.N = config['N']||10.0;
    this.b = config['b']||1.0;
    this.ulow = config['ulow']||0.0;
    this.uhigh = config['uhigh']||600.0;
    this.h= config['h']||1.0;
    this.uc = 0;
    this.y = 0;
    this.v = 0;
    this.u = 0;
    this.I = 0;
    this.D = 0;
    this.bi = 0;
    this.ar = 0;
    this.ad = 0;
    this.bd = 0;
    this.yold = null;
  }
  step (uc,y) {
    this.bi = this.K*this.h/this.Ti;
    this.ar = this.h/this.Tt;
    this.ad = this.Td/(this.Td + this.N*this.h);
    this.bd = this.K*this.N*this.ad;
    this.uc = uc;
    this.y = y;
    if (this.y==null) this.y=0.0;
    if (this.uc==null) this.uc=0.0;
    if (this.yold==null) this.yold = this.y;
    var P = this.K*(this.b*this.uc - this.y);
    this.D = this.ad*this.D - this.bd*(this.y - this.yold);
    this.v = P + this.I + this.D;
    if (this.v < this.ulow) {
      this.u = this.ulow;
    } else {
      if (this.v > this.uhigh) {
        this.u = this.uhigh;
      } else {
        this.u = this.v;
      }
    }
    this.I = this.I + this.bi*(this.uc - this.y) + this.ar*(this.u - this.v);
    this.yold = this.y;
    return this.u;
  }
}


/** 
* @typedef {Object} jxPeakOptions
* @property {number} fs Sample rate
* @property {number} fc Cut-off frequency
* @property {number} q Q-factor
* @property {number} A amplification
*/

/** Biquad peaking filter GED
*/
class jxPeak {
/** Create biquad peaking filter
* @param {jxPeakOptions} config Configuration options
*/
  constructor (config) {
    this.x_2 = 0;
    this.x_1 = 0;
    this.y_2 = 0;
    this.y_1 = 0;
    reset(config);
  }
/** Reset filter based on configuration
* @param {jxPeakOptions} config Configuration options
*/
  reset (config) {
    this.fs = config.fs||this.fs;
    this.fc = config.fc||this.fc;
    this.q = config.q||this.q||1.4;
    this.a = config.a||this.a||1.0;
    var w0 = 2*Math.PI*fc/fs;
    var alpha = Math.sin(w0)/(2.0*q);
    var a0 = 1+ alpha/A;
    this.b0 = (1 + alpha*A) / a0;
    this.b1 = (-2*Math.cos(w0)) / a0;
    this.b2 = (1 - alpha*A) / a0;
    this.a1 = (-2*Math.cos(w0)) / a0;
    this.a2 = (1-alpha/A) / a0;
  }
/** Filter data
* @param {Array} Data to filter
* @return {Array} Filtered data
*/
  step (data) {
    var ys = [];
    for (var i=0;i<data.length;i++) {
      var x = data[i];
      var y = this.b0*x+this.b1*this.x_1+this.b2*this.x_2-this.a1*this.y_1-this.a2*this.y_2;
      ys.push(y);
      this.x_2 = this.x_1; 
      this.x_1 = x; 
      this.y_2 = this.y_1;
      this.y_1 = y;
    }
    return ys;
  }
}



/**
*  Generates a permutation table of integers from 0 to n-1
* @param {number} n Size of the permutation table
* @return {Array} Permutation table  
*
* @example
* jxPermutation(5)
* > [0,2,4,3,1]
*/
function jxPermutation(n)
{
  function next(v) {
    let n = v.length;
    let index = Math.floor(Math.random()*n);
    let num = v[index];
    v[index] = v[n - 1];
    v.splice(n - 1,1);
    return num;
  }
  var dst = [];
  var src = [];
  for (let i = 0; i < n; i++) src.push(i);
  while (src.length > 0) dst.push(next(src));
  return dst;
}


/** Perform linear resampling
* @param {Array} data The data to resample
* @param {number} newlen The length of the new data
* @return {Array} The data resampled to length newlen
*
* @example
* jxResample([1,2,3,4],2)
* > [1,4]
*/
function jxResample(data,newlen) {
  var oldlen = data.length;
  var newdata = new Array(newlen);
  newdata[0]=data[0];
  newdata[newlen-1]=data[oldlen-1];
  for (var i=1;i<newlen-1;i++) {
    var r = (i*(oldlen-1))/(newlen-1);
    var oi = Math.floor(r);
    var mix = r - oi;
    newdata[i]=(1.0-mix)*data[oi]+mix*data[oi+1];
  }
  return newdata;
}

/**
* @typedef {Object} jxResamplerOptions
* @property {number} ratio The resampling ratio (new/old)
*/

/** Create a resampling filter
* @example
* var myFilter = new jxResampler({ratio: 2.0});
*/
class jxResampler {
/**
* @param {jxResamplerOptions} config Configuration options
*/
  constructor (config) {
    this.ratio = config.ratio||2.0;
  }
/** Filter data
* @param {Array} data Data to resample
* @return {Array} Resampled data
*/
  step (data) {
    var res = [];
    for (var i=0;i<data.length;i++) {
      if (!isNaN(data[i])) res.push(data[i]);
    }
    if (res.length>0) { 
      res = jxResample(res,Math.round(this.ratio*res.length));
    }
    return res;
  }
}


/**
* @typedef {Object} jxSinefitOptions
* @property {number} fs Sample rate
* @property {number} n Size of sine fit array
* @property {number} maxiter Iteration limit (4 parameter fit)
* @property {number} tolerance Tolerance threshold (4 parameter fit)
* @property {("3"|"4")} parameters How many parameters to fit
*/

/**
* @typedef {Object} jxSinefitResult
* @property {number} w Angular frequency
* @property {number} p Phase in radians
* @property {number} a Amplitude
* @property {number} o Offset
* @property {number} e Fitting error
* @property {number} i Iterations used (for 4 parameter fit)
*/

/** Sine fit (IEEE Standard 1057 / 1241)
*/
class jxSinefit {
/** Create a sine fit
*
* This will fit a sine wave to the data. It's a time domain alternative to FFT analysis.
*
* @param {jxSinefitOptions} config Configuration options
*/
  constructor (config) {
    this.n = config.n;
    this.x = new Array(n);
    this.y = new Array(n);
    for (var i=0;i<n;i++) {
      this.x[i]=0;
      this.y[i]=0;
    }
    this.t = 0;
    this.dt = 1/config.fs;
    this.w = 0;
    this.p = 0;
    this.amplitude=0;
    this.offset=0;
    this.mse=0;
    this.iter=0;
    this.iteration_limit = config.maxiter||100;
    this.tolerance = config.tolerance||1.0e-5;
    this.parameters = config.parameters||3;
  }
  fmod (a,b) {
    return Number((a - (Math.floor(a / b) * b)).toPrecision(8));
  }
  sinefit4 () {
    var iter;
    var a=0, ab=0, abam=0, abbm=0, abt=0, abtam=0, abtbm=0, am=0;
    var at=0, ay=0, ayym=0, a2=0, a2am=0, a2am2=0, a11=0, a12=0, a21=0, a22=0;
    var b=0, bm=0, bt=0, bty=0, bt2=0, by=0, b2=0, b2bm=0, b2t=0, b2tbm=0, b2t2=0;
    var p=0, pp=0, r_error=0, s_error=0, w=0, ww=0, y=0, ym=0, y2=0;
    w = this.w; 
    p = this.p;
    this.w = 0;
    this.p = 0;
    this.amplitude = 0;
    this.offset = 0;
    this.mse = 0;
    this.iter = 0;
    for (iter=1;iter<=this.iteration_limit;iter++){
      a=0.0; b=0.0; y=0.0; ay=0.0; by=0.0; ab=0.0; a2=0.0; b2=0.0; bty=0.0;
      abt=0.0; b2t=0.0; b2t2=0.0, bt=0.0; at=0.0; bt2=0.0; y2=0;
      var tn, yn, an, bn, x;
      for (var i=0;i<this.n;i++){
        tn=this.x[i];
        yn=this.y[i];
        an=Math.cos((w*tn)+p);
        bn=Math.sin((w*tn)+p);
        a+=an;
        a2+=an*an;
        ay+=an*yn;
        at+=an*tn;
        b+=bn;
        x=bn*bn; b2+=x;
        x=x*tn; b2t+=x;
        b2t2+=x*tn;
        x=bn*yn; by+=x;
        bty+=x*tn;
        x=bn*tn; bt+=x;
        bt2+=x*tn;
        x=an*bn; ab+=x;
        abt+=x*tn;
        y+=yn;
        y2+=yn*yn;
      }
      am=a/this.n; 
      bm=b/this.n; 
      ym=y/this.n;
      abtam=abt-(bt*am);
      abtbm=abt-(at*bm);
      a2am=a2-(a*am);
      if (fabs(a2am)<1e-15) a2am=1e-15;
      a2am2=a2am*a2am;
      abbm=ab-(a*bm);
      b2tbm=b2t-(bt*bm);
      abam=ab-(b*am);
      b2bm=b2-(b*bm);
      ayym=ay-(a*ym);
      if (fabs(ayym)<1e-15) ayym=1e-15;
      a11=((abtam*abtbm)-(a2am*(b2t2-(bt2*bm))))/a2am2;
      a12=((abtam*abbm)-(a2am*b2tbm))/a2am2;
      a21=((abam*abtbm)-(a2am*b2tbm))/a2am2;
      a22=((abam*abbm)-(a2am*b2bm))/a2am2;
      r_error=((bty-(bt*ym))/ayym)-(abtam/a2am);
      s_error=((by-(b*ym))/ayym)-(abam/a2am);
      x=(a11*a22)-(a12*a21);
      ww=fabs(w+(((a22*r_error)-(a12*s_error))/x));
      // clamp to regin
      var reg = 0.1;
      if (ww>(1+reg)*w) ww=(1+reg)*w;
      if (ww<(1-reg)*w) ww=(1-reg)*w;
      pp=p+(((a11*s_error)-(a21*r_error))/x);
      if ((fabs(w-ww)<(this.tolerance*Math.abs(w))) && (Math.abs(p-pp)<(this.tolerance*Math.PI))) {
        break;
      }
      w=ww;
      p=this.fmod(pp,2*Math.PI);
    }
    if (w>0){
      var tn, yn, an, bn;
      var atop=0, abot=0;
      var ymin=this.y[0];
      var ymax=this.y[0];
      for (var i=0;i<this.n;i++) {
        tn=this.x[i];
        yn=this.y[i];
        if (ymin>yn) ymin=yn;
        if (ymax<yn) ymax=yn;
        an=Math.cos((w*tn)+p);
        bn=Math.sin((w*tn)+p);
        atop+=(yn-ym)*(an+bn+(bn*tn));
        abot+=(an-am)*(an+bn+(bn*tn));
      }
      var amp=Math.abs(atop/abot);
      var c=ym-(amp*am);
      if (amp<1.1*(ymax-ymin)&&c>ymin&&c<ymax) {
        this.w=w;
        this.p=p;
        this.amplitude=amp;
        this.offset=c;
        this.mse=((y2+(amp*amp*a2)-(2*amp*y))/this.n)+(c*c)-(2*c*ym)+(2*amp*c*am);
      }
    }
    this.iter=iter;
  }
  sinefit3 () {
    var ym=0, bm=0, am=0;
    var sy=0,sa=0,sb=0,sab=0,saa=0,sbb=0,sya=0,syb=0,syy=0;
    for (var i=0;i<this.n;i++) {
      var tn=this.x[i];
      var an = Math.cos(w*tn);
      var bn = Math.sin(w*tn);
      var yn=this.y[i];
      sy+=yn; sa+=an; sb+=bn; sab+=an*bn; saa+=an*an;
      sbb+=bn*bn; sya+=yn*an; syb+=yn*bn; syy+=yn*yn;
    }
    am=sa/this.n; bm=sb/this.n; ym=sy/this.n;
    var a_nom = (sya-ym*sa)/(sab-bm*sa) - (syb - ym*sb)/(sbb-bm*sb);
    var a_denom = (saa-am*sa)/(sab-bm*sa) - (sab - am*sb)/(sbb-bm*sb);
//  if (fabs(a_denom)<1e-15) a_denom=1e-15;
    var a1 = a_nom/a_denom;
    var b_nom = (sya - ym*sa)/(saa-am*sa) - (syb - ym*sb)/(sab - am*sb);
    var b_denom = (sab - bm * sa)/(saa - am*sa) - (sbb-bm*sb)/(sab-am*sb);
//  if (fabs(b_denom)<1e-15) b_denom=1e-15;
    var b1 = b_nom/b_denom;
    var c = ym - a1*am - b1*bm;
    var erms = Math.sqrt((syy + a1*a1*saa + b1*b1*sbb + this.n*c*c
        - 2*a1*sya - 2*b1*syb - 2*c*sy
        + 2*a1*b1*sab + 2*a1*c*sa + 2*b1*c*sb)/this.n);
    this.w = w;
    this.p = Math.atan2(-b1,a1);
    this.amplitude = Math.sqrt(a1*a1+b1*b1);
    this.offset = c;
    this.mse = (this.amplitude==0?erms:erms/this.amplitude);
  }
/** Process a chunk of data
*  @param {Array} data Data to fit
*  @return {jxSinefitResult} Fitted parameters
*/ 
  step (data) {
    for (var i=0;i<data.length;i++) {
      this.t+=this.dt;
      this.x.shift(); 
      this.x.push(this.t);
      this.y.shift(); 
      this.y.push(y[i]); 
    }
    if (this.parameters+''=="3") 
      this.sinefit3(); 
    else 
      this.sinefit4();
    return { 
      w: this.w,
      p: this.p,
      a: this.amplitude,
      o: this.offset,
      e: this.mse,
      i: this.iter
    }
  }
}


function jxTableMergeDeep(t1,t2) {
  for (const [key, value] of Object.entries(t2)) { t1[key]=value; }
}

function jxTableMergeShallow(t1,t2) { Object.assign(t1,t2); }


class jxWebSerialPort {
  constructor (p,cfg) {
    this.port = p;
    this.done = false;
    this.decoder = new TextDecoderStream();
    this.encoder = new TextEncoder();
    this.reader = null;
    this.writer = null;
    this.buffer ="";
    this.configuration = jxMerge({
      "baudRate": 9600,
      "bufferSize": 255,
      "dataBits": 8,
      "flowControl": "none",
      "parity": "none",
      "stopBits": 1,
      "callback": function (str) { console.log(str); }
    },cfg);
  }
  connect () {
    var that = this;
    return this.port.open(this.configuration).then( function () {
      that.port.readable.pipeTo(that.decoder.writable);
      const inputStream = that.decoder.readable;
      that.reader = inputStream.getReader();
      that.writer = that.port.writable.getWriter();
      let readLoop = function () {
        that.reader.read().then ( function (data) {
          var str = data.value;
          for (var i=0;i<str.length;i++) {
            if (str[i]=='\n') {
              that.configuration["callback"](that.buffer);
              that.buffer="";
            } else {
              if (str[i]>=' ') that.buffer+=str[i];
            }
          }
          if (!data.done) readLoop();
        }, function (error) { console.log(error); });
      };
      readLoop();
    }, function (error) { console.error(error); });
  }
  disconnect () {
    this.port.forget();
  }
  send (data) {
    var that = this;
    this.writer.write(this.encoder.encode(data));
  }
}

class jxWebSerial {
  constructor (cfg) {
    var port = null;
    var configuration = cfg||{};
  }
  requestPort () {
    var that = this;
    return navigator.serial.requestPort().then(
      function (port) {
        that.port = new jxWebSerialPort(port,that.configuration); 
        that.port.connect();
      },
      function (error) { console.error(error); });
  }
}


class jxWebUSBSerialPort {
  constructor (dev,cfg) {
    this.device_ = dev;
    this.interfaceNumber = 0;
    this.endpointIn = 0;
    this.endpointOut = 0;
    this.decoder = new TextDecoder();
    this.encoder = new TextEncoder();
    this.reader = null;
    this.writer = null;
    this.buffer ="";
    this.configuration = jxMerge({
      "callback": function (str) { console.log(str); }
    },cfg);
  }
  connect () {
    var that = this;
    let readLoop = () => {
      this.device_.transferIn(this.endpointIn, 64).then(result => {
        //that.configuration["callback"](that.decoder.decode(result.data));
        var str = that.decoder.decode(result.data);
        for (var i=0;i<str.length;i++) {
          if (str[i]=='\n') {
            that.configuration["callback"](that.buffer);
            that.buffer="";
          } else {
            if (str[i]>=' ') that.buffer+=str[i];
          }
        }
        if (!result.done) readLoop();
      }, error => {
        console.error(error);
      });
    };
    return this.device_.open()
        .then(() => {
          if (that.device_.configuration === null) {
            return that.device_.selectConfiguration(1);
          }
        })
        .then(() => {
          var interfaces = that.device_.configuration.interfaces;
          interfaces.forEach(element => {
            element.alternates.forEach(elementalt => {
              if (elementalt.interfaceClass==0xFF) {
                that.interfaceNumber = element.interfaceNumber;
                elementalt.endpoints.forEach(elementendpoint => {
                  if (elementendpoint.direction == "out") {
                    that.endpointOut = elementendpoint.endpointNumber;
                  }
                  if (elementendpoint.direction=="in") {
                    that.endpointIn =elementendpoint.endpointNumber;
                  }
                })
              }
            })
          })
        })
        .then(() => that.device_.claimInterface(that.interfaceNumber))
        .then(() => that.device_.selectAlternateInterface(that.interfaceNumber, 0))
        .then(() => that.device_.controlTransferOut(
         {
            'requestType': 'class',
            'recipient': 'interface',
            'request': 0x22,
            'value': 0x01,
            'index': that.interfaceNumber
         }))
        .then(() => {
          readLoop();
        });
  }
  disconnect () {
    var that = this;
    return this.device_.controlTransferOut({
       'requestType': 'class',
       'recipient': 'interface',
       'request': 0x22,
       'value': 0x00,
       'index': this.interfaceNumber})
     .then(() => that.device_.close());
  }
  send (data) {
    return this.device_.transferOut(this.endpointOut, this.encoder.encode(data));
  }
}

class jxWebUSBSerial {
  constructor (cfg) {
    this.device = null;
    this.configuration = cfg||{};
  }
  requestPort () {
    var that = this;
    const filters = [
      { 'vendorId': 0x2886 }, // Seeed Technology
    ];
    return navigator.usb.requestDevice({ 'filters': filters }).then(
      function (device) {
        that.device = new jxWebUSBSerialPort(device,that.configuration);
        that.device.connect();
      },
      function (error) { console.error(error); }
    );
  }
}


class jxAUTO {
  constructor (prefix, config) {
    this.prefix = prefix;
  }
  step(state) {
    var y = state['eeg2HYP'];
    var uc = state[this.prefix + 'AUTOSetpoint'];
    var r = state[ this.prefix + 'TCIPRate'];
    var w = state['weight'];
    var c = state[this.prefix + 'Concentration'];
    if (state[this.prefix+'Mode']=='AUTO'&&y&&uc) {
      if (y&&uc) {
        state[this.prefix + 'TCIPSetpoint'] += -0.00025 * (uc - y);
      }
      // bumpless transfer
      state[this.prefix + 'TCIESetpoint'] = state[this.prefix + 'TCIPSetpoint'];
      state[this.prefix + 'TIVASetpoint'] = Math.round(( r * 1000.0 * c) / (60.0 * w));
    }
    state[this.prefix + 'AUTORate'] = r;
  }
}


function jxWeightFromAge (age, gender) {
  var f,m;
  var i = 0;
  var awFemale = [[0,3.4],[0.5,3.8],[1,4.2],[1.5,4.5],[2,4.9],[2.5,5.2],[3,5.5],[3.5,5.9],[4,6.1],
    [4.5,6.4],[5,6.7],[5.5,7.0],[6,7.2],[6.5,7.5],[7,7.7],[7.5,7.9],[8,8.1],
    [8.5,8.3],[9,8.5],[9.5,8.7],[10,8.9],[10.5,9.0],[11,9.2],[11.5,9.4],[12,9.5],
    [12.5,9.7],[13,9.8],[13.5,9.9],[14,10.1],[14.5,10.2],[15,10.3],[15.5,10.4],[16,10.6],
    [16.5,10.7],[17,10.8],[17.5,10.9],[18,11.0],[18.5,11.1],[19,11.2],[19.5,11.3],[20,11.4],
    [20.5,11.5],[21,11.6],[21.5,11.6],[22,11.7],[22.5,11.8],[23,11.9],[23.5,12.0],[24,12.1],
    [24.5,12.1],[25,12.2],[25.5,12.3],[26,12.4],[26.5,12.4],[27,12.5],[27.5,12.6],[28,12.7],
    [28.5,12.7],[29,12.8],[29.5,12.9],[30,13.0],[30.5,13.0],[31,13.1],[31.5,13.2],[32,13.3],
    [32.5,13.3],[33,13.4],[33.5,13.5],[34,13.6],[34.5,13.6],[35,13.7],[35.5,13.8],[36,13.9],
    [36.5,13.9],[37,14.0],[37.5,14.1],[38,14.2],[38.5,14.2],[39,14.3],[39.5,14.4],[40,14.5],
    [40.5,14.6],[41,14.6],[41.5,14.7],[42,14.8],[42.5,14.9],[43,15.0],[43.5,15.0],[44,15.1],
    [44.5,15.2],[45,15.3],[45.5,15.4],[46,15.5],[46.5,15.5],[47,15.6],[47.5,15.7],[48,15.8],
    [48.5,15.9],[49,16.0],[49.5,16.0],[50,16.1],[50.5,16.2],[51,16.3],[51.5,16.4],[52,16.5],
    [52.5,16.6],[53,16.7],[53.5,16.7],[54,16.8],[54.5,16.9],[55,17.0],[55.5,17.1],[56,17.2],
    [56.5,17.3],[57,17.4],[57.5,17.5],[58,17.6],[58.5,17.7],[59,17.7],[59.5,17.8],[60,17.9],
    [60.5,18.0],[61,18.1],[61.5,18.2],[62,18.3],[62.5,18.4],[63,18.5],[63.5,18.6],[64,18.7],
    [64.5,18.8],[65,18.9],[65.5,19.0],[66,19.1],[66.5,19.2],[67,19.3],[67.5,19.4],[68,19.4],
    [68.5,19.5],[69,19.6],[69.5,19.7],[70,19.8],[70.5,19.9],[71,20.0],[71.5,20.1],[72,20.2],
    [72.5,20.3],[73,20.4],[73.5,20.5],[74,20.6],[74.5,20.7],[75,20.8],[75.5,20.9],[76,21.0],
    [76.5,21.2],[77,21.3],[77.5,21.4],[78,21.5],[78.5,21.6],[79,21.7],[79.5,21.8],[80,21.9],
    [80.5,22.0],[81,22.1],[81.5,22.2],[82,22.3],[82.5,22.4],[83,22.5],[83.5,22.6],[84,22.8],
    [84.5,22.9],[85,23.0],[85.5,23.1],[86,23.2],[86.5,23.3],[87,23.4],[87.5,23.6],[88,23.7],
    [88.5,23.8],[89,23.9],[89.5,24.0],[90,24.1],[90.5,24.3],[91,24.4],[91.5,24.5],[92,24.6],
    [92.5,24.7],[93,24.9],[93.5,25.0],[94,25.1],[94.5,25.2],[95,25.4],[95.5,25.5],[96,25.6],
    [96.5,25.8],[97,25.9],[97.5,26.0],[98,26.2],[98.5,26.3],[99,26.4],[99.5,26.6],[100,26.7],
    [100.5,26.8],[101,27.0],[101.5,27.1],[102,27.2],[102.5,27.4],[103,27.5],[103.5,27.7],[104,27.8],
    [104.5,28.0],[105,28.1],[105.5,28.2],[106,28.4],[106.5,28.5],[107,28.7],[107.5,28.8],[108,29.0],
    [108.5,29.1],[109,29.3],[109.5,29.4],[110,29.6],[110.5,29.8],[111,29.9],[111.5,30.1],[112,30.2],
    [112.5,30.4],[113,30.6],[113.5,30.7],[114,30.9],[114.5,31.0],[115,31.2],[115.5,31.4],[116,31.5],
    [116.5,31.7],[117,31.9],[117.5,32.0],[118,32.2],[118.5,32.4],[119,32.5],[119.5,32.7],[120,32.9],
    [120.5,33.1],[121,33.2],[121.5,33.4],[122,33.6],[122.5,33.8],[123,33.9],[123.5,34.1],[124,34.3],
    [124.5,34.5],[125,34.7],[125.5,34.8],[126,35.0],[126.5,35.2],[127,35.4],[127.5,35.6],[128,35.7],
    [128.5,35.9],[129,36.1],[129.5,36.3],[130,36.5],[130.5,36.7],[131,36.8],[131.5,37.0],[132,37.2],
    [132.5,37.4],[133,37.6],[133.5,37.8],[134,37.9],[134.5,38.1],[135,38.3],[135.5,38.5],[136,38.7],
    [136.5,38.9],[137,39.1],[137.5,39.2],[138,39.4],[138.5,39.6],[139,39.8],[139.5,40.0],[140,40.2],
    [140.5,40.4],[141,40.5],[141.5,40.7],[142,40.9],[142.5,41.1],[143,41.3],[143.5,41.5],[144,41.6],
    [144.5,41.8],[145,42.0],[145.5,42.2],[146,42.4],[146.5,42.6],[147,42.7],[147.5,42.9],[148,43.1],
    [148.5,43.3],[149,43.4],[149.5,43.6],[150,43.8],[150.5,44.0],[151,44.1],[151.5,44.3],[152,44.5],
    [152.5,44.7],[153,44.8],[153.5,45.0],[154,45.2],[154.5,45.3],[155,45.5],[155.5,45.7],[156,45.8],
    [156.5,46.0],[157,46.1],[157.5,46.3],[158,46.5],[158.5,46.6],[159,46.8],[159.5,46.9],[160,47.1],
    [160.5,47.2],[161,47.4],[161.5,47.5],[162,47.7],[162.5,47.8],[163,48.0],[163.5,48.1],[164,48.3],
    [164.5,48.4],[165,48.6],[165.5,48.7],[166,48.8],[166.5,49.0],[167,49.1],[167.5,49.2],[168,49.4],
    [168.5,49.5],[169,49.6],[169.5,49.7],[170,49.9],[170.5,50.0],[171,50.1],[171.5,50.2],[172,50.4],
    [172.5,50.5],[173,50.6],[173.5,50.7],[174,50.8],[174.5,50.9],[175,51.0],[175.5,51.1],[176,51.2],
    [176.5,51.4],[177,51.5],[177.5,51.6],[178,51.7],[178.5,51.8],[179,51.9],[179.5,51.9],[180,52.0],
    [180.5,52.1],[181,52.2],[181.5,52.3],[182,52.4],[182.5,52.5],[183,52.6],[183.5,52.7],[184,52.7],
    [184.5,52.8],[185,52.9],[185.5,53.0],[186,53.1],[186.5,53.1],[187,53.2],[187.5,53.3],[188,53.4],
    [188.5,53.4],[189,53.5],[189.5,53.6],[190,53.6],[190.5,53.7],[191,53.8],[191.5,53.8],[192,53.9],
    [192.5,53.9],[193,54.0],[193.5,54.1],[194,54.1],[194.5,54.2],[195,54.2],[195.5,54.3],[196,54.3],
    [196.5,54.4],[197,54.5],[197.5,54.5],[198,54.6],[198.5,54.6],[199,54.7],[199.5,54.7],[200,54.8],
    [200.5,54.8],[201,54.9],[201.5,54.9],[202,55.0],[202.5,55.0],[203,55.0],[203.5,55.1],[204,55.1],
    [204.5,55.2],[205,55.2],[205.5,55.3],[206,55.3],[206.5,55.4],[207,55.4],[207.5,55.4],[208,55.5],
    [208.5,55.5],[209,55.6],[209.5,55.6],[210,55.7],[210.5,55.7],[211,55.7],[211.5,55.8],[212,55.8],
    [212.5,55.9],[213,55.9],[213.5,56.0],[214,56.0],[214.5,56.1],[215,56.1],[215.5,56.1],[216,56.2],
    [216.5,56.2],[217,56.3],[217.5,56.3],[218,56.4],[218.5,56.4],[219,56.5],[219.5,56.5],[220,56.5],
    [220.5,56.6],[221,56.6],[221.5,56.7],[222,56.7],[222.5,56.8],[223,56.8],[223.5,56.9],[224,56.9],
    [224.5,57.0],[225,57.0],[225.5,57.1],[226,57.1],[226.5,57.2],[227,57.2],[227.5,57.3],[228,57.3],
    [228.5,57.4],[229,57.4],[229.5,57.4],[230,57.5],[230.5,57.5],[231,57.6],[231.5,57.6],[232,57.7],
    [232.5,57.7],[233,57.8],[233.5,57.8],[234,57.8],[234.5,57.9],[235,57.9],[235.5,58.0],[236,58.0],
    [236.5,58.0],[237,58.1],[237.5,58.1],[238,58.1],[238.5,58.2],[239,58.2],[239.5,58.2],[240,58.2],
    [240.5,58.2]];
  var awMale = [[0,3.5],[0.5,4.0],[1,4.4],[1.5,4.9],[2,5.3],[2.5,5.7],[3,6.0],[3.5,6.4],[4,6.7],
    [4.5,7.0],[5,7.3],[5.5,7.6],[6,7.9],[6.5,8.2],[7,8.4],[7.5,8.6],[8,8.9],
    [8.5,9.1],[9,9.3],[9.5,9.5],[10,9.7],[10.5,9.8],[11,10.0],[11.5,10.2],[12,10.3],
    [12.5,10.5],[13,10.6],[13.5,10.7],[14,10.9],[14.5,11.0],[15,11.1],[15.5,11.2],[16,11.3],
    [16.5,11.4],[17,11.5],[17.5,11.6],[18,11.7],[18.5,11.8],[19,11.9],[19.5,12.0],[20,12.1],
    [20.5,12.1],[21,12.2],[21.5,12.3],[22,12.4],[22.5,12.5],[23,12.5],[23.5,12.6],[24,12.7],
    [24.5,12.7],[25,12.8],[25.5,12.9],[26,12.9],[26.5,13.0],[27,13.1],[27.5,13.2],[28,13.2],
    [28.5,13.3],[29,13.4],[29.5,13.4],[30,13.5],[30.5,13.6],[31,13.6],[31.5,13.7],[32,13.8],
    [32.5,13.8],[33,13.9],[33.5,14.0],[34,14.0],[34.5,14.1],[35,14.2],[35.5,14.3],[36,14.3],
    [36.5,14.4],[37,14.5],[37.5,14.5],[38,14.6],[38.5,14.7],[39,14.8],[39.5,14.9],[40,14.9],
    [40.5,15.0],[41,15.1],[41.5,15.2],[42,15.2],[42.5,15.3],[43,15.4],[43.5,15.5],[44,15.6],
    [44.5,15.6],[45,15.7],[45.5,15.8],[46,15.9],[46.5,16.0],[47,16.1],[47.5,16.1],[48,16.2],
    [48.5,16.3],[49,16.4],[49.5,16.5],[50,16.6],[50.5,16.7],[51,16.8],[51.5,16.8],[52,16.9],
    [52.5,17.0],[53,17.1],[53.5,17.2],[54,17.3],[54.5,17.4],[55,17.5],[55.5,17.6],[56,17.7],
    [56.5,17.7],[57,17.8],[57.5,17.9],[58,18.0],[58.5,18.1],[59,18.2],[59.5,18.3],[60,18.4],
    [60.5,18.5],[61,18.6],[61.5,18.7],[62,18.8],[62.5,18.9],[63,19.0],[63.5,19.1],[64,19.1],
    [64.5,19.2],[65,19.3],[65.5,19.4],[66,19.5],[66.5,19.6],[67,19.7],[67.5,19.8],[68,19.9],
    [68.5,20.0],[69,20.1],[69.5,20.2],[70,20.3],[70.5,20.4],[71,20.5],[71.5,20.6],[72,20.7],
    [72.5,20.8],[73,20.9],[73.5,21.0],[74,21.1],[74.5,21.2],[75,21.3],[75.5,21.4],[76,21.5],
    [76.5,21.6],[77,21.7],[77.5,21.8],[78,21.9],[78.5,22.0],[79,22.1],[79.5,22.2],[80,22.3],
    [80.5,22.4],[81,22.5],[81.5,22.6],[82,22.7],[82.5,22.8],[83,22.9],[83.5,23.0],[84,23.1],
    [84.5,23.2],[85,23.3],[85.5,23.4],[86,23.5],[86.5,23.6],[87,23.7],[87.5,23.8],[88,23.9],
    [88.5,24.0],[89,24.1],[89.5,24.2],[90,24.3],[90.5,24.4],[91,24.5],[91.5,24.6],[92,24.8],
    [92.5,24.9],[93,25.0],[93.5,25.1],[94,25.2],[94.5,25.3],[95,25.4],[95.5,25.5],[96,25.6],
    [96.5,25.8],[97,25.9],[97.5,26.0],[98,26.1],[98.5,26.2],[99,26.3],[99.5,26.4],[100,26.6],
    [100.5,26.7],[101,26.8],[101.5,26.9],[102,27.0],[102.5,27.2],[103,27.3],[103.5,27.4],[104,27.5],
    [104.5,27.7],[105,27.8],[105.5,27.9],[106,28.0],[106.5,28.2],[107,28.3],[107.5,28.4],[108,28.6],
    [108.5,28.7],[109,28.8],[109.5,28.9],[110,29.1],[110.5,29.2],[111,29.3],[111.5,29.5],[112,29.6],
    [112.5,29.8],[113,29.9],[113.5,30.0],[114,30.2],[114.5,30.3],[115,30.5],[115.5,30.6],[116,30.7],
    [116.5,30.9],[117,31.0],[117.5,31.2],[118,31.3],[118.5,31.5],[119,31.6],[119.5,31.8],[120,31.9],
    [120.5,32.1],[121,32.2],[121.5,32.4],[122,32.6],[122.5,32.7],[123,32.9],[123.5,33.0],[124,33.2],
    [124.5,33.3],[125,33.5],[125.5,33.7],[126,33.8],[126.5,34.0],[127,34.2],[127.5,34.3],[128,34.5],
    [128.5,34.7],[129,34.8],[129.5,35.0],[130,35.2],[130.5,35.4],[131,35.5],[131.5,35.7],[132,35.9],
    [132.5,36.1],[133,36.3],[133.5,36.4],[134,36.6],[134.5,36.8],[135,37.0],[135.5,37.2],[136,37.4],
    [136.5,37.5],[137,37.7],[137.5,37.9],[138,38.1],[138.5,38.3],[139,38.5],[139.5,38.7],[140,38.9],
    [140.5,39.1],[141,39.3],[141.5,39.5],[142,39.7],[142.5,39.9],[143,40.1],[143.5,40.3],[144,40.5],
    [144.5,40.7],[145,40.9],[145.5,41.1],[146,41.3],[146.5,41.5],[147,41.7],[147.5,41.9],[148,42.1],
    [148.5,42.3],[149,42.5],[149.5,42.8],[150,43.0],[150.5,43.2],[151,43.4],[151.5,43.6],[152,43.8],
    [152.5,44.1],[153,44.3],[153.5,44.5],[154,44.7],[154.5,44.9],[155,45.1],[155.5,45.4],[156,45.6],
    [156.5,45.8],[157,46.0],[157.5,46.3],[158,46.5],[158.5,46.7],[159,46.9],[159.5,47.2],[160,47.4],
    [160.5,47.6],[161,47.8],[161.5,48.1],[162,48.3],[162.5,48.5],[163,48.7],[163.5,49.0],[164,49.2],
    [164.5,49.4],[165,49.6],[165.5,49.9],[166,50.1],[166.5,50.3],[167,50.6],[167.5,50.8],[168,51.0],
    [168.5,51.2],[169,51.5],[169.5,51.7],[170,51.9],[170.5,52.1],[171,52.4],[171.5,52.6],[172,52.8],
    [172.5,53.0],[173,53.2],[173.5,53.5],[174,53.7],[174.5,53.9],[175,54.1],[175.5,54.4],[176,54.6],
    [176.5,54.8],[177,55.0],[177.5,55.2],[178,55.4],[178.5,55.6],[179,55.9],[179.5,56.1],[180,56.3],
    [180.5,56.5],[181,56.7],[181.5,56.9],[182,57.1],[182.5,57.3],[183,57.5],[183.5,57.7],[184,57.9],
    [184.5,58.1],[185,58.3],[185.5,58.5],[186,58.7],[186.5,58.9],[187,59.1],[187.5,59.3],[188,59.5],
    [188.5,59.7],[189,59.8],[189.5,60.0],[190,60.2],[190.5,60.4],[191,60.6],[191.5,60.7],[192,60.9],
    [192.5,61.1],[193,61.3],[193.5,61.4],[194,61.6],[194.5,61.8],[195,61.9],[195.5,62.1],[196,62.3],
    [196.5,62.4],[197,62.6],[197.5,62.7],[198,62.9],[198.5,63.0],[199,63.2],[199.5,63.3],[200,63.5],
    [200.5,63.6],[201,63.8],[201.5,63.9],[202,64.0],[202.5,64.2],[203,64.3],[203.5,64.4],[204,64.6],
    [204.5,64.7],[205,64.8],[205.5,65.0],[206,65.1],[206.5,65.2],[207,65.3],[207.5,65.4],[208,65.6],
    [208.5,65.7],[209,65.8],[209.5,65.9],[210,66.0],[210.5,66.1],[211,66.2],[211.5,66.3],[212,66.4],
    [212.5,66.5],[213,66.6],[213.5,66.7],[214,66.8],[214.5,66.9],[215,67.0],[215.5,67.1],[216,67.2],
    [216.5,67.3],[217,67.4],[217.5,67.5],[218,67.6],[218.5,67.6],[219,67.7],[219.5,67.8],[220,67.9],
    [220.5,68.0],[221,68.1],[221.5,68.1],[222,68.2],[222.5,68.3],[223,68.4],[223.5,68.5],[224,68.5],
    [224.5,68.6],[225,68.7],[225.5,68.8],[226,68.8],[226.5,68.9],[227,69.0],[227.5,69.1],[228,69.1],
    [228.5,69.2],[229,69.3],[229.5,69.3],[230,69.4],[230.5,69.5],[231,69.5],[231.5,69.6],[232,69.7],
    [232.5,69.7],[233,69.8],[233.5,69.9],[234,69.9],[234.5,70.0],[235,70.1],[235.5,70.1],[236,70.2],
    [236.5,70.2],[237,70.3],[237.5,70.4],[238,70.4],[238.5,70.5],[239,70.5],[239.5,70.6],[240,70.6],
    [240.5,70.6]];
  while (i<awFemale.length&&awFemale[i][0]<12*age) { f = awFemale[i][1]; i++; }
  m = awMale[i-1][1];
  res = 0.5*(m+f);
  if (gender&&gender.toUpperCase()=="MALE") res = m;
    else if (gender&&gender.toUpperCase()=="FEMALE") res = f;
  return Math.round(res);
}

function jxHeightFromAge (age) {
  return Math.round(2.54*(age>15?67:Math.max(10,2.5384614*age+28.923077)));
}
  

class jxBolus {
  constructor (prefix, config) {
     this.prefix = prefix;
     this.dt_s = config[prefix+'Timestep']||1.0;
     this.bolusOn = false;
     this.bolusRemaining_ml = 0;
     this.bolusRate_mlperh = 0;
  }
  step(state) {
    var newrate_mlperh = 0;
    var currate_mlperh = state[this.prefix + 'Rate']||0.0;
    var delta_ml =  currate_mlperh * this.dt_s/3600.0;
    if (this.bolusOn) {
      // already bolusing
      this.bolusRemaining_ml-=delta_ml;
      if (this.bolusRemaining_ml<=0||!state[this.prefix + 'BolusOn']) {
        newrate_mlperh = 0;
        this.bolusOn=false;
        this.bolusRemaining_ml=0;
      } else {
        newrate_mlperh = this.bolusRate_mlperh;
      }
    } else if (state[this.prefix + 'BolusOn']) {
      // new bolus
      this.bolusOn = true;
      var conc_mgperml = state[this.prefix + 'Concentration'];
      var bolusDose_mgperkg = state[this.prefix + 'BolusDose'];
      var weight_kg = state['weight'];
      this.bolusRemaining_ml = bolusDose_mgperkg * weight_kg / conc_mgperml;

      //this.bolusRate_mlperh = this.bolusRemaining_ml * 60.0;
      // attempt to deliver in 1s
      this.bolusRate_mlperh = this.bolusRemaining_ml * 60.0;
      var ns = 1; while (this.bolusRate_mlperh/ns>600) { ns++; }
      this.bolusRate_mlperh = Math.round(this.bolusRate_mlperh/ns);
      console.log('bolus ' + this.bolusRemaining_ml + 'ml @ ' + 
         this.bolusRate_mlperh + 'ml/h for ' + ns + 's');
      newrate_mlperh = this.bolusRate_mlperh;
    }
    state[this.prefix + 'BolusOn']=this.bolusOn;
    state[this.prefix + 'BolusRate']=newrate_mlperh;
  }
}


class jxCO2Simulator {
  constructor (prefix,config) {
    this.prefix = prefix;
    this.srate = config[prefix + 'Srate']||64.0;
    this.dt = 1.0 / this.srate;
    this.p=0;
    this.prv_t=-1;
    this.co2 = 0;
  }
  step (state) {
    var amp = state['etco2']||40.0;
    var cur_t = state['elapsed'];
    if (this.prv_t>=0&&cur_t<this.prv_t) this.prv_t = cur_t;
    var dp = 0.5*2*Math.PI*(state['rr']||17.0)*this.dt/60.0;
    var a = state[this.prefix+'Alpha']||0.1;
    var co2 = [];
    var prv_t = this.prv_t;
    if (prv_t==-1) prv_t=cur_t;
    while (prv_t<cur_t) {
      this.p+=dp;
      var tmp = Math.sin(this.p);
      if (tmp>0) { 
        this.co2 = 0.75*a + (1.0-a)*this.co2;
      } else {
        this.co2 = -0.75*a + (1.0-a)*this.co2;
      }
      co2.push(this.co2);
      prv_t = prv_t+this.dt;
    }
    this.prv_t=prv_t;
    state[this.prefix+'Waveform']=co2;
  }
}


function jxDSETest() {
 var rules = [
  {
     "name": "tachycardia",
     "condition": 
       function(hr) {
         return hr>=200;
       }
     ,
     "consequence": 
       function(name) {
         this.tachycardia = "yes";
         if (this.events.indexOf('tachycardia')<0) {
           this.events+='tachycardia '
         }
       }
   },
   {
     "name": "hypertension",
     "condition": 
       function(bp) {
         return bp>=200;
       }
     ,
     "consequence": 
       function(name) {
         this.hypertension = "yes";
         if (this.events.indexOf('hypertension')<0) {
           this.events+='hypertension '
         }
       }
   },
   {
     "name": "nociception",
     "condition": 
       function(events) {
         return events && events.indexOf('hypertension')>=0 &&
                          events.indexOf('tachycardia')>=0;
       }
     ,
     "consequence": 
       function(name) {
         this.nociception="yes";
         if (this.events.indexOf('nociception')<0) {
           this.events+='nociception '
         }
         if (this.alarms.indexOf('nociception')<0) {
           this.alarms+='nociception '
         }
       }
   }
 ];
   var testA =  {
    "name": "A",
    "hr": 50,
    "bp": "200",
    "events": "",
    "alarms": ""
  };
  var testB =  {
    "name": "B",
    "hr": 200,
    "bp": "200",
    "events": "",
    "alarms": ""
  };
  var j = new jxDSE(rules);
  var result = j.execute(testA);
  console.log(result.name + ":" + JSON.stringify(result));
  var result = j.execute(testB);
  console.log(result.name + ":" + JSON.stringify(result));
}

/** Forward chaining Decision Support Engine (DSE)
* 
* This is a forward chaining inference engine used for implementing desicion support logic
*
*/ 
class jxDSE {
/** Create a DSE engine
* @param {Object} rules The DSE rules
* @example
* var dse = new jxDSE([
*  {
*     "name": "tachycardia",
*     "condition":
*       function(hr) {
*         return hr>=200;
*       },
*     "consequence":
*       function() {
*         this.tachycardia = true;
*         if (this.alarms.indexOf('tachycardia')<0) {
*           this.alarms+='tachycardia '
*         }
*     }
*  },
* ]);
*  console.log(JSON.stringify(dse.step({hr: 60, alarms: ""})));
*  console.log(JSON.stringify(dse.step({hr: 210, alarms: ""})));
*/
  constructor (rules) {
    this.rules = rules;
  }
  clone (obj) { 
    return Object.assign({},obj); 
  } 
  flatten (obj) {
    return obj.flat(Infinity);
  }
  paramNames (f) {
    var m = /function[^\(]*\(([^\)]*)\)/.exec(f.toString());
    if (!m) throw new TypeError("Invalid functions");
    var params = [];
    m[1].split(',').forEach(function (p) {
      params.push(p.replace(/^\s*|\s*$/g, ''));
    });
    return params;
  }
  paramsToArguments (obj, params) {
    var args = [];
    params.forEach(function (p) {
      args.push(obj[p]);
    });
    return args;
  }
  isEqual(object1, object2) {
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);
    if (keys1.length !== keys2.length) {
      return false;
    }
    for (let key of keys1) {
      if (object1[key] !== object2[key]) {
        return false;
      }
    }
    return true;
  }
/** Run decision support engine on state
*
* Note that this runs recursively until all rules have fired. Any rules that repeatedly change the state will result in an infinte loop.
*
* @param {Object} state The current DSE state
* @return {Object} New state updated based on the DSE rules
*/
  step (state) {
    var self = this, session = this.clone(state), last_session = this.clone(state), goal = false;
    while (!goal) {
      var changes = false;
      for (var x=0; x < this.rules.length; x++) {
        var rule = this.rules[x], outcome;
        this.flatten([rule.condition]).forEach(function (cnd) {
          cnd.__args = cnd.__args || self.paramNames(cnd); 
          if (outcome) {
            outcome = outcome && cnd.apply({}, self.paramsToArguments(session, cnd.__args)); 
          } else {
            outcome = cnd.apply({}, self.paramsToArguments(session, cnd.__args));
          }
        });
        if (outcome) {
          this.flatten([rule.consequence]).forEach(function (csq) {
            csq.__args = csq.__args || self.paramNames(csq); 
            csq.apply(session, self.paramsToArguments(state, csq.__args));
            if (!self.isEqual(last_session,session)) {
              changes = true;
              last_session = self.clone(session);
            } 
          });
        }
        if(changes) break;
      }
      if (!changes) goal = true;
    }
    return session;
  }
}


class jxECGSimulator {
  constructor (prefix,config) {
    this.prefix = prefix;
    this.srate = config[prefix + 'Srate']||256.0;
    this.dt = 1.0 / this.srate;
    this.prv_t=-1;
    this.k=0;
    this.perm = jxPermutation(256);
  }
  ecg_calc(k,pamp,qamp,ramp,samp,tamp) {
    var pi = Math.PI;
    var p=pamp*Math.sin((pi*k+120)/80);
    var p_p=(k>120&&k<200?p:0);
    var q=qamp*Math.cos((pi*k-30)/20)
    var q_p=(k>240&&k<260?q:0);
    var r=ramp*Math.cos((pi*k+31.2)/20);
    var r_p= (k>260&&k<280?r:0);
    var s=samp*Math.sin(pi*k/10);
    var s_p=(k>280&&k<290?s:0);
    var t=tamp*Math.sin((pi*k-215)/110);
    var t_p=(k>290&&k<400?t:0);
    return p_p+q_p+r_p+s_p+t_p;
  }
  step (state) {
    var pamp = state[this.prefix + 'PAmp']||0.1;
    var qamp = state[this.prefix + 'QAmp']||-0.03;
    var ramp = state[this.prefix + 'RAmp']||1.1;
    var samp = state[this.prefix + 'SAmp']||-0.06;
    var tamp = state[this.prefix + 'TAmp']||0.4;
    var cur_t = state['elapsed'];
    if (this.prv_t>=0&&cur_t<this.prv_t) this.prv_t = cur_t;
    var hr = state['hr']||60.0;
    var dk=this.dt*500*60/hr;
    var prv_t = this.prv_t;
    var ecg = [];
    if (prv_t==-1) prv_t=cur_t;
    while (prv_t<cur_t) {
      this.k+=dk;
      if (this.k>=500) this.k-=500;
      ecg.push(-this.ecg_calc(this.k,pamp,qamp,ramp,samp,tamp)+0.2*jxNoise(0.25*cur_t,this.perm)+0.5);
      prv_t = prv_t+this.dt;
    }
    this.prv_t=prv_t;
    state[this.prefix+'Waveform']=ecg;
    state[this.prefix+'Hrate']=hr;
  }
}


class jxEDF {
  constructor (config) {
    var cfg = config||{};
    this.filename="";
    this.startdate = "";
    this.starttime = "";
    this.labels=[];
    this.data = null;
    this.s16data = null;
    this.physmin = [];
    this.physmax= [];
    this.digmin = [];
    this.digmax= [];
    this.n=0;
    this.rn=0;
    this.rt=0;
    this.rsamples = [];
    this.rstride = 0;
    this.sidx = [];
    this.prv_ts = [];
    this.idx=-1;
    this.loaded=false;
    this.onload = cfg["onload"];
  }
  read_int (abdata) {
    return parseInt(jxEnsureString(abdata));
  };
  read_float (abdata) {
    return parseFloat(jxEnsureString(abdata));
  };
  read_string (abdata) {
    return jxEnsureString(abdata);
  };
  loadURL(url,name) {
    var that = this;
    jxLoadFromURL(function (name,abdata) { that.load_internal(that,name,abdata); });
  }
  loadFile() {
    var that = this;
    jxLoadFromFile(function (fname,abdata) { that.load_internal(that,fname,abdata); });
  }
  load_internal (that, fname, abdata) {
    that.loaded=false;
    that.data=abdata;
    that.u8data=new Uint8Array(that.data);
    that.filename=fname;
    that.idx= 8 + // version
              80 +  // patient
              80;   // recording
    that.startdate = that.read_string(that.data.slice(that.idx,that.idx+8)).replaceAll(".","/");
    that.idx+=8;
    that.starttime = that.read_string(that.data.slice(that.idx,that.idx+8)).replaceAll(".",":");
    that.idx+=8;
    that.idx+=  8  +  // bytes in header
                44;   // reserved
    that.rn = that.read_int(that.data.slice(that.idx,that.idx+8));
    that.idx+=8;
    that.rt = that.read_float(that.data.slice(that.idx,that.idx+8));
    that.idx+=8;
    var n = that.read_int(that.data.slice(that.idx,that.idx+4));
    that.n = n;
    that.idx+=4;
    var labels=[];
    for (var i=0;i<n;i++) {
      var label = that.read_string(that.data.slice(that.idx,that.idx+16)); 
      labels.push(label.trim());
      that.idx+=16;
    }
    that.labels = labels;
    that.idx+= n*80 + // transducer types
               n*8; // physical dimension
    that.physmin=[];
    for (var i=0;i<n;i++) {
      that.physmin.push(that.read_float(that.data.slice(that.idx,that.idx+8)));
      that.idx+=8;
    }
    that.physmax=[];
    for (var i=0;i<n;i++) {
      that.physmax.push(that.read_float(that.data.slice(that.idx,that.idx+8)));
      that.idx+=8;
    }
    that.digmin=[];
    for (var i=0;i<n;i++) {
      that.digmin.push(that.read_float(that.data.slice(that.idx,that.idx+8)));
      that.idx+=8;
    }
    that.digmax=[];
    for (var i=0;i<n;i++) {
      that.digmax.push(that.read_float(that.data.slice(that.idx,that.idx+8)));
      that.idx+=8;
    }
    that.idx+=n*80; // prefiltering
    that.rsamples=[];
    that.sidx=[];
    that.prv_ts=[];
    that.rstride=0;
    for (var i=0;i<n;i++) {
      var tmp = that.read_int(that.data.slice(that.idx,that.idx+8));
      that.rsamples.push(tmp);
      that.sidx.push(0);
      that.prv_ts.push(-1);
      that.rstride+=tmp;
      that.idx+=8;
    }
    that.idx+=n*32; // reserved
    // we are now at the start of the data records..
    that.s16data = new Int16Array(that.data.slice(that.idx,that.data.length));
    that.loaded=true;
    if (that.onload) that.onload();
//    cdsa.annotations=[];
//    cdsa.plot('plot');
//    trends.plot('plot2');
//    elementShow("download","inline-block");
//    elementShow("download2","inline-block");
//    elementContent("filename",this.filename);
    return true;
  };
  read_short (sno,sidx) {
    var res = 0;
    if (sidx<this.rn*this.rsamples[sno]) {
      var rno = Math.floor(sidx/this.rsamples[sno]);
      var idx = rno*this.rstride;
      for (var i=0;i<sno;i++) {
        idx+=this.rsamples[i];
      }
      idx+=sidx-rno*this.rsamples[sno];
      var tmp = this.s16data[idx];
      tmp+= -1.0*this.digmin[sno];
      tmp*=(this.physmax[sno]-this.physmin[sno])/(this.digmax[sno]-this.digmin[sno]);
      tmp+= 1.0*this.physmin[sno];
      res = tmp;
    }
    return res;
  }
  chunk (sno,n) {
    var res = [];
    var len = this.rn * this.rsamples[sno];
    for (var i=0;i<n;i++) {
      var val = (this.sidx[sno]<len?this.read_short(sno,this.sidx[sno]):0);
      res.push(val);
      this.sidx[sno]++;
    }
    return res;
  }
  seek (ratio) {
    if (ratio<0) ratio=0;
    if (ratio>1) ratio=1;
    var nsignals = this.sidx.length;
    for (var i=0;i<nsignals;i++) {
      var len = this.rn * this.rsamples[i];
      this.sidx[i]=Math.floor(len*ratio);
    }
  }
  next (sno) {
    var len = this.rn * this.rsamples[sno];
    var res = (this.sidx[sno]<len?this.read_short(sno,this.sidx[sno]):null);
    this.sidx[sno]++;
    return res;
  }
  snippetAt (x) {
    var xsane = x;
    if (Array.isArray(xsane)) xsane=xsane[0];
    var dur = this.rt*this.rn;
    var fs = this.rsamples[0]/this.rt;
    var ofs = xsane*60.0-2.5;
    if (ofs<0) ofs=0;
    if (ofs>dur-5.0) ofs=dur-5.0;
    var r = ofs/dur;
    this.seek(r);
    var res = this.chunk(0,Math.floor(5.0*fs));
    return res;
  }
  eegChannels (hemisphere) {
    var sitenames = [
      [ "Fp1", "F7", "FT9", "Fp2", "F8", "FT10" ],
      [ "Fp1", "F7", "FT9" ],
      [ "Fp2", "F8", "FT10" ]
    ];
    var res = [];
    for (var i=0;i<this.labels.length;i++) {
      var l = this.labels[i];
      if (l.substring(0,3)=="EEG") {
        for (var j=0;j<sitenames[hemisphere].length;j++) {
          var site=sitenames[hemisphere][j];
          if (l.includes(site)&&!res.includes(i)) {
            res.push(i);
          }
        }
      }
    }
    return res;
  }
  /*
  eegChannels() {
    var res = [];
    for (var i=0;i<this.labels.length;i++) {
      var l = this.labels[i];
      if (l.toUpperCase().includes('EEG')) {
        res.push([i,l]);
      }
    }
    return res;
  }*/
  trendChannels (hemisphere) {
    var trendnames = [
      [ "WAVcns 1", "EMG 1", "SR 1", "WAVcns 2", "EMG 2", "SR 2"],
      [ "WAVcns 1", "EMG 1", "SR 1"],
      [ "WAVcns 2", "EMG 2", "SR 2"]
    ];
    var res = [];
    for (var i=0;i<this.labels.length;i++) {
      var l = this.labels[i];
      for (var j=0;j<trendnames[hemisphere].length;j++) {
        var trend=trendnames[hemisphere][j];
        if (l==trend&&!res.includes(i)) {
          res.push(i);
        }
      }
    }
    return res;
  }
  channelData (sno) {
    var dur = this.rt*this.rn;
    var fs = this.rsamples[sno]/this.rt;
    this.seek(0);
    return this.chunk(sno,Math.floor(fs*dur));
  }
}



class jxEEGAnalyzerBSR {
  constructor (leadname,config) {
    this.leadname = leadname;
    this.fs = 256.0;
    this.sr_twindow = 0.1;
    this.sr_tstep = 0.01;
    //this.sr_thres2 = 5*5;
    this.sr_thres2 = 0.05*0.05;
    this.sr_n = Math.floor(this.fs*this.sr_twindow);
    this.sr_buffer = new Array(this.sr_n);
    for (var i =0;i<this.sr_n;++i) { this.sr_buffer[i]=0; }
    this.sr_sum2 = 0;
    this.sr_idx =0;
    this.sr_supidx =0;
    this.sr_supsum = new Array(100);
    for (var i =0;i<100;++i) { this.sr_supsum[i]=0; }
    this.sr_supbuf=[];
    for (var i =0;i<100;++i) {
      var tmp = new Array(60);
      for (var j =0;j<60;++j) { tmp[j]=0; }
      this.sr_supbuf.push(tmp);
    }
    this.sr_t=0;
    this.sr=0;
    this.sr_rt=0;
  }
  next (x) {
    var x2 = x*x;
    this.sr_sum2-=this.sr_buffer[this.sr_idx];
    this.sr_buffer[this.sr_idx]=x2;
    this.sr_sum2+=x2;
    this.sr_rt = (this.sr_sum2<this.sr_thres2?1:0);
    if (++this.sr_idx==this.sr_n) this.sr_idx=0;
    if (this.sr_t>=this.sr_tstep) {
      var res = 0;
      var sup = (this.sr_sum2<this.sr_thres2?1:0);
      for (var i=0;i<100;i++) {
        var newsup = this.sr_supbuf[i][this.sr_supidx];
        this.sr_supsum[i]-=this.sr_supbuf[i][this.sr_supidx];
        this.sr_supsum[i]+=sup;
        this.sr_supbuf[i][this.sr_supidx]=sup;
          res+=(this.sr_supsum[i]>0?1:0);
        sup=newsup;
      }
      if (++this.sr_supidx==60) this.sr_supidx=0;
        this.sr = 0.01*res+0.99*this.sr;
      this.sr_t=0;
    } else {
      this.sr_t+=this.dt;
    }
  }
  step (state) {
    var data = state[this.leadname + 'Waveform'];
    if (data) { for (var i=0;i<data.length;i++) this.next(data[i]); }
    state[this.leadname + 'BSR']=this.sr;
  }
}


// experimental measure of hypnosis
class jxEEGAnalyzerHYP {
  constructor (leadname) {
    this.leadname = leadname;
    this.fs = 256.0;
    this.hp_tc = 60.0;
    this.hp_x_1 = 0;
    this.hp_n = 0;
    this.hp_cnt = 0;
    this.hp_a = null;
    this.hp_idx = 0;
    this.hp_n = Math.floor(this.fs*this.hp_tc);
    this.hp_a = new Array(this.hp_n);
    for (var i=0;i<this.hp_n;++i) { this.hp_a[i]=0; }
    this.hp_x_1=0;
    this.hp_idx=0;
    this.hp_cnt=0;
    this.hyp=null;
    this.cnt=0;
  }
  // estimate the sigmoid from 3 measurements around the midpoint
  dohSigmoid(x,reading40,reading50,reading60) {
    // Y = A1/(1+exp(A2*(X-A3)))+A4
    // min doh = 10
    var A4 = 10;
    // max doh = 100
    var A1 = 100 - A4;
    var slope = (60 - 40)/(reading60 - reading40);
    var A3 = reading50;
    var A2 = -4*slope/A1;
    return A1/(1+Math.exp(A2*(x-A3)))+A4;
  }
  next (x) {
    var anew = (this.hp_x_1>x?1:-1);
    if (this.hp_a[this.hp_idx]!=this.hp_a[(this.hp_idx+1)%this.hp_n]) this.hp_cnt--;
    var prv_idx=(this.hp_idx==0?this.hp_n-1:this.hp_idx-1)%this.hp_n;
    if (anew!=this.hp_a[prv_idx]) this.hp_cnt++;
    this.hp_a[this.hp_idx]=anew;
    if (++this.hp_idx==this.hp_n) this.hp_idx=0;
    this.hp_x_1 = x;
    var c = this.hp_cnt/this.hp_n;
    if (this.cnt>this.hp_n) {
      //this.hyp = c;
      this.hyp = this.dohSigmoid(c,0.0175,0.0195,0.021);
    }
    this.cnt++;
  }
  step (state) {
    var data = state[this.leadname + 'Waveform'];
    if (data) { for (var i=0;i<data.length;i++) this.next(data[i]); }
    state[this.leadname + 'HYP']=this.hyp;
  }
}

// EEG simulator

class jxEEGSimulator {
  constructor (prefix,config) {
    this.prefix=prefix;
    this.srate = config[prefix+"Srate"]||256.0;
    this.noise = config[prefix+"Noise"]||0.01;
    this.scale = config[prefix+"Scale"]||1.0;
    this.dt = 1.0/this.srate;
    this.doh = -1;
    this.w = 0;
    this.prv_t = -1;
    this.p = Math.random();
    this.perm = jxPermutation(256);
    this.mode = 0;
  }
  step (state) {
    var cur_t = state['elapsed_s']; 
    if (this.prv_t>=0&&cur_t<this.prv_t) this.prv_t = cur_t;
    if (state['propofolEffect']) {
      if ((state['propofolEffect']||50)!=this.doh) { 
        // doh = 81/(1+exp(-1.75*(x-3.5)))+13;
        // x = 3.5 - log (81/(doh-13) - 1)/ 1.75;
        this.doh = state['propofolEffect']; 
        this.k=1.0;
        if (this.doh>93) this.k=6.0;
          else if (this.doh>14.0) this.k=3.5-Math.log(81.0/(this.doh-13.0)-1.0)/1.75;
      }
    }
    var dp=this.k*this.dt;
    var prv_t = this.prv_t;
    var ecg = state['ecgWaveform'];
    var eeg = [];
    if (prv_t==-1) prv_t=cur_t;
    while (prv_t<cur_t) {
      var tmp = 0;
      if (this.mode==0) {
        this.p+=0.25*this.w*this.dt;
        tmp = this.scale*jxNoise(this.p,this.perm);
        if (ecg) tmp+=0.0001*ecg[eeg.length];
      } else {
        this.p+=this.w*this.dt;
        tmp = this.scale*Math.sin(this.p);
      }
      eeg.push(tmp);
      prv_t = prv_t+this.dt;
    }
    this.prv_t=prv_t;
    state[this.prefix+'Waveform']=eeg;
    state[this.prefix+'Doh']=this.doh;
  }
}


/** Calculate Lean Body Mass (LBM)
* @param {('male'|'female')} g the gender
* @param {number} w the weight in kg
* @param {number} height the height in cm
* @return {number} lean body mass
*/
function jxLBM(g,w,h) {
  var lbm;
  if (g.toUpperCase()=='MALE') {
    lbm = 0.32810*w + 0.33929*h - 29.5336;
  } else {
    lbm = 0.29569*w + 0.41813*h - 43.2933;
  }
  return (lbm>100||lbm<=0?w:lbm);
}


/**
* @typedef {Object} jxPDOptions
* @property {number} prefixPDEC50 the PD EC50 value
* @property {number} prefixPDGamma the PD Gamma value
* @property {number} prefixPDScale the max value of the PD effect
* @property {boolean} prefixPDInvert reverse the effect scale (max = no effect)
*/

/** PharmacoDynamic (PD) model
* 
* This uses the Hill Equation to calculate drug effect.
*/
class jxPD {
/** Create a PD model
* @param {string} prefix String to identify drug in state object
* @param {jxPDOptions} config Configuration options (with prefix)
*/
  constructor (prefix,config) {
    this.prefix = prefix;
    this.ec50 = config[prefix + 'PDEC50']||3.0;
    this.gamma = config[prefix + 'PDGamma']||2.0;
    this.scale = config[prefix + 'PDScale']||100.0;
    this.invert = config[prefix + 'PDInvert']||true;
  }
/** Perform PD simulation step 
* @param {Object} state The patient simulation state
*
* The simulation state is updated with a prefix+Effect key value
*/
  step (state) {
    var ce = state[this.prefix + 'Ce']||0.0;
    var effect = Math.pow(ce,this.gamma)/(
       Math.pow(this.ec50,this.gamma)+Math.pow(ce,this.gamma)
    );
    state[this.prefix + 'Effect']=this.scale*(this.invert?1.0-effect:effect);
  }
}


/**
* @typedef {Object} jxPKOptions
* @property {number} prefixTimestep PK simulation time step
* @property {number} prefixConcentration Drug concentration in mcg/ml
* @property {number} weight Patient weight in kg
* @property {number} height Patient height in cm
* @property {{'male'|'female'}} gender Patient gender
*/

/** PharmacoKinetic (PK) model
* 
* This follows the implementation in STANPUMP, freely available from Steven L. Shafer MD at <a href="http://opentci.org/code/stanpump">http://opentci.org/code/stanpump</a>
*
* The Propofol model is Marsh, and the Remifentanil model is Minto.
*
*/
class jxPK {
/** Create a PK model
* @param {'propofol'|'remifentanil'} prefix Drug to simulate (also prefix in patient state)
* @param {jxPKOptions} config Configuration options (note some are prefixed)
*
* @example
* var myPK = new jxPK('propofol', { propofolTimestep: 1, propofolConcentration: 10, weight: 70, height: 170, gender: 'male' });
*
*/
  constructor (prefix,config) {
    this.prefix = prefix;
    this.dt = config[prefix+'Timestep']||1.0;
    this.conc = config[prefix+'Concentration'];
    this.weight = config['weight'];
    this.vc = 0;
    this.k12 = 0;
    this.k13 = 0;
    this.k21 = 0;
    this.k31 = 0;
    this.ke0 = 0;
    this.tpeak =0;
    var g = config['gender'];
    var w = config['weight'];
    var h = config['height'];
    var lbm = jxLBM(g,w,h);
    var a = config['age'];
    switch (prefix) {
      case 'remifentanil':
        var v2 = 9.82 - 0.0811*(a-40) + 0.108*(lbm-55);
        var v3 = 5.42;
        var cl1 = 2.6 - 0.0162*(a-40) + 0.0191*(lbm-55);
        var cl2 = 2.05 - 0.0301*(a-40);
        var cl3 = 0.076 - 0.00113*(a-40);
        this.vc = 5.1 - 0.0201*(a-40) + 0.072*(lbm-55);
        this.k10 = cl1/this.vc;
        this.k12 = cl2/this.vc;
        this.k13 = cl3/this.vc;
        this.k21 = cl2/v2;
        this.k31 = cl3/v3;
        this.ke0 = 0.595 - 0.007 * (a-40);
        this.tpeak = 0;
        break;
      case 'propofol':
        this.vc  = 0.228*w;
        this.k10 = 0.119;
        this.k12 = 0.112;
        this.k13 = 0.0419;
        this.k21 = 0.055;
        this.k31 = 0.0033;
        this.ke0 = 0.456;
        this.tpeak = 1.6;
        break;
      default:
        console.error('Unknown drug');
        break;
    }
    this.l1=0;
    this.l2=0;
    this.l3=0;
    this.l4=0;
    this.pc1=0;
    this.pc2=0;
    this.pc3=0;
    this.pc4=0;
    this.ec1=0;
    this.ec2=0;
    this.ec3=0;
    this.ec4=0;
    this.totaldose = 0;
    this.pudf = null;
    this.eudf = null;
    this.peaktime=0;
    this.priorpeaktime=null;
    this.infusefactor=0;
    this.css = 0;
    this.toradian = (Math.asin(1) * 2) / 180;
    this.deltaseconds = 10.0;
    this.prv_t=-1;
    this.ve = 0;
    this.ps1 = 0;
    this.ps2 = 0;
    this.ps3 = 0;
    this.es1 = 0;
    this.es2 = 0;
    this.es3 = 0;
    this.es4 = 0;
    this.pv = 0;
    this.udfs();
  }
  cube () {
    var a0;
    var a1;
    var a2;
    var p;
    var q;
    var r1;
    var phi0;
    var phi1;
    var phi;
    var r1a;
    var a0_1809;
    var a1_1810;
    var res = this.k31 > 0 ? (a0 = this.k10 * this.k21 * this.k31,
        (a1 = this.k10 * this.k31 + this.k21 * this.k31 + this.k21 * this.k13 + this.k10 * this.k21 + this.k31 * this.k12,
        (a2 = this.k10 + this.k12 + this.k13 + this.k21 + this.k31,
        (p = a1 - (a2 * a2) / 3,
        (q = (2 * a2 * a2 * a2) / 27 + (a1 * a2) / -3 + a0,
        (r1 = Math.sqrt((p * p * p) / -27),
        (phi0 = q / (-2 * r1),
        (phi1 = phi0 > 1 ? 1 : (phi0 < -1 ? -1 : phi0),
        (phi = Math.acos(phi1) / 3,
        (r1a = 2 * Math.exp(Math.log(r1) / 3),
        [-(Math.cos(phi) * r1a - a2 / 3), -(Math.cos(phi + 120 * this.toradian) * r1a - a2 / 3), -(Math.cos(phi + 240 * this.toradian) * r1a - a2 / 3)])))))))))) : (this.k21 > 0 ? (a0_1809 = this.k10 * this.k21,
            a1_1810 = -(this.k10 + this.k12 + this.k21),
            [(-a1_1810 + Math.sqrt(a1_1810 * a1_1810 - 4 * a0_1809)) / 2, (-a1_1810 - Math.sqrt(a1_1810 * a1_1810 - 4 * a0_1809)) / 2, 0]) : [0, 0, 0]);
    return res.sort(function(a,b) { return b - a; });
  }
  aux (val) {
    this.ec1 = (this.pc1 / (val - this.l1)) * val;
    if (this.k31 > 0) {
      this.ec2 = (this.pc2 / (val - this.l2)) * val;
      this.ec3 = (this.pc3 / (val - this.l3)) * val;
      this.ec4 = ((val - this.k21) * (val - this.k31)) / 
           ((this.l1 - val) * (this.l2 - val) * (this.l3 - val) * this.vc);
    } else {
      if (this.k21 > 0) {
        this.ec2 = (this.pc2 / (val - this.l2)) * val;
        this.ec3 = 0;
        this.ec4 = (this.k21 - val) / ((this.l1 - val) * (this.l2 - val) * this.vc);
      } else {
        this.ec2 = 0;
        this.ec3 = 0;
        this.ec4 = 1 / ((this.l1 - val) * this.vc);
      }
    }
  }
  aux2 () {
    if (this.k31 > 0) {
      this.pc1 = (((((this.k21 - this.l1) * (this.k31 - this.l1)) / (this.l1 - this.l2)) / 
                          (this.l1 - this.l3)) / this.vc) / this.l1;
      this.pc2 = (((((this.k21 - this.l2) * (this.k31 - this.l2)) / (this.l2 - this.l1)) / 
                          (this.l2 - this.l3)) / this.vc) / this.l2;
      this.pc3 = (((((this.k21 - this.l3) * (this.k31 - this.l3)) / 
              (this.l3 - this.l2)) / (this.l3 - this.l1)) / this.vc) / this.l3;
    } else {
      if (this.k21 > 0) {
        this.pc1 = (((this.k21 - this.l1) / (this.l2 - this.l1)) / this.vc) / this.l1;
        this.pc2 = (((this.k21 - this.l2) / (this.l1 - this.l2)) / this.vc) / this.l2;
        this.pc3 = 0;
      } else {
        this.pc1 = (1 / this.l1) / this.vc;
        this.pc2 = 0;
        this.pc3 = 0;
      }
    }
  }
  expresult (tt) {
    return this.ec1 * Math.exp(this.l1 * tt * -1) + 
           this.ec2 * Math.exp(this.l2 * tt * -1) + 
           this.ec3 * Math.exp(this.l3 * tt * -1) + 
           this.ec4 * Math.exp(this.l4 * tt * -1);
  }
  beforeafter (ke0) {
    this.l4 = ke0;
    this.aux(ke0);
    this.ec1 *= this.l1;
    this.ec2 *= this.l2;
    this.ec3 *= this.l3;
    this.ec4 *= this.l4;
    var t1 = this.tpeak - 0.01;
    var t2 = this.tpeak;
    var t3 = this.tpeak + 0.01;
    var result1 = this.expresult(t1);
    var result2 = this.expresult(t2);
    var result3 = this.expresult(t3);
    if (result1 < result2 && result3 < result2) {
      return 0;
    } else {
      return result1 > result2 ? -1 : 1;
    }
  }
  recalculate () { 
    var ke0 = this.ke0;
    var tooSmall = 0;
    var tooLarge = ke0 * 1.5;
    while (this.beforeafter(tooLarge) !== -1) tooLarge*=1.5;
    var n = 0;
    while (true) {
      var result = this.beforeafter(ke0);
      if (n === 100 || result === 0) break;
      if (result === -1) {
        tooLarge = ke0;
      } else {
        tooSmall = ke0;
      }
      ke0 = (tooLarge + tooSmall) / 2;
      ++n;
    }
    return ke0;
  }
  udfs () {
    this.k10 /= 60;
    this.k12 /= 60;
    this.k13 /= 60;
    this.k21 /= 60;
    this.k31 /= 60;
    this.ke0 /= 60;
    var res = this.cube();
    this.l1 = res[0];
    this.l2 = res[1];
    this.l3 = res[2];
    this.pc4 = 0;
    this.l4 = this.ke0;
    this.aux2();
    this.aux(this.ke0);
    this.tpeak *= 60;
    if (this.tpeak > 0) {
      this.ke0 = this.recalculate();
      this.l4 = this.ke0;
      this.aux(this.ke0);
    }
    var l1 = Math.exp(-this.l1);
    var l2 = Math.exp(-this.l2);
    var l3 = Math.exp(-this.l3);
    var l4 = Math.exp(-this.l4);
    var arr1811;
    var elt1813;
    this.pudf = (arr1811 = new Array(200),
        ((elt1813 = 0,
           (function() {
               for (var i1814 = 0; i1814 < arr1811.length; i1814 += 1) {
                   arr1811[i1814] = elt1813;
               }
           })()), arr1811));
    var n = 1;
    var temp1 = 0;
    var temp2 = 0;
    var temp3 = 0;
    while (n < 200) {
      this.pudf[n] = temp1 + temp2 + temp3;
      ++n;
      temp1 = temp1 * l1 + this.pc1 * (1 - l1);
      temp2 = temp2 * l2 + this.pc2 * (1 - l2);
      temp3 = temp3 * l3 + this.pc3 * (1 - l3);
    }
    var arr1815;
    var elt1817;
    this.eudf = (arr1815 = new Array(2701),
      ((elt1817 = 0,
         (function() {
           for (var i1818 = 0; i1818 < arr1815.length; i1818 += 1) {
                   arr1815[i1818] = elt1817;
            } })()), arr1815));
    var n1819 = 1;
    var temp1_1820 = 0;
    var temp2_1821 = 0;
    var temp3_1822 = 0;
    var temp4 = 0;
    var done = false;
    while (!done) {
      var newtemp1 = temp1_1820 * l1 + (n1819 < this.deltaseconds ? this.ec1 * (1 - l1) : 0);
      var newtemp2 = temp2_1821 * l2 + (n1819 < this.deltaseconds ? this.ec2 * (1 - l2) : 0);
      var newtemp3 = temp3_1822 * l3 + (n1819 < this.deltaseconds ? this.ec3 * (1 - l3) : 0);
      var newtemp4 = temp4 * l4 + (n1819 < this.deltaseconds ? this.ec4 * (1 - l4) : 0);
      this.eudf[n1819] = newtemp1 + newtemp2 + newtemp3 + newtemp4;
      if (n1819 > this.deltaseconds && this.eudf[n1819 - 1] > this.eudf[n1819]) {
        this.peaktime = n1819 - 1;
        this.priorpeaktime = this.peaktime;
        done=true;
      } else {
        n1819 += 1;
        temp1_1820 = newtemp1;
        temp2_1821 = newtemp2;
        temp3_1822 = newtemp3;
        temp4 = newtemp4;
      }
    }
  }
/** Perform one step in the PK simulation 
* 
* Reads prefix+'Rate' infusion rate (ml/h) from the state object
*
* Side effect: updates prefix+'Ce' and prefix+'Cp' effect and plasma concentrations (mcg/ml) in the state object
*
* @param {Object} state the patient state
*/
  step (state) {
    var rate = state[this.prefix + 'Rate']||0;
    var conc = this.conc;
    var interval = this.dt;
    var new_vol = this.totaldose;
    var prior_vol = this.pv > new_vol ? new_vol : this.pv;
    var delta_vol = new_vol - prior_vol;
    var delta_amt = delta_vol * conc;
    var rate_amt = delta_amt / interval;
  //  var rate_amt = conc*rate;

    var l1 = Math.exp(-1 * this.l1 * interval);
    var l2 = Math.exp(-1 * this.l2 * interval);
    var l3 = Math.exp(-1 * this.l3 * interval);
    var l4 = Math.exp(-1 * this.l4 * interval);
    var actualvolume = this.totaldose;
    this.ps1 = this.ps1 * l1 + this.pc1 * rate_amt * (1 - l1);
    this.ps2 = this.ps2 * l2 + this.pc2 * rate_amt * (1 - l2);
    this.ps3 = this.ps3 * l3 + this.pc3 * rate_amt * (1 - l3);
    this.es1 = this.es1 * l1 + this.ec1 * rate_amt * (1 - l1);
    this.es2 = this.es2 * l2 + this.ec2 * rate_amt * (1 - l2);
    this.es3 = this.es3 * l3 + this.ec3 * rate_amt * (1 - l3);
    this.es4 = this.es4 * l4 + this.ec4 * rate_amt * (1 - l4);

  //  this.pv += rate*interval;
    this.pv = new_vol;

/*
   this.pv = new_vol;
   if (rate > 0 && actualvolume && this.pv) {
     if (Math.abs(actualvolume - this.pv) > 2) {
       return this.infusefactor = 1.0;
     } else {
       var tmp = this.pv - actualvolume;
       var delta = Math.min(0.1, Math.abs(tmp));
       var ifactor = 1 + delta * 0.2;
       if (tmp > 0) {
         this.infusefactor *= ifactor;
       } else {
         this.infusefactor /= ifactor;
       }
       if (this.infusefactor < 0.5) {
         this.infusefactor = 0.5;
       }
       return this.infusefactor > 2 ? (this.infusefactor = 2) : null;
     }
   }
*/
    state[this.prefix + 'Cp'] = Math.max(0,this.ps1+this.ps2+this.ps3);
    state[this.prefix + 'Ce'] = Math.max(0,this.es1+this.es2+this.es3+this.es4);
    this.totaldose+=rate*this.dt/3600.0;
  }
}


function makePPGDeviceReceiver (obj) {
  return function (data) {
    var res = jxEnsureNumber(obj.decoder.decode(data));
    obj.data.push(res);
  }
}

function makePPGDeviceError (obj) {
  return function (error) {
    console.log(error);
    obj.disconnect();
  }
}

class jxPPGDevice {
  constructor (prefix,config) {
    this.prefix = prefix;
    this.port = null;
    this.data = [];
    this.decoder = new TextDecoder();
    this.lp = new jxLowPass({});
  }
  disconnect () {
    if (this.port) {
      this.port.disconnect();
      this.port = null;
    } 
  }
  connect () {
    this.disconnect();
    var that = this;
    jxSerial.requestPort().then( function (p) {
      that.port = p;
      that.port.onReceive = makePPGDeviceReceiver(that);
      that.port.onReceiveError = makePPGDeviceError(that);
      that.port.connect().then( function () {}, function (error) { console.error(error); });
    }).catch( function (error) { console.error(error); });
  }
  step (state) {
    var ppg = [];
    while (this.data.length>0) { 
      var x = this.data.shift();
      if (!isNaN(x)) ppg.push(x);
    }
    if (this.port) state[this.prefix+'Waveform']=this.lp.step(ppg);
  }
}


class jxPPGSimulator {
  constructor (prefix,config) {
    this.prefix = prefix;
    this.srate = config[prefix+'Srate']||64.0;
    this.dt = 1.0 / this.srate;
    this.seed = Math.random();
    this.prv_t=-1;
    this.p=0;
  }
  step (state) {
    var cur_t = state['elapsed_s'];
    if (this.prv_t>=0&&cur_t<this.prv_t) this.prv_t = cur_t;
    var na = state[this.prefix+'NotchAmplitude']||0.25;
    var np = state[this.prefix+'NotchPhase']||1.0;
    var hr = state['hr']||60.0;
    var dp = 2*Math.PI*this.dt*hr/60.0;
    var prv_t = this.prv_t;
    var ppg = [];
    if (prv_t==-1) prv_t=cur_t;
    while (prv_t<cur_t) {
      this.p+=dp;
      ppg.push(0.5*(Math.sin(this.p)+na*Math.sin(2*this.p+np))+0.5*jxNoise(0.25*cur_t+this.seed));
      prv_t = prv_t+this.dt;
    }
    this.prv_t=prv_t;
    state[this.prefix+'Waveform']=ppg;
    state[this.prefix+'HR_bpm']=hr;
    state[this.prefix+'SpO2_percent']=99;
  }
}


class jxParamSimulator {
  constructor (name,config) {
    this.name = name;
    this.sp = config.setpoint||0;
    this.mod = config.modulation||0.1;
    this.speed = config.speed||0.1;
    this.perm = jxPermutation(256);
    this.seed = Math.random() * 1000;
  }
  step(state) {
    var cur_t = state['elapsed'];
    var newsp = state[this.name+'Setpoint']||this.sp;
    this.sp = 0.1*newsp + 0.9*this.sp;
    var r = this.mod / this.sp;
    state[this.name]= this.sp*(1 + r*jxNoise(this.speed*cur_t,this.perm));
  }
}


class jxPatient {
  constructor (config) {
    this.timeStart = -1;
    this.lastSlow = 0;
    this.state = config["state"]||{};
    this.params = config["params"]||[];
    this.devices = config["devices"]||[];
    this.analyzers = config["analyzers"]||[];
    this.metaAnalyzers= config["metaAnalyzers"]||[];
    this.filters = config["filters"]||[];
    this.actuators = config["actuators"]||[];
    this.fastHandler = config["fastHandler"]||function () {};
    this.slowHandler = config["slowHandler"]||function () {};
    this.slowStep = 1.0;
  }
  step () {
    var timeNow = new Date().getTime()/1000.0;
    if (this.timeStart==-1) {
      this.timeStart=timeNow;
      this.lastSlow=0;
    }
    this.state['elapsed_s']=timeNow-this.timeStart;
    for (var i=0;i<this.params.length;i++) this.params[i].step(this.state);
    for (var i=0;i<this.devices.length;i++) this.devices[i].step(this.state);
    for (var i=0;i<this.analyzers.length;i++) this.analyzers[i].step(this.state);
    for (var i=0;i<this.metaAnalyzers.length;i++) this.metaAnalyzers[i].step(this.state);
    for (var i=0;i<this.actuators.length;i++) this.actuators[i].step(this.state);
    for (var i=0;i<this.filters.length;i++) this.filters[i].step(this.state);
    if (this.fastHandler) this.fastHandler(this.state);
    if (this.slowHandler&&this.state['elapsed_s']-this.lastSlow>this.slowStep) {
      this.slowHandler(this.state);
      this.lastSlow=this.state['elapsed_s'];
    }
  }
}


class jxPatientSimulator {
  constructor (config) {
    // default values
    this.state = {
      gender: 'Male',
      age_yr: 10.0,
      weight_kg: 50.0,
      height_cm: 100.0,
      temp_degcSetpoint: 36.0,
      temp_degcModulation: 0.5,
      temp_degcSpeed: 0.001,
      temp_degc: 36.0,
      rr_perminSetpoint: 17.0,
      rr_perminModulation: 1.0,
      rr_perminSpeed: 0.001,
      rr_permin: 17,
      etco2_mmhgSetpoint: 40.0,
      etco2_mmhgModulation: 1.0,
      etco2_mmhgSpeed: 0.001,
      etco2_mmhg: 40,
      co2Waveform: [],
      hr_perminSetpoint: 70.0,
      hr_perminModulation: 10.0,
      hr_perminSpeed: 0.01,
      hr_permin: 70,
      spo2_percentSetpoint: 95.0,
      spo2_percentModulation: 2.0,
      spo2_percent: 97,
      bpSys_mmhgSetpoint: 120,
      bpSys_mmhgModulation: 20.0,
      bpSys_mmhg: 120,
      bpDia_mmhgSetpoint: 80,
      bpDia_mmhgModulation: 5.0,
      bpDia_mmhg: 80,
      map_mmhg: 100,
      ecgRAmpSetpoint: 1.1,
      ecgRAmpModulation: 0.5,
      ecgRAmpSpeed: 10.0,
      ecgRAmp: 1.1,
      ecgTAmpSetpoint: 0.4,
      ecgTAmpModulation: 0.2,
      ecgTAmpSpeed: 10.0,
      ecgTAmp: 0.4,
      ecgWaveform: [],
      eeg1Scale: 0.1,
      eeg1Waveform: [],
      eeg2Waveform: [],
      eeg3Waveform: [],
      eeg4Scale: 0.1,
      eeg4Waveform: [],
      ppgWaveform: [],

      propofolMode: 'Off',
      propofolTotal_ml: 0,
      propofolTotalRemaining_ml: 0,
      propofolRate_mlperh: 0,
      propofolBolusDose_ml: 0.2,
      propofolBolusRate_mlperh: 0.2,
      propofolControlMode: 'Off',
      propofolControlCe_mcgperml: 0,
      propofolControlCp_mcgperml: 0,
      propofolControlRate_mcgperkgpermin: 0,
      propofolControlConcentration_mcgperml: 10.0,
      propofolControlTIVASetpoint_mlperh: 50,
      propofolControlTCIPSetpoint_mcgperml: 3.0,
      propofolControlTCIESetpoint_mcgperml: 3.0,
      propofolControlAUTOSetpoint_index: 50.0,

      remifentanilMode: 'Off',
      remifentanilTotal_ml: 0,
      remifentanilTotalRemaining_ml: 0,
      remifentanilRate_mlperh: 0,
      remifentanilBolusDose_ml: 0.2,
      remifentanilBolusRate_mlperh: 0.2,
      remifentanilControlMode: 'Off',
      remifentanilControlCe_mcgperml: 0,
      remifentanilControlCp_mcgperml: 0,
      remifentanilControlRate_mcgperkgpermin: 0,
      remifentanilControlConcentration_mcgperml: 0.02,
      remifentanilControlTIVASetpoint_mlperh: 50,
      remifentanilControlTCIPSetpoint_mcgperml: 3.0,
      remifentanilControlTCIESetpoint_mcgperml: 3.0,
      remifentanilControlAUTOSetpoint_index: 50.0,

      doh_index: 50
    };
    jxTableMergeDeep(this.state,config);
    this.devices = [ 
      new jxParamSimulator('temp_degc',this.state),
      new jxParamSimulator('hr_permin',this.state),
      new jxParamSimulator('spo2_percent',this.state),
      new jxParamSimulator('bpSys_mmhg',this.state),
      new jxParamSimulator('bpDia_mmhg',this.state),
      new jxParamSimulator('ecgRAmp',this.state),
      new jxParamSimulator('ecgTAmp',this.state),
    ];
  }
  step (cur_t) {
    this.state['elapsed']=cur_t;
    for (var i=0;i<this.devices.length;i++) 
      this.devices[i].step(this.state);
  }
}



class jxPumpController {
  constructor (prefix,config) {
    this.prefix = prefix;
    this.dt = config[prefix+'Timestep']||1.0;
    this.pk = new jxPK(prefix,config);
    // this does not belong here
    this.pd = new jxPD(prefix,config);
    this.tci = new jxTCI(prefix,config,this.pk);
    this.tiva = new jxTIVA(prefix,config);
    this.auto = new jxAUTO(prefix,config);
    this.bolus = new jxBolus(prefix,config);
    this.prv_t = -1;
  }
  step (state) {
    var cur_t = state['elapsed'];
    var prv_t = this.prv_t;
    if (prv_t==-1) prv_t=cur_t;
    var mode = state[this.prefix + 'Mode']||"Off";
    var conc = state[this.prefix+'Concentration'];
    var weight = state['weight'];
    while (prv_t<cur_t) {
      this.pk.step(state);
      this.pd.step(state);
      this.tci.step(state);
      this.tiva.step(state);
      this.auto.step(state);
      this.bolus.step(state);
      var rate = (mode=='Off'?0:Math.max(
        state[this.prefix + 'BolusRate'],
        state[this.prefix + mode + 'Rate']
      ));
      state[this.prefix + 'Rate']=rate;
      state[this.prefix + 'Rate2']= (rate*1000.0*conc)/(60.0*weight);
      prv_t = prv_t+this.dt;
    }
    this.prv_t=prv_t;
  }
}

// pump simulator
// Note: this is only capable of manual infusion, knows nothing about patient
// All PK/PD/closed-loop is in separate controller

class jxPumpSimulator {
  constructor (prefix,config) {
    this.prefix = prefix;
    this.mode = config[this.prefix+'Mode']||"Off";  
    this.bolusRemaining_ml = 0;
    this.prv_t = -1;
  }
  step (state) {
    var cur_t = state['elapsed_s'];
    var prv_t = this.prv_t;
    if (prv_t==-1) prv_t=cur_t;
    var prv_mode = this.mode;
    this.mode = state[this.prefix+'Mode']||'Off';
    var rate_mlperh = state[this.prefix+'RateSet_mlperh']||0;
    var total_ml=state[this.prefix+'Total_ml']||0.0;
    var totalRemaining_ml=state[this.prefix+'TotalRemaining_ml'];
    var delta_ml = 0;
    switch (this.mode) {
      case "On":
        delta_ml = rate_mlperh * (cur_t-prv_t)/3600.0;
        if (totalRemaining_ml<=0) this.mode='Empty';
        break;
      case "FixedBolus":
        var bolusRate_mlperh = state[this.prefix+'BolusRateSet_mlperh']||600.0;
        if (prv_mode!='FixedBolus') { 
          var bolusDose_ml = state[this.prefix+'BolusDose_ml']||2.0;
          this.bolusRemaining_ml = bolusDose_ml;
        }
        delta_ml= bolusRate_mlperh * (cur_t-prv_t)/3600.0;
        this.bolusRemaining_ml-=delta_ml;
        if (this.bolusRemaining_ml<=0) this.mode='On';
        break;
      case "ContBolus":
        var bolusRate_mlperh = state[this.prefix+'BolusRateSet_mlperh']||600.0;
        delta_ml= bolusRate_mlperh * (cur_t-prv_t)/3600.0;
        break;
    }
    delta_ml = Math.min(delta_ml,totalRemaining_ml);
    totalRemaining_ml-=delta_ml;
    if (totalRemaining_ml<=0) this.mode='Off';
    total_ml+=delta_ml;
    var netrate_mlperh = (cur_t==prv_t?0.0:3600.0*delta_ml/(cur_t-prv_t));
    state[this.prefix+'Rate_mlperh']=netrate_mlperh;
    state[this.prefix+'Total_ml']=total_ml;
    state[this.prefix+'TotalRemaining_ml']=totalRemaining_ml;
    state[this.prefix+'Mode']=this.mode;
    if (netrate_mlperh!=0) {
      state[this.prefix+'TimeToEmpty_s']=3600.0*totalRemaining_ml/netrate_mlperh;
    } else {
      state[this.prefix+'TimeToEmpty_s']=-1;
    }
    this.prv_t=cur_t;
  }
}


class jxTCI {
  constructor (prefix,config,pk) {
    this.prefix = prefix;
    this.pk = pk;
  }
  virtualmodel (vm1,vm2,vm3,vm4,t) {
    var vmf1 = (this.pk.l1*t>100.0?0.0:Math.exp(-this.pk.l1*t)); 
    var vmf2 = (this.pk.l2*t>100.0?0.0:Math.exp(-this.pk.l2*t)); 
    var vmf3 = (this.pk.l3*t>100.0?0.0:Math.exp(-this.pk.l3*t)); 
    var vmf4 = (this.pk.l4*t>100.0?0.0:Math.exp(-this.pk.l4*t)); 
    return vm1*vmf1 + vm2*vmf2 + vm3*vmf3 + vm4*vmf4;
  }
  aux (rate,t1,t2,t3,t4,t) { 
    return this.virtualmodel(t1,t2,t3,t4,t) + this.pk.eudf[t] + rate;
  }
  findpeak (ct,rate,t1,t2,t3,t4) {
    var current_time = ct;
    var current = this.aux(rate,t1,t2,t3,t4,ct);
    var earlier = this.aux(rate,t1,t2,t3,t4,ct-1);
    var later = this.aux(rate,t1,t2,t3,t4,ct+1);
    while (true) {
      if (!(current<earlier||current<later)) return current_time;
        else if ((current<earlier)&&(current_time==this.pk.deltaseconds)) return current_time;
          else {
            var new_current_time = (current<earlier?current_time-1:current_time+1);
            var new_current = (current<earlier?earlier:later);
            var new_earlier = (current<earlier?this.aux(rate,t1,t2,t3,t4,current_time):current);
            var new_later = (current<earlier?current:this.aux(rate,t1,t2,t3,t4,current_time+1));
            current_time = new_current_time;
            current = new_current;
            earlier = new_earlier;
            later = new_later;
          }
    }
  }
  pStep (state,setpoint0) {
    var conc = state[this.prefix+'Concentration']||1.0;
    var setpoint = setpoint0||state[this.prefix+'TCIPSetpoint']||1.0;
    var maxrate = state[this.prefix+'TCIMaxRate']||600.0;
    if (maxrate>600) { maxrate = 600; }
    var rate_amt;
    if (this.pk.ps1==0) {
      rate_amt = setpoint/this.pk.pudf[this.pk.deltaseconds];
    } else {
      var tmp = this.virtualmodel(this.pk.ps1,this.pk.ps2,this.pk.ps3,0.0,this.pk.deltaseconds);
      rate_amt = (setpoint>tmp?(setpoint-tmp)/this.pk.pudf[this.pk.deltaseconds]:0.0);
    }
    state[this.prefix+'TCIPRate']=Math.min(maxrate,(rate_amt*3600)/conc);
  }
  eStep (state) {
    var conc = state[this.prefix+'Concentration']||1.0;
    var setpoint = state[this.prefix+'TCIESetpoint']||1.0;
    var maxrate = state[this.prefix+'TCIMaxRate']||600.0;
    var t1 = this.pk.es1; var t2 = this.pk.es2;
    var t3 = this.pk.es3; var t4 = this.pk.es4;
    if (Math.abs(setpoint-(t1+t2+t3+t4))<0.05*setpoint) {
      return this.pStep(state,setpoint);
    } else {
      var rate_amt;
      if (this.pk.ps1==0) {
        this.pk.priorpeaktime = this.pk.peaktime;
        rate_amt = setpoint / this.pk.eudf[this.pk.peaktime];
      } else if (this.virtualmodel(t1,t2,t3,t4,this.pk.deltaseconds)>setpoint) {
        rate_amt = 0;
      } else {
        var mindif = 0.001 * setpoint;
        var first_peak = (this.pk.priorpeaktime<=this.pk.deltaseconds?
                           this.pk.deltaseconds+1:this.pk.priorpeaktime)
        var first_rate = setpoint - this.virtualmodel(t1,t2,t3,t4,first_peak);
        var rate = first_rate;
        var temp_peak = this.findpeak(first_peak,first_rate,t1,t2,t3,t4);
        var current = this.virtualmodel(t1,t2,t3,t4,first_peak) + first_rate*this.pk.eudf[first_peak];
        var done = false;
        while (!done) {
          if (Math.abs(current-setpoint)<mindif) {
            this.pk.priorpeaktime =  temp_peak;
            rate_amt = (rate>0?rate:0.0);
            done = true; 
          } else {
            var tmp = this.virtualmodel(t1,t2,t3,t4,temp_peak);
            var tmp2 = this.pk.eudf[temp_peak];
            current = tmp + rate*tmp2;
            temp_peak = this.findpeak(temp_peak,rate,t1,t2,t3,t4);
            rate = (setpoint-tmp)/tmp2;
          }
        }
      }
      state[this.prefix+'TCIERate']=Math.min(maxrate,(rate_amt*3600)/conc);
    }
  }
  step (state) {
    this.pStep(state);
    this.eStep(state);
  }
}


class jxTIVA {
  constructor (prefix, config) {
    this.prefix = prefix;
  }
  step(state) {
    var sp_ugperkgpermin = state[this.prefix + 'TIVASetpoint']
    var conc_mgperml = state[this.prefix + 'Concentration'];
    var weight_kg = state['weight'];
    var newrate_mlperh = (sp_ugperkgpermin * 60.0 * weight_kg) / (conc_mgperml * 1000.0);
    state[this.prefix + 'TIVARate']=newrate_mlperh;
  }
}

// EEG Simulator

var patient = null;
var serial = null;

var mode = 0;
var freq = 0;
var ampl = 0;

function setMode(m) {
  mode = m;
  patient.devices[0].mode=m;
  patient.devices[1].mode=m;
  if (serial.device) serial.device.send('M'+m);
}

function setFreq(f) {
  freq = f;
  patient.devices[0].w=2*Math.PI*f;
  patient.devices[1].w=2*Math.PI*f;
  if (serial.device) serial.device.send('F'+f);
}

function setAmpl(a) {
  ampl = a;
  patient.devices[0].scale = a;
  patient.devices[1].scale = a;
  if (serial.device) serial.device.send('G'+a);
}

function makeEEGSIM(id) {
  var objs = [];
  var wf = jxMakeWaveform({
    "id": "eeg",
    "type": "wave",
    "axis": ["L","R"],
    "color": "orange",
    "ymax": 1.0,
    "label": "EEG",
    "unit": "uV"
  });
  objs.push(wf);
  var mode = jxMakeToggleBar({
    "id": id + "-mode",
    "entries": ["EEG","SINE"],
    "default": "EEG",
    "callback": function (i) { setMode(i) }
  });
  jxStyle(mode,'max-height',"60px");
  var w1 = jxMakeWheel({
    "id": id+'-fset',
    "entries": [ '1.0','2.0','3.0','4.0','5.0','6.0','7.0','8.0','9.0','10.0',
                 '11.0','12.0','13.0','14.0','15.0','16.0','17.0','18.0','19.0','20.0'],
    "default": '10.0',
    "font-size": '32px',
    "background": jxPal(0.15).hex(),
    "callback": function (i) { setFreq(1.0+i*1.0); }
  });
  jxStyle(w1,'border-top','1px solid '+jxPal(0.2).hex());
  var w1o = jxLegendLeftOverlay(w1, {
    "top": "FREQ",
    "bottom": "Hz"
  });
  jxStyle(w1o,'max-height',"120px");
  objs.push(w1o);
  var w2 = jxMakeWheel({
    "id": id+'-gset',
    "entries": [ '10','20','30','40','50','60','70','80','90','100'],
    "default": '30',
    "font-size": '32px',
    "background": jxPal(0.15).hex(),
    "callback": function (i) { setAmpl(0.1+i*0.1); }
  });
  jxStyle(w2,'border-top','1px solid '+jxPal(0.2).hex());
  var w2o = jxLegendLeftOverlay(w2, {
    "top": "AMPL",
    "bottom": "uV"
  });
  jxStyle(w2o,'max-height',"120px");
  objs.push(w2o);
  objs.push(mode);
  var o = jxMakeRows({
    "id": id,
    "children": objs
  });
  return o;
}

function runPatientSlow() {
}

function runPatientFast() {
  var tcb = jxWaveformAdd('eeg',
      patient.state['eeg1WaveformFiltered'],
      patient.state['eeg2WaveformFiltered']
    );
  if (tcb) tcb(patient.state['elapsed_s']);
}

function makePatient () {
 patient = new jxPatient({
   "state": {
   },
   "devices": [
      new jxEEGSimulator('eeg1',{}),
      new jxEEGSimulator('eeg2',{})
   ],
   "filters": [
     new jxWaveformFilter('eeg1',{}),
     new jxWaveformFilter('eeg2',{})
   ],
   "slowHandler": runPatientSlow,
   "fastHandler": runPatientFast,
  });
  setMode(0);
  setFreq(10.0);
  setAmpl(0.3);
  setInterval(function() { if (patient) patient.step() },100);
}

function boot() {
  jxInit({
    "max-ar": 0.6
  });
  serial = new jxWebUSBSerial();
  var connect = jxMakeButton({
    "id": "connect",
    "label": "icons/connect.svg",
    "height": "calc(100% - 2px)",
    "width": "60px",
    "title": "CONNECT",
    "callback": function () {
       if (!serial.device)  {
         serial.requestPort();
       } else {
         serial.device.device_.close();
         serial = new jxWebUSBSerial();
       }
    }
  });
  var mb = jxMakeMenubar({
   "id": "menubar",
   "title": "icons/eegsim.svg",
   "font-size": "32px",
   "right": connect
  });
  var ui = makeEEGSIM('eegsim');
  var o = jxMakeRows({
    "id": 'content',
    "children": [mb,ui]
  });
  jxStyle(o,'height','100%');
  jxAppend(o);
  makePatient();
}

window.addEventListener( 'load', boot );

