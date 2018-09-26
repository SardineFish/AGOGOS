import { ProcessNodeData } from "./lib-renderer";


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