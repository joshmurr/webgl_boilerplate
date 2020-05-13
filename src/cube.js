import Geometry from "./geometry.js";
import { mat4 } from "gl-matrix";

export default class Cube extends Geometry {
    constructor(gl, type){
        super(gl);
        this._indexedGeometry = true;
        switch(type){
            case 'SOLID' : {
                this._verts = [
                    // Front face
                    -1.0, -1.0,  1.0,
                    1.0, -1.0,  1.0,
                    1.0,  1.0,  1.0,
                    -1.0,  1.0,  1.0,

                    // Back face
                    -1.0, -1.0, -1.0,
                    -1.0,  1.0, -1.0,
                    1.0,  1.0, -1.0,
                    1.0, -1.0, -1.0,

                    // Top face
                    -1.0,  1.0, -1.0,
                    -1.0,  1.0,  1.0,
                    1.0,  1.0,  1.0,
                    1.0,  1.0, -1.0,

                    // Bottom face
                    -1.0, -1.0, -1.0,
                    1.0, -1.0, -1.0,
                    1.0, -1.0,  1.0,
                    -1.0, -1.0,  1.0,

                    // Right face
                    1.0, -1.0, -1.0,
                    1.0,  1.0, -1.0,
                    1.0,  1.0,  1.0,
                    1.0, -1.0,  1.0,

                    // Left face
                    -1.0, -1.0, -1.0,
                    -1.0, -1.0,  1.0,
                    -1.0,  1.0,  1.0,
                    -1.0,  1.0, -1.0,
                ];
                this._indices = [
                    0,  1,  2,      0,  2,  3,    // front
                    4,  5,  6,      4,  6,  7,    // back
                    8,  9,  10,     8,  10, 11,   // top
                    12, 13, 14,     12, 14, 15,   // bottom
                    16, 17, 18,     16, 18, 19,   // right
                    20, 21, 22,     20, 22, 23,   // left
                ];
                break;
            }
            case 'DEBUG' : {
                this._verts = [
                    -1.0,  1.0,  1.0, // 0
                     1.0,  1.0,  1.0, // 1
                     1.0, -1.0,  1.0, // 2
                    -1.0, -1.0,  1.0, // 3
                    -1.0, -1.0, -1.0, // 4
                    -1.0,  1.0, -1.0, // 5
                     1.0,  1.0, -1.0, // 6
                     1.0, -1.0, -1.0, // 7
                ];                       
                this.normalizeVerts();
                this._indices = [
                    0, 1,
                    1, 2,
                    2, 3,
                    3, 0,
                    0, 5,
                    1, 6,
                    2, 7,
                    3, 4,
                    5, 6,
                    6, 7,
                    7, 4,
                    4, 5
                ];
                break;
            }
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

        this._uniforms = {
            u_ModelMatrix : {
                value    : mat4.create(),
                type     : 'uniformMatrix4fv',
                location : this.gl.getUniformLocation(_program, 'u_ModelMatrix')
            },
        }
    }
}
