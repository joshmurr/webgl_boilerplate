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

var textureVert = require('./glsl/textureVert.glsl');
var textureFrag = require('./glsl/textureFrag.glsl');

window.onload = function main() {
    const GL = new GL_BP();
    // Create canvas of specified size and setup WebGL instance
    GL.init(512,512);
    GL.initShaderProgram('lines', pointsVert, basicFrag, 'LINES');
    GL.initShaderProgram('debug', pointsVert, basicFrag, 'TRIANGLE_STRIP');
    GL.initShaderProgram('texture', textureVert, textureFrag, 'TRIANGLES');

    GL.updateGlobalUniforms();
    GL.cameraPosition = [0, 0, 5];

    const quad = new Quad(GL.gl);
    // GL.linkProgram('debug', quad);

    GL.testTexture('texture');
    const uCube = new Cube(GL.gl, 'SOLID');
    GL.linkProgram('texture', uCube);
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
