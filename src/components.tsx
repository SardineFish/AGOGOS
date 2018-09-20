import React, { HTMLProps, RefObject } from "react";
import ViewPort from "../../react-free-viewport/dist";
import { ProcessNode } from "./process-node";
interface PaneProps extends HTMLProps<HTMLDivElement>
{
    header: string;
}
interface ProcessNodeProps extends HTMLProps<HTMLDivElement>
{
    node: ProcessNode;
}
export class Pane extends React.Component<PaneProps>
{
    render()
    {
        return (
            <section className={[this.props.className, "pane"].join(" ")} id={this.props.id} key={this.props.key}>
                <header className="pane-header">{this.props.header}</header>
                <div className="pane-content">{this.props.children}</div>
            </section>
        );
    }
}
export class ProcessSpace extends React.Component<HTMLProps<HTMLDivElement>>
{
    domRef: RefObject<HTMLDivElement>
    viewportRef:RefObject<ViewPort>
    constructor(props:HTMLProps<HTMLDivElement>)
    {
        super(props);
        this.domRef = React.createRef();
        this.viewportRef = React.createRef();
    }
    componentDidMount()
    {
        console.log(this.domRef.current);
    }
    render()
    {
        const { children, ...other } = this.props;
        
        return (
            <ViewPort id={this.props.id} button={1} refobj={this.domRef}>

            </ViewPort>
        )
    }
}

export class ReactProcessNode extends React.Component<ProcessNodeProps>
{
    render()
    {
        return (
            <div className="node-wrapper">
                <header className="node-header">{this.props.node.name}</header>
                <div className="node-content">
                    
                </div>
            </div>
        )
    }
}