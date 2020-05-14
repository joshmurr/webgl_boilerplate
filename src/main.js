import GL_BP from './GL_BP';
import Icosahedron from './geometry/icosahedron.js';
import RandomPointSphere from './geometry/randomPointSphere.js';
import Cube from './geometry/cube.js';
import Quad from './geometry/quad.js';
import './styles.css';
var facesVert = require('./glsl/facesVert.glsl');
var facesFrag = require('./glsl/facesFrag.glsl');
var pointsVert = require('./glsl/pointsVert.glsl');
var pointsFrag = require('./glsl/pointsFrag.glsl');
var basicFrag = require('./glsl/basicFrag.glsl');

window.onload = function main() {
    const GL = new GL_BP();
    // Create canvas of specified size and setup WebGL instance
    GL.init(512,512);
    // GL.initShaderProgram('faces', facesVert, facesFrag, 'TRIANGLES');
    // GL.initShaderProgram('points', pointsVert, pointsFrag, 'POINTS');
    GL.initShaderProgram('lines', pointsVert, basicFrag, 'LINES');
    GL.initShaderProgram('debug', pointsVert, basicFrag, 'TRIANGLE_STRIP');


    // Init scene for all programs so they receive the same 'global' uniforms
    // GL.initBasicScene('faces');
    // GL.initBasicScene('points');
    GL.updateGlobalUniforms();

    GL.cameraPosition = [0, 0, 5];
    // const rSphere = new RandomPointSphere(GL.gl, 10000);
    // GL.linkProgram('points', rSphere);
    // rSphere.rotate = { s:0.001, r:[1, 1, 0]};
    //
    const quad = new Quad(GL.gl);
    // GL.linkProgram('debug', quad);

    const uCube = new Cube(GL.gl, 'DEBUG');
    GL.linkProgram('lines', uCube);
    uCube.rotate = { s:0.001, r:[1, 1, 0]};

    function draw(now) {
        GL.draw(now);
        window.requestAnimationFrame(draw);
    }
    window.requestAnimationFrame(draw);

    // GL.canvas.onmousemove = function(e) {
        // const x = 2.0 * (e.pageX - this.offsetLeft)/this.width - 1.0;
        // const y = -(2.0 * (e.pageY - this.offsetTop)/this.height - 1.0);
    // };
};
