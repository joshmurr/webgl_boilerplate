import { mat4 } from "gl-matrix";

export default class Geometry {
    constructor(gl){
        this.gl = gl;

        this._indexedGeometry = false;
        this._uniformsNeedsUpdate = false;
        this._translate = [0.0, 0.0, 0.0];
        this._rotation = { speed : 0, axis : [0, 0, 0]};

        this._verts = [];
        this._indices = [];
        this._normals = [];
        this._colors = [];
        this._buffers = [];
        this._VAOs = [];

        this._uniforms = {};
        this._textures = {};
    }


    setupVAO(_buffers, _VAO){
        this.gl.bindVertexArray(_VAO);

        for(const buffer of _buffers){
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer.buffer_object);
            let offset = 0;

            for(const attrib in buffer.attributes){
                if(buffer.attributes.hasOwnProperty(attrib)){
                    const attrib_desc = buffer.attributes[attrib];
                    this.gl.enableVertexAttribArray(attrib_desc.location);
                    this.gl.vertexAttribPointer(
                        attrib_desc.location,
                        attrib_desc.num_components,
                        attrib_desc.type,
                        false, //attrib_desc.normalize,
                        buffer.stride,
                        offset
                    );
                    offset += attrib_desc.num_components * attrib_desc.size;
                    if(attrib_desc.hasOwnProperty("divisor")){
                        this.gl.vertexAttribDivisor(attrib_desc.location, attrib_desc.divisor);
                    }
                }
            }
        }
        if(this._indexedGeometry){
            const indexBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this._indices), this.gl.STATIC_DRAW);
        }
        // Empty Buffers:
        // !Important to unbind the VAO first.
        this.gl.bindVertexArray(null);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
    }

    addUniform(_name, _initialValue, _type, _glType, _progName, _program){
        this._uniforms[_name] = {
            value       : _initialValue,
            uniformType : _type,
            type        : _glType,
            programName : _progName,
            location    : this.gl.getUniformLocation(_program, _name)
        }
    }

    updateUniform(_uniform, _val){
        if(this._uniforms.hasOwnProperty(_uniform)){
            const uniform_desc = this._uniforms[_uniform];
            uniform_desc.value = _val;
        }
    }

    linkUniforms(_arg1, _aarg2){
        console.error("'linkUniforms()' is deprecated, use 'initUniforms()'");
    }

    initUniforms(_shaderProgram, _uniforms){
        for(const uniform of _uniforms){
            switch(uniform){
                case 'u_ModelMatrix' : {
                    this._uniforms['u_ModelMatrix'] = {
                        // type        : 'mat4',
                        type        : 'uniformMatrix4fv',
                        value       : mat4.create(), //this._projectionMat,
                        // programName : null,
                        location    : this.gl.getUniformLocation(_shaderProgram, 'u_ProjectionMatrix')
                    };
                    break;
                }
            }
        }
        console.log(this._uniforms);
        // if(_textures){
        // for(const tex of _textures){
        // Object.assign(this._uniforms, tex);
        // }
        // }
    }

    setUniforms(){
        for(const uniform in this._uniforms){
            if(this._uniforms.hasOwnProperty(uniform)){
                const uniform_desc = this._uniforms[uniform];
                // If a specific program is passed and does not match the program
                // in the uniform, skip it.
                if(uniform_desc.programName && _programName &&  _programName!==uniform_desc.programName) continue;
                switch(uniform_desc.type){
                    case 'texture' : {
                        // If there is only one texture, all of this is implied
                        // and therefore technically unnecessary
                        this.gl.activeTexture(this.gl.TEXTURE0 + uniform_desc.unit);
                        // this.gl.bindTexture(this.gl.TEXTURE_2D, uniform_desc.value);
                        this.gl.uniform1i(uniform_desc.location, 0);
                        break;
                    }
                    case 'uniform2fv' : {
                        this.gl[uniform_desc.type](
                            uniform_desc.location,
                            uniform_desc.value,
                        );
                        break;
                    }
                    default : {
                        // Matrix
                        this.gl[uniform_desc.type](
                            uniform_desc.location,
                            false, // transpose
                            uniform_desc.value,
                        );
                    }
                }
            }
        }
    }

    get VAO(){
        return this._VAOs[0];
    }

    get uniforms(){
        return this._uniforms;
    }

    get numVertices(){
        return this._verts.length/3;
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
        this._uniformsNeedsUpdate = true;
        this._translate[0] = loc[0];
        this._translate[1] = loc[1];
        this._translate[2] = loc[2];
    }
    set rotate(speedAxis){
        this._uniformsNeedsUpdate = true;
        const [s, r] = Object.values(speedAxis);
        this._rotation.speed = s;
        this._rotation.axis[0] = r[0];
        this._rotation.axis[1] = r[1];
        this._rotation.axis[2] = r[2];
    }

    get needsUpdate(){
        return this._uniformsNeedsUpdate;
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
    normalizeVerts(){
        for(let i=0; i<this._verts.length; i+=3) {
            const norm = this.normalize(this._verts[i], this._verts[i+1], this._verts[i+2]);
            this._verts[i] = norm[0];
            this._verts[i+1] = norm[1];
            this._verts[i+2] = norm[2];
        }
    }

    normalize(a, b, c){
        const len = Math.sqrt(a*a + b*b + c*c);
        return [a/len, b/len, c/len];
    }
}
