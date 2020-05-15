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

        this._textures = {};
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

    linkUniforms(_program){
        // UNIFORMS
        this._uniforms = {
            u_ModelMatrix : {
                value    : mat4.create(),
                type     : 'uniformMatrix4fv',
                location : this.gl.getUniformLocation(_program, 'u_ModelMatrix')
            },
        }
        // Update textures with program location
        for(const tex in this._textures){
            if(this._textures.hasOwnProperty(tex)){
                const texture = this._textures[tex];
                texture.location = this.gl.getUniformLocation(_program, texture.name);
            }
        }
        // Add textures into uniforms
        Object.assign(this._uniforms, this._textures);
    }

    setUniforms(){
        for(const uniform in this._uniforms){
            if(this._uniforms.hasOwnProperty(uniform)){
                const uniform_desc = this._uniforms[uniform];
                if(uniform_desc.type == 'texture'){
                    this.gl.activeTexture(this.gl.TEXTURE0 + uniform_desc.unit);
                    this.gl.bindTexture(this.gl.TEXTURE_2D, uniform_desc.value);
                    this.gl.uniform1i(uniform_desc.location, 0);
                } else {
                    this.gl[uniform_desc.type](
                        uniform_desc.location,
                        false,
                        uniform_desc.value,
                    );
                }
            }
        }
    }

    texture(_options){
        // Default options, to be overwritten by _options passed in
        let options = {
            program : null,
            name : 'u_Texture',
            level : 0,
            unit : 0,
            width : 1,
            height : 1,
            data : null,
            border : 0,
            internalFormat : 'RGBA8',
            format : 'RGBA',
            wrap : 'CLAMP_TO_EDGE',
            filter : 'NEAREST',
            type : 'UNSIGNED_BYTE'
        }

        Object.assign(options, _options);
        // Make some data if none exists
        if(options.data == null){
            options.width = 1;
            options.height = 1;
            options.data = new Uint8Array([0,0,255,255]);
        }

        const texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

        this.gl.texImage2D(this.gl.TEXTURE_2D,
            0, // Level
            this.gl[options.internalFormat],
            options.width,
            options.height,
            options.border,
            this.gl[options.format],
            this.gl[options.type],
            options.data
        );

        // In case of width/height errors use this:
        // this.gl.pixelStorei(this.gl.UNPACK_ALIGNMENT, 1);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl[options.wrap]);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl[options.wrap]);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl[options.filter]);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl[options.filter]);

        // These are basically temporary uniforms to be linked later
        this._textures[options.name] = {
            type        : 'texture',
            uniformType : 'uniform1i',
            value       : texture,
            // location    : this.gl.getUniformLocation(this._programs[options.program].shader, 'u_Texture'),
            location    : null, // Not yet assigned
            unit        : options.unit
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
