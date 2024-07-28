logColor = (text, color = 'green') => {
  if (typeof text === 'object') text = JSON.stringify(text, null, 3);
  const style = `background: ${color}`;
  console.log(`%c${text}`, style)
}
var horizontalReductionF = 0.7;
var shouldSpawnDetector = true;
var ROAD_CONV_2 = {
  0: 6,
  1: 7,
  2: 8,
  3: 9,
  4: 10,
  5: 11,
};

var ROAD_CONV_3 = {
  0: 12,
  1: 13,
  2: 14,
  3: 15,
  4: 16,
  5: 17,
};


//#############################################################
// general ui settings
//#############################################################

const userCanDropObjects = true;
var showCoords = true; // show logical coords of nearest road to mouse pointer
// definition => showLogicalCoords(.) in canvas_gui.js

//#############################################################
// general debug settings (set=false for public deployment)
//#############################################################

drawVehIDs = false; // override control_gui.js
drawRoadIDs = true; // override control_gui.js
var debug = false;
var crashinfo = new CrashInfo();

//#############################################################
// adapt/override most relevant settings
// including standard param settings from control_gui.js
//#############################################################

// button/choicebox controlled vars

// callback "changeTrafficRules needs ready roads etc->not here
var trafficRuleIndex = 2; // {priority,symmetric,traffic lights}
var cycleTL = 50; // 50 seconds
var greenMain = 33; //33
var dt_lastSwitch = 0;

var nLanes_main = 2;
var nLanes_sec = 2;
var laneCount = nLanes_main + nLanes_sec;

// slider-controlled vars definined in control_gui.js

qIn = 600 / 3600; // 390 inflow to both directional main roads
q2 = 0 / 3600; // 220 inflow to secondary (subordinate) roads
fracRight = 0; // fracRight [0-1] of drivers on road 2 turn right
fracLeft = 0; // rest of q2-drivers cross straight ahead

IDM_v0 = 15;
IDM_a = 2.0;
IDM_T = 1.0;
timewarp = 3.5;
var mainroadLen = 175 * horizontalReductionF; // reference size in m

var laneWidth = 3.0;
var car_length = 5; // car length in m (all a bit oversize for visualisation)
var car_width = 2.5; // car width in m
var truck_length = 10;
var truck_width = 3;

// ###################################################
commaDigits = 0;

/* setSlider(slider_qIn, slider_qInVal, 3600 * qIn, commaDigits, "veh/h");
setSlider(slider_q2, slider_q2Val, 3600 * q2, commaDigits, "veh/h");
setSlider(slider_IDM_v0, slider_IDM_v0Val, 3.6 * IDM_v0, 0, "km/h");
setSlider(slider_IDM_a, slider_IDM_aVal, IDM_a, 1, "m/s<sup>2</sup>");
setSlider(slider_IDM_T, slider_IDM_TVal, IDM_T, 1, "s");
setSlider(slider_timewarp, slider_timewarpVal, timewarp, 1, " times");
setSlider(slider_fracRight, slider_fracRightVal, 100 * fracRight, 0, " %");
if (typeof slider_fracLeft != "undefined") {
  setSlider(slider_fracLeft, slider_fracLeftVal, 100 * fracLeft, 0, " %");
} */
logColor('should be setting sliders from old way ...')

fracTruck = 0.05;

/*######################################################
 Global overall scenario settings and graphics objects
  NOTICE: canvas has strange initialization of width=300 in firefox 
  and DOS when try sizing in css (see there) only => always works following:
  document.getElementById("contents").clientWidth; .clientHeight;
######################################################*/

var scenarioString = "Intersection";

var simDivWindow = document.getElementById("contents");
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d"); // graphics context
canvas.width = simDivWindow.clientWidth;
canvas.height = simDivWindow.clientHeight;

console.log("before addTouchListeners()");
addTouchListeners();
console.log("after addTouchListeners()");

// init overall scaling (if fitfactor>1 => road begins/ends visible)

var fitfactor = 3.1;
var refSizePhys = (fitfactor * mainroadLen * canvas.height) / canvas.width;
var isSmartphone = mqSmartphone(); // from css; only influences text size

// these two must be updated in updateDimensions (aspectRatio != const)

var refSizePix = canvas.height; // corresponds to pixel size of smaller side
var scale = refSizePix / refSizePhys; // global scale

var aspectRatio = canvas.width / canvas.height;

var hasChanged = true; // window dimensions have changed

function updateDimensions() {
  // if viewport->canvas or sizePhys changed

  refSizePix = canvas.height; // corresponds to pixel size of smaller side
  scale = refSizePix / refSizePhys;

  if (true) {
    console.log(
      "updateDimensions: canvas.width=",
      canvas.width,
      " canvas.height=",
      canvas.height,
      " aspectRatio=",
      aspectRatio.toFixed(2),
      " isSmartphone=",
      isSmartphone,
      " "
    );
  }
}

//####################################################################
// Global graphics specification
//####################################################################

var drawBackground = true; // if false, default unicolor background
var drawRoad = true; // if false, only vehicles are drawn
var vmin_col = 0; // for the speed-dependent color-coding of vehicles
var vmax_col = 0.7 * IDM_v0;

//####################################################################
// Images
//####################################################################

// init background image

var background = new Image();
background.src = "figs/backgroundGrass.jpg";

// init vehicle image(s)

carImg = new Image();
carImg.src = "figs/blackCarCropped.gif";
truckImg = new Image();
truckImg.src = "figs/truck1Small.png";

// init traffic light images

traffLightRedImg = new Image();
traffLightRedImg.src = "figs/trafficLightRed_affine.png";
traffLightGreenImg = new Image();
traffLightGreenImg.src = "figs/trafficLightGreen_affine.png";

//define obstacle image names

obstacleImgNames = []; // srcFiles[0]='figs/obstacleImg.png'
obstacleImgs = []; // srcFiles[0]='figs/obstacleImg.png'
for (var i = 0; i < 10; i++) {
  obstacleImgs[i] = new Image();
  obstacleImgs[i].src =
    i == 0 ? "figs/obstacleImg.png" : "figs/constructionVeh" + i + ".png";
  obstacleImgNames[i] = obstacleImgs[i].src;
}

// init road images for 1 to 4 lanes

roadImgWith_lane = []; // road with lane separating line
roadImgWithout_lane = []; // road without lane separating line

for (var i = 0; i < 4; i++) {
  roadImgWith_lane[i] = new Image();
  roadImgWith_lane[i].src = "figs/road" + (i + 1) + "lanesCropWith.png";
  roadImgWithout_lane[i] = new Image();
  roadImgWithout_lane[i].src = "figs/road" + (i + 1) + "lanesCropWithout.png";

  console.log("i=", i, " roadImgWith_lane[i].src=", roadImgWith_lane[i].src);
}

//##################################################################
//<NETWORK>
// Specification of physical road network and vehicle geometry
// If viewport or refSizePhys changes => updateDimensions();
//##################################################################

// all relative "Rel" settings with respect to refSizePhys, not refSizePix!

var center_xRel = 0.5; // 0: left, 1: right
var center_yRel = -0.5; // -1: bottom; 0: top
var center_xPhys = center_xRel * refSizePhys * aspectRatio * 0.33; //[m]
var center_xPhys_2 = center_xPhys + mainroadLen; //[m]
var center_xPhys_3 = center_xPhys_2 + mainroadLen; //[m]
var center_yPhys = center_yRel * refSizePhys;

defineGeometricVariables(nLanes_main, nLanes_sec);

//#########################################################
// def main trajectories
//#########################################################

function traj0_x(u, alternateCenter) {
  if (alternateCenter != undefined && !isNaN(alternateCenter)) {
    return alternateCenter + u - 0.5 * road0Len;
  }
  // physical coordinates
  return center_xPhys + u - 0.5 * road0Len;
}
function traj0_y(u) {
  return center_yPhys - offsetMain;
}

function traj1_x(u, alternateCenter) {
  if (alternateCenter != undefined && !isNaN(alternateCenter)) {
    return alternateCenter - (u - 0.5 * road0Len);
  }
  // physical coordinates
  return center_xPhys - (u - 0.5 * road0Len);
}
function traj1_y(u) {
  return center_yPhys + offsetMain;
}

function traj2_x(u, alternateCenter) {
  if (alternateCenter != undefined && !isNaN(alternateCenter)) {
    return alternateCenter + offsetSec;
  }
  return center_xPhys + offsetSec;
}
function traj2_y(u) {
  return center_yPhys - offset20Target - radiusRight - road2Len + u;
}

function traj3_x(u, alternateCenter) {
  if (alternateCenter != undefined && !isNaN(alternateCenter)) {
    return alternateCenter + offsetSec;
  }
  return center_xPhys + offsetSec;
}
function traj3_y(u) {
  return center_yPhys - offset20Target - radiusRight + u;
}

function traj4_x(u, alternateCenter) {
  if (alternateCenter != undefined && !isNaN(alternateCenter)) {
    return alternateCenter - offsetSec;
  }
  return center_xPhys - offsetSec;
}
function traj4_y(u) {
  return center_yPhys + offset20Target + radiusRight + road4Len - u;
}

function traj5_x(u, alternateCenter) {
  if (alternateCenter != undefined && !isNaN(alternateCenter)) {
    return alternateCenter - offsetSec;
  }
  return center_xPhys - offsetSec;
}
function traj5_y(u) {
  return center_yPhys + offset20Target + radiusRight - u;
}

var traj = [
  [traj0_x, traj0_y], // 0
  [traj1_x, traj1_y], // 1
  [traj2_x, traj2_y], // 2
  [traj3_x, traj3_y], // 3
  [traj4_x, traj4_y], // 4
  [traj5_x, traj5_y], // 5
  //
  [(u) => traj0_x(u, center_xPhys_2), traj0_y], // 6
  [(u) => traj1_x(u, center_xPhys_2), traj1_y], // 7
  [(u) => traj2_x(u, center_xPhys_2), traj2_y], // 8
  [(u) => traj3_x(u, center_xPhys_2), traj3_y], // 9
  [(u) => traj4_x(u, center_xPhys_2), traj4_y], // 10
  [(u) => traj5_x(u, center_xPhys_2), traj5_y], // 11
  //
  [(u) => traj0_x(u, center_xPhys_3), traj0_y], // 12
  [(u) => traj1_x(u, center_xPhys_3), traj1_y], // 13
  [(u) => traj2_x(u, center_xPhys_3), traj2_y], // 14
  [(u) => traj3_x(u, center_xPhys_3), traj3_y], // 15
  [(u) => traj4_x(u, center_xPhys_3), traj4_y], // 16
  [(u) => traj5_x(u, center_xPhys_3), traj5_y], // 17
];

//#################################################################
// special trajectories for the right turns on the target roads 0,1,3,5
// routes 20,41,13,05
//#################################################################

// special traj as template for the route 20 for road 0

// dr=difference between target road center and center of target lane
// since traj always with resp to road center but I want r with resp to
// single-lane right turn (target since special lane atatched to target)

function trajRight_x(u, dr) {
  var urel = u - u20Target; // long coord target relative to start of transition

  // center of the arc for the right turn from right to right lane

  var x0 = center_xPhys + offset20Source + radiusRight;
  var y0 = center_yPhys - offset20Target - radiusRight;

  // dr=distance of target lane (right) to target road axis

  // case distinction since for veh rotation u-vehLen/2 relevant)

  var x =
    urel < 0
      ? x0 - (radiusRight + dr)
      : x0 - (radiusRight + dr) * Math.cos(urel / radiusRight);

  if (false) {
    console.log(
      "traj0_20x: t=",
      time.toFixed(2),
      " umin=",
      road0.trajAlt[0].umin.toFixed(1),
      " umax=",
      road0.trajAlt[0].umax.toFixed(1),
      " u=",
      u.toFixed(1),
      " urel=",
      urel,
      " x0=",
      x0,
      " traj2_x(0)=",
      traj2_x(0)
    );
  }
  return x;
}

function trajRight_x_2(u, dr) {
  var urel = u - u20Target; // long coord target relative to start of transition

  // center of the arc for the right turn from right to right lane

  var x0 = center_xPhys_2 + offset20Source + radiusRight;
  var y0 = center_yPhys - offset20Target - radiusRight;

  // dr=distance of target lane (right) to target road axis

  // case distinction since for veh rotation u-vehLen/2 relevant)

  var x =
    urel < 0
      ? x0 - (radiusRight + dr)
      : x0 - (radiusRight + dr) * Math.cos(urel / radiusRight);

  if (false) {
    console.log(
      "traj0_20x: t=",
      time.toFixed(2),
      " umin=",
      road0.trajAlt[0].umin.toFixed(1),
      " umax=",
      road0.trajAlt[0].umax.toFixed(1),
      " u=",
      u.toFixed(1),
      " urel=",
      urel,
      " x0=",
      x0,
      " traj2_x(0)=",
      traj2_x(0)
    );
  }
  return x;
}

