import { mat4, vec3 } from 'gl-matrix';

export default class GL_BP {
    constructor(){
        this._programs = {};
        this._meshes = [];
        this._time = 0.0;
        this._oldTimestamp = 0.0;
    }

    get programs(){
        return this._programs;
    }

    addMesh(_mesh){
        this._meshes.push(_mesh);
    }

    init(width, height){
        this.canvas = document.createElement("canvas");
        this.canvas.width = this.WIDTH = width;
        this.canvas.height = this.HEIGHT = height;
        const body = document.getElementsByTagName("body")[0];
        body.appendChild(this.canvas);
        this.gl = this.canvas.getContext('webgl2');
        if (!this.gl) {
            console.warn("You're browser does not support WebGL 2.0. Soz.");
            return;
        }
    }

    initShaderProgram(name, vsSource, fsSource) {
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

        this._programs[name] = shaderProgram;
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
            this._programs[programName],
            transformFeedbackVaryings,
            gl.INTERLEAVED_ATTRIBS)
    }


    initBasicScene(_program){
        const fieldOfView = 45 * Math.PI / 180;
        const aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
        const zNear = 0.1;
        const zFar = 100.0;
        this._perspectiveMat = mat4.create();
        mat4.perspective(this._perspectiveMat, fieldOfView, aspect, zNear, zFar);

        this._viewMat = mat4.create();
        const position = vec3.fromValues(0, 0.3, 3);
        const target = vec3.fromValues(0, 0, 0);
        const up = vec3.fromValues(0, 1, 0);
        mat4.lookAt(this._viewMat, position, target, up);

        this._globalUniforms = {
            u_ProjectionMatrix : {
                type    : 'uniformMatrix4fv',
                value   : this._perspectiveMat,
                location: this.gl.getUniformLocation(this._programs[_program], 'u_ProjectionMatrix')
            },
            u_ViewMatrix : {
                type    : 'uniformMatrix4fv',
                value   : this._viewMat,
                location: this.gl.getUniformLocation(this._programs[_program], 'u_ViewMatrix')
            },
        };
    }

    // initGlobalUniforms(_program){
        // this._globalUniforms = {
            // u_ProjectionMatrix : {
                // matrix : this._perspectiveMat,
                // location: this.gl.getUniformLocation(this._programs[_program], 'u_ProjectionMatrix')
            // },
            // u_ViewMatrix : {
                // matrix : this._viewMat,
                // location: this.gl.getUniformLocation(this._programs[_program], 'u_ViewMatrix')
            // },
        // };
    // }

    draw(now, _program){
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

        this.gl.useProgram(this._programs[_program]);

        this.setGloablUniforms();

        for(const mesh of this._meshes){
            this.gl.bindVertexArray(mesh.VAO);

            mesh.updateModelMatrix(this._time);
            mesh.setUniforms();

            this.gl.drawElements(this.gl.TRIANGLES, mesh.numIndices, this.gl.UNSIGNED_SHORT, 0);
        }

        // Empty Buffers
        this.gl.bindVertexArray(null);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
    }

    setGloablUniforms(){
        for(const uniform in this._globalUniforms){
            if(this._globalUniforms.hasOwnProperty(uniform)){
                const uniform_desc = this._globalUniforms[uniform];
                this.gl[uniform_desc.type](
                    uniform_desc.location,
                    false,
                    uniform_desc.value,
                );
            }
        }
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
}
