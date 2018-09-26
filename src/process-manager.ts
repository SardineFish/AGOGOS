import { ProcessNode, KeyProcess } from "./process-node";
import { ProcessNodeData } from "./lib-renderer";
import { getType } from "./meta-data";

class ProcessManager
{
    private types: Map<string, any>
    private processes: Map<string, ProcessNode>
    public getProcess(name: string)
    {
        return this.processes.get(name);
    }
    public inherit(derived: string, base: string)
    {
        return (this.types.get(derived) instanceof this.types.get(base));
    }
    public getProcessData(process: ProcessNode): ProcessNodeData
    {
        let data: ProcessNodeData = new ProcessNodeData();
        data.name = process.name;
        for (const key in process) {
            if (process.hasOwnProperty(key)) {
                data.properties.set(key, { type: getType(process, key), value: process[key] });
            }
        }
        data.processOutput = { type: getType(process, KeyProcess), value: null };
        console.log(JSON.stringify(data));
        return data;
    }
}
export default new ProcessManager();