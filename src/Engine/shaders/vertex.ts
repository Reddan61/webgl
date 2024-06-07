export const vertexShader = `
  attribute vec3 vertexPosition;
  attribute vec2 textureCoords;

  uniform mat4 world;
  uniform mat4 view;
  uniform mat4 projection;

  varying vec2 fragTextureCoords;

  void main(void) {
    fragTextureCoords = textureCoords;
    gl_Position = projection * view * world * vec4(vertexPosition, 1.0);
  }
`;