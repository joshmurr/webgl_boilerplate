#version 300 es
precision mediump float;

in vec3 v_Color;

out vec4 OUTCOLOUR;

void main(){
    float distance = length(2.0 * gl_PointCoord - 1.0);
    if (distance > 1.0) {
            discard;
    }
    OUTCOLOUR = vec4(v_Color, 1.0);
}
