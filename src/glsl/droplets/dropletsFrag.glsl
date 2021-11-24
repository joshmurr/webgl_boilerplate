#version 300 es
precision mediump float;

uniform sampler2D u_StateUpdate;
uniform vec2 u_Scale;

out vec4 OUTCOLOR;

int get(vec2 _offset){
    return int(texture(u_StateUpdate, (gl_FragCoord.xy + _offset) / u_Scale).r);
}

void main(){
    int sum =
        get(vec2(-1.0, -1.0)) +
        get(vec2(-1.0,  0.0)) +
        get(vec2(-1.0,  1.0)) +
        get(vec2( 0.0, -1.0)) +
        get(vec2( 0.0,  1.0)) +
        get(vec2( 1.0, -1.0)) +
        get(vec2( 1.0,  0.0)) +
        get(vec2( 1.0,  1.0));
    if (sum == 3) {
        OUTCOLOR = vec4(1.0, 1.0, 1.0, 1.0);
    } else if (sum == 2) {
        float current = float(get(vec2(0.0, 0.0)));
        OUTCOLOR = vec4(current, current, current, 1.0);
    } else {
        OUTCOLOR = vec4(0.0, 0.0, 0.0, 1.0);
    }
}
