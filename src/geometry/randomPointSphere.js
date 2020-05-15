import Geometry from "./geometry.js";
import { mat4 } from "gl-matrix";

export default class RandomPointSphere extends Geometry {
    constructor(gl, _numPoints){
        super(gl);
        this._numPoints = _numPoints;
        // Generate random vertices on the unit sphere
        for(let i=0; i<_numPoints; i++){
            const u = Math.random()*Math.PI*2;
            const v = Math.random()*Math.PI*2;
            this._verts.push(
                Math.sin(u) * Math.cos(v),
                Math.sin(u) * Math.sin(v),
                Math.cos(u)
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
