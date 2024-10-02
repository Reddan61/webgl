type Type = WebGL2RenderingContext["FLOAT"];

export class ArrayBuffer {
    private type: Type;
    private size: number;
    private location: number;
    private buffer: WebGLBuffer;
    private name: string;
    private webgl: WebGL2RenderingContext;
    private program: WebGLProgram;

    constructor(
        webgl: WebGL2RenderingContext,
        program: WebGLProgram,
        name: string,
        size: number,
        type: Type
    ) {
        this.name = name;
        this.webgl = webgl;
        this.program = program;
        this.type = type;
        this.size = size;
        this.createBuffer();
        this.getLocation();
    }

    public setAttributes() {
        this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, this.buffer);
        this.webgl.vertexAttribPointer(
            this.location,
            this.size,
            this.type,
            false,
            0,
            0
        );
        this.webgl.enableVertexAttribArray(this.location);
    }

    public setBufferData(data: AllowSharedBufferSource | null) {
        this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, this.buffer);
        this.webgl.bufferData(
            this.webgl.ARRAY_BUFFER,
            data,
            this.webgl.DYNAMIC_DRAW
        );
    }

    private createBuffer() {
        this.buffer = this.webgl.createBuffer() as WebGLBuffer;
    }

    private getLocation() {
        this.location = this.webgl.getAttribLocation(this.program, this.name);
    }
}
