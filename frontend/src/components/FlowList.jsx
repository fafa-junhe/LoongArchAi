import {useEffect, useState} from "react";
import {axios} from "../Constrains.jsx";
import {Plus, CirclePlay, Pencil} from "lucide-react"
import {Link} from "react-router-dom"
import FlowPreview from "./FlowPreview.jsx";

export default function FlowList({
                                     flowList = [],
                                     onContextMenu,
                                     setContextMenuContent,
                                     isViewOnly = false,
                                     isClickable = true,
                                     onClick = () => {}
                                 }) {
    // State for storing flow list and images

    // Fetch flow list on component mount

    return (
        <ul className="gap-6 flex flex-wrap">
            {flowList !== null ? flowList.map((flow, index) => (
                    <FlowPreview isClickable={isClickable} isViewOnly={isViewOnly} flow={flow} onContextMenu={onContextMenu}
                                 onClick={onClick}
                                 setContextMenuContent={setContextMenuContent} index={index} key={index}></FlowPreview>
                )) :
                (Array.from({length: 3}, (_, k) => (
                    <div key={k} className="flex flex-col gap-4 w-60">
                        <div className="skeleton h-32 w-full"></div>
                        <div className="skeleton h-4 w-28"></div>
                        <div className="skeleton h-4 w-full"></div>
                        <div className="skeleton h-4 w-full"></div>
                    </div>
                )))
            }
        </ul>
    );
}