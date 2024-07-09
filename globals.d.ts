declare module "*.scss"
declare module "*.png"
declare module "*.obj"
declare module "*.json" {
    type fbxjson = any;
    const JSON: fbxjson;
    export default JSON;
}