import {Handle, Position} from 'reactflow';
import {SquareGanttChart} from "lucide-react";
import PropTypes from "prop-types";
import NodeHeader from "../NodeHeader.jsx";

export default function TextInput({data, id, isViewMode = false}) {
    TextInput.propTypes = {
        data: PropTypes.object.isRequired,
        isViewMode: PropTypes.bool, id: PropTypes.string.isRequired 
    }

    return (
        <div>
            <div className={`node-card ${isViewMode ? "view-mode" : ""}`}>
                <div className="form-control">
                    { !isViewMode && <NodeHeader label={data.label} isViewMode={isViewMode} nodeId={id} color="primary" />}
                    <div className="form-control">
                        <div className="mt-2 px-2 border-box w-full flex-1 items-center gap-4 self-center pt-2 form-control">

                            <div className="w-full">
                                <label htmlFor="input" className="label-text">{data.label}</label>

                                <textarea defaultValue={data.input} onChange={(e) => {
                                    data.input = e.target.value
                                }} className="mt-2 w-full h-32 resize-none textarea nowheel textarea-bordered text-base-content"
                                          name="input"></textarea>
                            </div>
                            {/*{!isViewMode &&*/}

                            {/*    <div className="w-full form-control">*/}
                            {/*    <label className="cursor-pointer label">*/}
                            {/*        <span className="label-text">静态文本</span>*/}
                            {/*        <input type="checkbox" className="toggle" onChange={(e) => {*/}

                            {/*        }}/>*/}
                            {/*    </label>*/}
                            {/*</div>*/}
                            {/*}*/}
                        </div>

                        {!isViewMode &&
                            <>
                                <div className="divider"></div>
                                <div className="h-24">
                                    <div className="float-right mr-2 form-control">
                                        <div className="flex gap-2 text-xs">
                                            <div className="self-center">
                                                文本
                                            </div>
                                            <SquareGanttChart className="stroke-info-content handle_btn"/>

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