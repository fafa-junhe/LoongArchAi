import {Handle, Position} from 'reactflow';
import {Image} from "lucide-react";
import PropTypes from "prop-types";
import NodeHeader from "../NodeHeader.jsx";

export default function ImageOutput({data, id, isViewMode = false}) {
    ImageOutput.propTypes = {
        data: PropTypes.object.isRequired,
        isViewMode: PropTypes.bool, id: PropTypes.string.isRequired 
    }

    return (
        <div>
            <div className={`node-card ${isViewMode ? "view-mode" : ""}`}>
                <div className="form-control">
                    { !isViewMode && <NodeHeader label={data.label} isViewMode={isViewMode} nodeId={id} color="success"/>}

                    <div className="form-control">
                        <div className="mt-2 flex w-52 flex-1 flex-col items-center gap-4 self-center pt-2">

                            <div>
                                <div className="h-48 w-48 border bg-contain bg-center bg-no-repeat" style={{
                                    backgroundImage: `url(${data.output})`,
                                }}>
                                </div>

                            </div>


                        </div>
                        {!isViewMode &&
                            <>
                                <div className="divider"></div>
                                <div className="h-24">
                                    <div className="float-left ml-3 form-control">
                                        <div className="flex gap-2 text-xs">

                                            <Image className="stroke-warning-content handle_btn"/>

                                            <Handle type="target" position={Position.Left}>

                                            </Handle>
                                            <div className="self-center">
                                                图像
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