import Geometry from "./geometry.js";
import { mat4 } from "gl-matrix";

export default class Quad extends Geometry {
    constructor(gl){
        super(gl);
        this._indexedGeometry = true;
        this._verts = [ 
            -1, -1, 0,
             1, -1, 0,
             1,  1, 0,
            -1,  1, 0,
        ];
        this._textureCoordinates = [ 
            0.0,  0.0,
            1.0,  0.0,
            1.0,  1.0,
            0.0,  1.0,
        ];
        // For use with TRIANGLES
        this._indices = [
            0, 1, 2, 0, 2, 3
        ];
    }

    linkProgram(_program, _textures){
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
            i_TexCoord: {
                buffer: this.gl.createBuffer(),
                bufferData: new Float32Array(this._textureCoordinates),
                usage: this.gl.STATIC_DRAW,
                location: this.gl.getAttribLocation(_program, "i_TexCoord"),
                num_components: 2,
                type: this.gl.FLOAT,
                normalize: false,
                stride: 0,
                offset: 0,
            },
        };

        this._VAO = this.gl.createVertexArray();
        this.setupVAO(attributes);
        this.linkUniforms(_program, _textures);
    }
}
