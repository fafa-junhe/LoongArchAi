import {Handle, Position} from 'reactflow';
import {SquareGanttChart} from "lucide-react";
import PropTypes from "prop-types";
import NodeHeader from "../NodeHeader.jsx";

export default function TextOutput({data, id, isViewMode = false}) {
    TextOutput.propTypes = {
        data: PropTypes.object.isRequired,
        id: PropTypes.string.isRequired,
        isViewMode: PropTypes.bool,
    }


    return (
        <div>
            <div className={`node-card ${isViewMode ? "view-mode" : ""}`}>
                <div className="form-control">
                    { !isViewMode && <NodeHeader label={data.label} isViewMode={isViewMode} nodeId={id} color="success"/>}

                    <div className="form-control">
                        <div className="mt-2 px-2 border-box w-full  gap-4 self-center pt-2 form-control">

                            <div>
                                <label className="label-text">{data.label}</label>

                                <textarea readOnly value={
                                    !data.output || data.output.length === 0 ? "暂无输出" : data.output
                                } className="w-full mt-2 textarea nowheel p-3 textarea-bordered h-32 resize-none overflow-y-auto text-base-content" />

                            </div>
                        </div>
                        {!isViewMode &&
                            <>
                                <div className="divider"></div>
                                <div className="h-24">
                                    <div className="float-left ml-3 form-control">
                                        <div className="flex gap-2 text-xs">

                                            <SquareGanttChart className="stroke-info-content handle_btn"/>

                                            <Handle type="target" position={Position.Left}>

                                            </Handle>
                                            <div className="self-center">
                                                文本
                                            </div>
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