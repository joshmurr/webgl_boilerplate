import Geometry from "./geometry.js";
import { mat4 } from "gl-matrix";

export default class ParticleSystem extends Geometry {
    constructor(gl, _numPoints){
        super(gl);
        this._numPoints = _numPoints;
        const min_age = 1.0;
        const max_age = 1.5;
        for(let i=0; i<this._numPoints; ++i){
            // Position
            // data.push(0.0, 0.0);
            this._verts.push(Math.random(), Math.random());

            // Life
            let life = min_age + Math.random() * (max_age - min_age);
            this._verts.push(life+1, life);

            // Velocity
            this._verts.push(0.0, 0.0);
        }
    }
    /*
    const update_attrib_locations = {
        i_Position: {
            location: gl.getAttribLocation(update_program, "i_Position"),
            num_components: 2,
            type: gl.FLOAT
        },
        i_Age: {
            location: gl.getAttribLocation(update_program, "i_Age"),
            num_components: 1,
            type: gl.FLOAT
        },
        i_Life: {
            location: gl.getAttribLocation(update_program, "i_Life"),
            num_components: 1,
            type: gl.FLOAT
        },
        i_Velocity: {
            location: gl.getAttribLocation(update_program, "i_Velocity"),
            num_components: 2,
            type: gl.FLOAT
        }
    };
    const render_attrib_locations = {
        i_Position: {
            location: gl.getAttribLocation(render_program, "i_Position"),
            num_components: 2,
            type: gl.FLOAT
        },
        i_Age: {
            location: gl.getAttribLocation(render_program, "i_Age"),
            num_components: 1,
            type: gl.FLOAT
        },
        i_Life: {
            location: gl.getAttribLocation(render_program, "i_Life"),
            num_components: 1,
            type: gl.FLOAT
        },
    };
    */

    linkProgram(_updateProgram, _renderProgram){
        const buffers = [
            this.gl.createBuffer(),
            this.gl.createBuffer()
        ];

        /* PUT DATA IN THE BUFFERS */
        for(const buffer of buffers){
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, this._verts, this.gl.STREAM_DRAW);
        }
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

        const VAOs = [
            this.gl.createVertexArray(), /* update 1 */
            this.gl.createVertexArray(), /* update 2 */
            this.gl.createVertexArray(), /* render 1 */
            this.gl.createVertexArray(), /* render 2 */
        ];

        const updateAttributes = {
            i_Position: {
                // buffer: singleBuffer,
                // bufferData: new Float32Array(this._verts),
                // usage: this.gl.STATIC_DRAW,
                location: this.gl.getAttribLocation(_updateProgram, "i_Position"),
                num_components: 2,
                type: this.gl.FLOAT,
                size: 4,
                // normalize: false,
                // stride: 0,
                // offset: 0,
            },
            i_Age: {
                // buffer: singleBuffer,
                // bufferData: new Float32Array(this._verts),
                // usage: this.gl.STATIC_DRAW,
                location: this.gl.getAttribLocation(_updateProgram, "i_Age"),
                num_components: 1,
                type: this.gl.FLOAT,
                size: 4,
                // normalize: false,
                // stride: 0,
                // offset: 0,
            },
            i_Life: {
                // buffer: singleBuffer,
                // bufferData: new Float32Array(this._verts),
                // usage: this.gl.STATIC_DRAW,
                location: this.gl.getAttribLocation(_updateProgram, "i_Life"),
                num_components: 1,
                type: this.gl.FLOAT,
                size: 4,
                // normalize: false,
                // stride: 0,
                // offset: 0,
            },
            i_Velocity: {
                // buffer: singleBuffer,
                // bufferData: new Float32Array(this._verts),
                // usage: this.gl.STATIC_DRAW,
                location: this.gl.getAttribLocation(_updateProgram, "i_Velocity"),
                num_components: 2,
                type: this.gl.FLOAT,
                size: 4,
                // normalize: false,
                // stride: 0,
                // offset: 0,
            },
        };

        const renderAttributes = {
            i_Position: {
                location: this.gl.getAttribLocation(_renderProgram, "i_Position"),
                num_components: 2,
                type: this.gl.FLOAT
            },
            i_Age: {
                location: this.gl.getAttribLocation(_renderProgram, "i_Age"),
                num_components: 1,
                type: this.gl.FLOAT
            },
            i_Life: {
                location: this.gl.getAttribLocation(_renderProgram, "i_Life"),
                num_components: 1,
                type: this.gl.FLOAT
            },
        };

        const VAO_desc = [
            {
                vao: VAOs[0],
                // OR -> vao: this.gl.createVertexArray()
                buffers: [{
                    buffer_object: buffers[0],
                    stride: 4 * 6,
                    attribs: updateAttributes
                }]
            },
            {
                vao: vaos[1],
                buffers: [{
                    buffer_object: buffers[1],
                    stride: 4 * 6,
                    attribs: updateAttributes
                }]
            },
            {
                vao: vaos[2],
                buffers: [{
                    buffer_object: buffers[0],
                    stride: 4 * 6,
                    attribs: renderAttributes
                }],
            },
            {
                vao: vaos[3],
                buffers: [{
                    buffer_object: buffers[1],
                    stride: 4 * 6,
                    attribs: renderAttributes
                }],
            },
        ];

        for(const VAO of VAO_desc){
            this.setupVAO(VAO.buffers, VAO.vao);
        }

        const updateUniforms = {
            u_TimeDelta : {
                value    : mat4.create(),
                type     : 'uniformMatrix4fv',
                uniformType : 'mat4',
                programName : null,
                location : this.gl.getUniformLocation(_program, 'u_ModelMatrix')
            },
            u_ModelMatrix : {
                value    : mat4.create(),
                type     : 'uniformMatrix4fv',
                uniformType : 'mat4',
                programName : null,
                location : this.gl.getUniformLocation(_program, 'u_ModelMatrix')
            },
        }


        // Just link u_Model Matrix with the render program
        this.linkUniforms(_renderProgram);
    }
}
