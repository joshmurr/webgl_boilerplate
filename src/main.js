import GL_BP from './GL_BP';
// import GameOfLife from './gameoflife/gameoflife.js';
// var facesVert = require('./glsl/facesVert.glsl');
// var facesFrag = require('./glsl/facesFrag.glsl');
// var pointsVert = require('./particles/pointsVert.glsl');
// var pointsFrag = require('./particles/pointsFrag.glsl');
// var basicFrag = require('./glsl/basicFrag.glsl');

// var textureVert = require('./glsl/textureVert.glsl');
// var textureFrag = require('./glsl/textureFrag.glsl');

var updateVert = require('./glsl/TFBparticles/particle_update_vert.glsl');
var updateFrag = require('./glsl/TFBparticles/passthru_frag.glsl');
var renderVert = require('./glsl/TFBparticles/particle_render_vert.glsl');
var renderFrag = require('./glsl/TFBparticles/particle_render_frag.glsl');

window.onload = function main() {
    const GL = new GL_BP();
    // Create canvas of specified size and setup WebGL instance
    GL.init(512,512);

    const transformFeedbackVaryings = [
        "v_Position",
        "v_Age",
        "v_Life",
        "v_Velocity",
    ];

    // GL.initShaderProgram('update', updateVert, updateFrag, 'POINTS', transformFeedbackVaryings);

    // GL.globalUniforms([ LIST OF GLOBAL UNIFORMS ]);
    GL.initShaderProgram('update', updateVert, updateFrag, transformFeedbackVaryings, null);
    GL.initShaderProgram('render', renderVert, renderFrag, null, 'POINTS');
    const ParticleSystem = GL.ParticleSystem('update', 'render', 1000);
    // GL.linkGeometry('update', _geometry);
    GL.initProgramUniforms('update', ['u_TimeDelta']);

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
