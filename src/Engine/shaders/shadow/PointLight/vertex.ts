export const shadowVertexShader = `#version 300 es
    precision mediump float;

    in vec3 vertexPosition;

    uniform mat4 viewMatrix;
    uniform mat4 projMatrix;
    uniform mat4 modelMatrix;

    out vec3 fragPos;

    void main() {
        fragPos = (modelMatrix * vec4(vertexPosition, 1.0)).xyz;
        
        gl_Position = viewMatrix * modelMatrix * vec4(vertexPosition, 1.0);
    }
`;
