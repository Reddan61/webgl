export const fragmentShader = `
  precision mediump float;

  varying vec2 fragTextureCoords;
  varying vec3 fragNormal;

  uniform sampler2D sampler;
  uniform vec4 colorFactor;
  uniform bool useTexture;


  void main(void) {
    vec3 ambient = vec3(0.2, 0.2, 0.2);
    vec3 directionalIntensity = vec3(0.9, 0.9, 0.9);
    vec3 directionalLightDir = normalize(vec3(0.0, 2.0, 5.0));

    
    vec3 lightIntensity = ambient +
    directionalIntensity * max(dot(fragNormal, directionalLightDir), 0.0);
    
    if (useTexture) {
      vec4 texel = texture2D(sampler, fragTextureCoords);
      gl_FragColor = vec4(texel.rgb * lightIntensity, texel.a);
    } else {
      gl_FragColor = vec4(colorFactor.xyz * lightIntensity, colorFactor.w);
    }
  }
`;
