import { mat4 } from "gl-matrix";
import { HSVtoRGB } from "./utils.js";

export class Icosahedron {
    constructor(gl){
        this.gl = gl;
        this._meshes = {};
        this._indexedGeometry = true;
        this._translate = [0.0, 0.0, 0.0];

        this._verts = [
            0.000, 0.000, 1.000,
            0.894, 0.000, 0.447,
            0.276, 0.851, 0.447,
            -0.724, 0.526, 0.447,
            -0.724, -0.526, 0.447,
            0.276, -0.851, 0.447,
            0.724, 0.526, -0.447,
            -0.276, 0.851, -0.447,
            -0.894, 0.000, -0.447,
            -0.276, -0.851, -0.447,
            0.724, -0.526, -0.447,
            0.000, 0.000, -1.000,
        ];

        this._faces = [
            [0, 1, 2],
            [0, 2, 3],
            [0, 3, 4],
            [0, 4, 5],
            [0, 5, 1],
            [11, 7, 6],
            [11, 8, 7],
            [11, 9, 8],
            [11, 10, 9],
            [11, 6, 10],
            [1, 6, 2],
            [2, 7, 3],
            [3, 8, 4],
            [4, 9, 5],
            [5, 10, 1],
            [6, 7, 2],
            [7, 8, 3],
            [8, 9, 4],
            [9, 10, 5],
            [10, 6, 1]
        ];
        this._norms = [];
        for(let i=0; i<this._verts.length; i+=3){
            let x = this._verts[i]
            let y = this._verts[i+1]
            let z = this._verts[i+2]
            let len = Math.sqrt(x*x + y*y + z*z);
            this._norms.push(x/len, y/len, z/len);
        }

        this._colors = [];// new Array(20*3*4); // 20 Faces, 3 Verts, RGBA
        for(let i=0; i<this._verts.length; i++){
            const c = i/this._verts.length;
            const [R,G,B] = HSVtoRGB(c, 1.0, 1.0);
            this._colors.push(R, G, B, 1.0);
        }

        this._indices = [];
        for(let f of this._faces){
            this._indices.push(...f);
        }

    }

    setupVAO(_attributes){
        this.gl.bindVertexArray(this._VAO);

        for(const attrib in _attributes){
            if(_attributes.hasOwnProperty(attrib)){
                const attrib_desc = _attributes[attrib];
                this.gl.enableVertexAttribArray(attrib_desc.location);
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, attrib_desc.buffer);
                this.gl.bufferData(this.gl.ARRAY_BUFFER, attrib_desc.bufferData, attrib_desc.usage),
                this.gl.vertexAttribPointer(
                    attrib_desc.location,
                    attrib_desc.num_components,
                    attrib_desc.type,
                    attrib_desc.normalize,
                    attrib_desc.stride,
                    attrib_desc.offset);

                // const type_size = 4;
                // offset += attrib_desc.num_components * type_size;
                if(attrib_desc.hasOwnProperty("divisor")){
                    this.gl.vertexAttribDivisor(attrib_desc.location, attrib_desc.divisor);
                }
            }
        }
        if(this._indexedGeometry){
            const indexBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this._indices), this.gl.STATIC_DRAW);
        }
        this.gl.bindVertexArray(null);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    }

    init(_program){
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
            i_Normal: {
                buffer: this.gl.createBuffer(),
                bufferData: new Float32Array(this._norms),
                usage: this.gl.STATIC_DRAW,
                location: this.gl.getAttribLocation(_program, "i_Normal"),
                num_components: 3,
                type: this.gl.FLOAT,
                normalize: false,
                stride: 0,
                offset: 0,
            },
            i_Color: {
                buffer: this.gl.createBuffer(),
                bufferData: new Float32Array(this._colors),
                usage: this.gl.STATIC_DRAW,
                location: this.gl.getAttribLocation(_program, "i_Color"),
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
                matrix : mat4.create(),
                location : this.gl.getUniformLocation(_program, 'u_ModelMatrix')
            },
        }
    }

    get VAO(){
        return this._VAO;
    }

    get uniforms(){
        return this._uniforms;
    }

    get numVertices(){
        return this._verts.length;
    }

    get numFaces(){
        return this._faces.length*3;
    }

    get numIndices(){
        return this._indices.length;
    }

    get buffers(){
        return this._buffers;
    }
    get translate(){
        return this._translate;
    }
}
