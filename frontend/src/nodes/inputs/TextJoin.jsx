import {Handle, Position, useUpdateNodeInternals } from 'reactflow';
import {PlusSquare, SquareGanttChart, X} from "lucide-react";
import PropTypes from "prop-types";
import NodeHeader from "../NodeHeader.jsx";
import {useEffect, useState} from "react";

export default function TextJoin({data, id, isViewMode = false}) {
    const [inputs, setInputs] = useState(data.inputs || []);

    const updateNodeInternals = useUpdateNodeInternals();

    TextJoin.propTypes = {
        data: PropTypes.object.isRequired,
        isViewMode: PropTypes.bool,
        id: PropTypes.string.isRequired
    };

    const addInput = () => {
        setInputs([...inputs, ""]);
        updateNodeInternals(id);
    };

    const removeInput = (index) => {
        const newInputs = inputs.filter((_, i) => i !== index);
        setInputs(newInputs);
        data.inputs = newInputs;
        updateNodeInternals(id);
    };

// Ensure inputs are passed in order
    useEffect(() => {
        data.inputs = inputs;
    }, [inputs, data]);


    return (
        <div>
            <div className={`node-card ${isViewMode ? "view-mode" : ""}`}>
                <div className="form-control">
                    { !isViewMode && <NodeHeader label={data.label} isViewMode={isViewMode} nodeId={id} color="primary"/>}

                    <div className="form-control">
                        <div className="mt-2 px-2 border-box  w-full  flex-1 items-center gap-4 self-center pt-2 form-control">

                            <div>
                                <label htmlFor="rule" className="label-text">输入</label>

                                <textarea defaultValue={data.rule} onChange={(e) => {
                                    data.rule = e.target.value
                                }} className="w-full resize-none textarea nowheel textarea-bordered text-base-content"
                                          id="rule"></textarea>
                            </div>

                        </div>

                        {!isViewMode &&
                            <>
                                <div className="divider"></div>
                                <div className="min-h-24">
                                    <div className="float-left ml-3 form-control">

                                        {inputs.map((_, index) => (
                                            <div key={index} className="group/handle flex gap-2 text-xs">
                                                <SquareGanttChart className="stroke-info-content handle_btn"/>
                                                <Handle type="target" id={`a${index}`} position={Position.Left}/>
                                                <div className="self-center">文本 {index + 1}</div>
                                                <div
                                                    className="invisible group-hover/handle:visible btn btn-xs self-center min-h-3 size-3 btn-circle btn-error"
                                                    onClick={() => removeInput(index)}
                                                >
                                                    <X className="size-3"/>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="cursor-pointer flex gap-2 text-xs" onClick={addInput}>

                                            <PlusSquare className="stroke-success-content handle_btn"/>

                                            <div className="react-flow__handle-fake react-flow__handle"></div>

                                            <div className="self-center">
                                                添加新输入
                                            </div>
                                        </div>
                                    </div>

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