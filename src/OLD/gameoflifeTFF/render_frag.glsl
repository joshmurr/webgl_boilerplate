#version 300 es
precision mediump float;

in float v_State;

uniform vec2 u_Resolution;
uniform float u_TotalTime;

out vec4 OUTCOLOR;

float cell(vec2 _st, vec2 _size){
    _size = vec2(0.5)-_size*0.5;      // Translate to centre
    vec2 uv = step(_size, _st);       // Bottom left border
    uv *= step(_size, vec2(1.0)-_st); // Top Right border
    return v_State;
    // return uv.x * uv.y;
}

void main(){
    // Somehow get the color from v_State;
    vec2 st = fract(gl_FragCoord.xy/u_Resolution);
    // vec3 colour = vec3(cell(st,vec2(0.71)));


    OUTCOLOR = vec4(vec3(v_State), 1.0);
}
