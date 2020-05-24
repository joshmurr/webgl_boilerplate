#version 300 es
precision mediump float;

in vec2 v_TexCoord;

uniform sampler2D u_State;
uniform vec2 u_ScaleCopy;

out vec4 OUTCOLOR;

void main(){
    OUTCOLOR = texture(u_State, gl_FragCoord.xy / u_ScaleCopy);
}
