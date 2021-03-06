#version 300 es

#define PI 3.142

precision mediump float;
precision mediump sampler3D;

uniform float u_TimeDelta;
uniform float u_TotalTime;
uniform sampler2D u_InitialPosition;

vec3 u_Gravity = vec3(0.0, 0.0, 0.0);
vec3 u_Origin = vec3(0.0, 0.0, 0.0);
float u_MinTheta = -PI;
float u_MaxTheta = PI;
float u_MinSpeed = 0.01;
float u_MaxSpeed = 0.02;
vec3 acc = vec3(0.0);

in vec3 i_Position;
in float i_Age;
in float i_Life;
in vec3 i_Velocity;

// Transform Feedback Varyings
out vec3 v_Position;
out float v_Age;
out float v_Life;
out vec3 v_Velocity;

vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 taylorInvSqrt(vec4 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
}


vec4 permute(vec4 x) {
    return mod289(((x*34.0)+1.0)*x);
}

float snoise(vec3 v) {
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

    // First corner
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 =   v - i + dot(i, C.xxx) ;

    // Other corners
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );

    //   x0 = x0 - 0.0 + 0.0 * C.xxx;
    //   x1 = x0 - i1  + 1.0 * C.xxx;
    //   x2 = x0 - i2  + 2.0 * C.xxx;
    //   x3 = x0 - 1.0 + 3.0 * C.xxx;
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
    vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

    // Permutations
    i = mod289(i);
    vec4 p = permute( permute( permute(
                    i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

    // Gradients: 7x7 points over a square, mapped onto an octahedron.
    // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
    float n_ = 0.142857142857; // 1.0/7.0
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );

    //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
    //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

    //Normalise gradients
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    // Mix final noise value
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                dot(p2,x2), dot(p3,x3) ) );
}


float random (vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233)))* 43758.5453123);
}

vec3 flow(vec3 _p){
    float x = _p.y * _p.z;
    float y = _p.x * _p.z;
    float z = _p.y * _p.x;

    return vec3(x,y,z);
}

vec3 trigFlow(vec3 _p){
    return vec3(sin(_p.y*_p.z), cos(sin(_p.x)), sin(_p.z*_p.y));
}

vec3 piFlow(vec3 _p){
    return vec3(
            sin(2.0 * PI * _p.z),
            sin(2.0 * PI * _p.x),
            cos(2.0 * PI * _p.y)
        );
}

vec3 repel(vec3 _pos){
    vec3 dir = _pos - vec3(0);
    float d = length(dir);
    normalize(dir);
    float force = 5.0/(10.0*d*d);
    dir *= force;
    return dir;
}

void main(){
    if(i_Age >= i_Life) {
        v_Position = 0.5 * (2.0 * texelFetch(u_InitialPosition, ivec2(gl_VertexID, 0), 0).rgb - vec3(1.0));
        v_Age = 0.0;
        v_Life = i_Life;
        v_Velocity = vec3(0);
    } else {
        v_Position = i_Position + i_Velocity * u_TimeDelta;
        acc = repel(v_Position);
        v_Age = i_Age + u_TimeDelta;
        v_Life = i_Life;
        v_Velocity = i_Velocity + acc * u_TimeDelta + piFlow(v_Position) * 0.02 * u_TimeDelta;
        acc *= 0.0;
    }
}
