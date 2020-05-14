import { mat4, vec3 } from 'gl-matrix';

export default class GL_BP {
    constructor(){
        this._programs = {};
        this._textures = {};
        this._time = 0.0;
        this._oldTimestamp = 0.0;

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

    initShaderProgram(name, vsSource, fsSource, _mode) {
        const shaderProgram = this.gl.createProgram();
        const vertexShader = this.loadShader(this.gl.VERTEX_SHADER, vsSource);
        const fragmentShader = this.loadShader(this.gl.FRAGMENT_SHADER, fsSource);
        this.gl.attachShader(shaderProgram, vertexShader);
        this.gl.attachShader(shaderProgram, fragmentShader);

        this.gl.linkProgram(shaderProgram);

        if (!this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS)) {
            alert('Unable to initialize the shader program: ' + this.gl.getProgramInfoLog(shaderProgram));
            return null;
        }

        this._programs[name] = {
            shader   : shaderProgram,
            mode     : this.gl[_mode],
            geometry : [],
            globalUniforms : {
                u_ProjectionMatrix : {
                    type    : 'uniformMatrix4fv',
                    value   : this._projectionMat,
                    location: this.gl.getUniformLocation(shaderProgram, 'u_ProjectionMatrix')
                },
                u_ViewMatrix : {
                    type    : 'uniformMatrix4fv',
                    value   : this._viewMat,
                    location: this.gl.getUniformLocation(shaderProgram, 'u_ViewMatrix')
                },
            }

        }
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

    initTransformFeedbackVarying(programName, transformFeedbackVaryings){
        gl.transformFeedbackVaryings(
            this._programs[programName].shader,
            transformFeedbackVaryings,
            gl.INTERLEAVED_ATTRIBS)
    }

    updateGlobalUniforms(){
        for(const program in this._programs){
            if(this._programs.hasOwnProperty(program)){
                this.updateProjectionMatrix(program);
                this.updateViewMatrix(program);
            }
        }
    }

    updateProjectionMatrix(_program){
        this._projectionMat = mat4.create();
        mat4.perspective(
            this._programs[_program].globalUniforms.u_ProjectionMatrix.value,
            this._fieldOfView, this._aspect, this._zNear, this._zFar);
    }

    updateViewMatrix(_program){
        this._viewMat = mat4.create();
        mat4.lookAt(
            this._programs[_program].globalUniforms.u_ViewMatrix.value,
            this._position, this._target, this._up);
    }

    linkProgram(_program, _geometry){
        this._programs[_program].geometry.push(_geometry);
        _geometry.linkProgram(this._programs[_program].shader);
    }

    setGlobalUniforms(_uniforms){
        for(const uniform in _uniforms){
            if(_uniforms.hasOwnProperty(uniform)){
                const uniform_desc = _uniforms[uniform];
                if(uniform_desc.type == 'uniform1i'){
                    this.gl.activeTexture(this.gl.TEXTURE0);
                    this.gl.bindTexture(this.gl.TEXTURE_2D, uniform_desc.value);
                    this.gl.uniform1i(uniform_desc.location, 0);
                } else {
                    this.gl[uniform_desc.type](
                        uniform_desc.location,
                        false,
                        uniform_desc.value,
                    );
                }
            }
        }
    }

    draw(now){
        // this._time = 5 + now * 0.0001;
        let deltaTime = 0.0;
        if (this._oldTimestamp != 0) {
            deltaTime = now - this._oldTimestamp;
            if (deltaTime > 500.0) {
                deltaTime = 0.0;
            }
        }
        this._oldTimestamp = now;
        this._time += deltaTime;

        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

        this.gl.clearColor(0.95, 0.95, 0.95, 1.0);
        this.gl.clearDepth(1.0);

        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.enable(this.gl.DEPTH_TEST);

        for(const program in this._programs){
            if(this._programs.hasOwnProperty(program)){
                const program_desc = this._programs[program];

                if(program_desc.geometry.length < 1) continue;

                this.gl.useProgram(program_desc.shader);

                this.setGlobalUniforms(program_desc.globalUniforms);

                for(const geom of program_desc.geometry){
                    this.gl.bindVertexArray(geom.VAO);

                    geom.updateModelMatrix(this._time);
                    geom.setUniforms();

                    switch(program_desc.mode){ 
                        case 0 : {
                            // POINTS
                            this.gl.drawArrays(program_desc.mode, 0, geom.numVertices/3);
                            break;
                        } 
                        case 1 :
                            // LINES
                        case 2 : 
                            // LINE_LOOP
                        case 5 : {
                            // TRIANGLE_STRIP
                            this.gl.drawElements(program_desc.mode, geom.numIndices, this.gl.UNSIGNED_SHORT, 0);
                            break;
                        } 
                        default : {
                            this.gl.drawElements(program_desc.mode, geom.numIndices, this.gl.UNSIGNED_SHORT, 0);
                        }
                    }

                }

                // Empty Buffers
                this.gl.bindVertexArray(null);
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
                this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
            }
        }
    }

    texture(format, wrap, filter, type){
        const texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

        wrap = wrap == null ? gl.CLAMP_TO_EDGE : wrap;
        filter = filter == null ? gl.LINEAR : filter;
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
        format = format == null ? gl.RGBA : format;
        type = type == null ? gl.UNSIGNED_BYTE : type;
    }

    testTexture(_program){
        var texture = this.gl.createTexture();
        // use texture unit 0
        // gl.activeTexture(gl.TEXTURE0 + 0);
        // bind to the TEXTURE_2D bind point of texture unit 0
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        const level = 0;
        const internalFormat = this.gl.R8;
        const width = 3;
        const height = 2;
        const border = 0;
        const format = this.gl.RED;
        const type = this.gl.UNSIGNED_BYTE;
        const data = new Uint8Array([
            128,  64, 128,
            0, 192,   0,
        ]);
        this.gl.pixelStorei(this.gl.UNPACK_ALIGNMENT, 1);
        this.gl.texImage2D(this.gl.TEXTURE_2D, level, internalFormat, width, height, border,
            format, type, data);

        // set the filtering so we don't need mips
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

        this._textures['testTex'] = texture;

        this._programs[_program].globalUniforms['u_Texture'] = {
            type     : 'uniform1i',
            value    : texture,
            location : this.gl.getUniformLocation(this._programs[_program].shader, 'u_Texture'),
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


    randomData(DIMS){
        let d = [];
        let size = 1;
        for(const n of DIMS){
            size *= n;
        }
        for(let i=0; i<size; ++i){
            d.push(Math.random()*255.0);
        }
        return new Uint8Array(d);
    }
    // GETTERS - SETTERS
    get programs(){
        return this._programs;
    }

    set cameraPosition(loc){
        this._position = vec3.fromValues(...loc);
        this.updateGlobalUniforms();
    }

    set cameraTarget(loc){
        this._target = vec3.fromValues(...loc);
    }

    set FOV(val){
        this._fieldOfView = val * Math.PI/180;
    }
}
