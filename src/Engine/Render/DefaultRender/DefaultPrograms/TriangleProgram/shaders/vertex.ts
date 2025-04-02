export const vertex = `#version 300 es
  precision mediump float;

  in vec3 vertexPosition;
  in vec2 textureCoords;
  in vec4 weight;
  in vec4 boneIndexes;

  uniform mat4 globalTransformation;
  uniform mat4 view;
  uniform mat4 projection;
  uniform bool useBones;

  uniform sampler2D bonesDataTexture;
  uniform float numBones;

  out vec2 fragTextureCoords;

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

    if (useBones) {
      vec4 skinned = (getBoneMatrix(boneIndexes[0]) * vec4(vertexPosition, 1.0) * weight[0] +
                 getBoneMatrix(boneIndexes[1]) * vec4(vertexPosition, 1.0) * weight[1] +
                 getBoneMatrix(boneIndexes[2]) * vec4(vertexPosition, 1.0) * weight[2] +
                 getBoneMatrix(boneIndexes[3]) * vec4(vertexPosition, 1.0) * weight[3]);
          

      gl_Position = projection * view * globalTransformation * skinned;
    } else {
      gl_Position = projection * view * globalTransformation * vec4(vertexPosition, 1.0);
    }
  }
`;
