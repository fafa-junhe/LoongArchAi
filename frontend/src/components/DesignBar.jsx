import {ChevronLeft, Menu, Sun, Moon, Undo2, Redo2} from "lucide-react"
import {memo} from "react";
import { useNavigate } from "react-router-dom";

const DesignBar = memo(function DesignBar({ flowName, setFlowName, updateName, undo, redo, canUndo, canRedo, isAbsolute = true}) {
    const navigate = useNavigate();
    return (
        <div className={`z-50 ${isAbsolute ? "absolute": ""} left-4 top-4`}>
            <ul className="gap-2 menu menu-horizontal bg-base-300/60 shadow-2xl glass rounded-box">
                <li><a onClick={() => {
                    navigate(-1)
                }} className="p-2"><ChevronLeft className="size-5"/></a></li>

                <li><input className="input input-bordered bg-base-200 h-9" type="text" defaultValue={flowName} onChange={(event) => {
                    if (event.target.value !== "")
                        setFlowName(event.target.value)
                }} /></li>
                <li className={!canUndo ? "disabled" : "cursor-pointer"}><a onClick={undo} className="p-2"><Undo2  className="size-5"/></a></li>
                <li className={!canRedo ? "disabled" : "cursor-pointer"}><a onClick={redo} className="p-2"><Redo2  className="size-5"/></a></li>


            </ul>
        </div>
    )
});
export default DesignBar;