function trajRight_x_3(u, dr) {
  var urel = u - u20Target; // long coord target relative to start of transition

  // center of the arc for the right turn from right to right lane

  var x0 = center_xPhys_3 + offset20Source + radiusRight;
  var y0 = center_yPhys - offset20Target - radiusRight;

  // dr=distance of target lane (right) to target road axis

  // case distinction since for veh rotation u-vehLen/2 relevant)

  var x =
    urel < 0
      ? x0 - (radiusRight + dr)
      : x0 - (radiusRight + dr) * Math.cos(urel / radiusRight);

  if (false) {
    console.log(
      "traj0_20x: t=",
      time.toFixed(2),
      " umin=",
      road0.trajAlt[0].umin.toFixed(1),
      " umax=",
      road0.trajAlt[0].umax.toFixed(1),
      " u=",
      u.toFixed(1),
      " urel=",
      urel,
      " x0=",
      x0,
      " traj2_x(0)=",
      traj2_x(0)
    );
  }
  return x;
}

function trajRight_y(u, dr) {
  // special coordinate for the route 20 for road 0
  var urel = u - u20Target;
  var y0 = center_yPhys - offset20Target - radiusRight;
  var y =
    urel < 0
      ? y0 + urel
      : y0 + (radiusRight + dr) * Math.sin(urel / radiusRight);
  return y;
}

function traj0_20x(u) {
  return trajRight_x(u, offset20Target - offsetMain);
}

function traj0_20x_2(u) {
  return trajRight_x_2(u, offset20Target - offsetMain);
}

function traj0_20x_3(u) {
  return trajRight_x_3(u, offset20Target - offsetMain);
}

function traj0_20y(u) {
  return trajRight_y(u, offset20Target - offsetMain);
}

function traj1_41x(u) {
  return 2 * center_xPhys - traj0_20x(u);
}

function traj1_41x_2(u) {
  return 2 * center_xPhys_2 - traj0_20x_2(u);
}

function traj1_41x_3(u) {
  return 2 * center_xPhys_3 - traj0_20x_3(u);
}

function traj1_41y(u) {
  return 2 * center_yPhys - traj0_20y(u);
}

function traj3_13x(u) {
  return trajRight_x(
    lenRight - u + u20Target + u13Target,
    offset20Source - offsetSec
  );
}

function traj3_13x_2(u) {
  return trajRight_x_2(
    lenRight - u + u20Target + u13Target,
    offset20Source - offsetSec
  );
}

function traj3_13x_3(u) {
  return trajRight_x_3(
    lenRight - u + u20Target + u13Target,
    offset20Source - offsetSec
  );
}
function traj3_13y(u) {
  return (
    2 * center_yPhys -
    trajRight_y(
      lenRight - u + u20Target + u13Target,
      offset20Source - offsetSec
    )
  );
}

function traj5_05x(u) {
  return 2 * center_xPhys - traj3_13x(u);
}

function traj5_05x_2(u) {
  return 2 * center_xPhys_2 - traj3_13x_2(u);
}

function traj5_05x_3(u) {
  return 2 * center_xPhys_3 - traj3_13x_3(u);
}

function traj5_05y(u) {
  return 2 * center_yPhys - traj3_13y(u);
}

//#################################################################
// special trajectories for the left turns on the target roads 0,1,3,5
// routes 40,21,03,15
//#################################################################

// template for the route 21 for road 1

function trajLeftSecMain_x(u, dr) {
  var straightSec = lenLeftSecMain - lenLeft; // first straight, then left turn

  var x0 = center_xPhys + offset21Source - radiusLeft;
  var y0 = center_yPhys + offset21Target - radiusLeft;

  var urel = u - u21Target; // long coord target relative to start of transition

  // dr=distance of target lane (left) to target road axis

  var x =
    urel < straightSec // dr=distance target lane to target road axis
      ? x0 + (radiusLeft + dr)
      : x0 + (radiusLeft + dr) * Math.cos((urel - straightSec) / radiusLeft);
  return x;
}

function trajLeftSecMain_x_2(u, dr) {
  var straightSec = lenLeftSecMain - lenLeft; // first straight, then left turn

  var x0 = center_xPhys_2 + offset21Source - radiusLeft;
  var y0 = center_yPhys + offset21Target - radiusLeft;

  var urel = u - u21Target; // long coord target relative to start of transition

  // dr=distance of target lane (left) to target road axis

  var x =
    urel < straightSec // dr=distance target lane to target road axis
      ? x0 + (radiusLeft + dr)
      : x0 + (radiusLeft + dr) * Math.cos((urel - straightSec) / radiusLeft);
  return x;
}

function trajLeftSecMain_x_3(u, dr) {
  var straightSec = lenLeftSecMain - lenLeft; // first straight, then left turn

  var x0 = center_xPhys_3 + offset21Source - radiusLeft;
  var y0 = center_yPhys + offset21Target - radiusLeft;

  var urel = u - u21Target; // long coord target relative to start of transition

  // dr=distance of target lane (left) to target road axis

  var x =
    urel < straightSec // dr=distance target lane to target road axis
      ? x0 + (radiusLeft + dr)
      : x0 + (radiusLeft + dr) * Math.cos((urel - straightSec) / radiusLeft);
  return x;
}

function trajLeftSecMain_y(u, dr) {
  var straightSec = lenLeftSecMain - lenLeft;
  var y0 = center_yPhys + offset21Target - radiusLeft;
  var urel = u - u21Target;
  var y =
    urel < straightSec // dr=distance target lane to target road axis
      ? y0 + urel - straightSec
      : y0 + (radiusLeft + dr) * Math.sin((urel - straightSec) / radiusLeft);
  return y;
}

// different traj: from main to sec only arc, from sec to main straight
// section needed because secondary road ends before the arc

function trajLeftMainSec_x(u, dr) {
  //  template for 03
  var x0 = center_xPhys + offset21Source - radiusLeft;
  var urel = u - u03Target;
  var x =
    urel < 0 ? x0 + urel : x0 + (radiusLeft + dr) * Math.sin(urel / radiusLeft);
  return x;
}

function trajLeftMainSec_x_2(u, dr) {
  //  template for 03
  var x0 = center_xPhys_2 + offset21Source - radiusLeft;
  var urel = u - u03Target;
  var x =
    urel < 0 ? x0 + urel : x0 + (radiusLeft + dr) * Math.sin(urel / radiusLeft);
  return x;
}

function trajLeftMainSec_x_3(u, dr) {
  //  template for 03
  var x0 = center_xPhys_3 + offset21Source - radiusLeft;
  var urel = u - u03Target;
  var x =
    urel < 0 ? x0 + urel : x0 + (radiusLeft + dr) * Math.sin(urel / radiusLeft);
  return x;
}

function trajLeftMainSec_y(u, dr) {
  //  template for 03
  var y0 = center_yPhys - offset21Target + radiusLeft;
  var urel = u - u03Target;
  var y =
    urel < 0
      ? y0 - (radiusLeft + dr)
      : y0 - (radiusLeft + dr) * Math.cos(urel / radiusLeft);
  return y;
}

function traj1_21x(u) {
  return trajLeftSecMain_x(u, offsetMain - offset21Target);
}

function traj1_21x_2(u) {
  return trajLeftSecMain_x_2(u, offsetMain - offset21Target);
}

function traj1_21x_3(u) {
  return trajLeftSecMain_x_3(u, offsetMain - offset21Target);
}

function traj1_21y(u) {
  return trajLeftSecMain_y(u, offsetMain - offset21Target);
}

function traj0_40x(u) {
  return 2 * center_xPhys - traj1_21x(u);
}

function traj0_40x_2(u) {
  return 2 * center_xPhys_2 - traj1_21x_2(u);
}

function traj0_40x_3(u) {
  return 2 * center_xPhys_3 - traj1_21x_3(u);
}
function traj0_40y(u) {
  return 2 * center_yPhys - traj1_21y(u);
}

function traj3_03x(u) {
  return trajLeftMainSec_x(u, offsetSec - offset21Source);
}

function traj3_03x_2(u) {
  return trajLeftMainSec_x_2(u, offsetSec - offset21Source);
}

function traj3_03x_3(u) {
  return trajLeftMainSec_x_3(u, offsetSec - offset21Source);
}
function traj3_03y(u) {
  return trajLeftMainSec_y(u, offsetSec - offset21Source);
}
//function traj3_03x(u){return trajLeftMainSec_x(u,5);}
//function traj3_03y(u){return trajLeftMainSec_y(u,5);}

function traj5_15x(u) {
  return 2 * center_xPhys - traj3_03x(u);
}

function traj5_15x_2(u) {
  return 2 * center_xPhys_2 - traj3_03x_2(u);
}

function traj5_15x_3(u) {
  return 2 * center_xPhys_3 - traj3_03x_3(u);
}

function traj5_15y(u) {
  return 2 * center_yPhys - traj3_03y(u);
}

// #############################################################3
// road images for the trajectories; 2 images per road/network element
// #############################################################3

var roadImages = [];
for (var ir = 0; ir < traj.length; ir++) {
  roadImages[ir] = [];
  for (var j = 0; j < 2; j++) {
    roadImages[ir][j] = new Image();
  }
}

//##################################################################
// Specification of logical road network: constructing the roads
//##################################################################

fracTruckToleratedMismatch = 1.0; // 1=100% allowed=>changes only by sources
speedInit = 20;
density = 0;
var isRing = false;
var roadIDs = this.traj.map((val, i) => i);
// var roadIDs = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
let buildRoute = (...args /* : number[] */) => {
  const built = [];
  args.forEach((val) => built.push(roadIDs[val]));
  return built;
};

var route0_12 = buildRoute(0, 6, 12); // mainE-straight
var route13_1 = buildRoute(13, 7, 1); // mainW-straight

var route0_5 = buildRoute(0, 5); // mainE-right
var route0_11 = buildRoute(0, 6, 11); // mainE-right
var route0_17 = buildRoute(0, 6, 12, 17); // mainE-right

var route0_3 = buildRoute(0, 3); // mainE-left
var route0_9 = buildRoute(0, 6, 9); // mainE-left
var route0_15 = buildRoute(0, 6, 12, 15); // mainE-left

var route13_15 = buildRoute(13, 15); // mainW-right
var route13_9 = buildRoute(13, 7, 9); // mainW-right
var route13_3 = buildRoute(13, 7, 1, 3); // mainW-right

var route13_5 = buildRoute(13, 7, 1, 5); // mainW-left
var route13_11 = buildRoute(13, 7, 11); // mainW-left
var route13_17 = buildRoute(13, 17);

// Primeiro cruzamento de baixo pra cima
var route2_12 = buildRoute(2, 0, 6, 12);
var route2_1 = buildRoute(2, 1);
var route2_3 = buildRoute(2, 3);

// Primeiro cruzamento de cima pra baixo
var route4_12 = buildRoute(4, 0, 6, 12);
var route4_1 = buildRoute(4, 1);
var route4_5 = buildRoute(4, 5);

// Segundo cruzamento de baixo pra cima
var route8_9 = buildRoute(8, 9);
var route8_12 = buildRoute(8, 6, 12);
var route8_1 = buildRoute(8, 7, 1);

// Segundo cruzamento de cima pra baixo
var route10_11 = buildRoute(10, 11);
var route10_1 = buildRoute(10, 7, 1);
var route10_12 = buildRoute(10, 6, 12);

// Terceiro cruzamento de baixo pra cima;
var route14_15 = buildRoute(14, 15);
var route14_12 = buildRoute(14, 12);
var route14_1 = buildRoute(14, 13, 7, 1);

// Terceiro cruzamento de cima pra baixo;
var route16_17 = buildRoute(16, 17);
var route16_1 = buildRoute(16, 13, 7, 1);
var route16_12 = buildRoute(16, 12);


// roads
// last opt arg "doGridding" left out (true:user can change road geometry)

