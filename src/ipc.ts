import { promisify } from "util";
import { ipcRenderer, ipcMain } from "electron";
export interface Startup
{
    workDir: string;
}
export const ChannelStartup = "startup";
export const ChannelProjectSettings = "proj-settings";
export const ChannelFileChanged = "file-chenged";

export async function waitIpcRenderer<T>(channel: string, timeout: number = 500): Promise<T>
{
    return new Promise<T>((resolve, reject) =>
    {
        ipcRenderer.once(channel, (event: Event, args: T) =>
        {
            resolve(args);
        });
        promisify(setTimeout)(timeout).then(() => reject(new Error("Ipc Timeout.")));
    });
}
export async function waitIpcMain<T>(channel: string, timeout: number = 500): Promise<T>
{
    return new Promise<T>((resolve, reject) =>
    {
        ipcMain.once(channel, (event: Event, args: T) =>
        {
            resolve(args);
        });
        promisify(setTimeout)(timeout).then(() => reject(new Error("Ipc Timeout.")));
    });
}