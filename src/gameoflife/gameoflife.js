import GL_BP from '../GL_BP.js';
import quadVert from './glsl/quadVert.glsl';
import copyFrag from './glsl/copyFrag.glsl';
import golFrag from './glsl/golFrag.glsl';

export default class GameOfLife{
    constructor(_scale, _target){
        this._GL = new GL_BP();

        this._scale = _scale;
        this._width = this._height = 512;

        if(_target) this._GL.initTarget(this._width, this._height, _target);
        else this._GL.init(this._width, this._height);

        this._viewsize = new Float32Array([this._width, this._height]);
        this._statesize = new Float32Array([this._width / this._scale, this._height / this._scale]);

        this._GL.initShaderProgram('copy', quadVert, copyFrag, 'TRIANGLES');
        this._GL.initShaderProgram('gol', quadVert, golFrag, 'TRIANGLES');

        this._GL.updateGlobalUniforms();
        this._GL.cameraPosition = [0, 0, 5];

        const frontTex = {
            program : 'copy',
            name : 'front',
            uniformName : 'u_State',
            width : this._statesize[0],
            height : this._statesize[1],
            wrap : 'REPEAT',
            data : null,
        };

        const backTex = {
            program : 'gol',
            name : 'back',
            uniformName : 'u_State',
            width : this._statesize[0],
            height : this._statesize[1],
            wrap : 'REPEAT',
            data : null,
        };

        this._quad = this._GL.Quad();

        // Textures are added as uniforms
        this._GL.dataTexture(frontTex);
        this._GL.dataTexture(backTex);

        this._quad.translate = [1, 0, -3];
        // this._quad.rotate = {s:0.001, a:[0,0,1]};
        this._GL.linkProgram('copy', this._quad, frontTex.name);
        this._GL.linkProgram('gol', this._quad, backTex.name);
        this._quad.addUniform('u_ScaleCopy', this._statesize,  'float2','uniform2fv', 'copy', this._GL.programs['copy'].shader);
        this._quad.addUniform('u_ScaleGol', this._viewsize, 'float2', 'uniform2fv', 'gol', this._GL.programs['gol'].shader);

        this._GL.framebuffer('step');

        this.seedRandom();
    }

    seedRandom(){
        const size = this._statesize[0]*this._statesize[1];
        let rand = new Uint8Array(size);
        for(let i=0; i<size; i++){
            rand[i] = Math.random() < 0.5 ? 1 : 0;
        }
        this.set(rand);
    }

    set(_state){
        const gl = this._GL.gl;
        let rgba = new Uint8Array(this._statesize[0] * this._statesize[1] * 4);
        for(let i=0; i<_state.length; i++){
            let ii = i*4;
            rgba[ii + 0] = rgba[ii + 1] = rgba[ii + 2] = _state[i] ? 255 : 0;
            rgba[ii + 3] = 255;
        }
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this._GL.textures['front'].value);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, this._statesize[0], this._statesize[1], gl.RGBA, gl.UNSIGNED_BYTE, rgba);
    }

    swapTextures(){
        const tmp = this._GL.textures['front'];
        this._GL.textures['front'] = this._GL.textures['back'];
        this._GL.textures['back'] = tmp;
        // return this;
    }

    step(now){
        const gl = this._GL.gl;
        this._GL.framebufferTexture2D('step', this._GL.textures.back.value);
        this._GL.bindTexture(this._GL.textures['front'].value);

        this._quad.updateUniform('u_ScaleGol', this._statesize);
        // this._quad.addUniform('u_Scale', this._statesize,  'float2','uniform2fv', 'gol', this._GL.programs['gol'].shader);

        this._GL.draw(now, 'gol', this._statesize);
        this.swapTextures();
    }

    draw(now){
        this._GL.bindMainViewport();

        this._quad.updateUniform('u_ScaleCopy', this._viewsize);
        // this._quad.addUniform('u_Scale', this._viewsize,  'float2','uniform2fv', 'copy', this._GL.programs['copy'].shader);

        this._GL.draw(now, 'copy', this._viewsize);
    }

    run(now){
        this.step(now);
        this.draw(now);
    }
}
