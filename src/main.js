import GL_BP from './GL_BP';
import { Icosahedron } from './icosahedron.js';
import './styles.css';
var vertShader = require('./glsl/vert.glsl');
var fragShader = require('./glsl/frag.glsl');
var pointsVert = require('./glsl/pointsVert.glsl');
var pointsFrag = require('./glsl/pointsFrag.glsl');

window.onload = function main() {
    const GL = new GL_BP();
    // Create canvas of specified size and setup WebGL instance
    GL.init(512,512);
    GL.initShaderProgram('testProgram', vertShader, fragShader);
    GL.initShaderProgram('points', pointsVert, pointsFrag);
    GL.initGlobalUniforms('points');
    GL.initBasicScene();

    const icosahedron = new Icosahedron(GL.gl);
    icosahedron.init(GL.programs['points']);

    GL.addMesh(icosahedron);


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
