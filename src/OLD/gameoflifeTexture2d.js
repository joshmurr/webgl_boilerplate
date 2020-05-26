import Geometry from "./geometry.js";
import { mat4 } from "gl-matrix";

export default class GameOfLifeTexture2D extends Geometry {
    constructor(gl){
        super(gl);

        this._verts = [ 
            -1, -1,
             1, -1,
            -1,  1,
            -1,  1,
             1, -1,
             1,  1,
        ];
    }

    get read(){
        return this._read;
    }
    get write(){
        return this._write;
    }
    set read(_val){
        this._read = _val;
    }
    set write(_val){
        this._write = _val;
    }

    get numVertices(){
        return this._verts.length/2;
    }

    get VAO(){
        return this._VAOs[0];
    }

    linkProgram(_updateProgram, _renderProgram){
        const quadBuffer = this.gl.createBuffer();

        const quad  = new Float32Array(this._verts);
        /* PUT DATA IN THE BUFFERS */
        // QUAD VERTS
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, quadBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, quad, this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

        this._VAOs.push(
            this.gl.createVertexArray(),
        );

        const renderAttributes = {
            i_Position: {
                location: this.gl.getAttribLocation(_renderProgram, "i_Position"),
                num_components: 2,
                type: this.gl.FLOAT,
                size: 4 * 2,
            },
        };

        const VAO_desc = [
            {
                vao: this._VAOs[0],
                buffers: [{
                    buffer_object: quadBuffer,
                    stride: 0,
                    attributes: renderAttributes
                }]
            },
        ];

        for(const VAO of VAO_desc){
            this.setupVAO(VAO.buffers, VAO.vao);
        }
    }
}
