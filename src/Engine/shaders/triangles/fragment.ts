export const fragmentShader = `#version 300 es
  precision mediump float;

  #define TEXEL_PER_POINTLIGHT 2.0

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

  in vec2 fragTextureCoords;
  in vec3 fragNormal;
  in vec3 fragPosition;

  out vec4 fragColor;

  uniform AmbientLight ambientLight;
  uniform DirectionalLight directionalLight;
  uniform vec4 colorFactor;
  uniform bool useTexture;
  uniform bool useLight;
  uniform vec3 cameraPosition;

  uniform sampler2D objectTexture;

  uniform sampler2D pointLightsDataTexture;
  uniform float pointLightsCount;

  PointLight getPointLight(float index) {
    PointLight light;

    float texIndex = index * TEXEL_PER_POINTLIGHT;
    float texWidth = pointLightsCount * TEXEL_PER_POINTLIGHT;

    float uColor = texIndex / texWidth;
    float uPosition = (texIndex + 1.0) / texWidth;
    
    vec4 colorData = texture(pointLightsDataTexture, vec2(uColor, 0));
    light.color = colorData.rgb;

    vec4 positionData = texture(pointLightsDataTexture, vec2(uPosition, 0));
    light.position = positionData.rgb;
    light.bright = positionData.a;

    return light;
}

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

      for (float i = 0.0; i < pointLightsCount; i++) {
        finalColor += calculatePointLight(getPointLight(i), viewDir, specularStrength);
      }
    } else {
       finalColor = vec3(1.0, 1.0, 1.0);
    }

    if (useTexture) {
      vec4 texel = texture(objectTexture, fragTextureCoords);
      fragColor = vec4(texel.rgb * finalColor, texel.a);
    } else {
      fragColor = vec4(colorFactor.xyz * finalColor, colorFactor.w);
    }
  }
`;
