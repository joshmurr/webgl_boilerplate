import Geometry from "./geometry.js";
import { mat4 } from "gl-matrix";

export default class XYZ_Cross extends Geometry {
    constructor(gl, type){
        super(gl);
        this._indexedGeometry = true;
        this._type = type;
        this._verts = [
            1.0, 0.0, 0.0,
            -1.0, 0.0, 0.0,

            0.0, 1.0, 0.0,
            0.0, -1.0, 0.0,

            0.0, 0.0, 1.0,
            0.0, 0.0, -1.0,
        ]
        this._indices = [
            0, 1, 2, 3, 4, 5
        ]
        this.normalizeVerts();
    }
    linkProgram(_program){
        this._VAOs.push(this.gl.createVertexArray());
        const positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this._verts), this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

        const positionAttrib = {
            i_Position: {
                location: this.gl.getAttribLocation(_program, "i_Position"),
                num_components: 3,
                type: this.gl.FLOAT,
                size: 0,
            },
        };
        const VAO_desc = [
            {
                vao: this._VAOs[0],
                buffers: [
                    {
                        buffer_object: positionBuffer,
                        stride: 0,
                        attributes: positionAttrib
                    },
                ]
            },
        ];
        for(const VAO of VAO_desc){
            this.setupVAO(VAO.buffers, VAO.vao);
        }
    }
}

