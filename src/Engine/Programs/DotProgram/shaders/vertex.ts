export const vertex = `
    attribute vec3 vertexPosition;

    uniform mat4 view;
    uniform mat4 projection;
    uniform float pointSize;

    void main(void) {
        gl_Position = projection * view * vec4(vertexPosition, 1.0);
        gl_PointSize = pointSize;
    }
`;
