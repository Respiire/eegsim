// EEGSIM Web Application

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

