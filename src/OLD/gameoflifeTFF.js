import Geometry from "./geometry.js";
import { mat4 } from "gl-matrix";

export default class GameOfLifeTFF extends Geometry {
    constructor(gl, _options=null){
        super(gl);
        this._options = {
            scale   : 64,
            width   : 512,
            height  : 512,
        };

        if(_options) Object.assign(this._options, _options);

        this._verts = [ 
            -1, -1,
             1, -1,
            -1,  1,
            -1,  1,
             1, -1,
             1,  1,
        ];

        for(let i=0,
            lim=this._options.width/this._options.scale*this._options.height/this._options.scale;
            i<lim;++i){
            this._normals.push(Math.round(Math.random()));
        }

        this._read = 0;
        this._write = 1;
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

    get numVertices(){
        return this._verts.length/2;
    }

    get VAO(){
        const tmp = this._read;
        this._read = this._write;
        this._write = tmp;
        return this._VAOs[tmp+2];
    }

    linkProgram(_updateProgram, _renderProgram){
        this._buffers.push(
            this.gl.createBuffer(),
            this.gl.createBuffer(),
        );

        const quadBuffer = this.gl.createBuffer();

        const quad  = new Float32Array(this._verts);
        const state = new Float32Array(this._normals);
        /* PUT DATA IN THE BUFFERS */
        // GOL STATE
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this._buffers[0]);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, state, this.gl.STREAM_DRAW);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this._buffers[1]);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, state, this.gl.STREAM_DRAW);
        // QUAD VERTS
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, quadBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, quad, this.gl.STATIC_DRAW);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

        this._VAOs.push(
            this.gl.createVertexArray(), /* update 1 */
            this.gl.createVertexArray(), /* update 2 */
            this.gl.createVertexArray(), /* render 1 */
            this.gl.createVertexArray(), /* render 2 */
        );

        const updateAttributes = {
            i_State: {
                location: this.gl.getAttribLocation(_updateProgram, "i_State"),
                num_components: 1,
                type: this.gl.FLOAT,
                size: 4,
            },
        };

        const renderAttributes = {
            i_Position: {
                location: this.gl.getAttribLocation(_renderProgram, "i_Position"),
                num_components: 2,
                type: this.gl.FLOAT,
                size: 4 * 2,
            },
            i_State: {
                location: this.gl.getAttribLocation(_renderProgram, "i_State"),
                num_components: 1,
                type: this.gl.FLOAT,
                size: 4,
            },
        };

        const VAO_desc = [
            {
                vao: this._VAOs[0],
                buffers: [{
                    buffer_object: this._buffers[0],
                    stride: 0,
                    attributes: updateAttributes
                }]
            },
            {
                vao: this._VAOs[1],
                buffers: [{
                    buffer_object: this._buffers[1],
                    stride: 0,
                    attributes: updateAttributes
                }]
            },
            {
                vao: this._VAOs[2],
                buffers: [{
                    buffer_object: this._buffers[0],
                    stride: 0,
                    attributes: renderAttributes
                },
                {
                    buffer_object: quadBuffer,
                    stride: 0,
                    attributes: renderAttributes
                }],
            },
            {
                vao: this._VAOs[3],
                buffers: [{
                    buffer_object: this._buffers[1],
                    stride: 0,
                    attributes: renderAttributes
                },
                {
                    buffer_object: quadBuffer,
                    stride: 0,
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
        _gl.bindVertexArray(this._VAOs[this._read]);

        // console.log(this.gl.getVertexAttrib(0, this.gl.VERTEX_ATTRIB_ARRAY_TYPE));
        /* Bind the "write" buffer as transform feedback - the varyings of the
         *      update shader will be written here. */
        _gl.bindBufferBase(
            _gl.TRANSFORM_FEEDBACK_BUFFER, 0, this._buffers[this._write]);

        /* Since we're not actually rendering anything when updating the particle
         *      this, disable rasterization.*/
        _gl.enable(_gl.RASTERIZER_DISCARD);

        /* Begin transform feedback! */
        _gl.beginTransformFeedback(_gl.POINTS);
        _gl.drawArrays(_gl.POINTS, 0, this._normals.length);
        _gl.endTransformFeedback();
        _gl.disable(_gl.RASTERIZER_DISCARD);
        /* Don't forget to unbind the transform feedback buffer! */
        _gl.bindBufferBase(_gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);
    }
}
