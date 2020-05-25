import { mat4, vec3 } from 'gl-matrix';
import Icosahedron from './geometry/icosahedron.js';
import RandomPointSphere from './geometry/randomPointSphere.js';
import PointCloud from './geometry/pointCloud.js';
import ParticleSystem from './geometry/particleSystem.js';
import Cube from './geometry/cube.js';
import Quad from './geometry/quad.js';

export default class GL_BP {
    constructor(){
        this._programs = {};

        /*
        this._programs = [
            programName : {
                name : ,
                shader   : shaderProgram,
                transformFeedback : **BOOL**,
                transformFeedbackVaryings : ,
                mode     : this.gl[_mode] (POINTS, TRIANGLES, etc),
                geometry : [],
                textures : [],
                globalUniforms : {
                    u_ProjectionMatrix : ,
                    u_ViewMatrix : ,
                    u_TimeDelta : ,
                    u_TotalTime : ,
                },
                drawSettings : {
                    viewport : ,
                    clearColor : ,
                    clearDepth : ,
                    clear : ,
                    enable : [],
                    disable : [],
                    framebuffer : ,

                }
            }
        }];
        */

        this._textures = {};
        this._framebuffers = {};
        this._time = 0.0;
        this._oldTimestamp = 0.0;
        this._deltaTime = 0.0;

        // Projection
        this._fieldOfView = 45 * Math.PI / 180;
        this._aspect = 1; // Default, to be changed on init
        this._zNear = 0.1;
        this._zFar = 100.0;
        this._projectionMat = mat4.create();
        // View
        this._viewMat = mat4.create();
        this._position = vec3.fromValues(0, 0.5, 5);
        this._target = vec3.fromValues(0, 0, 0);
        this._up = vec3.fromValues(0, 1, 0);
    }

    init(width, height){
        this.canvas = document.createElement("canvas");
        this.canvas.width = this.WIDTH = width;
        this.canvas.height = this.HEIGHT = height;
        const body = document.getElementsByTagName("body")[0];
        body.appendChild(this.canvas);
        this.gl = this.canvas.getContext('webgl2');
        this._aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
        if (!this.gl) {
            console.warn("You're browser does not support WebGL 2.0. Soz.");
            return;
        }
    }

    initTarget(width, height, canvasID){
        this.canvas = document.getElementById(canvasID);
        this.canvas.width = this.WIDTH = width;
        this.canvas.height = this.HEIGHT = height;
        this.gl = this.canvas.getContext('webgl2');
        this._aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
        if (!this.gl) {
            console.warn("You're browser does not support WebGL 2.0. Soz.");
            return;
        }
    }

    initShaderProgram(name, vsSource, fsSource, _transformFeedbackVaryings=null, _mode) {
        const shaderProgram = this.gl.createProgram();
        const vertexShader = this.loadShader(this.gl.VERTEX_SHADER, vsSource);
        const fragmentShader = this.loadShader(this.gl.FRAGMENT_SHADER, fsSource);
        this.gl.attachShader(shaderProgram, vertexShader);
        this.gl.attachShader(shaderProgram, fragmentShader);

        if(_transformFeedbackVaryings != null){
            this.gl.transformFeedbackVaryings(
                shaderProgram,
                _transformFeedbackVaryings,
                this.gl.INTERLEAVED_ATTRIBS
            );
        }

        this.gl.linkProgram(shaderProgram);

        if (!this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS)) {
            alert('Unable to initialize the shader program: ' + this.gl.getProgramInfoLog(shaderProgram));
            return null;
        }

