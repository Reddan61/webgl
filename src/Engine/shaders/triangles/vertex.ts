export const vertexShader = `#version 300 es
  precision mediump float;

  in vec3 vertexPosition;
  in vec2 textureCoords;
  in vec3 normals;
  in vec4 weight;
  in vec4 boneIndexes;

  uniform mat3 normalMat;
  uniform mat4 transformation;
  uniform mat4 view;
  uniform mat4 projection;
  uniform mat4 bones[100];
  uniform bool useBones;

  out vec2 fragTextureCoords;
  out vec3 fragNormal;
  out vec3 fragPosition;

  void main(void) {
    fragTextureCoords = textureCoords;
    fragNormal = normalize(normalMat * normals);

    if (useBones) {
      vec4 skinned = vec4(0.0);
  
      for (int i = 0; i < 4; i++) {
        skinned +=  bones[int(boneIndexes[i])] * vec4(vertexPosition, 1.0) * weight[i];
      }
      
      gl_Position = projection * view * transformation * skinned;
      fragPosition = (transformation * skinned).xyz;
    } else {
      gl_Position = projection * view * transformation * vec4(vertexPosition, 1.0);
      fragPosition = (transformation * vec4(vertexPosition, 1.0)).xyz;
    }
  }
`;
