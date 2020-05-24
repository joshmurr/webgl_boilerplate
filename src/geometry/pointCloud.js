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
        const attributes = {
            i_Position: {
                buffer: this.gl.createBuffer(),
                bufferData: new Float32Array(this._verts),
                usage: this.gl.STATIC_DRAW,
                location: this.gl.getAttribLocation(_program, "i_Position"),
                num_components: 3,
                type: this.gl.FLOAT,
                normalize: false,
                stride: 0,
                offset: 0,
            },
        };

        this._VAO = this.gl.createVertexArray();
        this.setupVAO(attributes);
        this.linkUniforms(_program);
    }
}