/* var road0 = new road(
  roadIDs[0],
  road0Len,
  laneWidth,
  nLanes_main,
  traj[0],
  density,
  speedInit,
  fracTruck,
  isRing
);

var road1 = new road(
  roadIDs[1],
  road1Len,
  laneWidth,
  nLanes_main,
  traj[1],
  density,
  speedInit,
  fracTruck,
  isRing
);

var road2 = new road(
  roadIDs[2],
  road2Len,
  laneWidth,
  nLanes_sec,
  traj[2],
  density,
  speedInit,
  fracTruck,
  isRing
);

var road3 = new road(
  roadIDs[3],
  road3Len,
  laneWidth,
  nLanes_sec,
  traj[3],
  density,
  speedInit,
  fracTruck,
  isRing
);

var road4 = new road(
  roadIDs[4],
  road4Len,
  laneWidth,
  nLanes_sec,
  traj[4],
  density,
  speedInit,
  fracTruck,
  isRing
);

var road5 = new road(
  roadIDs[5],
  road5Len,
  laneWidth,
  nLanes_sec,
  traj[5],
  density,
  speedInit,
  fracTruck,
  isRing
);

var road6 = new road(
  roadIDs[6],
  road6Len,
  laneWidth,
  nLanes_sec,
  traj[6],
  density,
  speedInit,
  fracTruck,
  isRing
);

var road7 = new road(
  roadIDs[7],
  road7Len,
  laneWidth,
  nLanes_sec,
  traj[7],
  density,
  speedInit,
  fracTruck,
  isRing
);

var road8 = new road(
  roadIDs[8],
  road8Len,
  laneWidth,
  nLanes_sec,
  traj[8],
  density,
  speedInit,
  fracTruck,
  isRing
);

var road9 = new road(
  roadIDs[9],
  road9Len,
  laneWidth,
  nLanes_sec,
  traj[9],
  density,
  speedInit,
  fracTruck,
  isRing
);

var road10 = new road(
  roadIDs[10],
  road10Len,
  laneWidth,
  nLanes_sec,
  traj[10],
  density,
  speedInit,
  fracTruck,
  isRing
);

var road11 = new road(
  roadIDs[11],
  road11Len,
  laneWidth,
  nLanes_sec,
  traj[11],
  density,
  speedInit,
  fracTruck,
  isRing
); */

const createRoad = () => {
  this.traj.forEach((val, i) => {
    this["road" + i] = new road(
      roadIDs[i],
      this[`road${i}Len`],
      laneWidth,
      nLanes_main,
      traj[i],
      density,
      speedInit,
      fracTruck,
      isRing
    );
  });
};

createRoad();
// road network (network declared in canvas_gui.js)

network = this.traj.map((val, i) => this[`road${i}`]);
console.log(network)


// !!! no lane changes when approaching intersections
// for some reason, nonsense LC when slowing down there

var distLCban = 20;
[0, 1, ROAD_CONV_2[0], ROAD_CONV_2[1], ROAD_CONV_3[0], ROAD_CONV_3[1]]
  .forEach(val => {
    network[val].LCbanStart = 0.5 * network[val].roadLen - distLCban;
    network[val].LCbanEnd = 0.5 * network[val].roadLen;
  });

[2, 4, ROAD_CONV_2[2], ROAD_CONV_2[4], ROAD_CONV_3[2], ROAD_CONV_3[4]]
  .forEach(val => {
    network[val].LCbanStart = network[val].roadLen - distLCban;
  
  });

// draw veh IDs on selected links if set true; also draw alternative traject

for (var ir = 0; ir < network.length; ir++) {
  network[ir].drawVehIDs = drawVehIDs;
  network[ir].drawAlternativeTrajectories = true; // must define road.trajAlt
}

defineGeometricRoadproperties(nLanes_main, nLanes_sec);

defineConflicts(nLanes_main, nLanes_sec, trafficRuleIndex);

// add standing virtual vehicles at the end of some road elements
// prepending=unshift (strange name)
// vehicle(length, width, u, lane, speed, type)

//var virtualStandingVeh
//    =new vehicle(2, laneWidth, road0.roadLen-0.5*laneWidth, 1, 0, "obstacle");

//road0.veh.unshift(virtualStandingVeh);

var detectors = []; // stationaryDetector(road,uRel,integrInterval_s)
if (shouldSpawnDetector) {
  detectors[0] = new stationaryDetector(road0, 0.1 * road0Len, 30);
  detectors[1] = new stationaryDetector(road12, 0.9 * road12Len, 30);
  detectors[2] = new stationaryDetector(road13, 0.1 * road13Len, 30);
  detectors[3] = new stationaryDetector(road1, 0.9 * road1Len, 30);
}

//</NETWORK>

//#########################################################
// model initialization (models and methods override control_gui.js)
//#########################################################

// ok 2021. Defines longModelCar,-Truck,LCModelCar,-Truck,-Mandatory
updateModels();

//############################################
// traffic objects and traffic-light control editor
//############################################

// TrafficObjects(canvas,nTL,nLimit,xRelDepot,yRelDepot,nRow,nCol)
var trafficObjs = new TrafficObjects(canvas, 12, 0, 0.15, 0.1, 4, 4);
var TL = trafficObjs.trafficObj.slice(0, 12); // last index not included




// set two TL to green, two to red

// !! Editor not yet finished
// (then args xRelEditor,yRelEditor not relevant unless editor shown)
var trafficLightControl = new TrafficLightControlEditor(trafficObjs, 0.5, 0.5);

//############################################
// run-time specification and functions
//############################################

var time = 0;
var itime = 0;
var fps = 30; // frames per second (unchanged during runtime)
var dt = timewarp / fps;
var TLJunctions = new LightJunctions(TL);
TLJunctions.setHalfWavePattern();
changeTrafficRules(trafficRuleIndex);

