export class ElementBuffer {
    private buffer: WebGLBuffer;
    private webgl: WebGLRenderingContext;

    constructor(webgl: WebGLRenderingContext) {
        this.webgl = webgl;
        this.createBuffer();
    }

    public setBufferData(data: AllowSharedBufferSource | null) {
        this.webgl.bindBuffer(this.webgl.ELEMENT_ARRAY_BUFFER, this.buffer);
        this.webgl.bufferData(
            this.webgl.ELEMENT_ARRAY_BUFFER,
            data,
            this.webgl.DYNAMIC_DRAW
        );
    }

    private createBuffer() {
        this.buffer = this.webgl.createBuffer() as WebGLBuffer;
    }
}
