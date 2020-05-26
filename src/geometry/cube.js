import Geometry from "./geometry.js";
import { mat4 } from "gl-matrix";

export default class Cube extends Geometry {
    constructor(gl, type){
        super(gl);
        this._indexedGeometry = true;
        this._type = type;
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
                this._textureCoordinates = [
                    // Front
                    0.0,  0.0,
                    1.0,  0.0,
                    1.0,  1.0,
                    0.0,  1.0,
                    // Back
                    0.0,  0.0,
                    1.0,  0.0,
                    1.0,  1.0,
                    0.0,  1.0,
                    // Top
                    0.0,  0.0,
                    1.0,  0.0,
                    1.0,  1.0,
                    0.0,  1.0,
                    // Bottom
                    0.0,  0.0,
                    1.0,  0.0,
                    1.0,  1.0,
                    0.0,  1.0,
                    // Right
                    0.0,  0.0,
                    1.0,  0.0,
                    1.0,  1.0,
                    0.0,  1.0,
                    // Left
                    0.0,  0.0,
                    1.0,  0.0,
                    1.0,  1.0,
                    0.0,  1.0,
                ];
                this.normalizeVerts();
                break;
            }
            case '404' : {
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
                this._textureCoordinates = [
                    // Front - 4
                    0.0,  0.0,
                    0.5,  0.0,
                    0.5,  1.0,
                    0.0,  1.0,
                    // Back - 4
                    0.0,  0.0,
                    0.5,  0.0,
                    0.5,  1.0,
                    0.0,  1.0,
                    // Top - 0
                    0.5,  0.0,
                    1.0,  0.0,
                    1.0,  1.0,
                    0.5,  1.0,
                    // Bottom - 4
                    0.5,  0.0,
                    1.0,  0.0,
                    1.0,  1.0,
                    0.5,  1.0,
                    // Right - 0
                    0.5,  0.0,
                    1.0,  0.0,
                    1.0,  1.0,
                    0.5,  1.0,
                    // Left - 0
                    0.5,  0.0,
                    1.0,  0.0,
                    1.0,  1.0,
                    0.5,  1.0,
                ];
                this.normalizeVerts();
                break;
            }
            case 'DEBUG' : {
                // For wireframe drawing
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
                // gl.LINES
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
        this._VAOs.push(this.gl.createVertexArray());

        switch(this._type){
            case 'SOLID' :
            case '404' : {
                const positionBuffer = this.gl.createBuffer();
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
                this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this._verts), this.gl.STATIC_DRAW);
                const texCoordBuffer = this.gl.createBuffer();
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, potexCoordffer);
                this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this._textureCoordinates), this.gl.STATIC_DRAW);
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

                const positionAttrib = {
                    i_Position: {
                        location: this.gl.getAttribLocation(_program, "i_Position"),
                        num_components: 3,
                        type: this.gl.FLOAT,
                        size: 4,
                    },
                };
                const texAttrib = {
                    i_TexCoord: {
                        location: this.gl.getAttribLocation(_program, "i_TexCoord"),
                        num_components: 2,
                        type: this.gl.FLOAT,
                    }
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
                            {
                                buffer_object: texCoordBuffer,
                                stride: 0,
                                attributes: texAttrib
                            },
                        ]
                    },
                ];
                for(const VAO of VAO_desc){
                    this.setupVAO(VAO.buffers, VAO.vao);
                }
                break;
            }
            case 'DEBUG' : {
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

    }
}
