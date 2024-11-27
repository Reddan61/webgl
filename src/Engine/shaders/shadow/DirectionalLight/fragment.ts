export const shadowFragmentShader = `#version 300 es
    precision mediump float;

    in float depth;

    out vec4 fragColor;

    void main() {
        fragColor = vec4(depth, 0.0, 0.0, 1.0);
    }
`;
