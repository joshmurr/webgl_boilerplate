#version 300 es
precision mediump float;

in vec3 i_Position;
in vec3 i_Normal;
in vec2 i_TexCoord;

out vec2 v_TexCoord;
out vec3 v_Normal;

void main(){
    gl_Position = vec4(i_Position,  1.0);
    v_TexCoord = i_TexCoord;
    v_Normal = i_Normal;
}
