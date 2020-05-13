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

    const i1 = new Icosahedron(GL.gl);
    i1.init(GL.programs['faces']);
    i1.translate = [0, 0, -10];
    i1.rotate = { s:0.001, r:[0, 1, 0]};

    const i2 = new Icosahedron(GL.gl);
    i2.init(GL.programs['faces']);
    i2.translate = [2, 0, -10];
    i2.rotate = { s:0.005, r:[0, 0, 1]};

    const i3 = new Icosahedron(GL.gl);
    i3.init(GL.programs['faces']);
    i3.translate = [-2, 0, -10];
    i3.rotate = { s:0.002, r:[1, 0, 0]};

    GL.addMesh(i1);
    GL.addMesh(i2);
    GL.addMesh(i3);

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
