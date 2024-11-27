export const shadowFragmentShader = `#version 300 es
    precision mediump float;

    in vec3 fragPos;

    uniform vec3 lightPos;
    uniform float farPlane;

    void main() {
        gl_FragDepth = length(fragPos - lightPos) / farPlane;
    }
`;
