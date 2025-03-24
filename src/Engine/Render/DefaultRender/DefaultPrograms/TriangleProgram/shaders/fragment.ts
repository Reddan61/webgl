export const fragment = `#version 300 es
  precision mediump float;

  in vec2 fragTextureCoords;
  in vec3 fragNormal;
  in vec3 fragPosition;
  in vec4 fragPositionLightSpace;
  in mat3 tbn;

  out vec4 fragColor;

  uniform vec4 colorFactor;
  uniform bool useTexture;
  uniform vec3 cameraPosition;

  uniform float alphaCutoff;

  uniform sampler2D objectTexture;

  void main(void) {
    if (useTexture) {
      vec4 texel = texture(objectTexture, fragTextureCoords);

      texel.a *= step(alphaCutoff, texel.a);

      fragColor = vec4(texel.rgb, texel.a);
    } else {
      fragColor = vec4(colorFactor.xyz , colorFactor.w);
    }
  }
`;
