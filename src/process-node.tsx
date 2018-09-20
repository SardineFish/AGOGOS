import ReactDOM from "react-dom";
import React from "react";
import { ReactProcessNode } from "./components";

export class ProcessNode
{
    name: string = "Node";
    
}

export function renderProcessNode(node:ProcessNode): HTMLElement
{
    let element = document.createElement("div");
    const reactElement = (
        <ReactProcessNode node={node}></ReactProcessNode>
    );
    ReactDOM.render(reactElement, element);
    return element;
}