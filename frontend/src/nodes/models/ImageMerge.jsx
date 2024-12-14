import {Handle, Position} from 'reactflow';
import PropTypes from "prop-types";
import {useContext, useEffect, useState} from "react";
import "../nodes.css"
import {Image, SquareGanttChart} from "lucide-react";
import {ModelsContext} from "../../Contexts.jsx";
import NodeHeader from "../NodeHeader.jsx";

export default function ImageMerge({data, id, isViewMode = false}) {
    ImageMerge.propTypes = {
        data: PropTypes.object,
        isViewMode: PropTypes.bool,
        id: PropTypes.string.isRequired
    }

    const [isStretch, setIsStretch] = useState(false)

    useEffect(() => {
        if (data.stretch === undefined) {
            data.stretch = false;
        }
    }, [data]);


    return (
        <div>

            <div className={`node-card ${isViewMode ? "view-mode" : ""}`}>
                <div className="form-control">
                    {!isViewMode && <NodeHeader label={data.label} isViewMode={isViewMode} nodeId={id} color="accent"/>}

                    <div className="form-control">
                        <div className="mt-2 px-2 border-box w-full gap-4 self-center pt-2 form-control">

                            <div>
                                <label className="label gap-20 cursor-pointer">
                                    <span className="label-text">拉伸</span>
                                    <input type="checkbox"
                                           defaultChecked={data.stretch}
                                           onChange={
                                               () => {
                                                   setIsStretch(!isStretch)
                                                   data.stretch = !isStretch;
                                               }
                                           }
                                           className="toggle"/>
                                </label>

                            </div>
                        </div>

                        {!isViewMode &&
                            <>
                                <div className="divider"></div>
                                <div className="h-24">
                                    <div className="float-left ml-3 gap-2 form-control">
                                        <div className="flex gap-2 text-xs">

                                            <Image className="stroke-warning-content handle_btn"/>

                                            <Handle id="a" type="target" position={Position.Left}>

                                            </Handle>
                                            <div className="self-center">
                                                图片
                                            </div>
                                        </div>
                                        <div className="flex gap-2 text-xs">

                                            <Image className="stroke-warning-content handle_btn"/>

                                            <Handle id="b" type="target" position={Position.Left}>

                                            </Handle>
                                            <div className="self-center">
                                                图片
                                            </div>
                                        </div>
                                    </div>
                                    <div className="float-right mr-2 form-control">
                                        <div className="flex gap-2 text-xs">
                                            <div className="self-center">
                                                图片
                                            </div>
                                            <Image className="stroke-info-content handle_btn"/>

                                            <Handle type="source" position={Position.Right}>

                                            </Handle>

                                        </div>
                                    </div>
                                </div>
                            </>
                        }

                    </div>

                </div>
            </div>
        </div>
    );
}