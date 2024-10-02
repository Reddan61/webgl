export const fragmentShader = `
  precision mediump float;

  #define POINTLIGHTS_COUNT 3

  struct AmbientLight {
    float bright;
    vec3 color;
  };

  struct DirectionalLight {
    vec3 color;
    vec3 direction;
    float bright;
  };

  struct PointLight {
    vec3 color;
    vec3 position;
    float bright;
  };

  varying vec2 fragTextureCoords;
  varying vec3 fragNormal;
  varying vec3 fragPosition;

  uniform sampler2D sampler;
  uniform AmbientLight ambientLight;
  uniform DirectionalLight directionalLight;
  uniform PointLight pointLights[POINTLIGHTS_COUNT];
  uniform vec4 colorFactor;
  uniform bool useTexture;
  uniform bool useLight;
  uniform vec3 cameraPosition;

  vec3 calculateDirectionalLight(vec3 viewDir, float specularStrength) {
    float diffuse = max(dot(fragNormal, directionalLight.direction), 0.0) * directionalLight.bright;

    vec3 reflectDir = reflect(-directionalLight.direction, fragNormal);

    float specular = pow(max(dot(viewDir, reflectDir), 0.0), 32.0) * specularStrength;

    return (diffuse + specular) * directionalLight.color;
  } 

  vec3 calculatePointLight(PointLight light, vec3 viewDir, float specularStrength) {
    float light_constant = 1.0;
    float light_linear = 0.1;
    float light_quadratic = 0.0;

    vec3 pointLightDir = light.position - fragPosition;
    float distance = length(pointLightDir);
    pointLightDir = normalize(pointLightDir);
    float diffuse = max(dot(fragNormal, pointLightDir), 0.0) * light.bright;

    vec3 reflectDir = reflect(-pointLightDir, fragNormal);  
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
    float specular = specularStrength * spec;  

    float attenuation = 1.0 / (light_constant + light_linear * distance + light_quadratic * (distance * distance));

    return ((diffuse + specular) * light.color) * attenuation;
  }

  void main(void) {
    vec3 finalColor = vec3(0.0);
    
    if (useLight) {
      vec3 viewDir = normalize(cameraPosition - fragPosition);
      float specularStrength = 0.5;
      
      finalColor = ambientLight.color * ambientLight.bright;
      finalColor += calculateDirectionalLight(viewDir, specularStrength);

      for (int i = 0; i < POINTLIGHTS_COUNT; i++) {
        finalColor += calculatePointLight(pointLights[i], viewDir, specularStrength);
      }
    } else {
       finalColor = vec3(1.0, 1.0, 1.0);
    }

    if (useTexture) {
      vec4 texel = texture2D(sampler, fragTextureCoords);
      gl_FragColor = vec4(texel.rgb * finalColor, texel.a);
    } else {
      gl_FragColor = vec4(colorFactor.xyz * finalColor, colorFactor.w);
    }
  }
`;
