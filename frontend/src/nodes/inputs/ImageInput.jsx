import {Handle, Position} from 'reactflow';
import {useCallback, useContext, useEffect, useRef, useState} from "react";
import {Image, Mic, MicOff, Video, VideoOff} from "lucide-react";
import PropTypes from "prop-types";
import NodeHeader from "../NodeHeader.jsx";
import {toast} from "react-hot-toast";
import {ModelsContext} from "../../Contexts.jsx";
import {runTest} from "../../Constrains.jsx";

export default function ImageInput({data, id, isViewMode = false}) {
    ImageInput.propTypes = {
        data: PropTypes.object.isRequired,
        isViewMode: PropTypes.bool, id: PropTypes.string.isRequired 
    }
    const [isContinuousRecord, setIsContinuousRecord] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [currentType, setCurrentType] = useState(0);
    const [currentImage, setCurrentImage] = useState("")
    const intervalRef = useRef(<input type="number"/>);
    const modelsContextContent = useContext(ModelsContext)

    const timer = useRef(0);
    useEffect(() => {
        const bc = new BroadcastChannel("drawing");
        bc.onmessage = (event) => {
            data.input = event.data;
            setCurrentImage(event.data)
            modelsContextContent.current.run();
        };
    }, []);

    const onChange = useCallback((event) => {
        let reader = new FileReader();
        let file = event.target.files[0];
        reader.onloadend = function () {
            data.input = reader.result;
            setCurrentImage(reader.result)
            console.log(reader.result);

        }

        if (file) {
            reader.readAsDataURL(file);
        } else {
            data.input = "";
        }
    }, [data]);

    const setType = useCallback((type) => {
        data.type = type;
        setCurrentType(type)
    }, [data])
    const recordAFrame = useCallback(() => {
        const video = document.createElement("video");
        const canvas = document.createElement("canvas");

        navigator.mediaDevices
            .getUserMedia({ video: true, audio: false })
            .then((stream) => {
                video.srcObject = stream;
                video.play(); // Start playing the video

                video.addEventListener('canplay', () => {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    const context = canvas.getContext('2d');
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const base64Image = canvas.toDataURL('image/png');
                    data.input = base64Image;
                    setCurrentImage(base64Image);
                    // Stop all tracks after capturing the image
                    stream.getTracks().forEach((t) => {
                        t.stop();
                    });
                });
            })

    }, [data])

    const handleSwapClick = useCallback(() => {
        setIsRecording(!isRecording)
        if (isRecording){
            clearInterval(timer.current)
            return;
        }
        if (isContinuousRecord){
            if (!intervalRef.current.value){
                toast.error("未填写间隔时间")
                setIsRecording(false)
                return;
            }
            timer.current = setInterval(
                () => {
                    recordAFrame()
                    modelsContextContent.current.run();
                }, intervalRef.current.value
            )
        }

        else{
            recordAFrame()
            setTimeout(() => setIsRecording(false), 1500)
            // toast.promise(
            //     runTest(rflInstance.current.toObject(), setNodes, setEdges),
            //     {
            //         success: "运行完成",
            //         loading: "运行中",
            //         error: "出现未知错误"
            //     });
        }
    }, [isContinuousRecord, isRecording, modelsContextContent, recordAFrame]);

    useEffect(() => {
        if (data.type === undefined){
            data.type = 0;
        }

    }, [data]);
    
    useEffect(() => {
        if (data.input)
            setCurrentImage(data.input)
    }, [data.input])

    return (
        <div>

            <div className={`node-card ${isViewMode ? "view-mode" : ""}`}>

                <div className="flex flex-col">
                    { !isViewMode && <NodeHeader label={data.label} isViewMode={isViewMode} nodeId={id} color="primary"/>}

                    <div className="form-control">

                        <div className="mt-2 flex w-52 flex-1 flex-col items-center gap-4 self-center pt-2">
                            <div role="tablist" className="w-full tabs tabs-lifted">
                                <input defaultChecked={currentType === 0} onChange={(e) => e.target.checked ? setType(0) : ""} type="radio" name={"image_type" + id} role="tab" className="tab" aria-label="图片"/>
                                <input defaultChecked={currentType === 1} onChange={(e) => e.target.checked ? setType(1) : ""} type="radio" name={"image_type" + id} role="tab" className="tab" aria-label="视频"/>
                                <input defaultChecked={currentType === 2} onChange={(e) => e.target.checked ? setType(2) : ""} type="radio" name={"image_type" + id} role="tab" className="tab" aria-label="画图"/>
                            </div>
                            {   currentType === 0 &&
                                <div>
                                    <input onChange={onChange} accept="image/png, image/jpeg" name="input" type="file"
                                           className="w-full max-w-xs text-xs file-input file-input-bordered file-input-info"/>
                                </div>
                            }
                            {   currentType === 1 &&
                                <div className="form-control mt-4 gap-2">
                                    <label className="swap">
                                        <input type="checkbox" checked={isRecording} onChange={handleSwapClick}/>
                                        <div className="swap-on"><Video/></div>
                                        <div className="swap-off"><VideoOff/></div>
                                    </label>

                                    <div className="group/record form-control">
                                        <label className="label gap-20 cursor-pointer">
                                            <span className="label-text">持续录制</span>
                                            <input onChange={() => setIsContinuousRecord(!isContinuousRecord)} type="checkbox" className="toggle"/>
                                        </label>
                                        <div className="mt-4 form-control hidden group-has-[:checked]/record:flex">
                                            <div><input type="number" placeholder="间隔时长"
                                                      ref ={intervalRef}
                                                        className="input w-36 input-bordered"/><span
                                                className="ml-2 font-light">(ms)</span></div>
                                        </div>
                                    </div>

                                </div>
                            }

                            {currentType === 2 &&
                                <a className="btn btn-primary" href="/draw" target="_blank">打开画图</a>
                            }
                            <div className="divider"></div>
                            <div className=" rounded-xl h-48 w-48 border bg-contain bg-center bg-no-repeat"
                                 style={{
                                     backgroundImage: `url(${currentImage})`,
                                 }}>
                            </div>


                        </div>
                        {!isViewMode &&
                            <>
                                <div className="divider"></div>
                                <div className="h-24">
                                    <div className="float-right mr-2 form-control">
                                    <div className="flex gap-2 text-xs">
                                            <div className="self-center">
                                            {data.label}
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