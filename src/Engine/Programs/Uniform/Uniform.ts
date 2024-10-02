export class Uniform {
    protected name: string;
    protected webgl: WebGLRenderingContext;
    protected program: WebGLProgram;
    protected location: WebGLUniformLocation;

    constructor(
        webgl: WebGLRenderingContext,
        program: WebGLProgram,
        name: string
    ) {
        this.name = name;
        this.webgl = webgl;
        this.program = program;

        this.getLocation();
    }

    protected getLocation() {
        this.location = this.webgl.getUniformLocation(
            this.program,
            this.name
        ) as WebGLUniformLocation;
    }

    public setData(data: unknown) {}
}
