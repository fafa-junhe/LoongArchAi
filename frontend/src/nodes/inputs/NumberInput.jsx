import {Handle, Position} from 'reactflow';
import {SquareGanttChart} from "lucide-react";
import PropTypes from "prop-types";
import NodeHeader from "../NodeHeader.jsx";
import {useEffect, useState} from "react";

export default function NumberInput({data, id, isViewMode = false}) {
    NumberInput.propTypes = {
        data: PropTypes.object.isRequired,
        isViewMode: PropTypes.bool, id: PropTypes.string.isRequired
    }

    const [currentNumber, setCurrentNumber] = useState(0)

    useEffect(() => {
        data.input = currentNumber;
    }, [currentNumber]);

    return (
        <div>
            <div className={`node-card ${isViewMode ? "view-mode" : ""}`}>
                <div className="form-control">
                    { !isViewMode && <NodeHeader label={data.label} isViewMode={isViewMode} nodeId={id} color="primary"/>}

                    <div className="form-control">
                        <div className="mt-2 px-2 border-box  w-full  flex-1 items-center gap-4 self-center pt-2 form-control">

                            <div className="w-full">
                                <label htmlFor="input" className="label-text">{data.label}</label>
                                <span> {currentNumber} </span>
                                <input
                                    defaultValue={currentNumber}
                                    onChange={(e) => {
                                        setCurrentNumber(parseInt(e.target.value))
                                    }}
                                    type="range" min="0" max="100" className="range-primary range w-full resize-none text-base-content"/>


                            </div>

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