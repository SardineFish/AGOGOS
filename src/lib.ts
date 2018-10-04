import { ProcessNodeData } from "./lib-renderer";
import { getJsonIgnore } from "./meta-data";
import { ProjectFile } from "./project";
import linq from "linq";

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
export function diffFiles(oldFiles: ProjectFile[], newFiles: ProjectFile[]): DiffResult<ProjectFile>
{
    oldFiles = linq.from(oldFiles).orderBy(f => f.name).toArray();
    newFiles = linq.from(newFiles).orderBy(f => f.name).toArray();
    let diffResult = diff(oldFiles, newFiles);
    let remove = linq.from(diffResult).where(r => r.operation === "remove").firstOrDefault();
    let add = linq.from(diffResult).where(r => r.operation === "add").firstOrDefault();
    if (add)
    {
        if (remove)
            return { newItem: add.newItem, oldItem: remove.oldItem, operation: "change" };
        return add;
    }
    else
        return remove;
}
export interface DiffResult<T>
{
    oldItem?: T;
    newItem?: T;
    operation: "add" | "remove" | "change";
}
export function diff<T>(listOld: T[], listNew: T[]): DiffResult<T>[]
{
    let valueGraph: number[][] = [];
    let operate: ("add" | "remove" | "keep" | "change")[][] = [];
    let ans: DiffResult<T>[] = [];
    for (let i = 0; i <= listOld.length; i++)
    {
        valueGraph[i] = [];
        operate[i] = [];
        for (let j = 0; j <= listNew.length; j++)
        {
            valueGraph[i][j] = Number.MAX_SAFE_INTEGER;
        }
    }
    valueGraph[0][0] = 0;
    for (let k = 0; k < listOld.length + listNew.length; k++)
    {
        for (let i = 0, j = k; i <= k && i < listOld.length && j >= 0; i++ , j--)
        {
            if (listOld[i] === listNew[j])
            {
                valueGraph[i + 1][j + 1] = valueGraph[i][j];
                operate[i+1][j+1] = "keep";
            }
            if (valueGraph[i + 1][j] > valueGraph[i][j] + 1)
            {
                valueGraph[i + 1][j] = valueGraph[i][j] + 1;
                operate[i + 1][j] = "remove";
            }
            if (valueGraph[i][j + 1] >= valueGraph[i][j] + 1)
            {
                valueGraph[i][j + 1] = valueGraph[i][j] + 1;
                operate[i][j + 1] = "add";
            }
        }
    }

    for (let i = listOld.length, j = listNew.length; i > 0 || j > 0;)
    {
        switch (operate[i][j])
        {
            case "keep":
                i-- , j--;
                break;
            case "remove":
                ans.push({ oldItem: listOld[--i], operation: "remove" });
                break;
            case "add":
                ans.push({ newItem: listNew[--j], operation: "add" });
        }
    }
    return ans.reverse();
}