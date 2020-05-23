import GL_BP from './GL_BP';
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
    // GL.initShaderProgram('lines', pointsVert, basicFrag, 'LINES');
    // GL.initShaderProgram('debug', pointsVert, basicFrag, 'TRIANGLE_STRIP');
    GL.initShaderProgram('texture', textureVert, textureFrag, 'TRIANGLES');
    // GL.initShaderProgram('points', pointsVert, pointsFrag, 'POINTS');

    GL.updateGlobalUniforms();
    GL.cameraPosition = [0, 0, 5];
    const texOptions = {
        program : 'texture',
        width : 2,
        height : 2,
        data : new Uint8Array([
            0, 0, 255, 255,
            255, 0, 0, 255,
            255, 0, 0, 255,
            0, 0, 255, 255,
        ]),
    };

    const tex2 = {
        program : 'texture',
        width : 2,
        height : 2,
        data : new Uint8Array([
            0, 255, 255, 255,
            255, 255, 0, 255,
            255, 255, 0, 255,
            0, 255, 255, 255,
        ]),
    };

    const quad2 = GL.Quad();
    GL.dataTexture(tex2); // Create the texture
    // quad2.translate = [-1, 0, -3];
    // Link the program with the geometry and the texture
    GL.linkProgram('texture', quad2, tex2.name);

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
