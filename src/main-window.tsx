import * as React from "react";
import * as ReactDOM from "react-dom";
import SplitPane from "react-split-pane";
import { TreeViewer, NodeData } from "../../react-tree-viewer";
import ViewPort from "../../react-free-viewport"
import { ipcRenderer, Event, app } from "electron";
import { ChannelStartup, Startup } from "./ipc";
import fs from "fs";
import path from "path";
import { Pane, ProcessSpace} from "./components";
import linq from "linq";

interface AppArgs
{
    workDir: string;
}

function getDirData(dirPath: string): NodeData[]
{
    return linq.from(fs.readdirSync(dirPath).map((name) =>
    {
        let p = path.resolve(dirPath, name);
        let isDir = fs.statSync(p).isDirectory();
        return {
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
                name: props.workDir,
                children: getDirData(this.props.workDir),
                data: this.props.workDir
            } as NodeData 
            
        };
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
                                    extend={true}
                                    data={this.state.dirData}
                                    tabSize={10}
                                    onExtend={(state) => console.log(state.nodeData.children = getDirData(state.nodeData.data))} />
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
        <App workDir={args.workDir}></App>
    );
    ReactDOM.render(element, $("#root"));
});
ipcRenderer.send("ping", "ping");