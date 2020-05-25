#version 300 es
precision mediump float;

uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ModelMatrix;

in vec2 i_Position;
in float i_Age;
in float i_Life;
in vec2 i_Velocity;

out float v_Age;
out float v_Life;

void main(){
    v_Age = i_Age;
    v_Life = i_Life;

    float size = 1.0 + 10.0 * (1.0 - i_Age/i_Life);
    gl_PointSize = size;

    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * vec4(i_Position, 0.0, 1.0);
    // gl_Position = vec4(i_Position, 0.0, 1.0);
    // gl_PointSize = ((gl_Position.w * -1.0) + 1.0) * size;
}