//#################################################################
function updateSim() {
  //#################################################################

  // updateSim (1): update time, global geometry, and traffic objects

  time += dt; // dt depends on timewarp slider (fps=const)
  itime++;
  hasChanged = false;

  // updateSim (0): update traffic light state if signalzed intersection

  greenMain = (cycleTL * (qIn + 0.02)) / (qIn + q2 + 0.04);
  dt_lastSwitch += dt;
  if (trafficRuleIndex == 2) {
    if (
      (TL[0].value == "green" && dt_lastSwitch > greenMain) ||
      (TL[0].value == "red" && dt_lastSwitch > cycleTL - greenMain)
    ) {
      // nextTLphase();
      dt_lastSwitch = 0;
    }
  }

  if (
    canvas.width != simDivWindow.clientWidth ||
    canvas.height != simDivWindow.clientHeight
  ) {
    hasChanged = true;
    canvas.width = simDivWindow.clientWidth;
    canvas.height = simDivWindow.clientHeight;

    if (isSmartphone != mqSmartphone()) {
      isSmartphone = mqSmartphone();
    }

    updateDimensions(); // updates refsizePhys, -Pix,  geometry

    trafficObjs.calcDepotPositions(canvas);
  }

  if (userCanDropObjects && !isSmartphone && !trafficObjPicked) {
    trafficObjs.zoomBack(); // here more responsive than in drawSim
  }

  // updateSim (2): integrate all the GUI actions (sliders, TrafficObjects)
  // as long as not done independently (clicks on vehicles)
  // check that global var deepCopying=true (in road.js)
  // (needed for updateModelsOfAllVehicles)

  // LCModelMandatory in control_gui.js;
  // road.updateM... makes road.LCModelMandatoryLeft, -Right out of this

  for (var ir = 0; ir < network.length; ir++) {
    network[ir].updateTruckFrac(fracTruck, fracTruckToleratedMismatch);
    network[ir].updateModelsOfAllVehicles(
      longModelCar,
      longModelTruck,
      LCModelCar,
      LCModelTruck,
      LCModelMandatory
    );
    network[ir].updateSpeedlimits(trafficObjs);
  }

  // updateSim (3): do central acc calculation of vehicles
  // (may be later overridden by special actions before speed and pos update)

  for (var ir = 0; ir < network.length; ir++) {
    network[ir].calcAccelerations();
  }

  // updateSim (4): do all the network actions
  // (inflow, outflow, merging and connecting)

  // (4a) inflow BC

  var qEastbound = 0.95 * qIn; // Entrada de carros do leste (direita)
  var qWestbound = 1.05 * qIn; // Entrada de carros do oeste (esquerda)
  var qNorthbound = 0.95 * q2; // Entrada secundária superior
  var qSouthbound = 1.05 * q2; // Entrada secundária inferior
  /*
    Rotas de saida de veiculo:
      0, 13
      2, 8, 14
      4, 10, 16
   */

  // Reta
  var route0 = [
    route0_12,
    [route0_5, route0_11, route0_17],
    [route0_3, route0_9, route0_15],
  ];
  var route13 = [
    route13_1,
    [route13_15, route13_9, route13_3],
    [route13_17, route13_11, route13_5],
  ];

  // Lateral baixo
  var route2 = [route2_3, route2_12, route2_1];
  var route8 = [route8_9, route8_12, route8_1];
  var route14 = [route14_15, route14_12, route14_1];

  // Lateral cima
  var route4 = [route4_5, route4_1, route4_12];
  var route10 = [route10_11, route10_1, route10_12];
  var route16 = [route16_17, route16_1, route16_12];

  // direction={0: straight, 1: right, 2: left}
  var r = Math.random();
  var direction = r <= fracRight ? 1 : r < fracRight + fracLeft ? 2 : 0;
  memoizedDirection = getDirection(route0, direction);

  if (memoizedDirection == undefined) console.log(memoizedDirection, direction);
  network[0].updateBCup(qEastbound, dt, memoizedDirection);

  r = Math.random();
  direction = r <= fracRight ? 1 : r < fracRight + fracLeft ? 2 : 0;
  memoizedDirection = getDirection(route13, direction);
  if (memoizedDirection == undefined) console.log(memoizedDirection, direction);
  network[13].updateBCup(qWestbound, dt, memoizedDirection);

  r = Math.random();
  direction = r <= fracRight ? 1 : r < fracRight + fracLeft ? 2 : 0;
  memoizedDirection = getDirection(route2, direction);
  if (memoizedDirection == undefined) console.log(memoizedDirection, direction);
  network[2].updateBCup(qNorthbound, dt, memoizedDirection);

  r = Math.random();
  direction = r <= fracRight ? 1 : r < fracRight + fracLeft ? 2 : 0;
  memoizedDirection = getDirection(route8, direction);
  if (memoizedDirection == undefined) console.log(memoizedDirection, direction);
  network[8].updateBCup(qNorthbound, dt, memoizedDirection);

  r = Math.random();
  direction = r <= fracRight ? 1 : r < fracRight + fracLeft ? 2 : 0;
  memoizedDirection = getDirection(route14, direction);
  if (memoizedDirection == undefined) console.log(memoizedDirection, direction);
  network[14].updateBCup(qNorthbound, dt, memoizedDirection);

  r = Math.random();
  direction = r <= fracRight ? 1 : r < fracRight + fracLeft ? 2 : 0;
  memoizedDirection = getDirection(route4, direction);
  if (memoizedDirection == undefined) console.log(memoizedDirection, direction);
  network[4].updateBCup(qSouthbound, dt, memoizedDirection);

  r = Math.random();
  direction = r <= fracRight ? 1 : r < fracRight + fracLeft ? 2 : 0;
  memoizedDirection = getDirection(route10, direction);
  if (memoizedDirection == undefined) console.log(memoizedDirection, direction);
  network[10].updateBCup(qSouthbound, dt, memoizedDirection);

  r = Math.random();
  direction = r <= fracRight ? 1 : r < fracRight + fracLeft ? 2 : 0;
  memoizedDirection = getDirection(route16, direction);
  if (memoizedDirection == undefined) console.log(memoizedDirection, direction);
  network[16].updateBCup(qSouthbound, dt, memoizedDirection);

  // updateSim (4b) mergeDiverge actions

  // updateSim (4c): direct connecting stuff
  // connectors selected by the route of the vehicles
  // connect(targetRoad,uSource,uTarget,offsetLane,conflicts(opt),speed(opt))

  var maxspeed_turn = 7;

  // resolve gridlocks in right-priority rules

  if (trafficRuleIndex == 1) {
    var dtWait = 10;
    var dtResolve = 1.5;
    var itimeCycle = Math.round((dtWait + dtResolve) / dt);
    var itimeResolve = Math.round(dtResolve / dt);
    if (itime % itimeCycle < itimeResolve) {
      console.log("Resolving Gridlock");
      resolveGridlock();
    } else {
      defineConflictsSymmetric(nLanes_main, nLanes_sec);
    }
  }

  // straight  ahead (network[0], [1] need
  // straight connecting for right prio, route=only one link)
  // road.connect(targetRoad, uSource, uTarget,
  // offsetLane, conflicts, opt_maxspeed, opt_targetPrio)

  // Conexão reta-reta
  network[0].connect(
    network[0],
    0.5 * network[0].roadLen - (2 * offsetSec + laneWidth),
    0.5 * network[0].roadLen - (2 * offsetSec + laneWidth),
    0,
    conflicts00
  );

  network[1].connect(
    network[1],
    0.5 * network[1].roadLen - (2 * offsetSec + laneWidth),
    0.5 * network[1].roadLen - (2 * offsetSec + laneWidth),
    0,
    conflicts11
  );

  network[6].connect(
    network[6],
    0.5 * network[6].roadLen - (2 * offsetSec + laneWidth),
    0.5 * network[6].roadLen - (2 * offsetSec + laneWidth),
    0,
    conflicts66
  );

  network[7].connect(
    network[7],
    0.5 * network[7].roadLen - (2 * offsetSec + laneWidth),
    0.5 * network[7].roadLen - (2 * offsetSec + laneWidth),
    0,
    conflicts77
  );

  network[12].connect(
    network[12],
    0.5 * network[12].roadLen - (2 * offsetSec + laneWidth),
    0.5 * network[12].roadLen - (2 * offsetSec + laneWidth),
    0,
    conflicts1212
  );

  network[13].connect(
    network[13],
    0.5 * network[13].roadLen - (2 * offsetSec + laneWidth),
    0.5 * network[13].roadLen - (2 * offsetSec + laneWidth),
    0,
    conflicts1313
  );

  network[0].connect(network[6], network[0].roadLen, 0, 0);
  network[6].connect(network[12], network[6].roadLen, 0, 0);

  network[13].connect(network[7], network[13].roadLen, 0, 0);
  network[7].connect(network[1], network[7].roadLen, 0, 0);

  network[2].connect(network[3], network[2].roadLen, 0, 0, conflicts23);
  network[4].connect(network[5], network[4].roadLen, 0, 0, conflicts45);

  network[8].connect(network[9], network[8].roadLen, 0, 0, conflicts89);
  network[10].connect(network[11], network[10].roadLen, 0, 0, conflicts1011);

  network[14].connect(network[15], network[14].roadLen, 0, 0, conflicts1415);
  network[16].connect(network[17], network[16].roadLen, 0, 0, conflicts1617);

  // turn right
  // road.connect(targetRoad, uSource, uTarget,
  // offsetLane, conflicts, opt_maxspeed, opt_targetPrio)//!!! chck targetPrio

  network[0].connect(
    network[5],
    u05Source,
    u05Target,
    nLanes_sec - nLanes_main,
    conflicts05,
    maxspeed_turn,
    false
  );

  network[6].connect(
    network[11],
    u05Source,
    u05Target,
    nLanes_sec - nLanes_main,
    conflicts611,
    maxspeed_turn,
    false
  );

  network[12].connect(
    network[17],
    u05Source,
    u05Target,
    nLanes_sec - nLanes_main,
    conflicts1217,
    maxspeed_turn,
    false
  );

  network[1].connect(
    network[3],
    u13Source,
    u13Target,
    nLanes_sec - nLanes_main,
    conflicts13,
    maxspeed_turn,
    false
  );

  network[7].connect(
    network[9],
    u13Source,
    u13Target,
    nLanes_sec - nLanes_main,
    conflicts79,
    maxspeed_turn,
    false
  );

  network[13].connect(
    network[15],
    u13Source,
    u13Target,
    nLanes_sec - nLanes_main,
    conflicts1315,
    maxspeed_turn,
    false
  );

  network[2].connect(
    network[0],
    u20Source,
    u20Target,
    nLanes_main - nLanes_sec,
    conflicts20,
    maxspeed_turn,
    trafficRuleIndex != 1
  ); //=1: right prio

  network[8].connect(
    network[6],
    u20Source,
    u20Target,
    nLanes_main - nLanes_sec,
    conflicts86,
    maxspeed_turn,
    trafficRuleIndex != 1
  ); //=1: right prio

  network[14].connect(
    network[12],
    u20Source,
    u20Target,
    nLanes_main - nLanes_sec,
    conflicts1412,
    maxspeed_turn,
    trafficRuleIndex != 1
  ); //=1: right prio

  network[4].connect(
    network[1],
    u41Source,
    u41Target,
    nLanes_main - nLanes_sec,
    conflicts41,
    maxspeed_turn,
    trafficRuleIndex != 1
  );

  network[10].connect(
    network[7],
    u41Source,
    u41Target,
    nLanes_main - nLanes_sec,
    conflicts107,
    maxspeed_turn,
    trafficRuleIndex != 1
  );

  network[16].connect(
    network[13],
    u41Source,
    u41Target,
    nLanes_main - nLanes_sec,
    conflicts107,
    maxspeed_turn,
    trafficRuleIndex != 1
  );

  // turn left
  // road.connect(targetRoad, uSource, uTarget,
  // offsetLane, conflicts, opt_maxspeed, opt_targetPrio)//!!! chck targetPrio

  network[0].connect(
    network[3],
    u03Source,
    u03Target,
    0,
    conflicts03,
    maxspeed_turn,
    false
  );
  //0, conflicts03, maxspeed_turn, (trafficRuleIndex!=1));

  network[6].connect(
    network[9],
    u03Source,
    u03Target,
    0,
    conflicts69,
    maxspeed_turn,
    false
  );

  network[12].connect(
    network[15],
    u03Source,
    u03Target,
    0,
    conflicts1215,
    maxspeed_turn,
    false
  );
  //0, conflicts03, maxspeed_turn, (trafficRuleIndex!=1));

  network[1].connect(
    network[5],
    u15Source,
    u15Target,
    0,
    conflicts15,
    maxspeed_turn,
    false
  );
  //0, conflicts03, maxspeed_turn, (trafficRuleIndex!=1));

  network[7].connect(
    network[11],
    u15Source,
    u15Target,
    0,
    conflicts711,
    maxspeed_turn,
    false
  );
  //0, conflicts03, maxspeed_turn, (trafficRuleIndex!=1));
  network[13].connect(
    network[17],
    u15Source,
    u15Target,
    0,
    conflicts1317,
    maxspeed_turn,
    false
  );
  //0, conflicts03, maxspeed_turn, (trafficRuleIndex!=1));

  network[2].connect(
    network[1],
    u21Source,
    u21Target,
    0,
    conflicts21,
    maxspeed_turn,
    true
  );

  network[8].connect(
    network[7],
    u21Source,
    u21Target,
    0,
    conflicts87,
    maxspeed_turn,
    true
  );

  network[14].connect(
    network[13],
    u21Source,
    u21Target,
    0,
    conflicts1413,
    maxspeed_turn,
    true
  );

  network[4].connect(
    network[0],
    u40Source,
    u40Target,
    0,
    conflicts40,
    maxspeed_turn,
    true
  );

  network[10].connect(
    network[6],
    u40Source,
    u40Target,
    0,
    conflicts106,
    maxspeed_turn,
    true
  );
  network[16].connect(
    network[12],
    u40Source,
    u40Target,
    0,
    conflicts1612,
    maxspeed_turn,
    true
  );

  // updateSim (4d): outflow BC (if not relevant, updateBCdown does nothing)

  for (var ir = 0; ir < network.length; ir++) {
    network[ir].updateBCdown();
  }

  // updateSim (5):
  // restrict LC for inflowing road2-vehicles for route 20
  // (update speed and move vehs at the end because of changed acc)

  // Road 0
  for (var ir = 0; ir < network[0].veh.length; ir++) {
    if (arraysEqual(network[0].veh[ir].route, [0, 5])) {
      network[0].veh[ir].LCModel = network[0].LCModelMandatoryRight;
    }
    if (arraysEqual(network[0].veh[ir].route, [0, 3])) {
      network[0].veh[ir].LCModel = network[0].LCModelMandatoryLeft;
    }
  }

  // Road 1
  for (var ir = 0; ir < network[1].veh.length; ir++) {
    if (arraysEqual(network[1].veh[ir].route, [1, 3])) {
      network[1].veh[ir].LCModel = network[1].LCModelMandatoryRight;
    }
    if (arraysEqual(network[1].veh[ir].route, [1, 5])) {
      network[1].veh[ir].LCModel = network[1].LCModelMandatoryLeft;
    }
  }
  // Road 6
  for (var ir = 0; ir < network[6].veh.length; ir++) {
    if (arraysEqual(network[6].veh[ir].route, [6, 11])) {
      network[6].veh[ir].LCModel = network[6].LCModelMandatoryRight;
    }
    if (arraysEqual(network[6].veh[ir].route, [6, 9])) {
      network[6].veh[ir].LCModel = network[6].LCModelMandatoryLeft;
    }
  }

  // Road 7
  for (var ir = 0; ir < network[7].veh.length; ir++) {
    if (arraysEqual(network[7].veh[ir].route, [7, 9])) {
      network[7].veh[ir].LCModel = network[7].LCModelMandatoryRight;
    }
    if (arraysEqual(network[7].veh[ir].route, [7, 11])) {
      network[7].veh[ir].LCModel = network[7].LCModelMandatoryLeft;
    }
  }
  
  // Road 12
  for (var ir = 0; ir < network[12].veh.length; ir++) {
    if (arraysEqual(network[12].veh[ir].route, [12, 17])) {
      network[12].veh[ir].LCModel = network[12].LCModelMandatoryRight;
    }
    if (arraysEqual(network[12].veh[ir].route, [12, 15])) {
      network[12].veh[ir].LCModel = network[12].LCModelMandatoryLeft;
    }
  }

  // Road 13
  for (var ir = 0; ir < network[13].veh.length; ir++) {
    if (arraysEqual(network[13].veh[ir].route, [13, 15])) {
      network[13].veh[ir].LCModel = network[13].LCModelMandatoryRight;
    }
    if (arraysEqual(network[13].veh[ir].route, [13, 17])) {
      network[13].veh[ir].LCModel = network[13].LCModelMandatoryLeft;
    }
  }


  /* 
      LATERAIS
  */
  // Road 2
  for (var ir = 0; ir < network[2].veh.length; ir++) {
    if (arraysEqual(network[2].veh[ir].route, [2, 0])) {
      network[2].veh[ir].LCModel = network[2].LCModelMandatoryRight;
    }
    if (arraysEqual(network[2].veh[ir].route, [2, 1])) {
      network[2].veh[ir].LCModel = network[2].LCModelMandatoryLeft;
    }
  }

  // Road 4
  for (var ir = 0; ir < network[4].veh.length; ir++) {
    if (arraysEqual(network[4].veh[ir].route, [4, 1])) {
      network[4].veh[ir].LCModel = network[4].LCModelMandatoryRight;
    }
    if (arraysEqual(network[4].veh[ir].route, [4, 0])) {
      network[4].veh[ir].LCModel = network[4].LCModelMandatoryLeft;
    }
  }

  // Road 8
  for (var ir = 0; ir < network[8].veh.length; ir++) {
    if (arraysEqual(network[8].veh[ir].route, [8, 6])) {
      network[8].veh[ir].LCModel = network[8].LCModelMandatoryRight;
    }
    if (arraysEqual(network[8].veh[ir].route, [8, 7])) {
      network[8].veh[ir].LCModel = network[8].LCModelMandatoryLeft;
    }
  }

  // Road 10
  for (var ir = 0; ir < network[10].veh.length; ir++) {
    if (arraysEqual(network[10].veh[ir].route, [10, 7])) {
      network[10].veh[ir].LCModel = network[10].LCModelMandatoryRight;
    }
    if (arraysEqual(network[10].veh[ir].route, [10, 6])) {
      network[10].veh[ir].LCModel = network[10].LCModelMandatoryLeft;
    }
  }

  // Road 14
  for (var ir = 0; ir < network[14].veh.length; ir++) {
    if (arraysEqual(network[14].veh[ir].route, [14, 12])) {
      network[14].veh[ir].LCModel = network[14].LCModelMandatoryRight;
    }
    if (arraysEqual(network[14].veh[ir].route, [14, 13])) {
      network[14].veh[ir].LCModel = network[14].LCModelMandatoryLeft;
    }
  }

  // Road 16
  for (var ir = 0; ir < network[16].veh.length; ir++) {
    if (arraysEqual(network[16].veh[ir].route, [16, 13])) {
      network[16].veh[ir].LCModel = network[16].LCModelMandatoryRight;
    }
    if (arraysEqual(network[16].veh[ir].route, [16, 12])) {
      network[16].veh[ir].LCModel = network[16].LCModelMandatoryLeft;
    }
  }




  //
  for (var ir = 0; ir < network.length; ir++) {
    // at road construction, no-lane-change zones defined (road.LCbanStart)
    network[ir].changeLanes();
    network[ir].updateLastLCtimes(dt);
  }

  for (var ir = 0; ir < network.length; ir++) {
    // simult. update pos at the end
    network[ir].updateSpeedPositions();
  }

  // updateSim (6): update detector readings

  for (var iDet = 0; iDet < detectors.length; iDet++) {
    detectors[iDet].update(time, dt);
  }

  //##############################################################
  // debug output
  //##############################################################

  if (false) {
    debugVeh(219, network);
    debugVeh(224, network);
  }

  if (debug) {
    crashinfo.checkForCrashes(network);
  } //!! deact for production
} //updateSim

