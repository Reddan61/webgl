export const vertexShader = `
  attribute vec3 vertexPosition;

  uniform mat4 transformation;
  uniform mat4 view;
  uniform mat4 projection;

  void main(void) {
    gl_Position = projection * view * transformation * vec4(vertexPosition, 1.0);
  }
`;
