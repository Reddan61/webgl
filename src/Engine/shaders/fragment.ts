export const fragmentShader = `
  precision mediump float;

  varying vec2 fragTextureCoords;
  uniform sampler2D sampler;

  void main(void) {
    gl_FragColor = texture2D(sampler, fragTextureCoords);
  }
`;