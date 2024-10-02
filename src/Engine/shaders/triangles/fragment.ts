export const fragmentShader = `
  precision mediump float;

  struct DirectionalLight {
    vec3 intensity;
    vec3 direction;
  };

  varying vec2 fragTextureCoords;
  varying vec3 fragNormal;

  uniform sampler2D sampler;
  uniform vec3 ambientIntensive;
  uniform DirectionalLight directionalLight;
  uniform vec4 colorFactor;
  uniform bool useTexture;

  void main(void) {
    vec3 lightIntensity = ambientIntensive +
    directionalLight.intensity * max(dot(fragNormal, directionalLight.direction), 0.0);
    
    if (useTexture) {
      vec4 texel = texture2D(sampler, fragTextureCoords);
      gl_FragColor = vec4(texel.rgb * lightIntensity, texel.a);
    } else {
      gl_FragColor = vec4(colorFactor.xyz * lightIntensity, colorFactor.w);
    }
  }
`;
