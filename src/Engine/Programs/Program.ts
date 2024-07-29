export class Program {
    constructor(webgl: WebGLRenderingContext) {
        this.webgl = webgl;
    }

    protected webgl: WebGLRenderingContext | null = null;
    protected program: WebGLProgram | null = null;

    protected useProgram() {
        this.webgl.useProgram(this.program);
    }

    protected Init(vertexShader: string, fragmentShader: string) {
        this.program = this.webgl.createProgram();
        const vertex = this.shaderInit(vertexShader, this.webgl.VERTEX_SHADER);
        const fragment = this.shaderInit(
            fragmentShader,
            this.webgl.FRAGMENT_SHADER
        );

        this.webgl.attachShader(this.program, vertex);
        this.webgl.attachShader(this.program, fragment);
        this.webgl.linkProgram(this.program);

        if (
            !this.webgl.getProgramParameter(
                this.program,
                this.webgl.LINK_STATUS
            )
        ) {
            throw new Error("Unable to initialize the shader program");
        }
    }

    private shaderInit(
        source: string,
        mode: WebGLRenderingContextBase["FRAGMENT_SHADER" | "VERTEX_SHADER"]
    ): WebGLShader {
        const shader = this.webgl.createShader(mode);

        this.webgl.shaderSource(shader, source);

        this.webgl.compileShader(shader);

        if (!this.webgl.getShaderParameter(shader, this.webgl.COMPILE_STATUS)) {
            throw new Error(
                "An error occurred compiling the shaders: " +
                    this.webgl.getShaderInfoLog(shader)
            );
        }

        return shader;
    }
}