        this._programs[name] = {
            shader   : shaderProgram,
            mode     : _mode,
            transformFeedback : _transformFeedbackVaryings ? true : false,
            transformFeedbackVaryings : _transformFeedbackVaryings,
            geometry : [],
            // textures : [],
            uniformNeedsUpdate : false,
            globalUniforms : {},
            drawParams : {
                clearColor : [0.9, 0.9, 0.9, 1.0],
                clearDepth : [1.0],
                clear      : ['COLOR_BUFFER_BIT', 'DEPTH_BUFFER_BIT'],
                viewport   : [0, 0, this.gl.canvas.width, this.gl.canvas.height],
                enable     : ['CULL_FACE', 'DEPTH_TEST'],
            }
            // u_ProjectionMatrix : {
            // type        : 'mat4',
            // uniformType : 'uniformMatrix4fv',
            // value       : this._projectionMat,
            // location    : this.gl.getUniformLocation(shaderProgram, 'u_ProjectionMatrix')
            // },
            // u_ViewMatrix : {
            // type        : 'mat4',
            // uniformType : 'uniformMatrix4fv',
            // value       : this._viewMat,
            // location    : this.gl.getUniformLocation(shaderProgram, 'u_ViewMatrix')
            // },
            // },
        }

    }

    initProgramUniforms(_program, _uniforms){
        const program = this.getProgram(_program);
        let globalUniforms = program.globalUniforms;
        const shaderProgram = program.shader;
        for(const uniform of _uniforms){
            switch(uniform){
                case 'u_TimeDelta' : {
                    this._programs[_program].uniformNeedsUpdate = true;
                    globalUniforms['u_TimeDelta'] = {
                        type        : 'float',
                        uniformType : 'uniform1f',
                        value       : this._deltaTime / 1000.0,
                        location    : this.gl.getUniformLocation(shaderProgram, 'u_TimeDelta')
                    };
                    break;
                }
                case 'u_TotalTime' : {
                    this._programs[_program].uniformNeedsUpdate = true;
                    globalUniforms['u_TotalTime'] = {
                        type        : 'float',
                        uniformType : 'uniform1f',
                        value       : this._time,
                        location    : this.gl.getUniformLocation(shaderProgram, 'u_TotalTime')
                    };
                    break;
                }
                case 'u_ProjectionMatrix' : {
                    this._programs[_program].uniformNeedsUpdate = true;
                    globalUniforms['u_ProjectionMatrix'] = {
                        type        : 'mat4',
                        uniformType : 'uniformMatrix4fv',
                        value       : this._projectionMat,
                        location    : this.gl.getUniformLocation(shaderProgram, 'u_ProjectionMatrix')
                    };
                    break;
                }
                case 'u_ViewMatrix' : {
                    this._programs[_program].uniformNeedsUpdate = true;
                    globalUniforms['u_ViewMatrix'] = {
                        type        : 'mat4',
                        uniformType : 'uniformMatrix4fv',
                        value       : this._viewMat,
                        location    : this.gl.getUniformLocation(shaderProgram, 'u_ViewMatrix')
                    };
                    break;
                }
            }
        }
    }

    initGeometryUniforms(_program, _uniforms){
        const program = this.getProgram(_program);
        const shaderProgram = program.shader;

        for(const geom of program.geometry){
            geom.initUniforms(shaderProgram, _uniforms);
        }
    }

    setDrawParams(_program, _options){
        const program = this.getProgram(_program);
        Object.assign(program.drawParams, _options);
    }

    loadShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            alert('An error occurred compiling the shaders: ' + this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    updateAllGlobalUniforms(){
        for(const program in this._programs){
            if(this._programs.hasOwnProperty(program) && this._programs[program].uniformNeedsUpdate){
                const _uniforms = this._programs[program].globalUniforms;
                this.updateGlobalUniforms(_uniforms);
            }
        }
    }

    updateGlobalUniforms(_uniforms){
        for(const uniform in _uniforms){
            if(_uniforms.hasOwnProperty(uniform)){
                switch(uniform) {
                    case 'u_TimeDelta' : {
                        _uniforms[uniform].value = this._deltaTime / 1000.0;
                        break;
                    }
                    case 'u_TotalTime' : {
                        _uniforms[uniform].value = this._time / 1000.0;
                        break;
                    }
                    case 'u_ProjectionMatrix' : {
                        this.updateProjectionMatrix(program);
                        break;
                    }
                    case 'u_ViewMatrix' : {
                        this.updateViewMatrix(program);
                        break;
                    }
                }
            }
        }
    }

    updateProjectionMatrix(_program){
        // this._projectionMat = mat4.create();
        mat4.perspective(
            this._programs[_program].globalUniforms.u_ProjectionMatrix.value,
            this._fieldOfView, this._aspect, this._zNear, this._zFar);
    }

    updateViewMatrix(_program){
        // this._viewMat = mat4.create();
        mat4.lookAt(
            this._programs[_program].globalUniforms.u_ViewMatrix.value,
            this._position, this._target, this._up);
    }

    linkProgram(_program, _geometry, _textureName=null){
        this._programs[_program].geometry.push(_geometry);

        const geometryTex = {};
        if(_textureName){
            // Update textures with program location
            // Textures are stored in the GL_BP object
            const texture = this._textures[_textureName];
            texture.location = this.gl.getUniformLocation(this._programs[_program].shader, texture.uniformName);

            // Textures are then passed along to get put into the geometry specific uniforms
            geometryTex[texture.uniformName] = texture;
        }
        _geometry.linkProgram(this._programs[_program].shader, [geometryTex]);
    }

    setGlobalUniforms(_uniforms){
        for(const uniform in _uniforms){
            if(_uniforms.hasOwnProperty(uniform)){
                const uniform_desc = _uniforms[uniform];
                switch(uniform_desc.type){
                    case 'mat4' : {
                        this.gl[uniform_desc.uniformType](
                            uniform_desc.location,
                            false,
                            uniform_desc.value,
                        );
                        break;
                    }
                    default : {
                        this.gl[uniform_desc.uniformType](
                            uniform_desc.location,
                            uniform_desc.value,
                        );
                    }
                }
            }
        }
    }

    framebuffer(_name){
        // Create empty framebuffer
        this._framebuffers[_name] = this.gl.createFramebuffer();
    }

    get framebuffers(){
        return this._framebuffers;
    }

    framebufferTexture2D(_framebuffer, _texture){
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this._framebuffers[_framebuffer]);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0,
            this.gl.TEXTURE_2D, _texture, 0);
    }

    get textures(){
        return this._textures;
    }

    bindTexture(_texture){
        this.gl.bindTexture(this.gl.TEXTURE_2D, _texture);
    }

    bindMainViewport(){
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    }

    getProgram(_program){
        try{
            const program = this._programs[_program];
            if(!program) throw new TypeError;
            else return program;
        }catch (err) {
            if (err instanceof TypeError) {
                console.error(`Shader Program '${_program}' is not found, did you mean: '${Object.keys(this._programs)}'?`);
            }
        }
    }


    draw(now, _selectedProgram=null, _viewPort=[null, null]){
        // TIME ---------------------------------
        if (this._oldTimestamp != 0) {
            this._deltaTime = now - this._oldTimestamp;
            if (this._deltaTime > 500.0) {
                this._deltaTime = 0.0;
            }
        }
        this._oldTimestamp = now;
        this._time += this._deltaTime;
        // --------------------------------------

        for(const program in this._programs){
            if(this._programs.hasOwnProperty(program)){
                // const program_desc = _selectedProgram === null ? this._programs[program] : this._programs[_selectedProgram];
                const program_desc = this._programs[program];
                /* SET DRAW PARAMETERS */
                for(const param in program_desc.drawParams){
                    if(program_desc.drawParams.hasOwnProperty(param)){
                        const values = program_desc.drawParams[param];
                        if(param === 'enable'){
                            /* ENABLE CAPS */
                            for(const val of values) this.gl[param](this.gl[val]);
                        } else if(param === 'blendFunc'){
                            this.gl[param](this.gl[values[0]], this.gl[values[1]]);
                        } else if(param === 'clear'){
                            /* CLEAR_BUFFER_BIT | DEPTH_BUFFER_BIT */
                            let clear = 0;
                            for(const val of values) clear |= this.gl[val];
                            this.gl[param](clear);
                        } else {
                            this.gl[param](...values);
                        }
                    }
                }

                if(program_desc.geometry.length < 1) continue;

                /* USE PROGRAM */
                this.gl.useProgram(program_desc.shader);

                /* UPDATE AND SET GLOBAL UNIFORMS */
                if(Object.keys(program_desc.globalUniforms).length > 0){
                    if(program_desc.uniformNeedsUpdate) this.updateGlobalUniforms(program.globalUniforms);
                    this.setGlobalUniforms(program_desc.globalUniforms);
                }

                for(const geom of program_desc.geometry){
                    /* TRANSFORM FEEDBACK */
                    if(program_desc.transformFeedback) {
                        geom.step(this.gl, this._deltaTime);
                        continue;
                    }

                    /* BIND VAO */
                    this.gl.bindVertexArray(geom.VAO);

                    /* UPDATE AND SET GEOM UNIFORMS */
                    if(geom.needsUpdate) {
                        geom.updateModelMatrix(this._time);
                        geom.setUniforms();
                        // debugger;
                    }
                    // const numUniforms = this.gl.getProgramParameter(program_desc.shader, this.gl.ACTIVE_UNIFORMS);
                    // for (let i = 0; i < numUniforms; ++i) {
                          // const info = this.gl.getActiveUniform(program_desc.shader, i);
                          // console.log('name:', info.name, 'type:', info.type, 'size:', info.size);
                    // }

                    /* DRAW */
                    switch(program_desc.mode){
                        case 'POINTS' : {
                            this.gl.drawArrays(this.gl[program_desc.mode], 0, geom.numVertices);
                            break;
                        }
                        default : {
                            this.gl.drawElements(this.gl[program_desc.mode], geom.numIndices, this.gl.UNSIGNED_SHORT, 0);
                        }
                    }

                }

                /* EMPTY BUFFERS */
                this.gl.bindVertexArray(null);
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
                this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
            }
            // If a _selectedProgram is passed, skip the rest
            // if(_selectedProgram) continue;
        }
    }

    loadTexture(_name, _url) {
        const texture = this.gl.createTexture();
        this.gl.bindTexture(gl.TEXTURE_2D, texture);

        // Set texture to one blue dot while it loads below
        this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            0, gl.RGBA,
            1,
            1,
            0,
            this.gl.RGBA,
            this.gl.UNSIGNED_BYTE,
            new Uint8Array([0, 0, 255, 255])
        );

        // Asynchronously load an image
        var image = new Image();
        image.src = _url;
        image.addEventListener('load', function() {
            // Now that the image has loaded make copy it to the texture.
            this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
            this.gl.texImage2D(
                this.gl.TEXTURE_2D,
                0,
                this.gl.RGBA,
                this.gl.RGBA,
                this.gl.UNSIGNED_BYTE,
                image
            );
            this.gl.generateMipmap(gl.TEXTURE_2D);
        });

        this._textures[_name] = texture;
    }

    dataTexture(_options){
        // Default options, to be overwritten by _options passed in
        let options = {
            program : null,
            name: null,
            uniformName: 'u_Texture',
            level : 0,
            unit : 0,
            width : 1,
            height : 1,
            data : null,
            border : 0,
            internalFormat : 'RGBA8',
            format : 'RGBA',
            wrap : 'CLAMP_TO_EDGE',
            filter : 'NEAREST',
            type : 'UNSIGNED_BYTE'
        }

        Object.assign(options, _options);


        const texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

        this.gl.texImage2D(this.gl.TEXTURE_2D,
            0, // Level
            this.gl[options.internalFormat],
            options.width,
            options.height,
            options.border,
            this.gl[options.format],
            this.gl[options.type],
            options.data
        );

        // In case of width/height errors use this:
        // this.gl.pixelStorei(this.gl.UNPACK_ALIGNMENT, 1);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl[options.wrap]);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl[options.wrap]);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl[options.filter]);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl[options.filter]);

        // These are basically temporary uniforms to be linked later
        this._textures[options.name] = {
            type        : 'texture',
            uniformType : 'uniform1i',
            uniformName : options.uniformName,
            value       : texture,
            // location    : this.gl.getUniformLocation(this._programs[options.program].shader, 'u_Texture'),
            location    : null, // Not yet assigned
            unit        : options.unit
        }
    }

    // GETTERS - SETTERS
    get programs(){
        return this._programs;
    }

    set cameraPosition(loc){
        this._position = vec3.fromValues(...loc);
        // this.updateViewMatrix();
        this.updateAllGlobalUniforms();
    }

    set cameraTarget(loc){
        this._target = vec3.fromValues(...loc);
    }

    set FOV(val){
        this._fieldOfView = val * Math.PI/180;
    }

    Quad(){
        return new Quad(this.gl);
    }

    Cube(type){
        return new Cube(this.gl, type);
    }

    RandomPointSphere(_program, numPoints){
        const Points = new RandomPointSphere(this.gl, numPoints);
        this._programs[_program].geometry.push(Points);
        Points.linkProgram(this._programs[_program].shader);
        return Points;
    }

    PointCloud(numPoints, emptyData){
        return new PointCloud(this.gl, numPoints, emptyData);
    }

    Icosahedron(_program){
        const Icos = new Icosahedron(this.gl);
        this._programs[_program].geometry.push(Icos);
        Icos.linkProgram(this._programs[_program].shader);
        return Icos;
    }

    ParticleSystem(_updateProgram, _renderProgram, _numParticles){
        const PS = new ParticleSystem(this.gl, _numParticles);
        this._programs[_updateProgram].geometry.push(PS);
        this._programs[_renderProgram].geometry.push(PS);
        PS.linkProgram(
            this._programs[_updateProgram].shader,
            this._programs[_renderProgram].shader,
        );
        return PS;
    }
}
