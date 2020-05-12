import { mat4, vec3 } from 'gl-matrix';

export default class GL_BP {
    constructor(){
        this._programs = {};
        this._meshes = [];
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


    initBasicScene(){
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

    }

    initGlobalUniforms(_program){
        this._globalUniforms = {
            u_PerspectiveMatrix : {
                matrix : this._perspectiveMat,
                location: this.gl.getUniformLocation(this._programs[_program], 'u_ProjectionMatrix')
            },
            u_ViewMatrix : {
                matrix : this._viewMat,
                location: this.gl.getUniformLocation(this._programs[_program], 'u_ViewMatrix')
            },
        };
    }

    draw(now){
        this._time = 5 + now * 0.0001;

        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.enable(this.gl.DEPTH_TEST);

        this.gl.useProgram(this._programs['points']);

        this.gl.uniformMatrix4fv(
            this._globalUniforms.u_PerspectiveMatrix.location,
            false,
            this._globalUniforms.u_PerspectiveMatrix.matrix
        );
        this.gl.uniformMatrix4fv(
            this._globalUniforms.u_ViewMatrix.location,
            false,
            this._globalUniforms.u_ViewMatrix.matrix
        );

        for(const mesh of this._meshes){
            this.gl.bindVertexArray(mesh.VAO);

            mat4.rotate(mesh.uniforms.u_ModelMatrix.matrix,
                        mesh.uniforms.u_ModelMatrix.matrix,
                        this._time * 0.002,
                        [0, 1, 0]
            );

            this.gl.uniformMatrix4fv(
                mesh.uniforms.u_ModelMatrix.location,
                false,
                mesh.uniforms.u_ModelMatrix.matrix
            );

            this.gl.drawElements(this.gl.POINTS, mesh.numIndices, this.gl.UNSIGNED_SHORT, 0);
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

    generateUID(){
        let text = '';
        let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 15; i++){
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        localStorage.setItem('UID', text);
        return text;
    }

    createOverlay(){
        const container = document.createElement('div');
        container.classList.add("overlay");

        const text = document.createElement('P');
        text.innerHTML = `<h2>Getting to Know WebGL</h2>
                          <br>Generating icospheres and disturbing the vertices with Perlin noise.
                          <br><br>Mouse + WASD - Move
                          <br>Scroll - Change FOV`;
        container.appendChild(text);

        const code = document.createElement('a');
        code.text = "Code";
        code.href = "https://github.com/joshmurr/webgl_environment_test";

        container.appendChild(code);

        const body = document.getElementsByTagName("body")[0];
        body.appendChild(container);
    }
}





export function initialParticleData(num_parts, min_age, max_age){
    var data = [];
    for(let i=0; i<num_parts; ++i){
        // Position
        // data.push(0.0, 0.0);
        data.push(Math.random(), Math.random());

        // Life
        let life = min_age + Math.random() * (max_age - min_age);
        data.push(life+1, life);

        // Velocity
        data.push(0.0, 0.0);
    }
    return data;
}

export function setupParticleBufferVAO(gl, buffers, vao){
    gl.bindVertexArray(vao);
    for(let i=0; i<buffers.length; i++){
        const buffer = buffers[i];
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer.buffer_object);

        let offset = 0;

        for(const attrib_name in buffer.attribs){
            if(buffer.attribs.hasOwnProperty(attrib_name)){
                const attrib_desc = buffer.attribs[attrib_name];
                gl.enableVertexAttribArray(attrib_desc.location);
                gl.vertexAttribPointer(
                    attrib_desc.location,
                    attrib_desc.num_components,
                    attrib_desc.type,
                    false,
                    buffer.stride,
                    offset);

                const type_size = 4;
                offset += attrib_desc.num_components * type_size;
                if(attrib_desc.hasOwnProperty("divisor")){
                    gl.vertexAttribDivisor(attrib_desc.location, attrib_desc.divisor);
                }
            }
        }
    }
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

export function init(gl, programOne, programTwo, num_particles){
    const render_program = initShaderProgram(gl, programTwo[0], programTwo[1], null);

    const render_attrib_locations = {
        i_Position: {
            location: gl.getAttribLocation(render_program, "i_Position"),
            num_components: 2,
            type: gl.FLOAT
        },
    };

    /* These buffers shall contain data about particles. */
    const buffers = [
        gl.createBuffer(),
    ];
    /* We'll have 4 VAOs... */
    const vaos = [
        gl.createVertexArray(), /* for updating buffer 1 */
    ];

    const vao_desc = [
        {
            vao: vaos[0],
            buffers: [{
                buffer_object: buffers[0],
                typeSize: 4,
                stride: 4 * 3, // Type-size * Quantity (32bit * xyz)
                attribs: render_attrib_locations
            }]
        }
    ];
    const initial_data = new Float32Array(initialParticleData(num_particles));
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers[0]);
        gl.bufferData(gl.ARRAY_BUFFER, initial_data, gl.STREAM_DRAW);

        /* Set up VAOs */
        for (let i = 0; i < vao_desc.length; i++) {
            setupParticleBufferVAO(gl, vao_desc[i].buffers, vao_desc[i].vao);
        }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    /* Set up blending */
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    return {
        particle_sys_buffers: buffers,
        particle_sys_vaos: vaos,
        particle_update_program: update_program,
        particle_render_program: render_program,
        num_particles: initial_data.length / 3,
        old_timestamp: 0.0,
        total_time: 0.0,
    };
}

