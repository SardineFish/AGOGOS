import * as React from "react";
import * as ReactDOM from "react-dom";
import SplitPane from "react-split-pane";
import { TreeViewer, NodeData } from "../../react-tree-viewer";
import { ipcRenderer, Event } from "electron";
import { ChannelStartup, Startup } from "./ipc";
import fs from "fs";
import path from "path";

interface AppArgs
{
    workDir: string;
}

function getDirData(dirPath: string): NodeData[]
{
    return fs.readdirSync(dirPath).map((name) =>
    {
        let p = path.resolve(dirPath, name);
        return {
            name: name,
            children: fs.statSync(p).isDirectory() ? [] : undefined,
            data: p
        } as NodeData
    });
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
                <SplitPane split="vertical" minSize={50} defaultSize={100} allowResize={true}>
                    <div id="left-side">
                        <SplitPane split="horizontal" defaultSize={100} allowResize={true}>
                            <div id="work-dir" className="pane">
                                <TreeViewer
                                    data={this.state.dirData}
                                    onExtend={(state) => console.log(state.nodeData.children = getDirData(state.nodeData.data))}/>
                            </div>
                            <div id="res-lib" className="pane">2</div>
                        </SplitPane>
                    </div>
                    <div id="mid" className="pane">0</div>
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