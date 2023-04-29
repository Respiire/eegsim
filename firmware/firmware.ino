/* EEGSIM Interface */

#include <Arduino.h> 

#include "Adafruit_TinyUSB.h"

// USB WebUSB object
Adafruit_USBD_WebUSB usb_web;

// Landing Page: scheme (0: http, 1: https), url
WEBUSB_URL_DEF(landingPage, 1, "console.respiire.com");

#define FIRMWARE_TYPE "EEGSIM"
#define FIRMWARE_VERSION "1.1"

int mode = 0;
float dt = 1.0/256.0;
float p = 0.0;
float w = 2.0 * M_PI * 2.5;
float g = 1.0;

int eeg1 = 127;
int eeg2 = 127;

// ---------

int pwm_pin1 = 6;
int pwm_pin2 = 7;

void setup_pwm() {
  pinMode(pwm_pin1,OUTPUT);
  pinMode(pwm_pin2,OUTPUT);
  analogWrite(pwm_pin2,127);
  analogWrite(pwm_pin1,127);
}

// ---------
// sine wave 

void sine () {
  p+=w*dt;
  eeg1 = (int)(127.0 + 127.0*g*sin(p) + 0.5);
  eeg2 = (int)(127.0 + 127.0*g*cos(p) + 0.5);
}

// ---------
// SimplexNoise1234
// Copyright 2003-2011, Stefan Gustavson, stegu@itn.liu.se
//
// This library is public domain software, released by the author
// into the public domain in February 2011. You may do anything
// you like with it. You may even remove all attributions,
// but of course I'd appreciate it if you kept my name somewhere.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

static unsigned char perm1[512] = {151,160,137,91,90,15,
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
  138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180,
  151,160,137,91,90,15, 131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,
  8,99,37,240,21,10,23,190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,
  35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,
  134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,
  55,46,245,40,244,102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,
  18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,
  250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,
  189,28,42,223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,
  172,9,129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
  251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
  49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
  138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180};

unsigned char perm2[512] = {
418,466,69,410,390,268,361,264,141,257,5,384,433,95,283,183,136,218,453,58,435,
40,328,34,500,402,217,374,424,284,139,288,127,247,39,150,474,151,18,181,412,110,
334,385,45,209,170,80,320,41,347,304,92,122,313,392,17,467,93,411,341,0,43,44,369,
485,102,66,396,480,178,335,232,6,414,315,224,443,87,166,340,345,245,423,440,211,129,
21,174,342,7,261,29,312,131,505,75,295,255,78,441,241,290,235,199,421,259,455,478,
23,378,120,387,108,426,155,203,50,162,456,362,256,445,488,94,349,293,389,432,210,
475,322,490,208,96,339,509,499,258,64,303,160,300,195,202,398,1,207,182,428,49,8,
89,229,250,431,270,377,98,194,9,26,201,86,333,185,172,492,76,375,363,381,106,439,
119,393,54,263,495,193,36,179,38,142,103,408,180,401,397,249,71,296,332,196,451,355,
496,90,415,482,251,477,260,83,140,394,292,416,215,502,113,275,132,298,31,15,213,399,
126,57,111,459,326,436,307,508,101,294,383,484,447,147,104,30,216,461,226,13,253,489,
344,472,205,479,153,222,230,348,146,197,237,305,125,487,52,323,73,46,491,280,97,360,
184,507,123,407,25,464,143,242,168,171,463,16,506,3,448,391,100,285,430,409,278,376,
158,359,400,157,380,367,37,510,77,114,121,324,149,266,302,317,504,314,82,227,336,169,
405,420,458,223,427,159,354,152,206,233,190,11,252,186,88,154,35,444,281,47,419,325,
473,33,246,192,370,365,219,481,379,346,198,364,351,163,107,279,503,494,177,272,331,
373,442,476,462,238,350,51,161,449,145,282,70,297,468,372,53,187,289,67,382,404,403,
287,91,452,311,12,32,220,271,417,276,413,277,234,460,28,204,212,498,366,79,274,483,
327,438,254,137,164,321,72,4,188,386,371,133,358,425,486,422,450,330,48,22,343,301,
74,470,429,99,497,189,165,240,134,395,124,65,319,27,2,24,148,167,200,56,128,406,388,
20,353,306,116,357,262,63,299,356,286,244,469,84,214,368,60,68,318,130,248,19,310,85,
446,14,309,273,105,228,511,493,62,138,191,465,236,231,454,81,471,173,501,269,267,437,
337,135,265,144,239,109,117,225,55,61,175,115,221,243,338,329,434,59,42,10,156,352,
112,457,308,176,316,118,291 };

