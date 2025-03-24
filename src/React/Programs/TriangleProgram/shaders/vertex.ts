export const vertex = `#version 300 es
  precision mediump float;

  in vec3 vertexPosition;
  in vec4 tangent;
  in vec2 textureCoords;
  in vec3 normals;
  in vec4 weight;
  in vec4 boneIndexes;

  uniform mat3 normalMat;
  uniform mat4 transformation;
  uniform mat4 view;
  uniform mat4 projection;
  uniform mat4 lightSpaceMatrix;
  uniform bool useBones;
  uniform bool useNormalTexture;

  uniform sampler2D bonesDataTexture;
  uniform float numBones;

  out vec2 fragTextureCoords;
  out vec3 fragNormal;
  out vec3 fragPosition;
  out vec4 fragPositionLightSpace;
  out mat3 tbn;

  #define ROW0_U ((0.5 + 0.0) / 4.)
  #define ROW1_U ((0.5 + 1.0) / 4.)
  #define ROW2_U ((0.5 + 2.0) / 4.)
  #define ROW3_U ((0.5 + 3.0) / 4.)
 
  mat4 getBoneMatrix(float boneNdx) {
    float v = (boneNdx + 0.5) / numBones;
    return mat4(
      texture(bonesDataTexture, vec2(ROW0_U, v)),
      texture(bonesDataTexture, vec2(ROW1_U, v)),
      texture(bonesDataTexture, vec2(ROW2_U, v)),
      texture(bonesDataTexture, vec2(ROW3_U, v))
    );
  }

  void main(void) {
    fragTextureCoords = textureCoords;

    vec3 skinnedNormal = normals;
    vec3 skinnedTangent = tangent.xyz;

    if (useBones) {
      vec4 skinned = (getBoneMatrix(boneIndexes[0]) * vec4(vertexPosition, 1.0) * weight[0] +
                 getBoneMatrix(boneIndexes[1]) * vec4(vertexPosition, 1.0) * weight[1] +
                 getBoneMatrix(boneIndexes[2]) * vec4(vertexPosition, 1.0) * weight[2] +
                 getBoneMatrix(boneIndexes[3]) * vec4(vertexPosition, 1.0) * weight[3]);
          
      skinnedNormal = normalize(
        (getBoneMatrix(boneIndexes[0]) * vec4(normals, 0.0) * weight[0] +
         getBoneMatrix(boneIndexes[1]) * vec4(normals, 0.0) * weight[1] +
         getBoneMatrix(boneIndexes[2]) * vec4(normals, 0.0) * weight[2] +
         getBoneMatrix(boneIndexes[3]) * vec4(normals, 0.0) * weight[3]).xyz
      );

      if (useNormalTexture) {
        skinnedTangent = normalize(
          (getBoneMatrix(boneIndexes[0]) * vec4(skinnedTangent, 0.0) * weight[0] +
           getBoneMatrix(boneIndexes[1]) * vec4(skinnedTangent, 0.0) * weight[1] +
           getBoneMatrix(boneIndexes[2]) * vec4(skinnedTangent, 0.0) * weight[2] +
           getBoneMatrix(boneIndexes[3]) * vec4(skinnedTangent, 0.0) * weight[3]).xyz
        );
      }

      gl_Position = projection * view * transformation * skinned;
      fragPosition = (transformation * skinned).xyz;
    } else {
      gl_Position = projection * view * transformation * vec4(vertexPosition, 1.0);
      fragPosition = (transformation * vec4(vertexPosition, 1.0)).xyz;
    }

    fragPositionLightSpace = lightSpaceMatrix * vec4(fragPosition, 1.0);
    fragNormal = normalize(normalMat * skinnedNormal);

    if (useNormalTexture) {
      vec3 bitangent = normalize(cross(fragNormal, skinnedTangent));
      tbn = mat3(skinnedTangent, bitangent, fragNormal);
    }
  }
`;
