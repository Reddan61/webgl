export const vertexShader = `
  precision mediump float;

  attribute vec3 vertexPosition;
  attribute vec2 textureCoords;
  attribute vec3 normals;
  attribute vec4 weight;
  attribute vec4 boneIndexes;

  uniform mat3 normalMat;
  uniform mat4 transformation;
  uniform mat4 view;
  uniform mat4 projection;
  uniform mat4 bones[100];
  uniform bool useBones;

  varying vec2 fragTextureCoords;
  varying vec3 fragNormal;

  void main(void) {
    fragTextureCoords = textureCoords;
    fragNormal = normalize(normalMat * normals);

    if (useBones) {
      vec4 skinned = vec4(0.0);
  
      for (int i = 0; i < 4; i++) {
        skinned +=  bones[int(boneIndexes[i])] * vec4(vertexPosition, 1.0) * weight[i];
      }
      
      gl_Position = projection * view * transformation * skinned;
    } else {
      gl_Position = projection * view * transformation * vec4(vertexPosition, 1.0);
    }
  }
`;
