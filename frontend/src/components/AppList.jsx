import {useCallback, useContext, useEffect, useRef, useState} from "react";
import {axios} from "../Constrains.jsx";
import {Plus, CirclePlay, Pencil} from "lucide-react"
import {Link} from "react-router-dom"
import AppPreview from "./AppPreview.jsx";
import {useCookies} from "react-cookie";
import useTokenStore from "../states/state.js";
import {FrameContext} from "../Contexts.jsx";
import {useModal} from 'react-hooks-use-modal';
import {toast} from "react-hot-toast";

export default function AppList({appList= [], onContextMenu, setContextMenuContent}) {
    // State for storing flow list and images



    return (
        <ul className=" gap-5 flex flex-wrap">

            {appList.map((app, index) => (
                <AppPreview app={app} index={index} key={index} onContextMenu={onContextMenu} setContextMenuContent={setContextMenuContent}></AppPreview>
            ))}

        </ul>
    );
}