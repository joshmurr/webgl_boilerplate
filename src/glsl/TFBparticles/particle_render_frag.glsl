#version 300 es
precision mediump float;

in float v_Age;
in float v_Life;

out vec4 o_FragColor;

vec3 palette(in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d){
    return a+b*cos(6.28318*(c*t+d));
}

void main() {
    float t = v_Age/v_Life;
    float dist = length(2.0 * gl_PointCoord - 1.0);
    if (dist > 1.0) {
            discard;
    }
    float invT = 1.0 - t;
    o_FragColor = vec4(invT, invT, invT, 1.0);
}
