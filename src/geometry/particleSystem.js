import Geometry from "./geometry.js";
import { mat4 } from "gl-matrix";

export default class ParticleSystem extends Geometry {
    constructor(gl, _numParticles){
        super(gl);
        this._numParticles = _numParticles;
        const min_age = 1.0;
        const max_age = 1.5;
        for(let i=0; i<this._numParticles; ++i){
            // Position
            // data.push(0.0, 0.0);
            this._verts.push(Math.random(), Math.random());

            // Life
            let life = min_age + Math.random() * (max_age - min_age);
            this._verts.push(life+1, life);

            // Velocity
            this._verts.push(0.0, 0.0);
        }

        this._read  = 0;
        this._write = 1;

        this._birthRate = 0.5;
        this._bornParticles = 0;
    }

    get read(){
        return this._read;
    }
    get write(){
        return this._write;
    }
    set read(_val){
        this._read = _val;;
    }
    set write(_val){
        this._write = _val;
    }

    get VAOs(){
        return this._VAOs;
    }
    get buffers(){
        return this._buffers;
    }

    get VAO(){
        const tmp = this._read;
        this._read = this._write;
        this._write = tmp;
        return this._VAOs[tmp];
    }

    get numVertices(){
        // return this._numParticles;
        return this._bornParticles;
    }

    linkProgram(_updateProgram, _renderProgram){
        this._buffers.push(
            this.gl.createBuffer(),
            this.gl.createBuffer()
        );

        const data = new Float32Array(this._verts);
        /* PUT DATA IN THE BUFFERS */
        for(const buffer of this._buffers){
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.STREAM_DRAW);
        }
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

        this._VAOs.push(
            this.gl.createVertexArray(), /* update 1 */
            this.gl.createVertexArray(), /* update 2 */
            this.gl.createVertexArray(), /* render 1 */
            this.gl.createVertexArray(), /* render 2 */
        );

        const updateAttributes = {
            i_Position: {
                location: this.gl.getAttribLocation(_updateProgram, "i_Position"),
                num_components: 2,
                type: this.gl.FLOAT,
                size: 4,
            },
            i_Age: {
                location: this.gl.getAttribLocation(_updateProgram, "i_Age"),
                num_components: 1,
                type: this.gl.FLOAT,
                size: 4,
            },
            i_Life: {
                location: this.gl.getAttribLocation(_updateProgram, "i_Life"),
                num_components: 1,
                type: this.gl.FLOAT,
                size: 4,
            },
            i_Velocity: {
                location: this.gl.getAttribLocation(_updateProgram, "i_Velocity"),
                num_components: 2,
                type: this.gl.FLOAT,
                size: 4,
            },
        };

        const renderAttributes = {
            i_Position: {
                location: this.gl.getAttribLocation(_renderProgram, "i_Position"),
                num_components: 2,
                type: this.gl.FLOAT
            }
        };

        const VAO_desc = [
            {
                vao: this._VAOs[0],
                buffers: [{
                    buffer_object: this._buffers[0],
                    stride: 4 * 6,
                    attributes: updateAttributes
                }]
            },
            {
                vao: this._VAOs[1],
                buffers: [{
                    buffer_object: this._buffers[1],
                    stride: 4 * 6,
                    attributes: updateAttributes
                }]
            },
            {
                vao: this._VAOs[2],
                buffers: [{
                    buffer_object: this._buffers[0],
                    stride: 4 * 6,
                    attributes: renderAttributes
                }],
            },
            {
                vao: this._VAOs[3],
                buffers: [{
                    buffer_object: this._buffers[1],
                    stride: 4 * 6,
                    attributes: renderAttributes
                }],
            },
        ];

        for(const VAO of VAO_desc){
            this.setupVAO(VAO.buffers, VAO.vao);
        }

        // Just link u_Model Matrix with the render program
        // this.linkUniforms(_renderProgram);
    }

    step(_gl, _dT){
        // console.log(`State -> read:${this._read} write:${this._write}`);
        const num_part = this._bornParticles;
        if (this._bornParticles < this._numParticles) {
            this._bornParticles = Math.min(this._numParticles,
                Math.floor(this._bornParticles + this._birthRate * _dT));
        }

        _gl.bindVertexArray(this._VAOs[this._read]);

        /* Bind the "write" buffer as transform feedback - the varyings of the
         *      update shader will be written here. */
        _gl.bindBufferBase(
            _gl.TRANSFORM_FEEDBACK_BUFFER, 0, this._buffers[this._write]);

        /* Since we're not actually rendering anything when updating the particle
         *      this, disable rasterization.*/
        _gl.enable(_gl.RASTERIZER_DISCARD);

        /* Begin transform feedback! */
        _gl.beginTransformFeedback(_gl.POINTS);
        _gl.drawArrays(_gl.POINTS, 0, num_part);
        _gl.endTransformFeedback();
        _gl.disable(_gl.RASTERIZER_DISCARD);
        /* Don't forget to unbind the transform feedback buffer! */
        _gl.bindBufferBase(_gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);
    }

    /*
    draw(_gl){
        // Drawing the data from the "read" buffer, not the "write" buffer
        // that we've written the updated data to.
        // _gl.bindVertexArray(this._VAOs[this.read + 2]);
        _gl.bindVertexArray(this._VAOs[this.read + 2]);
        _gl.drawArrays(_gl.POINTS, 0, this._bornParticles);

        // Finally, we swap read and write buffers. The updated this will be
        // rendered on the next frame.
        const tmp = this.read;
        this.read = this.write;
        this.write = tmp;
    }
    */
}