//##################################################
function drawSim() {
  //##################################################

  //if(itime==182){console.log("begin drawsim:"); debugVeh(211,network);}

  var movingObserver = false; // relative motion works, only start offset
  var speedObs = 2;
  var uObs = speedObs * time;

  // drawSim (1): adapt text size

  var relTextsize_vmin = isSmartphone ? 0.03 : 0.02;
  var textsize = relTextsize_vmin * Math.min(canvas.width, canvas.height);

  // drawSim (2): reset transform matrix and draw background
  // (only needed if changes, plus "reminders" for lazy browsers)
  // haschanged def/updated here,
  // mousedown/touchdown in canvas_gui objectsZoomBack in TrafficObjects

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (drawBackground) {
    var objectsMoved = mousedown || touchdown || objectsZoomBack;
    if (
      hasChanged ||
      objectsMoved ||
      itime <= 10 ||
      itime % 50 == 0 ||
      !drawRoad ||
      movingObserver ||
      drawVehIDs
    ) {
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    }
  }

  // drawSim (3): draw road network

  //var changedGeometry=hasChanged||(itime<=1);
  var changedGeometry = itime <= 1; // if no physical change of road lengths

  // road.draw(img1,img2,changedGeometry,
  //           umin,umax,movingObserver,uObs,center_xPhys,center_yPhys)
  // second arg line optional, only for moving observer

  for (var ir = network.length - 1; ir >= 0; ir--) {
    // draw second. roads first
    network[ir].draw(roadImages[ir][0], roadImages[ir][1], changedGeometry);
  }

  if (drawRoadIDs) {
    for (var ir = 0; ir < network.length; ir++) {
      network[ir].drawRoadID();
    }
  }

  // drawSim (4): draw vehicles

  // road.drawVehicles(carImg,truckImg,obstImgs,vmin_col,vmax_col,
  //           umin,umax,movingObserver,uObs,center_xPhys,center_yPhys)
  // second arg line optional, only for moving observer

  for (var ir = 0; ir < network.length; ir++) {
    network[ir].drawVehicles(
      carImg,
      truckImg,
      obstacleImgs,
      vmin_col,
      vmax_col
    );
  }

  // drawSim (5): redraw changeable traffic objects
  // (zoomback is better in sim!)

  if (userCanDropObjects && !isSmartphone) {
    trafficObjs.draw();
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  drawSpeedlBox(); // draw speedlimit-change select box

  // drawSim (6): show simulation time and detector displays

  displayTime(time, textsize);
  for (var iDet = 0; iDet < detectors.length; iDet++) {
    detectors[iDet].display(8);
  }

  // drawSim (7): show logical coordinates if activated

  if (showCoords && mouseInside) {
    showLogicalCoords(xPixUser, yPixUser);
  }

  //if(itime==182){console.log("end drawsim:"); debugVeh(211,network);}

  /* drawText(
    `xCenter: ${center_xPhys} | xCenter 2: ${center_xPhys_2} | d: ${
      center_xPhys_2 - center_xPhys
    } | mainroad: ${mainroadLen}`,
    canvas.width * 0.15,
    30
  ); */
} // drawSim

function drawRectangle(x, y, size = { height: 5, width: 5 }, debug = false) {
  // Set the fill style with transparency (rgba)
  if (debug) console.log(x, y);
  ctx.fillStyle = "magenta"; // Red color with 50% opacity

  // Draw the rectangle
  ctx.fillRect(x, y, size.height, size.width); // x, y, width, height
}

function drawText(text, x, y) {
  ctx.font = "16px Arial";

  // Measure the text width
  const textWidth = ctx.measureText(text).width;
  const textHeight = 20; // Approximate height of the text

  // Set the fill style for the rectangle (background)
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)"; // Black with 50% opacity

  // Draw the rectangle behind the text
  ctx.fillRect(x - 5, y - textHeight, textWidth + 10, textHeight + 10);

  // Set the fill style for the text
  ctx.fillStyle = "white";

  // Draw the text on top of the rectangle
  ctx.fillText(text, x, y);
}
//##################################################
// Running function of the sim thread (triggered by setInterval)
//##################################################

function main_loop() {
  //console.log("main_loop: time=",time," itime=",itime);
  updateSim();
  drawSim();
  updateTrafficLights();
}


function updateTrafficLights() {
  window.dispatchEvent(UPDATE_EVENT);
}

//############################################
// start the simulation thread
// THIS function does all the things; everything else
// only functions/definitions
// triggers:
// (i) automatically when loading the simulation
// (ii) when pressing the start button in *gui.js
//  ("myRun=setInterval(main_loop, 1000/fps);")
//############################################

console.log("first main execution");

var myRun = setInterval(main_loop, 1000 / fps);

//##################################################
// special gui callbacks (not so general to be in control_gui.js)
//##################################################

// address each TL individually because otherwise (just flipping state)
// consequential errors ("all 4 red or green") not caught

function nextTLphase() {
  console.log("in nextTLphase: TL[0].value=", TL[0].value);
  if (TL[0].value == "green")
    for (var i = 0; i < 4; i++) {
      trafficObjs.setTrafficLight(TL[i], i < 2 ? "red" : "green");
    }
  else
    for (var i = 0; i < 4; i++) {
      trafficObjs.setTrafficLight(TL[i], i < 2 ? "green" : "red");
    }
}

function changeTrafficRules(ruleIndex) {
  trafficRuleIndex = ruleIndex;
  defineConflicts(nLanes_main, nLanes_sec, trafficRuleIndex);

  // for right priority, too much traffic leads to grid lock;
  // furthermore, only 1/1 lane sensible

  if (false) {
    //if(trafficRuleIndex==1){
    setTotalLaneNumber(2);
    qIn = 180 / 3600;
    q2 = 110 / 3600;
    setSlider(slider_qIn, slider_qInVal, 3600 * qIn, commaDigits, "veh/h");
    setSlider(slider_q2, slider_q2Val, 3600 * q2, commaDigits, "veh/h");
  }
  

  if (trafficRuleIndex == 2) {
    // traffic lights
    // nextTLphase(); // to bring traffic lights in defined state: 2 green/red

    
    const roadsToAdd = [0, 1, 2, 4]
    const roadsToAdd2 = [6, 7, 8, 10]
    const roadsToAdd3 = [roadsToAdd, roadsToAdd2, [12, 13, 14, 16]];
    /* const u20Sources = [2, 4, 8, 10, 14, 16]
    roadsToAdd3.forEach((val, i) => {
      const sourceToUse = u20Sources.includes(val) ? u20Source : u05Source;
      trafficObjs.dropObject(
        TL[i],
        network,
        network[val].traj[0](sourceToUse),
        network[val].traj[1](sourceToUse),
        20
      );
    }) */

    TLJunctions.dropInRoads(roadsToAdd3);

    /* trafficObjs.dropObject(
      TL[0],
      network,
      network[0].traj[0](u05Source),
      network[0].traj[1](u05Source),
      20
    );
    trafficObjs.dropObject(
      TL[1],
      network,
      network[1].traj[0](u05Source),
      network[1].traj[1](u05Source),
      20
    );
    trafficObjs.dropObject(
      TL[2],
      network,
      network[2].traj[0](u20Source),
      network[2].traj[1](u20Source),
      20
    );
    trafficObjs.dropObject(
      TL[3],
      network,
      network[4].traj[0](u20Source),
      network[4].traj[1](u20Source),
      20
    ); */
  } else {
    for (var i = 0; i < 4; i++) {
      trafficObjs.deactivate(TL[i]);
      //TL[i].inDepot=true;
    }
  }
  console.log("end changeTrafficRules: trafficRuleIndex=", trafficRuleIndex);
}

function setTotalLaneNumber(laneCountIn) {
  console.log("setTotalLaneNumber: laneCountIn=", laneCountIn);
  userCanvasManip = true; // causes drawing background
  nLanes_main = laneCountIn == 1 ? 1 : laneCountIn <= 3 ? 2 : 3;
  nLanes_sec =
    laneCountIn == 6 ? 3 : laneCountIn == 3 || laneCountIn == 5 ? 2 : 1;
  laneCount = nLanes_main + nLanes_sec;

  defineGeometricVariables(nLanes_main, nLanes_sec);
  defineGeometricRoadproperties(nLanes_main, nLanes_sec);
  defineConflicts(nLanes_main, nLanes_sec, trafficRuleIndex);

  // sometimes ref error with active TLs on roads if the roads are redefined
  // ("new) in myRestartFunction() and the TLs just repositioned
  // by changeTrafficRules(rulesOld). It's safe to deactivate the TLs before
  // and activate them again at the new positions on the new roads
  // once constructed by myRestartFunction()

  var rulesOld = trafficRuleIndex;
  if (rulesOld == 2) {
    changeTrafficRules(0);
  }

  myRestartFunction();

  if (rulesOld == 2) {
    //changeTrafficRules(0);
    changeTrafficRules(rulesOld); // changes back integer trafficRules
  }
}

function setOD(index) {
  if (index == 0) {
    fracRight = 0;
    fracLeft = 0;
  } else if (index == 1) {
    fracRight = 1;
    fracLeft = 0;
  } else if (index == 2) {
    fracRight = 0;
    fracLeft = 1;
  } else {
    fracRight = 0.3;
    fracLeft = 0.3;
  }
}

//###############################################################
// define or update top-level lane-dependent variables
// (mainroadLen and refSizePhys=smaller edge define global scale
// at the very beginning, !=f(lanes)
// cannot define with "var" because called at the beginning and
// after changing lane numbers
//###############################################################

function defineGeometricVariables(nLanes_main, nLanes_sec) {
  // left-turning radius sufficiently high to allow for "US left-turning style"

  radiusRight = (2.0 + 0.5 * Math.max(laneCount - 3, 0)) * laneWidth;
  radiusLeft = 1.5 * radiusRight;

  offsetMain = 0.5 * laneWidth * nLanes_main;
  offsetSec = 0.5 * laneWidth * nLanes_sec;
  offset20Target = (nLanes_main - 0.5) * laneWidth; // dist from inters. y center
  road0Len = mainroadLen;
  road6Len = road0Len;
  road2Len =
    (0.5 / fitfactor) * refSizePhys - offset20Target - radiusRight + 40;
  road3Len =
    (0.5 / fitfactor) * refSizePhys + offset20Target + radiusRight + 40;

  //right

  lenRight = 0.5 * Math.PI * radiusRight; // for all right-turn special traj
  offset20Source = (nLanes_sec - 0.5) * laneWidth; // dist from inters. x center
  u20Source = 1.0 * road2Len;
  u20Target =
    0.5 * mainroadLen + offset20Source + (1 - 0.5 * Math.PI) * radiusRight;
  u13Source = 0.5 * mainroadLen - offset20Source - radiusRight;
  u13Target = 2 * (offset20Target + radiusRight) - lenRight;

  //left

  lenLeft = 0.5 * Math.PI * radiusLeft; //main-sec
  lenLeftSecMain = lenLeft + 2 * offsetMain - 1 * (radiusLeft - radiusRight);

  offset21Source = 0.5 * laneWidth; // dist from intersection x center
  offset21Target = 0.5 * laneWidth; // dist from intersection y center
  u21Source = 1.0 * road2Len;
  u21Target =
    0.5 * mainroadLen - offset21Source - (lenLeftSecMain - radiusLeft);
  //u21Target=0.5*mainroadLen-offset21Source-(lenLeft-radiusLeft);//!!
  u03Source = 0.5 * mainroadLen + offset21Source - radiusLeft;
  u03Target =
    -offset21Target + radiusLeft + radiusRight + offset20Target - lenLeft;

  // dependent quantities due to symmetry

  road1Len = mainroadLen;
  road4Len = road2Len;
  road5Len = road3Len;

  road7Len = road1Len;
  road8Len = road2Len;
  road9Len = road3Len;
  road10Len = road4Len;
  road11Len = road5Len;

  road12Len = road0Len;
  road13Len = road1Len;
  road14Len = road2Len;
  road15Len = road3Len;
  road16Len = road4Len;
  road17Len = road5Len;

  u41Source = u20Source;
  u41Target = u20Target;
  u05Source = u13Source;
  u05Target = u13Target;

  u40Source = u21Source;
  u40Target = u21Target;
  u15Source = u03Source;
  u15Target = u03Target;

  //

  /* u10_7Source = u8_11Source;
	u10_7Target = u8_11Target;
	u11_10Source = u7_9Source;
	u11_10Target = u7_9Target;

	u10_11Source = u8_7Source;
	u10_11Target = u8_7Target;
	u7_10Source = u11_9Source;
	u7_10Target = u11_9Target; */
}

// update non-function road properties (these are not by reference)

