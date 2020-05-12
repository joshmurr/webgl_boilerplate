#version 300 es
precision mediump float;

uniform float u_TimeDelta;
uniform float u_Time;
uniform sampler2D u_RgNoise;
uniform vec2 u_Gravity;

// PARTICLE SPECIFIC ----------
uniform vec2 u_Origin;
uniform float u_MinTheta;
uniform float u_MaxTheta;
uniform float u_MinSpeed;
uniform float u_MaxSpeed;
// ----------------------------

uniform sampler2D u_ForceField;

// PARTICLE SPECIFIC ----------
in vec2 i_Position;
in float i_Age;
in float i_Life;
in vec2 i_Velocity;
// ----------------------------


// Transform Feedback Varyings
out vec2 v_Position;
out float v_Age;
out float v_Life;
out vec2 v_Velocity;

vec2 attractorLoc1 = vec2(-0.5,0.0);
vec2 attractorLoc2 = vec2(0.5,0.0);
vec2 acceleration = vec2(0.0,0.0);
float mass = 50.0;

vec2 grad(vec2 p) {
    const float texture_width = 512.0;
    vec4 v = texture(u_RgNoise, vec2(p.x + u_Time*2.0 / texture_width, p.y + u_Time*2.0 / texture_width));
    return normalize(v.xy*2.0 - vec2(1.0));
}

/* S-shaped curve for 0 <= t <= 1 */
float fade(float t) {
    return t*t*t*(t*(t*6.0 - 15.0) + 10.0);
}


/* 2D noise */
float noise(vec2 p) {
    /* Calculate lattice points. */
    vec2 p0 = floor(p);
    vec2 p1 = p0 + vec2(1.0, 0.0);
    vec2 p2 = p0 + vec2(0.0, 1.0);
    vec2 p3 = p0 + vec2(1.0, 1.0);

    /* Look up gradients at lattice points. */
    vec2 g0 = grad(p0);
    vec2 g1 = grad(p1);
    vec2 g2 = grad(p2);
    vec2 g3 = grad(p3);

    float t0 = p.x - p0.x;
    float fade_t0 = fade(t0); /* Used for interpolation in horizontal direction */

    float t1 = p.y - p0.y;
    float fade_t1 = fade(t1); /* Used for interpolation in vertical direction. */

    /* Calculate dot products and interpolate.*/
    float p0p1 = (1.0 - fade_t0) * dot(g0, (p - p0)) + fade_t0 * dot(g1, (p - p1)); /* between upper two lattice points */
    float p2p3 = (1.0 - fade_t0) * dot(g2, (p - p2)) + fade_t0 * dot(g3, (p - p3)); /* between lower two lattice points */

    /* Calculate final result */
    return (1.0 - fade_t1) * p0p1 + fade_t1 * p2p3;
}

float random (vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233)))* 43758.5453123);
}

vec2 attract(vec2 attactor, vec2 loc){
    vec2 dir = attactor - loc;
    float d = length(dir);
    normalize(dir);
    float force = 500.0/(1.0*d*d);
    dir *= force;
    return dir;
}

void main(){
    if(i_Age >= i_Life) {
        // Sampling the texture based on particle ID.
        // This will return the same random seed value for each particle
        // every time.
        ivec2 noise_coord = ivec2(gl_VertexID % 512, gl_VertexID / 512);
        vec2 rand = texelFetch(u_RgNoise, noise_coord, 0).rg;
        // Initial direction of particle based on random value
        float theta = u_MinTheta + rand.r*(u_MaxTheta - u_MinTheta);

        float x = cos(theta);
        float y = sin(theta);

        v_Position = u_Origin;
        // v_Position = vec2((random(rand.xy)*2.0)-1.0, (random(rand.yx)*2.0)-1.0);

        v_Age = 0.0;
        v_Life = i_Life;

        v_Velocity = vec2(x, y) * (u_MinSpeed + rand.g * (u_MaxSpeed - u_MinSpeed));
    } else {
        v_Position = i_Position + i_Velocity * u_TimeDelta;
        acceleration += attract(attractorLoc1, v_Position);
        acceleration += attract(attractorLoc2, v_Position);
        acceleration /= mass;
        v_Age = i_Age + u_TimeDelta;
        v_Life = i_Life;
        // vec2 force = 4.0 * (2.0 * texture(u_ForceField, i_Position).rg - vec2(1.0));
        float n = 
            noise(i_Position/64.0) * 1.0 +
            noise(i_Position/32.0) * 0.5 +
            noise(i_Position/16.0) * 0.25 +
            noise(i_Position/8.0)  * 0.125;
        vec2 force = i_Position*n*50.0;
        // v_Velocity = i_Velocity * 0.9 + acceleration * u_TimeDelta * 0.005 + u_Gravity * u_TimeDelta + force * u_TimeDelta;
        v_Velocity = i_Velocity + acceleration * u_TimeDelta * 0.1 + u_Gravity * u_TimeDelta + force * u_TimeDelta;
        acceleration *= 0.0;
    }
}
