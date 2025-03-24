export const vertex = `#version 300 es
precision mediump float;

in vec2 vertexPosition;
in vec2 textureCoords; 

uniform int faceIndex;

out vec2 vTextCoords;

void main() {
    // vTextCoords = textureCoords;
    vTextCoords = vec2(textureCoords.x, 1.0 - textureCoords.y);
    gl_Position = vec4(vertexPosition, 0.0, 1.0);
    
    // if (faceIndex == 0) texCoords = vec3(1.0, vertexPosition);
    // else if (faceIndex == 1) texCoords = vec3(-1.0, vertexPosition);
    // else if (faceIndex == 2) texCoords = vec3(vertexPosition.x, 1.0, vertexPosition.y);
    // else if (faceIndex == 3) texCoords = vec3(vertexPosition.x, -1.0, vertexPosition.y);
    // else if (faceIndex == 4) texCoords = vec3(vertexPosition, 1.0);
    // else if (faceIndex == 5) texCoords = vec3(vertexPosition, -1.0);
}`;
