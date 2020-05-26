#version 300 es
precision mediump float;

in vec2 i_Position;

in float i_State;
out float v_State;

void main(){
    v_State = i_State;

    gl_Position = vec4(i_Position, 0.0, 1.0);
}
