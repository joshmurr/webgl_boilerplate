import GL_BP from './GL_BP';
// import Geometry from './geometry.js';
import Icosahedron from './icosahedron.js';
import './styles.css';
var facesVert = require('./glsl/facesVert.glsl');
var facesFrag = require('./glsl/facesFrag.glsl');
var pointsVert = require('./glsl/pointsVert.glsl');
var pointsFrag = require('./glsl/pointsFrag.glsl');

window.onload = function main() {
    const GL = new GL_BP();
    // Create canvas of specified size and setup WebGL instance
    GL.init(512,512);
    GL.initShaderProgram('faces', facesVert, facesFrag);
    GL.initShaderProgram('points', pointsVert, pointsFrag);
    GL.initBasicScene('faces');

    const icosahedron = new Icosahedron(GL.gl);
    icosahedron.init(GL.programs['faces']);
    icosahedron.translate = [0, 0, -10];
    icosahedron.rotate = { s:0.001, r:[1, 1, 1]};

    GL.addMesh(icosahedron);

    GL.canvas.onmousemove = function(e) {
        const x = 2.0 * (e.pageX - this.offsetLeft)/this.width - 1.0;
        const y = -(2.0 * (e.pageY - this.offsetTop)/this.height - 1.0);
    };

    function draw(now) {
        GL.draw(now, 'faces');
        window.requestAnimationFrame(draw);
    }
    window.requestAnimationFrame(draw);
};