float  grad1d( int hash, float x ) {
  int h = hash & 15;
  float grad = 1.0f + (h & 7);  
  if (h&8) grad = -grad;         
  return ( grad * x );           
}

#define FASTFLOOR(x) ( ((x)>0) ? ((int)x) : (((int)x)-1) )

float noise1(float x) {
  int i0 = FASTFLOOR(x);
  int i1 = i0 + 1;
  float x0 = x - i0;
  float x1 = x0 - 1.0f;
  float n0, n1;
  float t0 = 1.0f - x0*x0;
  t0 *= t0;
  n0 = t0 * t0 * grad1d(perm1[i0 & 0xff], x0);
  float t1 = 1.0f - x1*x1;
  t1 *= t1;
  n1 = t1 * t1 * grad1d(perm1[i1 & 0xff], x1);
  return 0.25f * (n0 + n1);
}

float noise2(float x) {
  int i0 = FASTFLOOR(x);
  int i1 = i0 + 1;
  float x0 = x - i0;
  float x1 = x0 - 1.0f;
  float n0, n1;
  float t0 = 1.0f - x0*x0;
  t0 *= t0;
  n0 = t0 * t0 * grad1d(perm2[i0 & 0xff], x0);
  float t1 = 1.0f - x1*x1;
  t1 *= t1;
  n1 = t1 * t1 * grad1d(perm2[i1 & 0xff], x1);
  return 0.25f * (n0 + n1);
}

void noise () {
  p+=0.25*w*dt;
  eeg1 = (int)(127.0 + 127.0*g*noise1(p) + 0.5);
  eeg2 = (int)(127.0 + 127.0*g*noise2(p) + 0.5);
}

// ---------

void line_state_callback(bool connected)
{
}

void setup_usb_web() {
  usb_web.setLandingPage(&landingPage);
  usb_web.setLineStateCallback(line_state_callback);
  usb_web.begin();
  while( !USBDevice.mounted() ) delay(1);
}

// ---------
  
String readString = "";

void setup() {
  setup_pwm();
  setup_usb_web();
}

uint32_t prv_t = 0;

void loop() {
  String valstr;
  int vali;
  float valf;
  while (usb_web.available()) {
    char c = usb_web.read();
    readString += c;
  }
  if (readString.length() > 0) {
    switch (readString[0]) {
       case 'M': // set mode
         vali=readString[1]-'0';
         if (vali==0||vali==1) mode=vali;
         usb_web.printf("M%i\n",mode);
         break;
       case 'F': // set freq
        if (readString.length() > 1) {
           valstr = readString.substring(1);
           valf = valstr.toFloat(); 
           if (valf>0&&valf<=30) w = 2.0*M_PI*(float)valf;
        }
        usb_web.printf("F%f\n",w/(2.0*M_PI));
        break;
      case 'G': // set gain
        if (readString.length() > 1) {
           valstr = readString.substring(1);
           valf = valstr.toFloat(); 
           if (valf>=0&&valf<=1.0) g = valf;
        }
        usb_web.printf("G%f\n",g);
        break;
      case 'V': // show version
        usb_web.printf("V%s ver. %s\n",FIRMWARE_TYPE,FIRMWARE_VERSION);
        break;
      case '?': // show help
        usb_web.printf("?%s ver. %s\n",FIRMWARE_TYPE,FIRMWARE_VERSION);
        usb_web.println("?M<0|1> : set mode (0 = noise, 1 = sine)");
        usb_web.println("?F<float> : set frequency in Hz");
        usb_web.println("?G<float> : set gain (0-1)");
        usb_web.println("?V : print version");
        usb_web.println("?? : print this message");
        break;
    }
    readString="";    
  }
  uint32_t cur_t = millis();
  if (cur_t-prv_t>=4) {
    if (mode==0) noise(); else sine();
    analogWrite(pwm_pin1,eeg1);
    analogWrite(pwm_pin2,eeg2);
    prv_t = cur_t; 
  } 
}
 
