import { mat4, vec3, vec4 } from "gl-matrix";
import { Camera } from "../Camera";
import { Ray } from "../Ray";

export class Rays {
    public static RayCast(
        screenX: number,
        screenY: number,
        canvas: HTMLCanvasElement,
        camera: Camera
    ) {
        const rect = canvas.getBoundingClientRect();
        const x = screenX - rect.left;
        const y = screenY - rect.top;

        const x_gl = (x / rect.width) * 2 - 1;
        const y_gl = (y / rect.height) * -2 + 1;
        const clip = vec4.fromValues(x_gl, y_gl, -1.0, 1.0);

        const view = camera.getView();
        const proj = camera.getProjection();

        const invProj = mat4.create();
        const invView = mat4.create();
        mat4.invert(invProj, proj);
        mat4.invert(invView, view);
        const eye = vec4.create();
        vec4.transformMat4(eye, clip, invProj);
        eye[2] = -1.0;
        eye[3] = 0.0;

        const world = vec4.create();
        vec4.transformMat4(world, eye, invView);

        const dir = vec3.fromValues(world[0], world[1], world[2]);
        vec3.normalize(dir, dir);

        return new Ray(camera.getTransform().getPosition(), dir);
    }
}
