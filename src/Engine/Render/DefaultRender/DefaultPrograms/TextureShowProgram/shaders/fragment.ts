export const fragment = `#version 300 es
    precision mediump float;

    in vec2 vTextCoords;

    out vec4 fragColor;

    uniform sampler2D customTexture;

    #define ATLAS_SCALE vec3(0.5, 0.5, 1.0)
    #define ATLAS_OFFSET vec3(-0.5, 0.0, 0.0)
    #define SCALE  0.25

    void main() {
        float depth = texture(customTexture, vTextCoords).r;
        fragColor = vec4(vec3(depth), 1.0);
    }
`;
