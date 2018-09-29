import { ProcessNodeData } from "./lib-renderer";
import { getJsonIgnore } from "./meta-data";


export class Vector2
{
    x: number;
    y: number;
    constructor(x: number, y: number)
    {
        this.x = x;
        this.y = y;
    }
    static plus(u: Vector2, v: Vector2)
    {
        return vec2(u.x + v.x, u.y + v.y);
    }
    static minus(u: Vector2, v: Vector2)
    {
        return vec2(u.x - v.x, u.y - v.y);
    }
}
export const vec2 = (x: number, y: number) => new Vector2(x, y);

export interface EndPoint
{
    process: ProcessNodeData;
    property: string;
    port: string;
}
export interface Connection{
    source: EndPoint;
    target: EndPoint;
}
function ObjectCast(obj: any): any
{
    let out: any = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key) && !getJsonIgnore(obj,key)) {
            const element = obj[key];
            if (element instanceof Object)
                out[key] = ObjectCast(element);
            else
                out[key] = element;
        }
    }
    return out;
}
export function JSONStringrify(obj: any): string
{
    return JSON.stringify(ObjectCast(obj));
}