import Geometry from "./geometry.js";
import { mat4 } from "gl-matrix";

export default class PointCloud extends Geometry {
    constructor(gl, _numPoints, _emptyData){
        super(gl);
        this._numPoints = _numPoints;
            for(let i=0; i<_numPoints; i++){
                this._verts.push(
                    1, 1, 1
                );
            }
    }

    linkProgram(_program){
        this._buffers.push(this.gl.createBuffer());

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this._buffers[0]);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this._verts), this.gl.STATIC_DRAW);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

        const positionAttrib = {
            i_Position: {
                location: this.gl.getAttribLocation(_program, "i_Position"),
                num_components: 3,
                type: this.gl.FLOAT,
                size: 4,
            },
        };
        this._VAOs.push(this.gl.createVertexArray());
        const VAO_desc = [
            {
                vao: this._VAOs[0],
                buffers: [
                    {
                        buffer_object: this._buffers[0],
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
