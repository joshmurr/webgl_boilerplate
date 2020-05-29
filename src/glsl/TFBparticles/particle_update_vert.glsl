#version 300 es

#define PI 3.142

precision mediump float;

uniform float u_TimeDelta;
// uniform vec2 u_Mouse;
uniform sampler2D u_RgNoise;

vec2 u_Gravity = vec2(0.0, -0.8);
vec2 u_Origin = vec2(0.0, -0.3);
float u_MinTheta = PI/2.0 - 0.5;
float u_MaxTheta = PI/2.0 + 0.5;
float u_MinSpeed = 0.5;
float u_MaxSpeed = 1.3;

in vec2 i_Position;
in float i_Age;
in float i_Life;
in vec2 i_Velocity;

out vec2 v_Position;
out float v_Age;
out float v_Life;
out vec2 v_Velocity;

float random (vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233)))* 43758.5453123);
}


void main(){
    if(i_Age >= i_Life) {
        ivec2 noise_coord = ivec2(gl_VertexID % 512, gl_VertexID / 512);
        vec3 rand = texelFetch(u_RgNoise, noise_coord, 0).rgb;
        float theta = u_MinTheta + rand.r*(u_MaxTheta - u_MinTheta);

        float x = cos(theta);
        float y = sin(theta);

        v_Position = u_Origin;
        // v_Position = u_Mouse;

        v_Age = 0.0;
        v_Life = i_Life;

        v_Velocity = vec2(x, y) * (u_MinSpeed + rand.g * (u_MaxSpeed - u_MinSpeed));
    } else {
        v_Position = i_Position + i_Velocity * u_TimeDelta;
        v_Age = i_Age + u_TimeDelta;
        v_Life = i_Life;
        v_Velocity = i_Velocity + u_Gravity * u_TimeDelta;
    }
}
