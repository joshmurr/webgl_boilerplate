#version 300 es
precision mediump float;

in vec3 i_Position;
in vec2 i_TexCoord;

uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ModelMatrix;

out vec2 v_TexCoord;

void main(){
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * vec4(i_Position, 1.0);

    v_TexCoord = i_TexCoord;
}
