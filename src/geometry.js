import { mat4 } from "gl-matrix";

export default class Geometry {
    constructor(gl){
        this.gl = gl;

        this._indexedGeometry = false;
        this._translate = [0.0, 0.0, 0.0];
        this._rotation = { speed : 0, axis : [0, 0, 0]};

        this._verts = [];
        this._indices = [];
        this._normals = [];
        this._colors = [];
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
        // Empty Buffers:
        this.gl.bindVertexArray(null);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
    }

    setUniforms(){
        for(const uniform in this._uniforms){
            if(this._uniforms.hasOwnProperty(uniform)){
                const uniform_desc = this._uniforms[uniform];
                this.gl[uniform_desc.type](
                    uniform_desc.location,
                    false,
                    uniform_desc.value,
                );
            }
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

    get numIndices(){
        return this._indices.length;
    }

    get buffers(){
        return this._buffers;
    }
    get translate(){
        return this._translate;
    }
    set translate(loc){
        this._translate[0] = loc[0];
        this._translate[1] = loc[1];
        this._translate[2] = loc[2];
    }
    set rotate(speedAxis){
        const [s, r] = Object.values(speedAxis);
        this._rotation.speed = s;
        this._rotation.axis[0] = r[0];
        this._rotation.axis[1] = r[1];
        this._rotation.axis[2] = r[2];
    }

    updateModelMatrix(_time){
        mat4.identity(this._uniforms.u_ModelMatrix.value);
        mat4.translate(this._uniforms.u_ModelMatrix.value,
                       this._uniforms.u_ModelMatrix.value,
                       this._translate
        );
        mat4.rotate(this._uniforms.u_ModelMatrix.value,
                    this._uniforms.u_ModelMatrix.value,
                    _time * this._rotation.speed,
                    this._rotation.axis
        );
    }
}
