export const vertexShader = `
  attribute vec3 vertexPosition;
  attribute vec2 textureCoords;
  attribute vec3 normals;

  uniform mat4 transformation;
  uniform mat4 view;
  uniform mat4 projection;

  varying vec2 fragTextureCoords;
  varying vec3 fragNormal;

  void main(void) {
    fragTextureCoords = textureCoords;
    fragNormal = (transformation * vec4(normals, 0.0)).xyz;
    gl_Position = projection * view * transformation * vec4(vertexPosition, 1.0);
  }
`;