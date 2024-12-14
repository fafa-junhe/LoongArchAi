import {Handle, Position} from 'reactflow';
import {SquareActivity} from "lucide-react";
import {useEffect, useState} from "react";
import PropTypes from "prop-types";
import NodeHeader from "../NodeHeader.jsx";

export default function AudioOutput({data, id, isViewMode = false}) {
    AudioOutput.propTypes = {
        data: PropTypes.object.isRequired,
        isViewMode: PropTypes.bool, id: PropTypes.string.isRequired 
    }
    const [audio, setAudio] = useState(new Audio())
    useEffect(() => {
        setAudio(new Audio("data:audio/wav;base64," + data.output));
    }, [data]);

    useEffect(() => {
        if (audio && data.output){
            audio.play()

        }
        
    }, [audio])

    return (
        <div>
            <div className={`node-card ${isViewMode ? "view-mode" : ""}`}>
                <div className="form-control">
                    { !isViewMode && <NodeHeader label={data.label} isViewMode={isViewMode} nodeId={id} color="success"/>}

                    <div className="pt-2 form-control mt-2 px-2 border-box w-full">
                        <label className="label-text">{data.label}</label>

                        <button className="mt-2 btn btn-primary" onClick={
                            () => {
                                audio.play()
                            }
                        }>播放
                        </button>
                        {!isViewMode &&
                            <>
                                <div className="divider"></div>
                                <div className="h-24">
                                    <div className="float-left ml-3 form-control">
                                        <div className="flex gap-2 text-xs">

                                            <SquareActivity className="stroke-warning-content handle_btn"/>

                                            <Handle type="target" position={Position.Left}>

                                            </Handle>
                                            <div className="self-center">
                                                音频
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