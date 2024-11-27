export const shadowVertexShader = `#version 300 es
    precision mediump float;

    in vec3 vertexPosition;

    uniform mat4 lightSpaceMatrix; 
    uniform mat4 modelMatrix;

    out float depth;

    void main() {
        gl_Position = lightSpaceMatrix * modelMatrix * vec4(vertexPosition, 1.0);
        
        float zBuf = gl_Position.z / gl_Position.w;
        depth = 0.5 + zBuf * 0.5; 
    }
`;
