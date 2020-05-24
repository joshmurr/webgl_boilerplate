#version 300 es
precision mediump float;

in mat4 u_ModelMatrix;
in mat4 u_ViewMatrix;
in mat4 u_ProjectionMatrix;

in vec3 i_Position;
in vec2 i_TexCoord;

out vec2 v_TexCoord;

void main(){
    gl_Position = vec4(i_Position, 1.0);
    v_TexCoord = i_TexCoord;
}
