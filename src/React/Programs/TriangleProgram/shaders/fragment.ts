export const fragment = `#version 300 es
  precision mediump float;

  #define TEXEL_PER_POINTLIGHT 4.0
  #define SHADOW_INTENSIVE 0.5
  #define SHADOW_SOFT_SAMPLERS 2

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
    vec2 atlasOffset;
    vec2 atlasScale;
    vec3 color;
    vec3 position;
    float bright;
    float farPlane;
  };

  in vec2 fragTextureCoords;
  in vec3 fragNormal;
  in vec3 fragPosition;
  in vec4 fragPositionLightSpace;
  in mat3 tbn;

  out vec4 fragColor;

  uniform AmbientLight ambientLight;
  uniform DirectionalLight directionalLight;
  uniform vec4 colorFactor;
  uniform bool useTexture;
  uniform bool useLight;
  uniform bool useNormalTexture;
  uniform vec3 cameraPosition;

  uniform float alphaCutoff;

  uniform sampler2D objectTexture;
  uniform sampler2D normalTexture;

  uniform sampler2D pointLightsDataTexture;
  uniform float pointLightsCount;

  uniform sampler2D shadowMap;
  uniform sampler2D shadowAtlas;

  float calculateDirectionalLightShadow(vec4 fragPosLightSpace, vec3 normal) {
    vec3 projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;
    projCoords = projCoords * 0.5 + 0.5;

    float currentDepth = projCoords.z;
    float pcfDepth = texture(shadowMap, projCoords.xy).r;

    float bias = max(0.0025f * (1.0f - dot(normal, directionalLight.direction)), 0.001);
    float shadow = 0.0;

    if(currentDepth > pcfDepth + bias) {
      shadow = SHADOW_INTENSIVE;
    }

    // vec2 texelSize = 1.0 / vec2(textureSize(shadowMap, 0));  

    // for (int x = -SHADOW_SOFT_SAMPLERS; x <= SHADOW_SOFT_SAMPLERS; ++x) {
    //     for (int y = -SHADOW_SOFT_SAMPLERS; y <= SHADOW_SOFT_SAMPLERS; ++y) {
    //         float pcfDepth = texture(shadowMap, projCoords.xy + vec2(x, y) * texelSize).r;
    //         shadow += currentDepth > pcfDepth + bias ? SHADOW_INTENSIVE : 0.0;
    //     }
    // }

    // shadow /= float((SHADOW_SOFT_SAMPLERS * 2 + 1) * (SHADOW_SOFT_SAMPLERS * 2 + 1));

    return shadow;
  }

  int getFaceIndex(vec3 fragToLight) {
    vec3 absDir = abs(fragToLight) + 0.0001;
    
    if (absDir.x >= absDir.y && absDir.x >= absDir.z) {
        return (fragToLight.x >= 0.0) ? 0 : 1; // +X или -X
    } else if (absDir.y >= absDir.x && absDir.y >= absDir.z) {
        return (fragToLight.y >= 0.0) ? 2 : 3; // +Y или -Y
    } else {
        return (fragToLight.z >= 0.0) ? 4 : 5; // +Z или -Z
    }
  }

  float calculatePointShadow(PointLight light, vec3 normal) {
    vec3 lightVec = normalize(light.position - fragPosition);

    vec3 fragToLight =  fragPosition - light.position;
    float currentDepth = length(fragToLight);
    fragToLight = normalize(fragToLight);

    int faceIndex = getFaceIndex(fragToLight);

    vec2 localUV;
    if (faceIndex == 0) { // +X
      localUV = vec2(-fragToLight.z / abs(fragToLight.x), -fragToLight.y / abs(fragToLight.x));
    } else if (faceIndex == 1) { // -X
      localUV = vec2(fragToLight.z / abs(fragToLight.x), -fragToLight.y / abs(fragToLight.x));
    } else if (faceIndex == 2) { // +Y
      localUV = vec2(fragToLight.x / abs(fragToLight.y), fragToLight.z / abs(fragToLight.y));
    } else if (faceIndex == 3) { // -Y
      localUV = vec2(fragToLight.x / abs(fragToLight.y), -fragToLight.z / abs(fragToLight.y));
    } else if (faceIndex == 4) { // +Z
      localUV = vec2(fragToLight.x / abs(fragToLight.z), -fragToLight.y / abs(fragToLight.z));
    } else { // -Z
      localUV = vec2(-fragToLight.x / abs(fragToLight.z), -fragToLight.y / abs(fragToLight.z));
    }

    localUV = (localUV + 1.0) * 0.5;
    // удаляет разрывы на рёбрах
    localUV = mix(localUV, vec2(0.5), 0.01);

    vec2 colOffset = vec2(float(faceIndex) * light.atlasScale.x, 0.0);

    vec2 atlasUV = 
      (light.atlasOffset + colOffset) + (localUV * light.atlasScale);

    float closestDepth = texture(shadowAtlas, atlasUV).r;
    closestDepth *= light.farPlane;

    float bias = max(0.5 * (1.0 - dot(normal, lightVec)), 0.5);

    float shadow = 0.0;

    if(currentDepth > closestDepth + bias) {
      shadow = SHADOW_INTENSIVE;
    }
    
    return 1.0 - shadow;
  }

  PointLight getPointLight(float index) {
    PointLight light;

    float texIndex = index * TEXEL_PER_POINTLIGHT;
    float texWidth = pointLightsCount * TEXEL_PER_POINTLIGHT;

    float uColor = texIndex / texWidth;
    float uPosition = (texIndex + 1.0) / texWidth;
    float uFarPlane = (texIndex + 2.0) / texWidth;
    float uAtlas = (texIndex + 3.0) / texWidth;
    
    vec4 colorData = texture(pointLightsDataTexture, vec2(uColor, 0));
    light.color = colorData.rgb;

    vec4 positionData = texture(pointLightsDataTexture, vec2(uPosition, 0));
    light.position = positionData.rgb;
    light.bright = positionData.a;

    vec4 farPlaneData = texture(pointLightsDataTexture, vec2(uFarPlane, 0));
    light.farPlane = farPlaneData.w;

    vec4 atlasData = texture(pointLightsDataTexture, vec2(uAtlas, 0));
    light.atlasOffset = atlasData.xy;
    light.atlasScale = atlasData.zw;

    return light;
}

  vec3 calculateDirectionalLight(vec3 viewDir, float specularStrength, vec3 normal) {
    float diffuse = max(dot(normal, directionalLight.direction), 0.0) * directionalLight.bright;

    vec3 reflectDir = reflect(-directionalLight.direction, normal);

    float specular = pow(max(dot(viewDir, reflectDir), 0.0), 32.0) * specularStrength;

    float shadow = calculateDirectionalLightShadow(fragPositionLightSpace, normal);

    return (diffuse + specular) * directionalLight.color  * (1.0 - shadow);
  } 

  vec3 calculatePointLight(PointLight light, vec3 viewDir, float specularStrength, vec3 normal) {
    float light_constant = 1.0;
    float light_linear = 0.1;
    float light_quadratic = 0.0;

    float shadow = calculatePointShadow(light, normal);

    vec3 pointLightDir = light.position - fragPosition;
    float distance = length(pointLightDir);
    pointLightDir = normalize(pointLightDir);
    float diffuse = max(dot(normal, pointLightDir), 0.0) * light.bright;

    vec3 reflectDir = reflect(-pointLightDir, normal);  
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
    float specular = specularStrength * spec;  

    float attenuation = 1.0 / (light_constant + light_linear * distance + light_quadratic * (distance * distance));

    return ((diffuse + specular) * light.color) * shadow * attenuation;
  }

  void main(void) {
    vec3 finalColor = vec3(0.0);
    vec3 normal = fragNormal;

    if (useNormalTexture) {
      vec3 normalFromTexture = texture(normalTexture, fragTextureCoords).rgb;
      normalFromTexture = normalize(normalFromTexture * 2.0 - 1.0);

      normal = normalize(tbn * normalFromTexture);
    }
    
    if (useLight) {
      vec3 viewDir = normalize(cameraPosition - fragPosition);
      float specularStrength = 0.5;
      
      finalColor = ambientLight.color * ambientLight.bright;
      finalColor += calculateDirectionalLight(viewDir, specularStrength, normal);

      for (float i = 0.0; i < pointLightsCount; i++) {
        PointLight pointLight = getPointLight(i);
        vec3 pointLightColor = calculatePointLight(pointLight, viewDir, specularStrength, normal);
        
        finalColor += pointLightColor;
      }
    } else {
       finalColor = vec3(1.0, 1.0, 1.0);
    }

    if (useTexture) {
      vec4 texel = texture(objectTexture, fragTextureCoords);

      texel.a *= step(alphaCutoff, texel.a);

      fragColor = vec4(texel.rgb * finalColor, texel.a);
    } else {
      fragColor = vec4(colorFactor.xyz * finalColor, colorFactor.w);
    }
  }
`;
