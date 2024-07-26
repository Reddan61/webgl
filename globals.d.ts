declare module "*.scss"
declare module "*.png"
declare module "*.jpeg"
declare module "*.obj"
declare module "*.gltf"
declare module "*.json" {
    type fbxjson = any;
    const JSON: fbxjson;
    export default JSON;
}