#version 300 es
precision mediump float;

in vec3 i_Position;

in int i_State;
flat out int v_State;

void main(){
    v_State = i_State;

    gl_Position = vec4(i_Position, 1.0);
}
