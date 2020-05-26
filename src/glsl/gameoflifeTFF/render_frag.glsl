#version 300 es
precision mediump float;

flat in int v_State;

out vec4 OUTCOLOR;

void main(){
    // Somehow get the color from v_State;
    OUTCOLOR = vec4(0.8, 0.1, 0.1, 1.0);
}
