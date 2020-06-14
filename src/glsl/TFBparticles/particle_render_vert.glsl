#version 300 es
precision mediump float;

uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ViewMatrix;

in vec2 i_Position;
in vec2 i_Velocity;
in float i_Age;
in float i_Life;

out float v_Age;
out float v_Life;
out vec2 v_Velocity;

void main(){
    v_Age = i_Age;
    v_Life = i_Life;
    v_Velocity = i_Velocity;

    float ageFactor = 1.0 + (1.0 - i_Age/i_Life);

    gl_Position = u_ProjectionMatrix * u_ViewMatrix * vec4(i_Position, 0.0, 1.0);
    gl_PointSize = 1.0/gl_Position.z * 8.0 * ageFactor;
}
