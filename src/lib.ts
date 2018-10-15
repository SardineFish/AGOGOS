import { ProcessNodeData } from "./lib-renderer";
import { getJsonIgnore } from "./meta-data";
import { ProjectFile } from "./project";
import Path from "path";
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
    let diffResult = diff(oldFiles, newFiles, (a, b) => a.name === b.name);
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
export function diff<T>(listOld: T[], listNew: T[], cmpFunc?:(a:T,b:T)=>boolean): DiffResult<T>[]
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
        let j = Math.min(k, listNew.length);
        let i = k - j;
        for (; i <= k && i <= listOld.length && j >= 0; i++ , j--)
        {
            // Add only
            if (i >= listOld.length)
            {
                if (valueGraph[i][j + 1] >= valueGraph[i][j] + 1)
                {
                    valueGraph[i][j + 1] = valueGraph[i][j] + 1;
                    operate[i][j + 1] = "add";
                }
                continue;
            }
            // Delete only
            if (j >= listNew.length)
            {
                if (valueGraph[i + 1][j] > valueGraph[i][j] + 1)
                {
                    valueGraph[i + 1][j] = valueGraph[i][j] + 1;
                    operate[i + 1][j] = "remove";
                }
                continue;
            }
            

            if (cmpFunc ? cmpFunc(listOld[i], listNew[j]) : listOld[i] === listNew[j])
            {
                valueGraph[i + 1][j + 1] = valueGraph[i][j];
                operate[i + 1][j + 1] = "keep";
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
export function switchCase<T>(value: string, cases: { [key: string]: T }):T
{
    for (const key in cases)
    {
        if (key === value)
            return cases[key];
    }
}

export async function foreachAsync<T>(list: T[], callback: (item: T, idx: number) => Promise<any>): Promise<T[]>
{
    for (let i = 0; i < list.length; i++)
    {
        await callback(list[i], i);
    }
    return list;
}
export async function mapAsync<TIn, TOut>(list: TIn[], func: (item: TIn, idx: number) => Promise<TOut>): Promise<TOut[]>
{
    let result: TOut[] = [];
    for (let i = 0; i < list.length; i++)
    {
        result[i] = await func(list[i], i);
    }
    return result;
}
export interface ConsoleMessage
{
    type: "log" | "warn" | "error";
    message: string;
}
export interface StatusOutput
{
    loading?: boolean,
    message: string;
    progress?: number;
}