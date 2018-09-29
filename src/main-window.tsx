import * as React from "react";
import * as ReactDOM from "react-dom";
import SplitPane from "react-split-pane";
import { TreeViewer, NodeData, NodeMouseEvent } from "../../react-tree-viewer";
import ViewPort from "../../react-free-viewport"
import { ipcRenderer, Event, app, Menu, MenuItem } from "electron";
import { ChannelStartup, Startup } from "./ipc";
import fs from "fs";
import path from "path";
import { Pane, ProcessSpace} from "./components";
import linq from "linq";
import { GetProjectSettings, PopupProjectMenu } from "./lib-renderer";

interface AppArgs
{
    workDir: string;
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

class App extends React.Component<AppArgs, any>
{
    constructor(props:AppArgs)
    {
        super(props);
        this.state = {
            workDir: this.props.workDir,
            dirData: {
                extend:true,
                name: props.workDir,
                children: getDirData(this.props.workDir),
                icon: (<span className="node-icon directory"></span>),
                data: this.props.workDir
            } as NodeData 
            
        };
    }
    onFolderExtend(nodeData: NodeData)
    {
        if (!nodeData.children || nodeData.children.length > 0)
            return nodeData;
        nodeData.children = getDirData(nodeData.data as string);
        return nodeData;
    }
    onProjectContextMenu(e: NodeMouseEvent)
    {
        PopupProjectMenu(e.parent.data as string);
    }
    render()
    {
        return (
            <div>
                <SplitPane split="vertical" minSize={50} defaultSize={300} allowResize={true}>
                    <div id="left-side">
                        <SplitPane split="horizontal" defaultSize={400} allowResize={true}>
                            <Pane id="work-dir" header="Project">
                                <TreeViewer
                                    data={this.state.dirData}
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
        <App workDir={GetProjectSettings().projectDirectory}></App>
    );
    ReactDOM.render(element, $("#root"));
});
ipcRenderer.send("ping", "ping");