function defineGeometricRoadproperties(nLanes_main, nLanes_sec) {
  var nLanes = [
    nLanes_main,
    nLanes_main,
    nLanes_sec,
    nLanes_sec,
    nLanes_sec,
    nLanes_sec,
    nLanes_main,
    nLanes_main,
    nLanes_sec,
    nLanes_sec,
    nLanes_sec,
    nLanes_sec,
    nLanes_main,
    nLanes_main,
    nLanes_sec,
    nLanes_sec,
    nLanes_sec,
    nLanes_sec,
  ];

  for (var ir = 0; ir < nLanes.length; ir++) {
    roadImages[ir][0] = roadImgWith_lane[nLanes[ir] - 1];
    roadImages[ir][1] = roadImgWithout_lane[nLanes[ir] - 1];
    network[ir].nLanes = ir % 6 < 2 ? nLanes_main : nLanes_sec;
  }

  // set road lens
  this.traj.forEach((val, i) => {
    this.road[i] = this[`road${i}Len`];
  });

  // adding the alternative trajectories ([0]=right turn, [1]=left turn)
  // then corresponding road drawn if road.drawAlternativeTrajectories=true
  // and corresponding vehicles if their route contains the trajAlt roadID elem

  road0.trajAlt[0] = {
    x: traj0_20x,
    y: traj0_20y,
    roadID: 2, // here only route 20
    umin: u20Target,
    umax: u20Target + lenRight,
    laneMin: nLanes_main - 1, // right main lane
    laneMax: nLanes_main - 1,
  };

  road0.trajAlt[1] = {
    x: traj0_40x,
    y: traj0_40y,
    roadID: 4, // route40,
    umin: u40Target,
    umax: u40Target + lenLeftSecMain,
    laneMin: 0, // left main lane
    laneMax: 0,
  };

  road1.trajAlt[0] = {
    x: traj1_41x,
    y: traj1_41y,
    roadID: 4, // route41,
    umin: u41Target,
    umax: u41Target + lenRight,
    laneMin: nLanes_main - 1, // right main lane
    laneMax: nLanes_main - 1,
  };

  road1.trajAlt[1] = {
    x: traj1_21x,
    y: traj1_21y,
    roadID: 2, // route21,
    umin: u21Target,
    umax: u21Target + lenLeftSecMain,
    laneMin: 0, // left main lane
    laneMax: 0,
  };

  road3.trajAlt[0] = {
    x: traj3_13x,
    y: traj3_13y,
    roadID: 1, // route13,
    umin: u13Target,
    umax: u13Target + lenRight,
    laneMin: nLanes_sec - 1, // right secondary lane
    laneMax: nLanes_sec - 1,
  };

  road3.trajAlt[1] = {
    x: traj3_03x,
    y: traj3_03y,
    roadID: 0, // route03,
    umin: u03Target,
    umax: u03Target + lenLeft,
    laneMin: 0, // left secondary lane
    laneMax: 0,
  };

  road5.trajAlt[0] = {
    x: traj5_05x,
    y: traj5_05y,
    roadID: 0, // route05,
    umin: u05Target,
    umax: u05Target + lenRight,
    laneMin: nLanes_sec - 1, // right secondary lane
    laneMax: nLanes_sec - 1,
  };

  road5.trajAlt[1] = {
    x: traj5_15x,
    y: traj5_15y,
    roadID: 1, //route15,
    umin: u15Target,
    umax: u15Target + lenLeft,
    laneMin: 0, // left secondary lane
    laneMax: 0,
  };

  //

  road6.trajAlt[0] = {
    x: traj0_20x_2,
    y: traj0_20y,
    roadID: ROAD_CONV_2[2], // here only route 20
    umin: u20Target,
    umax: u20Target + lenRight,
    laneMin: nLanes_main - 1, // right main lane
    laneMax: nLanes_main - 1,
  };

  road6.trajAlt[1] = {
    x: traj0_40x_2,
    y: traj0_40y,
    roadID: ROAD_CONV_2[4], // route40,
    umin: u40Target,
    umax: u40Target + lenLeftSecMain,
    laneMin: 0, // left main lane
    laneMax: 0,
  };

  road7.trajAlt[0] = {
    x: traj1_41x_2,
    y: traj1_41y,
    roadID: ROAD_CONV_2[4], // route41,
    umin: u41Target,
    umax: u41Target + lenRight,
    laneMin: nLanes_main - 1, // right main lane
    laneMax: nLanes_main - 1,
  };

  road7.trajAlt[1] = {
    x: traj1_21x_2,
    y: traj1_21y,
    roadID: ROAD_CONV_2[2], // route21,
    umin: u21Target,
    umax: u21Target + lenLeftSecMain,
    laneMin: 0, // left main lane
    laneMax: 0,
  };

  road9.trajAlt[0] = {
    x: traj3_13x_2,
    y: traj3_13y,
    roadID: ROAD_CONV_2[1], // route13,
    umin: u13Target,
    umax: u13Target + lenRight,
    laneMin: nLanes_sec - 1, // right secondary lane
    laneMax: nLanes_sec - 1,
  };

  road9.trajAlt[1] = {
    x: traj3_03x_2,
    y: traj3_03y,
    roadID: ROAD_CONV_2[0], // route03,
    umin: u03Target,
    umax: u03Target + lenLeft,
    laneMin: 0, // left secondary lane
    laneMax: 0,
  };

  road11.trajAlt[0] = {
    x: traj5_05x_2,
    y: traj5_05y,
    roadID: ROAD_CONV_2[0], // route05,
    umin: u05Target,
    umax: u05Target + lenRight,
    laneMin: nLanes_sec - 1, // right secondary lane
    laneMax: nLanes_sec - 1,
  };

  road11.trajAlt[1] = {
    x: traj5_15x_2,
    y: traj5_15y,
    roadID: ROAD_CONV_2[1], //route15,
    umin: u15Target,
    umax: u15Target + lenLeft,
    laneMin: 0, // left secondary lane
    laneMax: 0,
  };

  // 12

  road12.trajAlt[0] = {
    x: traj0_20x_3,
    y: traj0_20y,
    roadID: ROAD_CONV_3[2], // here only route 20
    umin: u20Target,
    umax: u20Target + lenRight,
    laneMin: nLanes_main - 1, // right main lane
    laneMax: nLanes_main - 1,
  };

  road12.trajAlt[1] = {
    x: traj0_40x_3,
    y: traj0_40y,
    roadID: ROAD_CONV_3[4], // route40,
    umin: u40Target,
    umax: u40Target + lenLeftSecMain,
    laneMin: 0, // left main lane
    laneMax: 0,
  };

  road13.trajAlt[0] = {
    x: traj1_41x_3,
    y: traj1_41y,
    roadID: ROAD_CONV_3[4], // route41,
    umin: u41Target,
    umax: u41Target + lenRight,
    laneMin: nLanes_main - 1, // right main lane
    laneMax: nLanes_main - 1,
  };

  road13.trajAlt[1] = {
    x: traj1_21x_3,
    y: traj1_21y,
    roadID: ROAD_CONV_3[2], // route21,
    umin: u21Target,
    umax: u21Target + lenLeftSecMain,
    laneMin: 0, // left main lane
    laneMax: 0,
  };

  road15.trajAlt[0] = {
    x: traj3_13x_3,
    y: traj3_13y,
    roadID: ROAD_CONV_3[1], // route13,
    umin: u13Target,
    umax: u13Target + lenRight,
    laneMin: nLanes_sec - 1, // right secondary lane
    laneMax: nLanes_sec - 1,
  };

  road15.trajAlt[1] = {
    x: traj3_03x_3,
    y: traj3_03y,
    roadID: ROAD_CONV_3[0], // route03,
    umin: u03Target,
    umax: u03Target + lenLeft,
    laneMin: 0, // left secondary lane
    laneMax: 0,
  };

  road17.trajAlt[0] = {
    x: traj5_05x_3,
    y: traj5_05y,
    roadID: ROAD_CONV_3[0], // route05,
    umin: u05Target,
    umax: u05Target + lenRight,
    laneMin: nLanes_sec - 1, // right secondary lane
    laneMax: nLanes_sec - 1,
  };

  road17.trajAlt[1] = {
    x: traj5_15x_3,
    y: traj5_15y,
    roadID: ROAD_CONV_3[1], //route15,
    umin: u15Target,
    umax: u15Target + lenLeft,
    laneMin: 0, // left secondary lane
    laneMax: 0,
  };
}

/* #################################################################

@param nLanes_main,nLanes_sec: The conflict points depend 
                               on the number of lanes
@param trafficRuleIndex: 0: unsignalized with East-West priority road
                         1: unsignalized, right priority
                         2: signalized
Since left-turners also have conflicting paths, some conflicts remain also
in the presence of traffic lights (just keeping the conflicts will lead to
gridlocks since secondary road users always "fear" that the waiting 
mainroad vehicles may start off)

Note: all conflicts are filtered for the ODs in the simulation, e.g.,
var conflicts21=[conflict0_up, conflict4_21, conflict5_21];

See "Defining the basic conflicts" of how the conflict variable (struct-type)
is defined

###################################################################
*/

function defineConflicts(nLanes_main, nLanes_sec, trafficRuleIndex) {
  if (trafficRuleIndex == 0) {
    defineConflictsPriorityRoad(nLanes_main, nLanes_sec);
  } else if (trafficRuleIndex == 1) {
    defineConflictsSymmetric(nLanes_main, nLanes_sec);
  } else {
    defineConflictsTrafficLights(nLanes_main, nLanes_sec);
  }
}

// set of conflicts for priority/secondary roads for all subject ODs

//################################################################
function defineConflictsPriorityRoad(nLanes_main, nLanes_sec) {
  //################################################################

  setBasicConflicts(nLanes_main, nLanes_sec);

  // right

  conflicts05 = [];
  conflicts13 = [];
  conflicts20 = [];
  conflicts41 = [];

  conflicts79 = [];
  conflicts611 = [];
  conflicts86 = [];
  conflicts107 = [];

  conflicts1315 = [];
  conflicts1217 = [];
  conflicts1412 = [];
  conflicts1613 = [];

  // straight ahead

  conflicts00 = [];
  conflicts11 = [];
  conflicts23 = [conflict0_up, conflict1_up];
  conflicts45 = [conflict0_down, conflict1_down];

  conflicts77 = [];
  conflicts66 = [];
  conflicts89 = [conflict6_up, conflict7_up];
  conflicts1011 = [conflict6_down, conflict7_down];

  conflicts1212 = [];
  conflicts1313 = [];
  conflicts1415 = [conflict12_up, conflict13_up];
  conflicts1617 = [conflict12_down, conflict13_down];

  // left

  conflicts03 = [conflict1_03];
  conflicts15 = [conflict0_15];
  conflicts21 = [conflict0_21, conflict4_21, conflict5_21];
  conflicts40 = [conflict1_down, conflict2_40, conflict3_40];

  conflicts69 = [conflict7_69];
  conflicts711 = [conflict6_711];
  conflicts87 = [conflict6_87, conflict10_87, conflict11_87];
  conflicts106 = [conflict7_down, conflict8_106, conflict9_106];

  conflicts1215 = [conflict13_1215];
  conflicts1317 = [conflict12_1317];
  conflicts1413 = [conflict12_1413, conflict16_1413, conflict17_1413];
  conflicts1612 = [conflict13_down, conflict14_1612, conflict15_1612];
}

// conflicts only for the four left-turning ODs

//################################################################
function defineConflictsTrafficLights(nLanes_main, nLanes_sec) {
  //################################################################

  setBasicConflicts(nLanes_main, nLanes_sec);


  // right

  conflicts05 = [];
  conflicts13 = [];
  conflicts20 = [];
  conflicts41 = [];

  // straight ahead

  conflicts00 = [];
  conflicts11 = [];
  conflicts23 = [];
  conflicts45 = [];

  // traffic lights, left

  conflicts03 = [conflict1_03];
  conflicts15 = [conflict0_15];
  conflicts21 = [conflict4_21, conflict5_21];
  conflicts40 = [conflict2_40, conflict3_40];
  
  
  // right 6

  conflicts611 = [];
  conflicts79 = [];
  conflicts86 = [];
  conflicts107 = [];

  // straight ahead

  conflicts66 = [];
  conflicts77 = [];
  conflicts89 = [];
  conflicts1011 = [];

  // traffic lights, left

  conflicts69 = [conflict7_69];
  conflicts711 = [conflict6_711];
  conflicts87 = [conflict10_87, conflict11_87];
  conflicts106 = [conflict8_106, conflict9_106];
  
  // right 12

  conflicts1217 = [];
  conflicts1315 = [];
  conflicts1412 = [];
  conflicts1613 = [];

  // straight ahead
  
  conflicts1212 = [];
  conflicts1313 = [];
  conflicts1415 = [];
  conflicts1617 = [];

  // traffic lights, left

  conflicts1215 = [conflict13_1215];
  conflicts1317 = [conflict12_1317];
  conflicts1413 = [conflict16_1413, conflict17_1413];
  conflicts1612 = [conflict14_1612, conflict15_1612];
}

