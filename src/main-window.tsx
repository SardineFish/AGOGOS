import * as React from "react";
import * as ReactDOM from "react-dom";
import SplitPane from "react-split-pane";
import { TreeViewer, NodeData, NodeMouseEvent } from "../../react-tree-viewer";
import ViewPort from "../../react-free-viewport"
import { ipcRenderer, Event, app, Menu, MenuItem } from "electron";
import { ChannelStartup, Startup, ChannelFileChanged, FileChangeArgs } from "./ipc";
import fs from "fs";
import path from "path";
import { Pane, ProcessSpace} from "./components";
import linq from "linq";
import { GetProjectSettings, PopupProjectMenu, ProjectFileData } from "./lib-renderer";
import { switchCase } from "./lib";
import { ProjectFile, AGOGOSProject, ProjFile } from "./project";

interface AppArgs
{
    workDir: string;
    //project: AGOGOSProject;
    projectFile?: ProjectFile;
}
interface AppState
{
    workDir: string;
    dirData: ProjectFileData;
}
function toProjectFileData(root: ProjectFile): ProjectFileData
{
    let { children, ...other } = root;
    return {
        extend: false,
        data: root.path,
        icon: (<span className={switchCase(root.type, { "file": `node-icon file ${path.extname(root.path).replace(".", "")}`, "folder": "node-icon directory" })}></span>),
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
            extend:false,
            name: name,
            children: isDir ? [] : undefined,
            data: p,
            icon: (<span className={isDir ? "node-icon directory" : `node-icon file ${path.extname(p).replace(".", "")}`}></span>)
        } as NodeData
    })).orderBy(node => fs.statSync(node.data).isDirectory() ? 0 : 1).toArray();
}

class App extends React.Component<AppArgs, AppState>
{
    constructor(props:AppArgs)
    {
        super(props);
        this.state = {
            workDir: this.props.workDir,
            dirData: null
        };
    }
    onFolderExtend(nodeData: NodeData)
    {
        return nodeData;
    }
    onProjectContextMenu(e: NodeMouseEvent)
    {
        PopupProjectMenu(e.parent.data as string);
    }
    componentDidMount()
    {
        let projectFileData = toProjectFileData(this.props.projectFile);
        projectFileData.icon = (<span className="node-icon directory"></span>);
        projectFileData.name = projectFileData.path;
        projectFileData.extend = true;
        this.setState({
            dirData: projectFileData
        });

        ipcRenderer.on(ChannelFileChanged, (event: Event, args: FileChangeArgs) =>
        {
            let relativeOld = args.oldFileName ? path.relative(this.props.workDir, args.oldFileName) : null;
            let relativeNew = args.newFileName ? path.relative(this.props.workDir, args.newFileName) : null;
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
    }
    render()
    {
        let data = this.state.dirData;
        return (
            <div>
                <SplitPane split="vertical" minSize={50} defaultSize={300} allowResize={true}>
                    <div id="left-side">
                        <SplitPane split="horizontal" defaultSize={400} allowResize={true}>
                            <Pane id="work-dir" header="Project">
                                <TreeViewer
                                    nodeData={this.state.dirData}
                                    tabSize={10}
                                    root={true}
                                    onContextMenu={e=>this.onProjectContextMenu(e)}
                                    onExtend={(nodeData) => this.onFolderExtend(nodeData)} />
                            </Pane>
                            <Pane id="res-lib" header="Library">

                            </Pane>
                        </SplitPane>
                    </div>
                    <div id="mid" className="pane">
                        <ProcessSpace id="process-space"></ProcessSpace>
                    </div>
                </SplitPane>
            </div>
        );
    }
}

const $ = (selector: string) => document.querySelector(selector);


ipcRenderer.once(ChannelStartup, (event: Event, args: Startup) =>
{
    const element = (
        <App workDir={args.workDir} /*project={args.project}*/ projectFile={args.projectFile}></App>
    );
    ReactDOM.render(element, $("#root"));
});
ipcRenderer.send("ping", "ping");