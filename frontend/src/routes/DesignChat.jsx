import {Link, useNavigate, useParams} from "react-router-dom";
import {ArrowDownCircle, ChevronLeft, CircleHelp, Clipboard, LucideX, Search, Share} from "lucide-react";
import {useCallback, useEffect, useRef, useState} from "react";
import {axios, getModels, restore} from "../Constrains.jsx";
import {toast} from "react-hot-toast";
import Chat from "../components/Chat.jsx";
import QRCode from "react-qr-code";

export default function DesignChat() {
    const {flowId} = useParams()

    const promptRef = useRef(<textarea />);
    const nameRef = useRef(<input />);
    const openingRef = useRef(<input />);
    const userNameRef = useRef(<input />);
    const topKRef = useRef(<input />);
    const topPRef = useRef(<input />);
    const temperatureRef = useRef(<input />);
    const searchRef = useRef(<input />);
    const modelSelectRef = useRef(<select />);
    const scrollRef = useRef(<div />);
    const firstSelectionRef = useRef(<div />);
    const selectionRef = useRef(<div />);
    const navigate = useNavigate()
    const [models, setModels] = useState([]);
    const [messageList, setMessageList] = useState([])
    const [currentModelFeatures, setCurrentModelFeatures] = useState("")
    const [jsonData, setJsonData] = useState({
        prompt: "",
        name: "",
        model: "baichuan2-13b-chat-v1",
        user_name: "",
        opening: "",
        search: false,
        top_k: 50,
        top_p: 0.8,
        temperature: 0.3,
        first_selection: [],
        selection: []
    })

    const [selection, setSelection] = useState([])
    const [firstSelection, setFirstSelection] = useState([])


    const read = useCallback(() => {
        return restore(flowId).then(res => {
            const flow = res.data.message.flow_json;
            if (flow) {
                setJsonData(flow);

            }
        });
    }, [flowId]);

    useEffect(() => {
        searchRef.current.checked = jsonData.search
        const model = models.filter((model) => {
            if (model.id === jsonData.model) {
                return model;
            }
        })[0]
        setSelection(jsonData.selection)
        setFirstSelection(jsonData.first_selection)
        if (model) {

            setCurrentModelFeatures(model.features)
        }
    }, [jsonData.first_selection, jsonData.model, jsonData.search, jsonData.selection, models]);

    useEffect(() => {
        getModels().then((res) => {
            setModels(res.data.filter((item) => {
                return item.type === "T2T";
            }));
        }).catch(() => {
            toast.error("无法连接至服务器");
        });
        read()

    }, [read]);


    const save = () => {
        let currentJson = {
            prompt: promptRef.current.value,
            name: nameRef.current.value,
            opening: openingRef.current.value,
            model: modelSelectRef.current.value,
            user_name: userNameRef.current.value,
            top_p: parseFloat(topPRef.current.value),
            top_k: parseFloat(topKRef.current.value),
            temperature: parseFloat(temperatureRef.current.value),
            search: searchRef.current.checked,
            selection: selection,
            first_selection: firstSelection
        }
        setJsonData(currentJson)
        toast.promise(axios.put(`/api/flow/${flowId}`, {
            json: currentJson
        }, {
            cache: {
                update: {
                    ["flow-" + flowId]: 'delete'
                }
            }
        }), {
            loading: "保存中", error: "保存错误", success: "保存成功"
        })
    }

    return (<div className="form-control h-screen w-screen">
        <div className="flex">
            <ul className="gap-2 menu menu-horizontal bg-base-100 shadow-2xl rounded-box">
                <li>
                    <a onClick={() => {
                        navigate(-1)
                    }} className="p-2"
                    ><ChevronLeft className="size-5" /></a>
                </li>

            </ul>
        </div>
        <div className=" py-4 flex h-full">
            <div className="group/details px-4 grow form-control ">
                <div ref={scrollRef}
                     className=" px-2 py-2 group-has-[.hidden:checked]/details:overflow-y-scroll overflow-y-clip gap-4 grow form-control">
                    <div className="flex gap-4">
                        <label className="label-text grow">
                            <div className="label">
                                <span className="flex gap-2 items-center label-text"> 机器人名字
                                <div className="tooltip tooltip-right tooltip-primary"
                                     data-tip="显示于聊天界面上。"
                                ><CircleHelp className="size-4" />
                                </div>
                        </span>
                            </div>
                            <input ref={nameRef}
                                   defaultValue={jsonData.name}
                                   className="input input-primary w-full border-2 rounded-xl"
                            />
                        </label>
                        <label className="label-text grow">
                            <div className="label">
                        <span className="flex gap-2 items-center label-text"> 模型
                        <div className="tooltip tooltip-bottom tooltip-primary"
                             data-tip="调用的大模型。">
                              <CircleHelp className="size-4" />
                            </div>
                        </span>
                            </div>
                            <select ref={modelSelectRef}
                                    onChange={(e) => {
                                        setCurrentModelFeatures(models.filter((model) => {
                                            if (model.id === e.target.value) {
                                                return model;
                                            }
                                        })[0].features)
                                    }}

                                    className="select select-primary w-full border-2 rounded-xl"
                            >
                                {models.map((item, index) => (<option key={index} selected={jsonData.model === item.id}
                                                                      value={item.id}>{item.name}</option>))}
                            </select>
                        </label>
                    </div>
                    <label className="label-text">
                        <div className="label">
                        <span className="flex gap-2 items-center label-text"> 提示词
                        <div className="tooltip tooltip-right before:max-w-32 lg:before:max-w-lg tooltip-primary"
                             data-tip="提示词用于对 AI 的回复做出一系列指令和约束。
                             这段提示词不会被用户所看到。"
                        ><CircleHelp className="size-4" />
                            </div>
                        </span>
                        </div>
                        <div className="relative">

                            <textarea ref={promptRef}
                                      defaultValue={jsonData.prompt}
                                      className={`${currentModelFeatures.includes("P") ? "" : "blur cursor-not-allowed"} textarea textarea-primary w-full h-32 border-2 rounded-xl `}
                                      readOnly={!currentModelFeatures.includes("P")}
                            >
                            </textarea>
                            {!currentModelFeatures.includes("P") && <div
                                className=" absolute z-auto pointer-events-none top-1/2 left-0 h-full w-full text-center text-error">
                                此模型未支持此特性
                            </div>}
                        </div>
                    </label>
                    <div>
                        <label onClick={() => {
                            let i = 0;
                            let currentScroll = scrollRef.current.scrollTop;
                            let interval = setInterval(() => {
                                scrollRef.current.scroll(0, i + currentScroll)
                                i += 5
                                if (i >= 500) {
                                    clearInterval(interval);
                                }
                            }, 1)
                        }}>
                            <input type="checkbox" className="hidden"></input>
                            <div className="cursor-pointer divider">
                                <div className="text-primary group-has-[.hidden:checked]/details:hidden">
                                    显示高级选项
                                </div>
                                <div className="text-secondary group-has-[.hidden:checked]/details:block hidden">
                                    隐藏高级选项
                                </div>
                                <ArrowDownCircle
                                    className="transition size-10 group-has-[.hidden:checked]/details:rotate-180 rotate-0" />
                            </div>
                        </label>
                        <div
                            className="relative bottom-64 group-has-[.hidden:checked]/details:bottom-0 opacity-0 group-has-[.hidden:checked]/details:opacity-100 max-h-0 group-has-[.hidden:checked]/details:max-h-none pointer-events-none group-has-[.hidden:checked]/details:pointer-events-auto duration-200 transition-all">
                            <div className="gap-2 form-control">
                                <div className="flex gap-4">
                                    <label className=" label-text grow">
                                        <div className="label">
                                        <span className="flex gap-2 items-center label-text"> 用户名字
                                            <div className="tooltip tooltip-right tooltip-primary"
                                                 data-tip="显示于聊天界面上。">
                                                    <CircleHelp className="size-4" />
                                            </div>
                                        </span>
                                        </div>
                                        <input
                                            ref={userNameRef}
                                            defaultValue={jsonData.user_name}
                                            className="input input-primary w-full border-2 rounded-xl"
                                        />
                                    </label>
                                    <label className=" label-text grow">
                                        <div className="label">
                                        <span className="flex gap-2 items-center label-text"> 搜索
                                            <div className="tooltip tooltip-left  tooltip-primary"
                                                 data-tip="让模型能够联网获得资料。">
                                                <CircleHelp className="size-4" />
                                            </div>
                                        </span>
                                        </div>
                                        <div className=" relative">
                                            <label
                                                className={` ${currentModelFeatures.includes("s") ? "cursor-pointer label" : "blur cursor-not-allowed"} `}
                                            >
                                                <span className="label-text">是否启用</span>
                                                <input ref={searchRef}
                                                       disabled={!currentModelFeatures.includes("s")} type="checkbox"
                                                       className="toggle toggle-primary" />
                                            </label>
                                            {!currentModelFeatures.includes("s") && <div
                                                className=" absolute z-auto pointer-events-none top-1/2 left-0 h-full w-full text-center text-error">
                                                此模型未支持此特性
                                            </div>}
                                        </div>
                                    </label>
                                </div>
                                <div className="flex gap-4">
                                    <label className="grow basis-auto label-text">
                                        <div className="label">
                                        <span className="flex gap-2 items-center label-text"> Temperature
                                            <div
                                                className="tooltip tooltip-top lg:tooltip-right before:max-w-40 lg:before:max-w-lg tooltip-primary"
                                                data-tip="用于控制模型回复的随机性和多样性。具体来说，temperature值控制了生成文本时对每个候选词的概率分布进行平滑的程度。较高的temperature值会降低概率分布的峰值，使得更多的低概率词被选择，生成结果更加多样化；而较低的temperature值则会增强概率分布的峰值，使得高概率词更容易被选择，生成结果更加确定。取值范围：[0, 2)，不建议取值为0。">
                                                <CircleHelp className="size-4" />
                                            </div>
                                        </span>
                                        </div>
                                        <div className="form-control relative">
                                            <label
                                                className={`${currentModelFeatures.includes("t") ? "cursor-pointer label" : "blur cursor-not-allowed"} `}
                                            >
                                                <input ref={temperatureRef}
                                                       defaultValue={jsonData.temperature}
                                                       disabled={!currentModelFeatures.includes("t")} type="number"
                                                       className="w-full input input-primary border-2 rounded-xl" />
                                            </label>
                                            {!currentModelFeatures.includes("t") && <div
                                                className=" absolute z-auto pointer-events-none top-1/2 left-0 h-full w-full text-center text-error">
                                                此模型未支持此特性
                                            </div>}
                                        </div>
                                    </label>
                                    <label className="grow basis-auto label-text">
                                        <div className="label">
                                        <span className="flex gap-2 items-center label-text"> Top P
                                            <div
                                                className="tooltip tooltip-top before:max-w-40 lg:before:max-w-lg tooltip-primary"
                                                data-tip="生成过程中的核采样方法概率阈值，例如，取值为0.8时，仅保留概率加起来大于等于0.8的最可能token的最小集合作为候选集。取值范围为（0,1.0)，取值越大，生成的随机性越高；取值越低，生成的确定性越高。">
                                                <CircleHelp className="size-4" />
                                            </div>
                                        </span>
                                        </div>
                                        <div className="form-control relative">
                                            <label
                                                className={` ${currentModelFeatures.includes("p") ? "cursor-pointer label" : "blur cursor-not-allowed"} `}
                                            >
                                                <input ref={topPRef}
                                                       defaultValue={jsonData.top_p}
                                                       disabled={!currentModelFeatures.includes("p")} type="number"
                                                       className="w-full input input-primary border-2 rounded-xl" />
                                            </label>
                                            {!currentModelFeatures.includes("p") && <div
                                                className=" absolute z-auto pointer-events-none top-1/2 left-0 h-full w-full text-center text-error">
                                                此模型未支持此特性
                                            </div>}
                                        </div>
                                    </label>
                                    <label className="grow basis-auto label-text">
                                        <div className="label">
                                        <span className="flex gap-2 items-center label-text"> Top K
                                            <div
                                                className="tooltip tooltip-left before:max-w-40 lg:before:max-w-lg tooltip-primary"
                                                data-tip="生成时，采样候选集的大小。例如，
                                                 取值为50时，仅将单次生成中得分最高的50个token组成随机采样的候选集。
                                                 取值越大，生成的随机性越高；取值越小，生成的确定性越高。
                                                 取值为None或当top_k大于100时，表示不启用top_k策略，
                                                 此时，仅有top_p策略生效。">
                                                <CircleHelp className="size-4" />
                                            </div>
                                        </span>
                                        </div>
                                        <div className="form-control relative">
                                            <label
                                                className={` ${currentModelFeatures.includes("k") ? "cursor-pointer label" : "blur cursor-not-allowed"} `}
                                            >
                                                <input ref={topKRef}
                                                       defaultValue={jsonData.top_k}
                                                       disabled={!currentModelFeatures.includes("k")} type="number"
                                                       className="w-full input input-primary border-2 rounded-xl" />
                                            </label>
                                            {!currentModelFeatures.includes("k") && <div
                                                className=" absolute z-auto pointer-events-none top-1/2 left-0 h-full w-full text-center text-error">
                                                此模型未支持此特性
                                            </div>}
                                        </div>
                                    </label>
                                </div>
                                <label className="label-text grow">
                                    <div className="label">
                                        <span className="flex gap-2 items-center label-text"> 开场白
                                            <div className="tooltip tooltip-top before:max-w-40 tooltip-primary"
                                                 data-tip="每次新建聊天时，机器人自动发送的文字。">
                                                    <CircleHelp className="size-4" />
                                            </div>
                                        </span>
                                    </div>
                                    <textarea ref={openingRef}
                                              defaultValue={jsonData.opening}
                                              className="textarea textarea-primary w-full h-32 border-2 rounded-xl"
                                    >
                                    </textarea>
                                </label>
                                <label className="label-text grow">
                                    <div className="label">
                                        <span className="flex gap-2 items-center label-text"> 第一次选择项
                                            <div className="tooltip tooltip-top before:max-w-40 tooltip-primary"
                                                 data-tip="聊天前，用户可以选择的选项。">
                                                    <CircleHelp className="size-4" />
                                            </div>
                                        </span>
                                    </div>
                                    <div className="form-control bg-base-300 rounded-2xl p-2 gap-3">
                                        <div ref={firstSelectionRef} className="gap-2 form-control">
                                            {firstSelection.length === 0 ? (
                                                <p>点击以下添加按钮添加一个选择项</p>
                                            ) : (
                                                firstSelection.map((item, index) => (
                                                    <div className=" flex gap-2" key={index}>
                                                        <input
                                                            className="w-full input input-primary input-bordered"
                                                            value={item}
                                                            onChange={(e) => {
                                                                const updatedSelection = firstSelection.map((item, i) => i === index ? e.target.value : item);
                                                                setFirstSelection(updatedSelection);
                                                            }}
                                                            type="text"
                                                        />
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation() // 不知道为什么会同时触发下面的添加
                                                                e.preventDefault()
                                                                const updatedSelection = firstSelection.filter((_, i) => i !== index);
                                                                setFirstSelection(updatedSelection);
                                                            }}
                                                            className="btn btn-square btn-error text-2xl"
                                                        >
                                                            <LucideX />
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        <button
                                            onClick={() => {
                                                setFirstSelection([...firstSelection, ''])
                                            }}
                                            className="btn btn-primary text-2xl"
                                        >
                                            +
                                        </button>
                                    </div>
                                </label>
                                <label className="label-text grow">
                                    <div className="label">
                                        <span className="flex gap-2 items-center label-text"> 选择项
                                            <div className="tooltip tooltip-top before:max-w-40 tooltip-primary"
                                                 data-tip="聊天时，用户可以选择的选项。">
                                                    <CircleHelp className="size-4" />
                                            </div>
                                        </span>
                                    </div>
                                    <div className="form-control bg-base-300 rounded-2xl p-2 gap-3">
                                        <div ref={selectionRef} className="gap-2 form-control">
                                            {selection.length === 0 ? (
                                                <p>点击以下添加按钮添加一个选择项</p>
                                            ) : (
                                                selection.map((item, index) => (
                                                    <div className=" flex gap-2" key={index}>
                                                        <input
                                                            className="w-full input input-primary input-bordered"
                                                            value={item}
                                                            onChange={(e) => {
                                                                const updatedSelection = selection.map((item, i) => i === index ? e.target.value : item);
                                                                setSelection(updatedSelection);
                                                            }}
                                                            type="text"
                                                        />
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                e.preventDefault()
                                                                const updatedSelection = selection.filter((_, i) => i !== index);
                                                                setSelection(updatedSelection);
                                                            }}
                                                            className="btn btn-square btn-error text-2xl"
                                                        >
                                                            <LucideX />
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        <button
                                            onClick={() => {
                                                setSelection([...selection, ''])
                                            }}
                                            className="btn btn-primary text-2xl"
                                        >
                                            +
                                        </button>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mb-16 flex self-end">
                    <div onClick={save} className="btn w-16 btn-primary">保存</div>
                </div>
            </div>
            <div className="pt-3 pb-10 grow form-control">
                <div className="h-full mockup-browser border bg-base-300">
                    <div className="mockup-browser-toolbar">
                        <div className="!flex !overflow-visible items-center input before:hidden after:hidden">
                            <Search
                                className="size-4 -ml-4 mt-0.5 mr-2" />
                            <Link target="_blank" to={window.location.href.replace("design/", "")}
                            >{window.location.href.replace("design/", "")}
                            </Link>
                            <div className="grow"></div>
                            <div className="group/share">
                                <div className="z-10 right-0 top-4 absolute hidden group-hover/share:block">
                                    <div className="card bg-base-100 w-96 shadow-xl">
                                        <div className="card-body">
                                            <h2 className="card-title">分享</h2>
                                            <p className="font-bold">复制链接</p>
                                            <div className="flex items-center">
                                                <input className="p-4 grow w-full border-base-300 border-2 rounded-xl"
                                                       type="text" readOnly
                                                       value={window.location.href.replace("design/", "")} />
                                                <div className="-ml-10 cursor-pointer">
                                                    <Clipboard onClick={() => {
                                                        toast.promise(navigator.clipboard.writeText(window.location.href.replace("design/", "")), {
                                                            success: "已复制到剪切板", error: "出现错误",

                                                        })


                                                    }} />
                                                </div>
                                            </div>
                                            <div className="divider"></div>
                                            <p className="font-bold">二维码</p>
                                            <QRCode
                                                size={100}
                                                value={window.location.href.replace("design/", "")}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <Share className="size-4 mt-0.5 mr-2" />
                            </div>
                        </div>
                    </div>
                    <div className="h-[calc(100vh-10rem)]">
                        <Chat json={jsonData} messageList={messageList} setMessageList={setMessageList} setTitle={() => {}}/>
                    </div>
                </div>
            </div>
        </div>
    </div>)
}