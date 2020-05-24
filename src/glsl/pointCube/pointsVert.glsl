#version 300 es
precision mediump float;

in vec3 i_Position;

uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ModelMatrix;

uniform sampler2D u_Texture;

float off = 0.5-(1.0/16.0);

void main(){
    // float vel = texelFetch(u_Texture, ivec2(gl_VertexID, 0), 0).r;
    vec3 position = texelFetch(u_Texture, ivec2(gl_VertexID, 0), 0).rgb;
    // position /= 255.0;
    position -= off;
    // position -= vec3(0.5);
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * vec4(i_Position*position, 1.0);
    // gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * vec4(i_Position, 1.0);
    gl_PointSize = (gl_Position.w * -1.0) + 6.0;
}
