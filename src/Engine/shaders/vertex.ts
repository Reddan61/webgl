export const vertexShader = `
  attribute vec3 vertexPosition;
  attribute vec2 textureCoords;
  attribute vec3 normals;

  uniform mat4 world;
  uniform mat4 view;
  uniform mat4 projection;

  varying vec2 fragTextureCoords;
  varying vec3 fragNormal;

  void main(void) {
    fragTextureCoords = textureCoords;
    fragNormal = (world * vec4(normals, 0.0)).xyz;
    gl_Position = projection * view * world * vec4(vertexPosition, 1.0);
  }
`;