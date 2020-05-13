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
    GL.initShaderProgram('faces', facesVert, facesFrag, 'TRIANGLES');
    GL.initShaderProgram('points', pointsVert, pointsFrag, 'POINTS');
    GL.initBasicScene('faces');
    GL.initBasicScene('points');

    const i1 = new Icosahedron(GL.gl);
    GL.linkProgram('faces', i1);
    i1.translate = [0, 0, -10];
    i1.rotate = { s:0.001, r:[0, 1, 0]};

    const i2 = new Icosahedron(GL.gl);
    GL.linkProgram('faces', i2);
    i2.translate = [2, 0, -10];
    i2.rotate = { s:0.005, r:[0, 0, 1]};

    const i3 = new Icosahedron(GL.gl);
    GL.linkProgram('points', i3);
    i3.translate = [-2, 0, -10];
    i3.rotate = { s:0.002, r:[1, 0, 0]};

    GL.canvas.onmousemove = function(e) {
        const x = 2.0 * (e.pageX - this.offsetLeft)/this.width - 1.0;
        const y = -(2.0 * (e.pageY - this.offsetTop)/this.height - 1.0);
    };

    function draw(now) {
        GL.draw(now);
        window.requestAnimationFrame(draw);
    }
    window.requestAnimationFrame(draw);
};
