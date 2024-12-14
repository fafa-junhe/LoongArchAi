import FlowList from "../components/FlowList.jsx";
import React, {useCallback, useContext, useEffect, useRef, useState} from "react";
import {axios} from "../Constrains.jsx";
import {Link, useNavigate} from "react-router-dom";
import {toast} from "react-hot-toast";
import useContextMenu from "../hooks/useContextMenu.jsx";
import {BadgeInfo, Bot, GalleryThumbnails, Pencil, Play, Share, TextCursorInput, Trash2, Workflow} from "lucide-react";
import {FlowContext, FrameContext} from "../Contexts.jsx";
import {useCookies} from "react-cookie";
import useTokenStore from "../states/state.js";
import {useModal} from "react-hooks-use-modal";

export default function Flows() {
    const navigate = useNavigate();
    const [flowList, setFlowList] = useState(null)
    const {openLoginModal} = useContext(FrameContext);
    const { user} = useTokenStore();



    const [Modal, open, close] = useModal('root', {
        preventScroll: true,
    });
    const nameInput = useRef();
    const descInput = useRef();
    const publicInput = useRef();
    const chatTypeInput = useRef(<input type="radio"/>);
    const [onContextMenu, onMouseDownCapture, Menu, setContextMenuContent] = useContextMenu()

    const [chatType, setChatType] = useState(true)


    const onPageContextMenu = useCallback((e) => {
        e.stopPropagation()
        setContextMenuContent(
            <>
                <li><a onClick={open}><Pencil/>创建</a></li>
            </>
        )
        onContextMenu(e)
    }, [onContextMenu, open, setContextMenuContent]);

    const createAFlow = useCallback(() => {
        if (user.id == null){
            openLoginModal();
            return;
        }
        axios.post(
            "/api/flow", {
                name: nameInput.current.value !== "" ? nameInput.current.value : nameInput.current.placeholder,
                desc: descInput.current.value,
                public: publicInput.current.checked,
                flow_type: chatTypeInput.current.checked ? 0 : 1
            },{
                cache: {
                    update: {
                        'list-my-flows': 'delete',
                        'list-flows': 'delete'

                    }
                }
            }
        )
        .then((res) => {
            toast.success("创建成功")
            if (chatTypeInput.current.checked){
                navigate("/design/chat/" + res.data["flow_id"])
                return;
            }
            navigate("/design/" + res.data["flow_id"])
        })
    }, [openLoginModal, navigate, user.id]);

    const update = useCallback(() => {
        if (user.id === null){
            openLoginModal()
            return;
        }
        axios.get("/api/my_flows",
            {
                id: "list-my-flows"
            }).then(response => {
            setFlowList(response.data.message);
        });
    }, [openLoginModal, user.id])
    useEffect(() => {
        update()
    }, [openLoginModal, update, user.id]);
    return (
        <FlowContext.Provider value={{update}}>
            <Modal>
                <div className=" bg-base-100 rounded-3xl shadow p-8">

                    <h3 className=" font-bold text-lg">新建功能</h3>
                    <div className="flex gap-8">

                        <div className="gap-5 py-6 w-full form-control">
                            <div className="flex gap-8">
                                <div className="form-control gap-2 items-center">
                                    <div className="tooltip" data-tip="填写提示词，即可完成一个聊天app。">

                                        <label htmlFor="chat_type" className="form-control w-32 h-24 btn text-success">
                                            <Bot/>
                                            对话
                                        </label>
                                    </div>
                                    <input onClick={() => {setChatType(true)}} ref={chatTypeInput} id="chat_type" type="radio" name="flow_type" className="radio" defaultChecked="true"/>
                                </div>
                                <div className="form-control gap-2 items-center">
                                    <div className="tooltip" data-tip="使用流程图的形式，自定义程度高。">

                                        <label htmlFor="flow_type" className="form-control w-32 h-24 btn text-primary">
                                            <Workflow/>
                                            流程图
                                        </label>
                                    </div>

                                    <input onClick={() => {setChatType(false)}} id="flow_type" type="radio" name="flow_type" className="radio"/>
                                </div>

                            </div>
                            <div>
                                <input ref={nameInput} type="text" placeholder={
                                    chatType ? "新建对话" : "新建流程图"
                                }
                                       className="input-bordered input w-full"/>
                            </div>
                            <div>
                                <textarea ref={descInput} placeholder={
                                    chatType ? "对话描述" : "新建描述"
                                }
                                          className="textarea-bordered h-32 textarea resize-none w-full"></textarea>
                            </div>
                            <div className="form-control">
                                <label className="label cursor-pointer">
                                    <span className="label-text">是否公开</span>
                                    <input ref={publicInput} name="public" type="checkbox" className="toggle"
                                           defaultChecked="false"/>
                                </label>
                            </div>
                        </div>

                    </div>
                    <div className="modal-action">
                        <form method="dialog" className="flex gap-4">
                            <button className="btn">取消</button>
                            <button onClick={() => {
                                createAFlow()
                            }} className="btn btn-primary">创建
                            </button>
                        </form>
                    </div>
                </div>
            </Modal>
            <Menu></Menu>

            <div className="h-full" onContextMenu={onPageContextMenu} onMouseDownCapture={onMouseDownCapture}>
                <div className="py-5">
                    我的功能
                    <div className="float-right">
                        <a
                            onClick={open}
                            className="w-28 btn btn-primary"
                        >
                            {flowList === null ? <span className="loading loading-spinner"></span> : <>新建功能</>}
                        </a>
                    </div>
                </div>
                <FlowList onContextMenu={onContextMenu} setContextMenuContent={setContextMenuContent}
                          flowList={flowList}/>
            </div>
        </FlowContext.Provider>
    );
}