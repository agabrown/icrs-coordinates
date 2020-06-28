/*
 * P5/Processing sketch that illustrates interactively the meaning of the vector triad [p,q,r]
 * in the ICRS in relation to the coordinates (alpha,delta).
 *
 * Anthony Brown Jun 2020 - Jun 2020
 */

var mptab10 = new Map();
mptab10.set('blue', [ 31, 119, 180]);
mptab10.set('orange', [255, 127,  14]);
mptab10.set('green', [ 44, 160,  44]);
mptab10.set('red', [214,  39,  40]);
mptab10.set('purple', [148, 103, 189]);
mptab10.set('brown', [140,  86,  75]);
mptab10.set('magenta', [227, 119, 194]);
mptab10.set('grey', [127, 127, 127]);
mptab10.set('olive', [188, 189,  34]);
mptab10.set('cyan', [ 23, 190, 207]);

var paddingHorizontal = 50;
var paddingVertical = 50;

var longRightwardsArrow = "";
var longLeftwardsArrow = "";

var camRotY = 20;
var camRotYMin = -180;
var camRotYMax = 180;
var camRotYStep = 1;

var camRotZ = -20;
var camRotZMin = -180;
var camRotZMax = 180;
var camRotZStep = 1;

var alpha = 75;
var alphaMin = 0;
var alphaMax = 360;
var alphaStep = 1;

var delta = 43;
var deltaMin = -90;
var deltaMax = 90;
var deltaStep = 1;

var pvec, qvec, rvec, origin, sourcvec;

var explanationText;
var explain;
var showHelp = true;
var helpVisible = true;
var helpButton;

var guiVisible = true;
var gui;

var rasc, rdesc, xasc, xdesc, yasc, ydesc;

const REF_PLANE_RADIUS = 3.0;
const SCALE = 100;
const HELPSIZE = 600;

