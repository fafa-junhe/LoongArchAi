import CanvasDraw from "@win11react/react-canvas-draw";
import {useEffect, useRef, useState} from "react";
import {ChevronLeft, LucideDot, LucidePencil, Menu, Redo2, Undo2} from "lucide-react";
import useUndoable from "use-undoable";
import {BlockPicker, SketchPicker} from "react-color";
import CompactColor from "react-color/lib/components/compact/CompactColor.js";

export default function Drawing() {
    const bc = new BroadcastChannel("drawing");
    const canvas = useRef(<CanvasDraw />);
    const [elements, setElements, {undo, redo, canUndo, canRedo, reset}] = useUndoable(`{"lines": []}`, {
        ignoreIdenticalMutations: false, cloneState: false, behavior: "destroyFuture"
    });
    const [size, setSize] = useState(10)
    const [color, setColor] = useState("#006600")
    const onMouseUp = () => {
        if (canvas.current) {
            setElements(canvas.current.getSaveData())
            bc.postMessage(canvas.current.getDataURL("png", false, "#0000FF"));
        }
    }

    useEffect(() => {
        canvas.current.loadSaveData(elements)
    }, [elements]);

    return (<div>
            <div className="absolute z-50 left-4 top-4">
                <ul className="gap-2 menu menu-horizontal bg-base-300/60 shadow-2xl glass rounded-box">
                    <li>
                        <a onClick={() => {
                            navigate(-1)
                        }} className="p-2"><ChevronLeft className="size-5" /></a>
                    </li>
                    <li>
                        <a className="p-2"><Menu className="size-5" /></a>
                    </li>
                    <div className="group/color ">
                        <li>
                            <a>
                                <LucidePencil stroke={color} />
                            </a>
                        </li>
                        <div className="hidden group-hover/color:block absolute left-9 top-15">
                            <SketchPicker
                                color={color}
                                onChange={(color) => {
                                    setColor(color.hex)
                                }}
                                presetColors={[
                                    { "color": "#000000", "title": "void" },
                                    { "color": "#6C4014", "title": "dirt" },
                                    { "color": "#006600", "title": "grass" },
                                    { "color": "#00FF00", "title": "tree" },
                                    { "color": "#009999", "title": "pole" },
                                    { "color": "#0080FF", "title": "water" },
                                    { "color": "#0000FF", "title": "sky" },
                                    { "color": "#FFFF00", "title": "vehicle" },
                                    { "color": "#FF007F", "title": "object" },
                                    { "color": "#404040", "title": "asphalt" },
                                    { "color": "#FF0000", "title": "building" },
                                    { "color": "#660000", "title": "log" },
                                    { "color": "#CC99FF", "title": "person" },
                                    { "color": "#6600CC", "title": "fence" },
                                    { "color": "#FF99CC", "title": "bush" },
                                    { "color": "#AAAAAA", "title": "concrete" },
                                    { "color": "#2979FF", "title": "barrier" },
                                    { "color": "#86FFEF", "title": "puddle" },
                                    { "color": "#634222", "title": "mud" },
                                    { "color": "#6E168A", "title": "rubble" }
                                ]}
                            /></div>
                    </div>
                    <div className="group/size">
                        <li className="h-10 overflow-hidden">
                            <a className=" flex h-full">
                                {size}
                                <LucideDot width={size * 2} height={size * 2} />
                            </a>
                        </li>
                        <div className="hidden border-8 rounded-2xl bg-base-300 group-hover/size:block absolute left-18 top-15">
                            <input type="range" min="0" max="100" defaultValue={size}
                                   onChange={(e) => {setSize(e.target.value)}}
                                   className="range" />
                        </div>
                    </div>
                    <li className={!canUndo ? "disabled" : "cursor-pointer"}>
                        <a onClick={undo} className="p-2"><Undo2 className="size-5" /></a>
                    </li>
                    <li className={!canRedo ? "disabled" : "cursor-pointer"}>
                        <a onClick={redo} className="p-2"><Redo2 className="size-5" /></a>
                    </li>
                    <li>
                        <details>
                            <summary>新建节点</summary>
                            <ul>
                                <li>
                                    <a>1</a>
                                </li>
                                <li>
                                    <a>2</a>
                                </li>
                                <li>
                                    <details open>
                                        <summary>Parent</summary>
                                        <ul>
                                            <li>
                                                <a>item 1</a>
                                            </li>
                                            <li>
                                                <a>item 2</a>
                                            </li>
                                        </ul>
                                    </details>
                                </li>
                            </ul>
                        </details>
                    </li>
                    <li>
                        <a>Item 3</a>
                    </li>
                </ul>
            </div>
            <div className=""></div>
            <div onMouseUp={onMouseUp} onTouchEnd={onMouseUp} onTouchCancel={onMouseUp}>
                <CanvasDraw

                    lazyRadius={10} brushRadius={size} enablePanAndZoom={true} clampLinesToDocument={true}
                             ref={canvas} brushColor={color} immediateLoading={true}
                            canvasWidth={window.innerWidth} canvasHeight={window.innerHeight} />
            </div>
        </div>)
}