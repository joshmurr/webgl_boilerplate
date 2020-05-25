import GL_BP from './GL_BP';
// import GameOfLife from './gameoflife/gameoflife.js';

// var textureVert = require('./glsl/textureVert.glsl');
// var textureFrag = require('./glsl/textureFrag.glsl');


window.addEventListener("load", particles());
// window.addEventListener("load", pointSphere());
// window.addEventListener("load", icosahedron());

function particles() {
    const updateVert = require('./glsl/TFBparticles/particle_update_vert.glsl');
    const updateFrag = require('./glsl/TFBparticles/passthru_frag.glsl');
    const renderVert = require('./glsl/TFBparticles/particle_render_vert.glsl');
    const renderFrag = require('./glsl/TFBparticles/particle_render_frag.glsl');

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
    const ParticleSystem = GL.ParticleSystem('update', 'render', 100);
    // GL.linkGeometry('update', _geometry);
    GL.initProgramUniforms('update', [
        'u_TimeDelta',
    ]
    );
    GL.initProgramUniforms('render', [
        'u_ProjectionMatrix',
        'u_ViewMatrix']
    );
    GL.cameraPosition = [0, 0, 2];
    GL.initGeometryUniforms('render', [ 'u_ModelMatrix' ]);
    ParticleSystem.rotate = {s:0.001, a:[0,1,0]};
    GL.setDrawParams('render', {
        clearColor : [0.0, 0.0, 1.0, 1.0],
        enable     : ['BLEND', 'CULL_FACE', 'DEPTH_TEST'], // if enable is changed, it will override defaults
        blendFunc  : ['SRC_ALPHA', 'ONE_MINUS_SRC_ALPHA'],
    });

    // console.log(GL.programs);

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

function icosahedron() {
    const facesVert = require('./glsl/facesVert.glsl');
    const facesFrag = require('./glsl/facesFrag.glsl');
    const GL = new GL_BP();
    GL.init(512,512);

    GL.initShaderProgram('faces', facesVert, facesFrag, null, 'TRIANGLES');

    const icos = GL.Icosahedron('faces');
    icos.rotate = {s:0.001, a:[0,1,0]};

    GL.initProgramUniforms('faces', [
        'u_ProjectionMatrix',
        'u_ViewMatrix',
    ]);
    GL.cameraPosition = [0, 1, 4];

    GL.setDrawParams('faces', {
        clearColor : [0.8, 1.0, 1.0, 1.0],
    });
    GL.initGeometryUniforms('faces', [ 'u_ModelMatrix' ]);

    // console.log(GL.programs.faces.globalUniforms);

    function draw(now) {
        GL.draw(now);
        window.requestAnimationFrame(draw);
    }
    window.requestAnimationFrame(draw);
};

function pointSphere() {
    const pointsVert = require('./glsl/pointsVert.glsl');
    const pointsFrag = require('./glsl/pointsFrag.glsl');
    const basicFrag = require('./glsl/basicFrag.glsl');
    const GL = new GL_BP();
    // Create canvas of specified size and setup WebGL instance
    GL.init(512,512);

    GL.initShaderProgram('points', pointsVert, pointsFrag, null, 'POINTS');
    const points = GL.RandomPointSphere('points', 1000);
    points.rotate = {s:0.001, a:[0,1,0]};
    GL.initProgramUniforms('points', [
        'u_ProjectionMatrix',
        'u_ViewMatrix',
    ]);
    GL.cameraPosition = [0, 0, 3];

    GL.setDrawParams('points', {
        clearColor : [0.9, 0.9, 1.0, 1.0],
        clearDepth : [1.0],
    });

    function draw(now) {
        GL.draw(now);
        window.requestAnimationFrame(draw);
    }
    window.requestAnimationFrame(draw);
};
