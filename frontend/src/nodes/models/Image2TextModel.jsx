import {Handle, Position} from 'reactflow';
import PropTypes from "prop-types";
import {useContext, useEffect} from "react";
import "../nodes.css"
import {Image, SquareGanttChart} from "lucide-react";
import {ModelsContext} from "../../Contexts.jsx";
import NodeHeader from "../NodeHeader.jsx";

export default function Image2TextModel({data, id, isViewMode = false}) {
    Image2TextModel.propTypes = {
        data: PropTypes.object.isRequired,
        isViewMode: PropTypes.bool, id: PropTypes.string.isRequired 
    }
    const modelsContextContent = useContext(ModelsContext)
    const modelsFiltered = modelsContextContent.current.models.filter((item) => {
        return item.type === "I2T";
    })
    useEffect(() => {
        if (modelsFiltered[0] !== undefined)
            data.model = modelsFiltered[0].id
    }, [data, modelsFiltered]);
    return (
        <div>

            <div className={`node-card ${isViewMode ? "view-mode" : ""}`}>
                <div className="form-control">
                    { !isViewMode && <NodeHeader label={data.label} isViewMode={isViewMode} nodeId={id} color="accent"/>}

                    <div className="form-control">
                        <div className="mt-2 px-2 border-box  w-full  gap-4 self-center pt-2 form-control">
                            <div>
                                <label htmlFor="model_select" className="mb-2 label-text">图片理解模型</label>
                                <select
                                    name="model_select"
                                    defaultValue={data.model}
                                    onChange={
                                        (event) => {
                                            data.model = event.target.value;
                                        }
                                    }
                                    className="w-full text-center text-base-content select select-bordered">
                                    {
                                        modelsFiltered.map((item, index) => (
                                            <option key={index} value={item.id}>{item.name}</option>
                                        ))
                                    }
                                </select>
                            </div>
                            <div>
                                <label htmlFor="prompt" className="mb-2 label-text">提示词</label>

                                <textarea defaultValue={data.prompt} onChange={(e) => {
                                    data.prompt = e.target.value
                                }} className="w-full resize-none textarea nowheel textarea-bordered text-base-content"
                                          name="prompt"></textarea>
                            </div>

                        </div>
                        <div></div>

                        {!isViewMode &&
                            <>
                                <div className="divider"></div>
                                <div className="h-24">
                                    <div className="float-left ml-3 form-control">
                                        <div className="flex gap-2 text-xs">

                                            <Image className="handle_btn"/>

                                            <Handle type="target" position={Position.Left}>

                                            </Handle>
                                            <div className="self-center">
                                                图片
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