import { ProcessNode } from "./process-node";

class ProcessManager
{
    private types: Map<string, any>
    private processes: Map<string, ProcessNode>
    public getProcess(name: string)
    {
        return this.processes.get(name);
    }
}
export default new ProcessManager();