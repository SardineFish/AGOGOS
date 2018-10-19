import { EndPoint, StatusOutput, ConsoleMessage } from "./lib";
import { AGOGOSProject, ProjectFile } from "./project";
import { ipcRenderer, remote } from "electron";
import { ChannelProjectSettings } from "./ipc";
import { NodeData } from "../../react-tree-viewer/dist";
import * as React from "react";
import * as ReactDOM from "react-dom";
import SplitPane from "react-split-pane";
import { TreeViewer, NodeMouseEvent, TreeNodeDragEvent } from "../../react-tree-viewer";
import ViewPort from "../../react-free-viewport"
import { Event, app, MenuItem } from "electron";
import { ChannelStartup, Startup, ChannelFileChanged, FileChangeArgs, ChannelConsole, ChannelStatus, GeneralIPC, ChannelIpcCall, IPCRenderer } from "./ipc";
import fs from "fs";
import path from "path";
import { Pane, ProcessSpace, ProgressBar } from "./components";
import linq from "linq";
import { ProjectFileData } from "./lib-renderer";
import { switchCase } from "./lib";
import { ProjFile } from "./project";

const { Menu } = remote;
const $ = (selector: string): HTMLElement => document.querySelector(selector);

export function GetProjectSettings(): AGOGOSProject
{
    return ipcRenderer.sendSync(ChannelProjectSettings) as AGOGOSProject;
}
export function PopupProjectMenu(context: string)
{
    Menu.buildFromTemplate([
        {
            label: "New File",
        },
        {
            label: "New Folder",
        },
        {
            label: "Rename"
        }
    ]).popup({});
}
export function diffProjectFilesRenderer(files: ProjectFile, fileNode: NodeData): NodeData
{
    return null;
    for (let i = 0; i < files.children.length; i++)
    {
        for (let j = 0; j < fileNode.children.length; j++)
        {

        }
    }
}
export interface ProjectFileData extends NodeData, ProjectFile
{
    children?: ProjectFileData[];
}

export class AGOGOSRenderer
{
    public static instance: AGOGOSRenderer;

    public ipc: GeneralIPC;
    public app: App;

    public get console() { return this.app.console };
    constructor()
    {
        AGOGOSRenderer.instance = this;
    }
    init():AGOGOSRenderer
    {
        this.ipc = new GeneralIPC({
            receive: (msg) => ipcRenderer.on(ChannelIpcCall, (event: Event, args: any) => msg(args)),
            send: (args) => ipcRenderer.send(ChannelIpcCall, args)
        });
        return this;
    }
    render(): AGOGOSRenderer
    {
        const $ = (selector: string) => document.querySelector(selector);
        const element = (
            <App callback={(app) => this.app = app}></App>
        );
        ReactDOM.render(element, $("#root"));
        return this;
    }
}

interface AppArgs
{
    callback: (app: App) => void;
}
interface AppState
{
    workDir: string;
    dirData: ProjectFileData;
    statusText: StatusOutput;
    consoleHistory: ConsoleMessage[];
    projectFile: ProjectFile;
    showConsole: boolean;
}
function toProjectFileData(root: ProjectFile): ProjectFileData
{
    let { children, ...other } = root;
    return {
        extend: false,
        data: root.path,
        icon: (<span className={switchCase(root.type, {
            "file": `node-icon file ${path.extname(root.path).replace(".", "")}`, "folder": "node-icon directory"
        })
        }> </span>),
        children: children ? children.map(child => toProjectFileData(child)) : null,
        ...other
    };
}
function getDirData(dirPath: string): NodeData[]
{
    return linq.from(fs.readdirSync(dirPath).filter(name => !name.startsWith(".")).map((name) =>
    {
        let p = path.resolve(dirPath, name);
        let isDir = fs.statSync(p).isDirectory();
        return {
            extend: false,
            name: name,
            children: isDir ? [] : undefined,
            data: p,
            icon: (<span className={isDir ? "node-icon directory" : `node-icon file ${path.extname(p).replace(".", "")}`
            } > </span>)
        } as NodeData
    })).orderBy(node => fs.statSync(node.data).isDirectory() ? 0 : 1).toArray();
}

class App extends React.Component<AppArgs, AppState>
{
    constructor(props: AppArgs)
    {
        super(props);
        this.consoleHistory = [{ type: "warn", message: "Development environment." }];
        this.state = {
            workDir: null,
            dirData: null,
            statusText: { message: "GUI Ready", loading: true, progress: 0.4 },
            consoleHistory: this.consoleHistory,
            projectFile: null,
            showConsole: false,
        };
    }
    consoleHistory: ConsoleMessage[] = [];
    console = {
        log: (message: any, type: "log" | "warn" | "error" = "log") =>
        {
            console.log(message);
            this.consoleHistory.push({ message: `[GUI] ${message.toString()}`, type });
            this.setState({
                consoleHistory: this.consoleHistory
            });
        }
    }
    get latestConsole() { return this.state.consoleHistory[this.state.consoleHistory.length - 1]; }

