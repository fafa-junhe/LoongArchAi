import {Handle, Position} from 'reactflow';
import {useCallback, useContext, useRef, useState} from "react";
import {Mic, MicOff, SquareActivity} from "lucide-react";
import PropTypes from "prop-types";
import NodeHeader from "../NodeHeader.jsx";
import {toast} from "react-hot-toast";
import {ModelsContext} from "../../Contexts.jsx";

export default function AudioInput({ data, id, isViewMode = false }) {
    AudioInput.propTypes = {
        data: PropTypes.object.isRequired,
        isViewMode: PropTypes.bool,
        id: PropTypes.string.isRequired
    }

    const [recordingDuration, setRecordingDuration] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const intervalRef = useRef(<input type="number"/>);
    const [isContinuousRecord, setIsContinuousRecord] = useState(false);
    const timer = useRef(0);
    const modelsContextContent = useContext(ModelsContext)

    const mediaRecorder = useRef(null)
    function blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(blob);
        });
    }

    const startRecord = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });

        mediaRecorder.current.ondataavailable = async event => {
            if (event.data.size > 0) {
                const audioBlob = event.data;
                data.input = await blobToBase64(audioBlob);
                // new Audio("data:audio/webm;base64," + data.input ).play()
                modelsContextContent.current.run();
            }
        };

        mediaRecorder.current.start(intervalRef.current.value); // Record in small chunks

        timer.current = setInterval(() => {
            if (mediaRecorder.current.state === 'recording') {
                mediaRecorder.current.stop();
                mediaRecorder.current.start(intervalRef.current.value); // Restart recording
            }
        }, intervalRef.current.value);
    }, [data, modelsContextContent]);

    const stopRecord = useCallback(() => {
        clearInterval(timer.current);
        if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
            mediaRecorder.current.stop();
        }
    }, []);

    const handleSwapClick = useCallback(() => {
        setIsRecording(!isRecording);
        if (isRecording) {
            stopRecord();
        } else if (isContinuousRecord) {
            if (!intervalRef.current.value) {
                toast.error("未填写间隔时间");
                setIsRecording(false);
                return;
            }
            startRecord().then(() => {});
        } else {
            // 只录制一次
        }
    }, [isContinuousRecord, isRecording, startRecord, stopRecord]);

    return (
        <div>
            <div className={`node-card ${isViewMode ? "view-mode" : ""}`}>
                <div className="flex flex-col">
                    { !isViewMode && <NodeHeader label={data.label} isViewMode={isViewMode} nodeId={id} color="primary" />}
                    <div className="form-control">
                        <div className="mt-2 flex w-52 flex-1 flex-col items-center gap-4 self-center pt-2">
                            <div>
                                {isRecording && (
                                    <div className="text-center mb-2">
                                        录音时间: {Math.floor(recordingDuration / 60)}:{recordingDuration % 60 < 10 ? '0' : ''}{recordingDuration % 60}
                                    </div>
                                )}
                            </div>
                            <div className="form-control mt-4 gap-2">
                                <label className="swap">
                                    <input type="checkbox" checked={isRecording} onChange={handleSwapClick}/>
                                    <div className="swap-on"><Mic/></div>
                                    <div className="swap-off"><MicOff/></div>
                                </label>
                                <div className="group/record form-control">
                                    <label className="label gap-20 cursor-pointer">
                                        <span className="label-text">持续录制</span>
                                        <input onChange={() => setIsContinuousRecord(!isContinuousRecord)}
                                               type="checkbox" className="toggle"/>
                                    </label>
                                    <div className="gap-2 mt-4 form-control hidden group-has-[:checked]/record:flex">
                                        <div><input type="number" placeholder="间隔时长"
                                                    ref={intervalRef}
                                                    className="input w-36 input-bordered"/><span
                                            className="ml-2 font-light">(ms)</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {!isViewMode &&
                            <>
                                <div className="divider"></div>
                                <div className="h-24">
                                    <div className="float-right mr-2 form-control">
                                        <div className="flex gap-2 text-xs">
                                            <div className="self-center">
                                                音频
                                            </div>
                                            <SquareActivity className="stroke-info-content handle_btn"/>
                                            <Handle type="source" position={Position.Right}></Handle>
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