#version 300 es
precision mediump float;

in vec3 i_Position;

uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ModelMatrix;

void main(){
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * vec4(i_Position, 1.0);
    gl_PointSize = (gl_Position.w * -1.0) + 6.0;
}