    onFolderExtend(nodeData: NodeData)
    {
        return nodeData;
    }
    onProjectContextMenu(e: NodeMouseEvent)
    {
        PopupProjectMenu(e.parent.data as string);
    }
    onProjectReady(projectFile: ProjectFile)
    {
        let projectFileData = toProjectFileData(this.state.projectFile);
        projectFileData.icon = (<span className="node-icon directory"></span>);
        projectFileData.name = projectFileData.path;
        projectFileData.extend = true;
        this.setState({
            dirData: projectFileData
        });
        ipcRenderer.on(ChannelFileChanged, (event: Event, args: FileChangeArgs) =>
        {
            let relativeOld = args.oldFileName ? path.relative(this.state.workDir, args.oldFileName) : null;
            let relativeNew = args.newFileName ? path.relative(this.state.workDir, args.newFileName) : null;
            let dir: ProjectFileData;
            if (args.operation === "add")
            {
                dir = ProjFile.getDirectory(projectFileData, relativeNew) as ProjectFileData;
                let file = ProjFile.getFile(args.newFile, relativeNew);
                dir.children.push(toProjectFileData(file));
            }
            else if (args.operation === "rename")
            {
                dir = ProjFile.getDirectory(projectFileData, relativeOld) as ProjectFileData;
                let file = ProjFile.getFile(projectFileData, relativeOld);
                file.path = args.newFileName;
                file.name = path.basename(args.newFileName);
            }
            else if (args.operation === "delete")
            {
                dir = ProjFile.getDirectory(projectFileData, relativeOld) as ProjectFileData;
                dir.children = dir.children.filter(child => child.path !== args.oldFileName);
            }
            else
                return;
            dir.children = ProjFile.orderFiles(dir.children);
            this.setState({ dirData: projectFileData });
        });
        ipcRenderer.on(ChannelConsole, (event: Event, args: ConsoleMessage) =>
        {
            this.state.consoleHistory.push(args);
            this.setState({ consoleHistory: this.state.consoleHistory });
        });
        ipcRenderer.on(ChannelStatus, (event: Event, args: StatusOutput) =>
        {
            this.setState({
                statusText: args
            });
        })
    }
    componentDidMount()
    {
        ipcRenderer.once(ChannelStartup, (event: Event, args: Startup) =>
        {
            this.setState({
                workDir: args.workDir,
                projectFile: args.projectFile
            });
            this.onProjectReady(args.projectFile);
        });
        ipcRenderer.send("ping", "ping");


    }
    onFileDragStart(e: TreeNodeDragEvent)
    {
        e.dataTransfer.setData("text/plain", e.nodeData.data);
        e.dataTransfer.dropEffect = "move";

        //this.console.log(e.nodeData.data);
    }
    render()
    {
        let data = this.state.dirData;
        return (
            <div id="content">
                <main id="main">
                    <SplitPane split="vertical" minSize={50} defaultSize={300} allowResize={true}>
                        <div id="left-side">
                            <SplitPane split="horizontal" defaultSize={400} allowResize={true}>
                                <Pane id="work-dir" header="Project">
                                    <TreeViewer
                                        nodeData={this.state.dirData}
                                        tabSize={10}
                                        root={true}
                                        dragable={true}
                                        onDragStart={(e) => this.onFileDragStart(e)}
                                        onContextMenu={e => this.onProjectContextMenu(e)}
                                        onExtend={(nodeData) => this.onFolderExtend(nodeData)}
                                    />
                                </Pane>
                                <Pane id="res-lib" header="Library">

                                </Pane>
                            </SplitPane>
                        </div>
                        <div id="mid" className="pane">
                            <ProcessSpace
                                id="process-space"
                            ></ProcessSpace>
                        </div>
                    </SplitPane>
                </main>
                <footer id="status-bar">
                    <span id="agogos-console" onClick={() => this.setState({ showConsole: !this.state.showConsole })}>
                        {
                            this.state.consoleHistory.length > 0 ?
                                <span id="console-text"
                                    className={`icon-before msg-${this.latestConsole.type}`}
                                >
                                    {this.latestConsole.message}
                                </span>
                                : null
                        }
                        <Pane id="console-history" header="Console" style={{ visibility: this.state.showConsole ? "visible" : "collapse" }}>
                            {
                                this.state.consoleHistory.map((con, idx) => (<p className={`console-msg-item icon-before msg-${con.type}`} key={idx}>{con.message}</p>))
                            }
                        </Pane>
                    </span>
                    <span id="agogos-status">
                        {
                            this.state.statusText.progress ?
                                <ProgressBar progress={this.state.statusText.progress}></ProgressBar>
                                : null
                        }
                        <span id="status-text" className={this.state.statusText.loading ? "loading" : ""}>{this.state.statusText.message}</span>
                    </span>
                </footer>
            </div>
        );
    }
}