//###########################################################
function defineConflictsSymmetric(nLanes_main, nLanes_sec) {
  //###########################################################

  setBasicConflicts(nLanes_main, nLanes_sec);

  // conflict2_00,conflic3_00 not yet defined, also not connect to itself
  // in actual simulation

  // right

  conflicts05 = [];
  conflicts13 = [];
  conflicts20 = [];
  conflicts41 = [];

  // straight ahead (symmetric right priority)

  conflicts00 = [conflict2_00, conflict3_00];
  conflicts11 = [conflict4_11, conflict5_11];
  conflicts23 = [conflict1_up];
  conflicts45 = [conflict0_down];

  // left

  conflicts03 = [conflict1_03, conflict2_03];
  conflicts15 = [conflict0_15, conflict4_15];
  conflicts21 = [conflict4_21, conflict5_21];
  conflicts40 = [conflict2_40, conflict3_40];

  //
  //
  // right

  conflicts611 = [];
  conflicts79 = [];
  conflicts86 = [];
  conflicts107 = [];

  // straight ahead (symmetric right priority)

  conflicts66 = [conflict8_66, conflict9_66];
  conflicts77 = [conflict10_77, conflict11_77];
  conflicts89 = [conflict7_up];
  conflicts1011 = [conflict6_down];

  // left

  conflicts610 = [conflict7_69, conflict8_69];
  conflicts711 = [conflict6_711, conflict10_711];
  conflicts87 = [conflict10_87, conflict11_87];
  conflicts107 = [conflict8_106, conflict9_106];

  // right

  conflicts1217 = [];
  conflicts1315 = [];
  conflicts1412 = [];
  conflicts1613 = [];

  // straight ahead (symmetric right priority)

  conflicts1212 = [conflict14_1212, conflict15_1212];
  conflicts1313 = [conflict16_1313, conflict17_1313];
  conflicts1415 = [conflict13_up];
  conflicts1617 = [conflict12_down];

  // left

  conflicts1216 = [conflict13_1215, conflict14_1215];
  conflicts1317 = [conflict12_1317, conflict16_1317];
  conflicts1413 = [conflict16_1413, conflict17_1413];
  conflicts1613 = [conflict14_1612, conflict15_1612];
}

// give one or two mainroad directions temporarily the "mainroad" rights
// to resolve gridlocks in "right-priority" rules if all four
// arms have waiting vehicles

//###########################################################
function resolveGridlock() {
  //###########################################################

  // straight ahead

  conflicts00 = [];
  conflicts11 = [];
  conflicts66 = [];
  conflicts77 = [];
  conflicts1212 = [];
  conflicts1313 = [];

  // left

  conflicts03 = [conflict1_03];
  conflicts15 = [conflict0_15];

  conflicts69 = [conflict7_69];
  conflicts711 = [conflict6_711];

  conflicts1215 = [conflict13_1215];
  conflicts1317 = [conflict12_1317];
}

/* #################################################################

Defining the basic conflicts in connecting one link to the next
as a struct-like variable

The actual conflicts for a given OD and a given intersection control 
(PriorityRoad, Symmetric, TrafficLights) are subsets of the basic conflicts
and their symmetric counterparts. They are defined in 
defineConflicts(.) => defineConflictsPriorityRoad(.) etc

Conflict components:
.roadConflict: the crossing road causing the potential conflict
               (merging is handled as pointwise onramp
.dest:         filters destination links for the vehicles on the 
               conflicting road possibly leading to a conflict ([]=all)
.ucOther:      absolute longit (u) conflict position on the conflicting road
.ducExitOwn:   distance between the conflict point in target-road coords
               and the entering point on the target road
               (distinguish between source-road, target-road and 
                conflicting-road coordinates; source road coords not used
                for specifying conflict points)

Example for conflicts for OD 21 (left turn northwards->westwards)
caused by road 0 (straight road eastwards):

  conflict0_21= {roadConflict: network[0], 
		 dest:         [0,3], //conflict straight-on and left turners
		 ucOther:      ucOther[3], // about half the road-0 length
		 ducExitOwn:   ducExitOwn[3]};  // near zero (can be <0)


  //(1) determine the road-axis u values of the conflicting point
  // * component .ucOther:    absolute u value on the conflicting road
  // * component .ducExitOwn: distance between conflict on target road
  //   and the exit/enter point uTarget
  // at least the half follows from symmetry

//################################################################*/

