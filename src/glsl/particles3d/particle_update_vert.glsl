#version 300 es

#define PI 3.142

precision mediump float;

uniform float u_TimeDelta;
uniform float u_TotalTime;
uniform sampler2D u_RgNoise;
// uniform vec2 u_Gravity;

// PARTICLE SPECIFIC ----------
// uniform vec2 u_Origin;
// uniform float u_MinTheta;
// uniform float u_MaxTheta;
// uniform float u_MinSpeed;
// uniform float u_MaxSpeed;
// ----------------------------

vec3 u_Gravity = vec3(0.0, -0.8, 0.0);
vec3 u_Origin = vec3(0.0, 0.0, 0.0);
float u_MinTheta = PI/2.0 - 0.1;
float u_MaxTheta = PI/2.0 + 0.1;
float u_MinSpeed = 0.9;
float u_MaxSpeed = 1.5;

// uniform sampler2D u_ForceField;

// PARTICLE SPECIFIC ----------
in vec3 i_Position;
in float i_Age;
in float i_Life;
in vec3 i_Velocity;
// ----------------------------


// Transform Feedback Varyings
out vec3 v_Position;
out float v_Age;
out float v_Life;
out vec3 v_Velocity;


float random (vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233)))* 43758.5453123);
}


void main(){
    if(i_Age >= i_Life) {
        ivec2 noise_coord = ivec2(gl_VertexID % 512, gl_VertexID / 512);
        vec3 rand = texelFetch(u_RgNoise, noise_coord, 0).rgb;
        // float theta = u_MinTheta + rand.r*(u_MaxTheta - u_MinTheta);
        float theta = u_MinTheta + rand.r*(u_MaxTheta - u_MinTheta);
        float phi   = u_MinTheta + rand.b*(u_MaxTheta - u_MinTheta);

        float x = sin(theta)*cos(phi);
        float y = sin(theta)*sin(phi);
        float z = cos(theta);

        v_Position = u_Origin;
        // v_Position = vec3((random(noise_coord)*2.0)-1.0, (random(noise_coord)*2.0)-1.0,(random(noise_coord)*2.0)-1.0);

        v_Age = 0.0;
        v_Life = i_Life;

        v_Velocity = vec3(x, y, z) * (u_MinSpeed + rand.g * (u_MaxSpeed - u_MinSpeed));
    } else {
        v_Position = i_Position + i_Velocity * u_TimeDelta;
        v_Age = i_Age + u_TimeDelta;
        v_Life = i_Life;
        v_Velocity = i_Velocity + u_Gravity * u_TimeDelta;
    }
}