var sketch = function(p) {

    p.preload = function() {
        explanationText = p.loadStrings("explanation.html");
    }

    p.setup = function() {
        var canvas = p.createCanvas(900, 600, p.WEBGL);
        p.ortho();
        canvas.position(0,0);
        gui = p.createGui(this, 'ICRS Coordinates');
        gui.addGlobals('showHelp', 'camRotY', 'camRotZ', 'alpha', 'delta');
        gui.setPosition(p.width, paddingVertical);

        explain = p.createDiv(p.join(explanationText, " "));
        explain.position(paddingHorizontal, paddingVertical);
        explain.size(HELPSIZE);

        p.ellipseMode(p.RADIUS);
        p.angleMode(p.DEGREES);

        origin = p.createVector(0,0,0);

        p.noLoop();
        p.noFill();
        p.smooth();
    }

    p.draw = function() {
        p.background(255);

        if (showHelp & !helpVisible) {
            explain = p.createDiv(p.join(explanationText, " "));
            explain.position(paddingHorizontal, paddingVertical);
            explain.size(HELPSIZE);
            helpVisible = true;
        } else {
            if (!showHelp) {
                explain.remove();
                helpVisible = false;
            }
        }

        p.push();

        rightHanded3DtoWEBGL(p, camRotY, camRotZ);

        p.push()

        // XYZ axes of the ICRS
        p.strokeWeight(1);
        p.stroke(0);
        p.line(0,0,0,REF_PLANE_RADIUS*SCALE*1.05,0,0);
        p.push()
        p.translate(REF_PLANE_RADIUS*SCALE*1.05,0,0);
        p.rotateZ(-90);
        p.cone(SCALE*0.05, SCALE*0.1);
        p.pop();
        p.line(0,0,0,0,REF_PLANE_RADIUS*SCALE*1.05,0);
        p.push()
        p.translate(0,REF_PLANE_RADIUS*SCALE*1.05,0);
        p.cone(SCALE*0.05, SCALE*0.1);
        p.pop();
        p.line(0,0,0,0,0,REF_PLANE_RADIUS*SCALE*1.05);
        p.push()
        p.translate(0,0,REF_PLANE_RADIUS*SCALE*1.05);
        p.rotateX(90);
        p.cone(SCALE*0.05, SCALE*0.1);
        p.pop();

        p.pop();

        pvec = p.createVector(0,1,0)
        qvec = p.createVector(0,0,1);
        rvec = p.createVector(1,0,0);
        pvec.mult(SCALE);
        qvec.mult(SCALE);
        rvec.mult(SCALE);
        sourcevec = p.createVector(p.cos(alpha)*p.cos(delta), p.sin(alpha)*p.cos(delta), p.sin(delta));
        sourcevec.mult(REF_PLANE_RADIUS*SCALE);

        p.push();
        p.strokeWeight(3);
        p.stroke(0);
        p.rotateZ(alpha);
        p.rotateY(-delta);
        drawLine(p, origin, rvec);
        p.push()
        p.translate(rvec.mag(), 0, 0);
        p.rotateZ(-90);
        p.cone(SCALE*0.05, SCALE*0.1);
        p.pop();
        p.pop();

        p.push();
        p.translate(sourcevec.x, sourcevec.y, sourcevec.z);
        p.rotateZ(alpha);
        p.rotateY(-delta);
        p.strokeWeight(3);
        p.stroke(mptab10.get('blue'))
        drawLine(p, origin, rvec);
        p.push()
        p.translate(rvec.mag(), 0, 0);
        p.rotateZ(-90);
        p.cone(SCALE*0.05, SCALE*0.1);
        p.pop();
        p.stroke(mptab10.get('orange'));
        drawLine(p, origin, pvec);
        p.push()
        p.translate(0, pvec.mag(), 0);
        p.cone(SCALE*0.05, SCALE*0.1);
        p.pop();
        p.stroke(mptab10.get('green'));
        drawLine(p, origin, qvec);
        p.push()
        p.translate(0, 0, qvec.mag());
        p.rotateX(90);
        p.cone(SCALE*0.05, SCALE*0.1);
        p.pop();
        p.stroke(0);
        p.sphere(SCALE*0.05);
        p.pop();

        // Reference plane (XY plane of BCRS, loosely speaking the Ecliptic plane)
        // Draw this last so that the transparency works correctly (where the intention
        // is to see the orbital ellipse through the plane).
        p.noStroke();
        p.fill(mptab10.get('red')[0], mptab10.get('red')[1], mptab10.get('red')[2], 150);
        p.ellipse(0, 0, REF_PLANE_RADIUS*SCALE, REF_PLANE_RADIUS*SCALE, 50);

        p.pop();
    }

}

var myp5 = new p5(sketch);

/*
 * Apply this transformation so that one can work in a normal righthanded Cartesian coordinate
 * system. The transformation takes care of placing things correctly in the 'device' (here WEBGL)
 * coordinates.
 *
 * So typically you do the following:
 * p.push();
 * rightHanded3DtoWEBGL(p, rotY, rotZ);
 * ...
 * drawing instructions with coordinates now to be interpreted in normal righthanded Cartesian
 * coordinate system
 * ...
 * p.pop();
 *
 * Parameters:
 * p - the p5 object
 * rotY - rotation angle around Y (sets the viewpoint)
 * rotZ - rotation angle around Z (sets the viewpoint)
 */
function rightHanded3DtoWEBGL(p, rotY, rotZ) {
    p.applyMatrix(0, 0, 1, 0,
        1, 0, 0, 0,
        0, -1, 0, 0,
        0, 0, 0, 1);
    p.rotateY(rotY);
    p.rotateZ(rotZ);
}

/*
 * Draw a line between two points represented as p5.Vector instances.
 *
 * Parameters:
 * p - the p5 object
 * a - first point
 * b - second point
 */
function drawLine(p, a, b) {
    p.line(a.x, a.y, a.z, b.x, b.y, b.z);
}
