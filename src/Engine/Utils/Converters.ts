interface OBJFace {
    verticeIndex: number,
    textureIndex: number,
    normalIndex: number
}

export const parseObj = (text: string) => {
    const lines = text.split('\n');
    const vertices: number[][] = []; 
    const indices: OBJFace[][] = [] ;
    const textureCoords: number[][] = [] ;
    const normals: number[][] = [];

    for (let line of lines) {
        line = line.trim();
        if (line.startsWith('#') || line.length === 0) {
            continue; // игнорируем комментарии и пустые строки
        }

        const parts = line.split(/\s+/);
        const keyword = parts[0];

        switch (keyword) {
            case 'v':
                vertices.push(parts.slice(1).map(parseFloat));
                break;
            case 'vn':
                normals.push(parts.slice(1).map(parseFloat));
                break;
            case 'vt':
                const temp = parts.slice(1).map(parseFloat);
                textureCoords.push([temp[0], temp[1]]);
                break;
            case 'f':
                const tempIndices: OBJFace[] = [];

                parts.slice(1).forEach(part => {
                    const [vIndex, vtIndex, vnIndex] = part.split('/').map(idx => idx ? parseInt(idx) - 1 : undefined);

                    tempIndices.push({
                        verticeIndex: vIndex,
                        textureIndex: vtIndex,
                        normalIndex: vnIndex
                    });
                });

                if (tempIndices.length === 4) {
                    const [v1, v2, v3, v4] = tempIndices;
                    indices.push([v1, v2, v3]);
                    indices.push([v3, v4, v1]);
                } else {
                    indices.push(tempIndices);
                }

                break;
        }
    }


    const finalVertices: number[] = []; 
    const finalIndices: number[] = [] ;
    const finalTextureCoords: number[] = [] ;
    const finalNormals: number[] = [];

    indices.forEach((face) => {
        face.forEach(({ normalIndex, textureIndex, verticeIndex }) => {
            finalIndices.push(finalVertices.length / 3);
            finalVertices.push(...vertices[verticeIndex]);
            finalTextureCoords.push(...textureCoords[textureIndex]);
            finalNormals.push(...normals[normalIndex]);
        });
    });

    return {
        vertices: finalVertices,
        indices: finalIndices,
        textureCoords: finalTextureCoords,
        normals: finalNormals
    }
}