function setBasicConflicts(nLanes_main, nLanes_sec) {
  // <input>
  var conflictName = [
    "OD 23, conflicting road 0 (conflict0_up)", // up=OD 23
    "OD 23, conflicting road 1 (conflict1_up)",
    "OD 03, conflicting road 1 (conflict1_03)",
    "OD 21, conflicting road 0 (conflict0_21)",
    "OD 21, conflicting road 4 (conflict4_21)",
    "OD 21, conflicting road 5 (conflict5_21)",
    "OD 23, conflicting road 0 (conflict0_up)", // up=OD 23
    "OD 23, conflicting road 1 (conflict1_up)",
    "OD 03, conflicting road 1 (conflict1_03)",
    "OD 21, conflicting road 0 (conflict0_21)",
    "OD 21, conflicting road 4 (conflict4_21)",
    "OD 21, conflicting road 5 (conflict5_21)",
    "OD 23, conflicting road 0 (conflict0_up)", // up=OD 23
    "OD 23, conflicting road 1 (conflict1_up)",
    "OD 03, conflicting road 1 (conflict1_03)",
    "OD 21, conflicting road 0 (conflict0_21)",
    "OD 21, conflicting road 4 (conflict4_21)",
    "OD 21, conflicting road 5 (conflict5_21)",
  ];

  var sourceIndex = [
    2,
    2,
    0,
    2,
    2,
    2,
    2 + 6,
    2 + 6,
    0 + 6,
    2 + 6,
    2 + 6,
    2 + 6,
    2 + 6 + 6,
    2 + 6 + 6,
    0 + 6 + 6,
    2 + 6 + 6,
    2 + 6 + 6,
    2 + 6 + 6,
  ];
  var targetIndex = [
    3,
    3,
    3,
    1,
    1,
    1,
    3 + 6,
    3 + 6,
    3 + 6,
    1 + 6,
    1 + 6,
    1 + 6,
    3 + 6 + 6,
    3 + 6 + 6,
    3 + 6 + 6,
    1 + 6 + 6,
    1 + 6 + 6,
    1 + 6 + 6,
  ];
  var conflictIndex = [
    0,
    1,
    1,
    0,
    4,
    5,
    0 + 6,
    1 + 6,
    1 + 6,
    0 + 6,
    4 + 6,
    5 + 6,
    0 + 6 + 6,
    1 + 6 + 6,
    1 + 6 + 6,
    0 + 6 + 6,
    4 + 6 + 6,
    5 + 6 + 6,
  ];
  var trajAltIndex = [
    -1, -1, 1, 1, 1, 1, -1, -1, 1, 1, 1, 1, -1, -1, 1, 1, 1, 1,
  ]; // alternativ traj  on destination road
  // (-1: none)
  var xc_known = [false, false, false, false, true, true];
  var uTarget = [0, 0, u03Target, u21Target, u21Target, u21Target];
  var uSource = [
    network[2].roadLen,
    network[2].roadLen,
    u03Source,
    u21Source,
    u21Source,
    u21Source,
  ];

  //</input>

  var ucOther = []; // output
  var ducExitOwn = [];

  // find exact xc,yc for the conflicts and corresponding
  // uConflict, uTargetConflict (uOwn) for all conflicts
  // xc is known/not known  for vertical/horiz conflicting roads

  for (var i = 0; i < conflictName.length; i++) {
    var iConflict = conflictIndex[i]; // conflicting road index
    var iSource = sourceIndex[i]; // source road index
    var iDest = targetIndex[i]; // destination road indecx
    var iTrajAlt = trajAltIndex[i];
    var valcTarget = xc_known[i]
      ? network[iConflict].traj[0](0)
      : network[iConflict].traj[1](0);
    var funTarget_x =
      iTrajAlt >= 0
        ? network[iDest].trajAlt[iTrajAlt].x
        : network[iDest].traj[0];
    var funTarget_y =
      iTrajAlt >= 0
        ? network[iDest].trajAlt[iTrajAlt].y
        : network[iDest].traj[1];
    var funTarget = xc_known[i] // the trajectory component to analyse
      ? funTarget_x
      : funTarget_y;
    var funTarget1 = xc_known[i] // the other traj component
      ? funTarget_y
      : funTarget_x;
    var umin = iTrajAlt >= 0 ? network[iDest].trajAlt[iTrajAlt].umin : 0;
    var umax =
      iTrajAlt >= 0
        ? network[iDest].trajAlt[iTrajAlt].umax
        : network[iDest].roadLen;
    if (false) {
      console.log("valcTarget=", valcTarget, " xc_known[i]=", xc_known[i]);
      console.log(
        "funTarget(0)=",
        funTarget(0),
        "funTarget1(0)=",
        funTarget1(0)
      );
      console.log(
        "funTarget(10)=",
        funTarget(10),
        "funTarget1(10)=",
        funTarget1(10)
      );
      console.log("umin=", umin, " umax=", umax);
    }
    var resultsTarget = findArg(funTarget, valcTarget, umin, umax);
    var ucTarget = resultsTarget[0];
    var xc = xc_known[i] ? valcTarget : funTarget1(ucTarget);
    var yc = xc_known[i] ? funTarget1(ucTarget) : valcTarget;

    var valcOther = xc_known[i] ? yc : xc;
    var funOther = xc_known[i]
      ? network[iConflict].traj[1]
      : network[iConflict].traj[0];

    // !! add +100 [m] to roadLen
    // to include possible antic downstream of road end
    var resultsOther = findArg(
      funOther,
      valcOther,
      0,
      network[iConflict].roadLen + 100
    );

    ucOther[i] = resultsOther[0]; // output
    ducExitOwn[i] = ucTarget - uTarget[i];

    if (false) {
      console.log(
        "results for OD ",
        iSource,
        iDest,
        "conflicting road",
        iConflict,
        ":",
        "\n  ucTarget=",
        ucTarget.toFixed(1),
        " dist=",
        resultsTarget[1].toFixed(1),
        " xc=",
        xc.toFixed(1),
        " yc=",
        yc.toFixed(1),
        " dist=",
        resultsOther[1].toFixed(1),
        " \n  ducExitOwn[i]=",
        ducExitOwn[i].toFixed(1),
        " ucOther[i]=",
        ucOther[i].toFixed(1),
        ""
      );
    }
  }

  // (2) define the independent and symmetric conflicts using above results
  // for ducExitOwn and ucOther for curved trajectories

  // (2a) conflicts by mainroads for straight ahead OD 23 (secondary road)
  // and by opposite mainroad for secondary left-turners

  conflict0_up = {
    roadConflict: network[0],
    dest: [0, 3], //straight-on and left turners
    ucOther: 0.5 * network[0].roadLen + offsetSec,
    ducExitOwn: radiusRight + offset20Target - offsetMain,
  };
  //ucOther: ucOther[0],
  //ducExitOwn: ducExitOwn[0]};

  conflict1_up = {
    roadConflict: network[1],
    dest: [1, 5],
    ucOther: 0.5 * network[0].roadLen - offsetSec,
    ducExitOwn: radiusRight + offset20Target + offsetMain,
  };
  //ucOther: ucOther[1],
  //ducExitOwn: ducExitOwn[1]};

  conflict6_up = {
    roadConflict: network[6],
    dest: [0, 3], //straight-on and left turners
    ucOther: 0.5 * network[6].roadLen + offsetSec,
    ducExitOwn: radiusRight + offset20Target - offsetMain,
  };
  //ucOther: ucOther[0],
  //ducExitOwn: ducExitOwn[0]};

  conflict7_up = {
    roadConflict: network[7],
    dest: [],
    ucOther: 0.5 * network[6].roadLen - offsetSec,
    ducExitOwn: radiusRight + offset20Target + offsetMain,
  };
  //ucOther: ucOther[1],
  //ducExitOwn: ducExitOwn[1]};
  conflict12_up = {
    roadConflict: network[12],
    dest: [0, 3], //straight-on and left turners
    ucOther: 0.5 * network[12].roadLen + offsetSec,
    ducExitOwn: radiusRight + offset20Target - offsetMain,
  };
  //ucOther: ucOther[0],
  //ducExitOwn: ducExitOwn[0]};

  conflict13_up = {
    roadConflict: network[13],
    dest: [],
    ucOther: 0.5 * network[12].roadLen - offsetSec,
    ducExitOwn: radiusRight + offset20Target + offsetMain,
  };
  //ucOther: ucOther[1],
  //ducExitOwn: ducExitOwn[1]};

  // symmetry

  conflict0_down = {
    roadConflict: network[0],
    dest: [], // all
    ucOther: conflict1_up.ucOther,
    ducExitOwn: conflict1_up.ducExitOwn,
  };

  conflict1_down = {
    roadConflict: network[1],
    dest: [1, 5],
    ucOther: conflict0_up.ucOther,
    ducExitOwn: conflict0_up.ducExitOwn,
  };

  conflict6_down = {
    roadConflict: network[6],
    dest: [], // all
    ucOther: conflict7_up.ucOther,
    ducExitOwn: conflict7_up.ducExitOwn,
  };

  conflict7_down = {
    roadConflict: network[7],
    dest: [1, 5],
    ucOther: conflict6_up.ucOther,
    ducExitOwn: conflict6_up.ducExitOwn,
  };

  conflict12_down = {
    roadConflict: network[12],
    dest: [], // all
    ucOther: conflict13_up.ucOther,
    ducExitOwn: conflict13_up.ducExitOwn,
  };

  conflict13_down = {
    roadConflict: network[13],
    dest: [1, 5],
    ucOther: conflict12_up.ucOther,
    ducExitOwn: conflict12_up.ducExitOwn,
  };

  // (2b) conflicts by straight-on mainroad vehicles (only for right priority
  // where there are no longer mainroad directions)

  // 2*offsetSec+laneWidth: wait one laneWidth upstream of sec road boundary
  // offsetSec: distance of sec road axis to center
  // must be consistent with network[0/1].connect(network[0/1],...)

  conflict2_00 = {
    roadConflict: network[2],
    dest: [],
    ucOther: conflict0_up.ducExitOwn + network[2].roadLen,
    ducExitOwn: 2 * offsetSec + laneWidth + offsetSec,
  };

  conflict8_66 = {
    roadConflict: network[8],
    dest: [],
    ucOther: conflict6_up.ducExitOwn + network[8].roadLen,
    ducExitOwn: 2 * offsetSec + laneWidth + offsetSec,
  };

  conflict14_1212 = {
    roadConflict: network[14],
    dest: [],
    ucOther: conflict12_up.ducExitOwn + network[14].roadLen,
    ducExitOwn: 2 * offsetSec + laneWidth + offsetSec,
  };

  conflict3_00 = {
    roadConflict: network[3],
    dest: [],
    ucOther: conflict0_up.ducExitOwn,
    ducExitOwn: 2 * offsetSec + laneWidth + offsetSec,
  };

  conflict9_66 = {
    roadConflict: network[9],
    dest: [],
    ucOther: conflict6_up.ducExitOwn,
    ducExitOwn: 2 * offsetSec + laneWidth + offsetSec,
  };

  conflict15_1212 = {
    roadConflict: network[15],
    dest: [],
    ucOther: conflict12_up.ducExitOwn,
    ducExitOwn: 2 * offsetSec + laneWidth + offsetSec,
  };

  // symmetry

  conflict4_11 = {
    roadConflict: network[4],
    dest: [],
    ucOther: conflict2_00.ucOther,
    ducExitOwn: conflict2_00.ducExitOwn,
  };

  conflict5_11 = {
    roadConflict: network[5],
    dest: [],
    ucOther: conflict3_00.ucOther,
    ducExitOwn: conflict3_00.ducExitOwn,
  };

  conflict10_77 = {
    roadConflict: network[10],
    dest: [],
    ucOther: conflict8_66.ucOther,
    ducExitOwn: conflict8_66.ducExitOwn,
  };

  conflict11_77 = {
    roadConflict: network[11],
    dest: [],
    ucOther: conflict9_66.ucOther,
    ducExitOwn: conflict9_66.ducExitOwn,
  };

  conflict16_1313 = {
    roadConflict: network[16],
    dest: [],
    ucOther: conflict14_1212.ucOther,
    ducExitOwn: conflict14_1212.ducExitOwn,
  };

  conflict17_1313 = {
    roadConflict: network[17],
    dest: [],
    ucOther: conflict15_1212.ucOther,
    ducExitOwn: conflict15_1212.ducExitOwn,
  };

  // (2c) conflicts by opposite mainroad for mainroad left-turners

  conflict1_03 = {
    roadConflict: network[1], //by road 1 for OD 03
    dest: [1, 3], // only main straight-on and right
    ucOther: ucOther[2],
    ducExitOwn: ducExitOwn[2],
  };

  conflict7_69 = {
    roadConflict: network[7], //by road 1 for OD 03
    dest: [7, 9], // only main straight-on and right
    ucOther: ucOther[ROAD_CONV_2[2]],
    ducExitOwn: ducExitOwn[ROAD_CONV_2[2]],
  };

  conflict13_1215 = {
    roadConflict: network[13], //by road 1 for OD 03
    dest: [13, 15], // only main straight-on and right
    ucOther: ucOther[ROAD_CONV_3[2]],
    ducExitOwn: ducExitOwn[ROAD_CONV_3[2]],
  };

  // symmetry

  conflict0_15 = {
    roadConflict: network[0], //by road 0 for OD 15
    dest: [0, 5], // US style: only main-straight/right
    ucOther: conflict1_03.ucOther,
    ducExitOwn: conflict1_03.ducExitOwn,
  };

  conflict6_711 = {
    roadConflict: network[ROAD_CONV_2[0]], //by road 0 for OD 15
    dest: [ROAD_CONV_2[0], ROAD_CONV_2[5]], // US style: only main-straight/right
    ucOther: conflict7_69.ucOther,
    ducExitOwn: conflict7_69.ducExitOwn,
  };

  conflict12_1317 = {
    roadConflict: network[ROAD_CONV_3[0]], //by road 0 for OD 15
    dest: [ROAD_CONV_3[0], ROAD_CONV_3[5]], // US style: only main-straight/right
    ucOther: conflict13_1215.ucOther,
    ducExitOwn: conflict13_1215.ducExitOwn,
  };

  // (2d) conflicts by right road for mainroad left-turners for
  // right-priority rules (no 3_03 since target road)
  //!! no precide calc ucOther, ducOwn but this is tricky and approx good

  conflict2_03 = {
    roadConflict: network[2], //by road 1 for OD 03
    dest: [1, 3], // only secondary straight or left
    ucOther: conflict0_up.ducExitOwn + network[2].roadLen,
    ducExitOwn: conflict1_03.ducExitOwn,
  };

  conflict8_69 = {
    roadConflict: network[8], //by road 1 for OD 03
    dest: [7, 9], // only secondary straight or left
    ucOther: conflict6_up.ducExitOwn + network[8].roadLen,
    ducExitOwn: conflict7_69.ducExitOwn,
  };

  conflict14_1215 = {
    roadConflict: network[14], //by road 1 for OD 03
    dest: [13, 15], // only secondary straight or left
    ucOther: conflict12_up.ducExitOwn + network[14].roadLen,
    ducExitOwn: conflict13_1215.ducExitOwn,
  };

  // symmetry

  conflict4_711 = {
    roadConflict: network[4], //by road 1 for OD 03
    dest: [0, 5], // only secondary straight or left
    ucOther: conflict2_03.ucOther,
    ducExitOwn: conflict2_03.ducExitOwn,
  };

  conflict10_711 = {
    roadConflict: network[10], //by road 1 for OD 03
    dest: [6, 11], // only secondary straight or left
    ucOther: conflict8_69.ucOther,
    ducExitOwn: conflict8_69.ducExitOwn,
  };

  conflict16_1317 = {
    roadConflict: network[16], //by road 1 for OD 03
    dest: [12, 17], // only secondary straight or left
    ucOther: conflict14_1215.ucOther,
    ducExitOwn: conflict14_1215.ducExitOwn,
  };

  // (2e) conflicts by the secondary roads straight traffic
  // for secondary left turners of the other direction
  // anticipation -> roads 2/4 needed as well since
  //roads 3/5 starts too near the conflict (u>roadLen OK)

  conflict0_21 = {
    roadConflict: network[0],
    dest: [0, 3], //conflict straight-on and left turners
    ucOther: ucOther[3],
    ducExitOwn: ducExitOwn[3],
  };

  conflict6_87 = {
    roadConflict: network[ROAD_CONV_2[0]],
    dest: [ROAD_CONV_2[0], ROAD_CONV_2[3]], //conflict straight-on and left turners
    ucOther: ucOther[ROAD_CONV_2[3]],
    ducExitOwn: ducExitOwn[ROAD_CONV_2[3]],
  };

  conflict12_1413 = {
    roadConflict: network[ROAD_CONV_3[0]],
    dest: [ROAD_CONV_3[0], ROAD_CONV_3[3]], //conflict straight-on and left turners
    ucOther: ucOther[ROAD_CONV_3[3]],
    ducExitOwn: ducExitOwn[ROAD_CONV_3[3]],
  };

  conflict4_21 = {
    roadConflict: network[4], // By road 4 for OD 21
    dest: [1, 5], // right priority+US style left
    ucOther: ucOther[4],
    ducExitOwn: ducExitOwn[4],
  };

  conflict10_87 = {
    roadConflict: network[ROAD_CONV_2[4]], // By road 4 for OD 21
    dest: [ROAD_CONV_2[1], ROAD_CONV_2[5]], // right priority+US style left
    ucOther: ucOther[ROAD_CONV_2[4]],
    ducExitOwn: ducExitOwn[ROAD_CONV_2[4]],
  };

  conflict16_1413 = {
    roadConflict: network[ROAD_CONV_3[4]], // By road 4 for OD 21
    dest: [ROAD_CONV_3[1], ROAD_CONV_3[5]], // right priority+US style left
    ucOther: ucOther[ROAD_CONV_3[4]],
    ducExitOwn: ducExitOwn[ROAD_CONV_3[4]],
  };

  conflict5_21 = {
    roadConflict: network[5], // By road 5 for OD 21
    dest: [], // sink road
    ucOther: ucOther[5],
    ducExitOwn: ducExitOwn[5],
  };

  conflict11_87 = {
    roadConflict: network[ROAD_CONV_2[5]], // By road 5 for OD 21
    dest: [], // sink road
    ucOther: ucOther[ROAD_CONV_2[5]],
    ducExitOwn: ducExitOwn[ROAD_CONV_2[5]],
  };

  conflict17_1413 = {
    roadConflict: network[ROAD_CONV_3[5]], // By road 5 for OD 21
    dest: [], // sink road
    ucOther: ucOther[ROAD_CONV_3[5]],
    ducExitOwn: ducExitOwn[ROAD_CONV_3[5]],
  };

  // symmetry

  conflict1_40 = {
    roadConflict: network[1],
    dest: [1, 5], //straight-on and left turners
    ucOther: conflict0_21.ucOther,
    ducExitOwn: conflict0_21.ducExitOwn,
  };

  conflict7_106 = {
    roadConflict: network[ROAD_CONV_2[1]],
    dest: [ROAD_CONV_2[1], ROAD_CONV_2[5]], //straight-on and left turners
    ucOther: conflict6_87.ucOther,
    ducExitOwn: conflict6_87.ducExitOwn,
  };

  conflict13_1612 = {
    roadConflict: network[ROAD_CONV_3[1]],
    dest: [ROAD_CONV_3[1], ROAD_CONV_3[5]], //straight-on and left turners
    ucOther: conflict12_1413.ucOther,
    ducExitOwn: conflict12_1413.ducExitOwn,
  };

  conflict2_40 = {
    roadConflict: network[2], // By road 2 for OD 40
    dest: [0, 3], // right priority+US style left
    ucOther: conflict10_87.ucOther,
    ducExitOwn: conflict10_87.ducExitOwn,
  };

  conflict8_106 = {
    roadConflict: network[ROAD_CONV_2[2]], // By road 2 for OD 40
    dest: [ROAD_CONV_2[0], ROAD_CONV_2[3]], // right priority+US style left
    ucOther: conflict10_87.ucOther,
    ducExitOwn: conflict10_87.ducExitOwn,
  };

  conflict14_1612 = {
    roadConflict: network[ROAD_CONV_3[2]], // By road 2 for OD 40
    dest: [ROAD_CONV_3[0], ROAD_CONV_3[3]], // right priority+US style left
    ucOther: conflict16_1413.ucOther,
    ducExitOwn: conflict16_1413.ducExitOwn,
  };

  conflict3_40 = {
    roadConflict: network[3], // By road 3 for OD 40
    dest: [], // road 3 is only sink road
    ucOther: conflict5_21.ucOther,
    ducExitOwn: conflict5_21.ducExitOwn,
  };

  conflict9_106 = {
    roadConflict: network[ROAD_CONV_2[3]], // By road 3 for OD 40
    dest: [], // road 3 is only sink road
    ucOther: conflict11_87.ucOther,
    ducExitOwn: conflict11_87.ducExitOwn,
  };

  conflict15_1612 = {
    roadConflict: network[ROAD_CONV_3[3]], // By road 3 for OD 40
    dest: [], // road 3 is only sink road
    ucOther: conflict17_1413.ucOther,
    ducExitOwn: conflict17_1413.ducExitOwn,
  };
}

function getDirection(arr, direction) {
  if (arr[direction][0] == undefined) throw new Error('Direção lateral detectada como undefined ou nula') 
  let hasMultipleRoutes = Array.isArray(arr[direction][0]);
  if (hasMultipleRoutes) {
    const arrToGet = arr[direction];
    const randomIndex = Math.floor(Math.random() * arrToGet.length);
    return arrToGet[randomIndex];
  }
  return arr[direction];
}
