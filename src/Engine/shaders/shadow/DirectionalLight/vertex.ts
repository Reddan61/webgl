export const shadowVertexShader = `#version 300 es
    precision mediump float;

    in vec3 vertexPosition;
    in vec4 weight;
    in vec4 boneIndexes;

    uniform mat4 lightSpaceMatrix; 
    uniform mat4 modelMatrix;

    uniform bool useBones;
    uniform sampler2D bonesDataTexture;
    uniform float numBones;

    out float depth;

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

    void main() {
        if (useBones) {
            vec4 skinned = (getBoneMatrix(boneIndexes[0]) * vec4(vertexPosition, 1.0) * weight[0] +
                            getBoneMatrix(boneIndexes[1]) * vec4(vertexPosition, 1.0) * weight[1] +
                            getBoneMatrix(boneIndexes[2]) * vec4(vertexPosition, 1.0) * weight[2] +
                            getBoneMatrix(boneIndexes[3]) * vec4(vertexPosition, 1.0) * weight[3]);
            
            gl_Position = lightSpaceMatrix * modelMatrix * skinned;
        } else {
            gl_Position = lightSpaceMatrix * modelMatrix * vec4(vertexPosition, 1.0);
        }

        float zBuf = gl_Position.z / gl_Position.w;
        depth = 0.5 + zBuf * 0.5; 
    }
`;
