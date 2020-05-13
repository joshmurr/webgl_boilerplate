#version 300 es
precision mediump float;

out vec4 OUTCOLOUR;

void main(){
    float distance = length(2.0 * gl_PointCoord - 1.0);
    if (distance > 1.0) {
            discard;
    }
    OUTCOLOUR = vec4(0.0, 0.0, 0.0, 1.0);
}
