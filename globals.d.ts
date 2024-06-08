declare module "*.scss"
declare module "*.png"
declare module "*.json" {
    type fbxjson = any;
    const JSON: fbxjson;
    export default JSON;
}