import GL_BP from './GL_BP';
// import GameOfLife from './gameoflife/gameoflife.js';

window.addEventListener("load", golTFF());
// window.addEventListener("load", particles3D());
// window.addEventListener("load", simpleParticles());
// window.addEventListener("load", pointSphere());
// window.addEventListener("load", icosahedron());
//
function golTFF(){
    const updateVert = require('./glsl/gameoflifeTFF/update_vert.glsl');
    const updateFrag = require('./glsl/gameoflifeTFF/passthru_frag.glsl');
    const renderVert = require('./glsl/gameoflifeTFF/render_vert.glsl');
    const renderFrag = require('./glsl/gameoflifeTFF/render_frag.glsl');

    const GL = new GL_BP();
    GL.init(512,512);

    const transformFeedbackVaryings = [ "v_State" ];

    GL.initShaderProgram('update', updateVert, updateFrag, transformFeedbackVaryings, null);
    GL.initShaderProgram('render', renderVert, renderFrag, null, 'TRIANGLES_ARRAYS');
    GL.initProgramUniforms('render', [ 'u_Resolution', 'u_TotalTime' ]);
    // GL.initProgramUniforms('render', [ 'u_ProjectionMatrix', 'u_ViewMatrix' ]);

    const GOL = GL.GameOfLifeTFF('update', 'render');


    function draw(now) {
        GL.draw(now);
        window.requestAnimationFrame(draw);
    }
    window.requestAnimationFrame(draw);
}

function particles3D(){
    const updateVert = require('./glsl/particles3d/particle_update_vert.glsl');
    const updateFrag = require('./glsl/particles3d/passthru_frag.glsl');
    const renderVert = require('./glsl/particles3d/particle_render_vert.glsl');
    const renderFrag = require('./glsl/particles3d/particle_render_frag.glsl');

    const GL = new GL_BP();
    GL.init(512,512);

    const transformFeedbackVaryings = [
        "v_Position",
        "v_Velocity",
        "v_Age",
        "v_Life",
    ];

    GL.initShaderProgram('update', updateVert, updateFrag, transformFeedbackVaryings, null);
    GL.initShaderProgram('render', renderVert, renderFrag, null, 'POINTS');

    let d = [];
    for(let i=0; i<512*512; ++i){
        d.push(Math.random()*255);
        d.push(Math.random()*255);
        d.push(Math.random()*255);
    }

    GL.loadTexture('update', 'u_ForceField', './glsl/particles3d/rgperlin.png');
    GL.dataTexture('update', {
        name           :'u_RgNoise',
        width          : 512,
        height         : 512,
        internalFormat : 'RGB8',
        format         : 'RGB',
        data           : new Uint8Array(d),
    });

    GL.initProgramUniforms('update', [ 'u_TimeDelta', 'u_TotalTime' ]);
    GL.initProgramUniforms('render', [ 'u_ProjectionMatrix', 'u_ViewMatrix' ]);

    GL.setDrawParams('render', {
        clearColor : [0.0, 0.0, 0.0, 1.0],
        enable     : ['BLEND', 'CULL_FACE', 'DEPTH_TEST'], // if enable is changed, it will override defaults
        blendFunc  : ['SRC_ALPHA', 'ONE_MINUS_SRC_ALPHA'],
        depthFunc  : ['LEQUAL']
    });

    GL.cameraPosition = [0, 2, 3.5];

    const opts = { 
        numParticles : 3000000,
        lifeRange    : [1.01, 10.1],
        dimensions : 3, 
        birthRate : 0.99
    };
    const ParticleSystem = GL.ParticleSystem('update', 'render', opts);
    ParticleSystem.rotate = { s:0.0005, a:[0,1,0]};
    GL.initGeometryUniforms('render', [ 'u_ModelMatrix' ]);

    function draw(now) {
        GL.draw(now);
        window.requestAnimationFrame(draw);
    }
    window.requestAnimationFrame(draw);
}
// -------------------------------------------------------------------------------

// -------------------------------------------------------------------------------
function simpleParticles() {
    const updateVert = require('./glsl/TFBparticles/particle_update_vert.glsl');
    const updateFrag = require('./glsl/TFBparticles/passthru_frag.glsl');
    const renderVert = require('./glsl/TFBparticles/particle_render_vert.glsl');
    const renderFrag = require('./glsl/TFBparticles/particle_render_frag.glsl');

    const GL = new GL_BP();
    GL.init(512,512);

    const transformFeedbackVaryings = [
        "v_Position",
        "v_Velocity",
        "v_Age",
        "v_Life",
    ];

    GL.initShaderProgram('update', updateVert, updateFrag, transformFeedbackVaryings, null);
    GL.initShaderProgram('render', renderVert, renderFrag, null, 'POINTS');

    GL.initProgramUniforms('update', [ 'u_TimeDelta' ]);
    GL.initProgramUniforms('render', [ 'u_ProjectionMatrix', 'u_ViewMatrix' ]);

    GL.setDrawParams('render', {
        clearColor : [0.0, 0.0, 1.0, 1.0],
        enable     : ['BLEND', 'CULL_FACE', 'DEPTH_TEST'], // if enable is changed, it will override defaults
        blendFunc  : ['SRC_ALPHA', 'ONE_MINUS_SRC_ALPHA'],
    });

    const opts = { numParticles : 200 };
    const ParticleSystem = GL.ParticleSystem('update', 'render', opts);
    GL.initGeometryUniforms('render', [ 'u_ModelMatrix' ]);

    function draw(now) {
        GL.draw(now);
        window.requestAnimationFrame(draw);
    }
    window.requestAnimationFrame(draw);
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
