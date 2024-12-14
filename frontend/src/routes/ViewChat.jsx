import Chat from "../components/Chat.jsx";
import {NavLink, Outlet, useNavigate, useParams} from "react-router-dom";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {getModels, restore, theme} from "../Constrains.jsx";
import {toast} from "react-hot-toast";
import Logo from "../components/Logo.jsx";
import {AppWindow, Earth, Edit, EllipsisIcon, Home, Menu, Package, Trash2, Workflow} from "lucide-react";
import {v4 as uuidv4} from 'uuid';
import {useModal} from "react-hooks-use-modal";
import storage from "../storage.jsx";

export default function ViewChat() {
    const renameInputRef = useRef(undefined);
    const {flowId} = useParams()
    const {chatId} = useParams()
    const [currentChat, setCurrentChat] = useState({})
    const navigator = useNavigate()
    const [messageList, setMessageList] = useState([])
    const [currentEditChatId, setCurrentEditChatId] = useState(undefined) // 当前重命名或者删除的弹窗
    const [RenameModal, openRenameModal, closeRenameModal] = useModal('root', {
        preventScroll: true,
    }); // 重命名弹窗
    const [DeleteModal, openDeleteModal, closeDeleteModal] = useModal('root', {
        preventScroll: true,
    }); // 删除弹窗

    const [flowData, setFlowData] = useState({
        flow_name: "", author: 0, flow_type: 0, id: 0, public: false, flow_desc: "", flow_json: {
            prompt: "",
            name: "",
            model: "",
            user_name: "",
            opening: "",
            search: false,
            top_k: 1,
            top_p: 0.8,
            temperature: 0.85
        }
    })
    useEffect(() => {
        if (chatId !== undefined) {
            const storedChat = storage.getItem(`chat-${flowId}-${chatId}`);
            console.log("Loaded chat from storage:", storedChat);
            setCurrentChat(JSON.parse(storedChat));
            if (JSON.parse(storedChat) === null) {
                navigator(`/chat/${flowId}`)
                return;
            }
            if (JSON.parse(storedChat).history !== undefined)
                setMessageList(JSON.parse(storedChat).history)
        }
    }, [chatId, flowId]); // 切换不同聊天或者对话的时候

    useEffect(() => {
        if (chatId !== undefined) {
            if (chatId === currentChat.id) {
                console.log("Saving currentChat to storage:", currentChat);
                storage.setItem(`chat-${flowId}-${chatId}`, JSON.stringify(currentChat));
            }

        }

    }, [chatId, currentChat, flowId]); // 当前聊天更改后，修改storage内的。

    useEffect(() => {
        console.log("messageList changed:", messageList);
        if (chatId !== undefined && chatId === currentChat.id) {
            setCurrentChat({
                ...currentChat,
                history: messageList
            });
        }
    }, [messageList]); // messageList更改后，同步history属性
    const read = useCallback(() => {
        return restore(flowId).then(res => {
            const flow = res.data.message;
            if (flow) {
                setFlowData(flow);
            }
        });
    }, [flowId]);
    const newChat = (initHistory = false) => {
        const uuid = uuidv4().replace(/-/g, ""); // 生成 uuid
        let newItem = {
            name: "对话 " + Object.keys(storage).filter((key) => {
                return key.startsWith(`chat-${flowId}-`) // 获取当前聊天个数
            }).length,
            id: uuid,
            history: initHistory ? [] : undefined
        }
        storage.setItem(`chat-${flowId}-${uuid}`, JSON.stringify(newItem))

        navigator(`/chat/${flowId}/${uuid}`)
        setCurrentChat(newItem)
        setMessageList([])
        // const items = { ...storage };
        // Object.keys(items).filter((key) => {
        //     if (key.startsWith(`chat-${flowId}`)){
        //
        //     }
        // })
    }
    const realRename = () => {
        let newItem = {
            ...JSON.parse(storage.getItem(`chat-${flowId}-${currentEditChatId}`)),
            name: renameInputRef.current.value
        }
        storage.setItem(`chat-${flowId}-${currentEditChatId}`, JSON.stringify(newItem))

        closeRenameModal()

    }
    const realDelete = () => {
        storage.removeItem(`chat-${flowId}-${currentEditChatId}`)
        if (currentEditChatId === chatId){
            navigator(`/chat/${flowId}`)
        }
        closeDeleteModal()
    }

    useEffect(() => {

        read()


    }, [flowId, read]);
    useEffect(() => {
        if (currentEditChatId !== undefined && renameInputRef.current !== undefined) {
            renameInputRef.current.value = JSON.parse(storage.getItem(`chat-${flowId}-${currentEditChatId}`)).name
        }   // 改重命名框内的值为要修改的聊天的名字
    }, [currentEditChatId, flowId, renameInputRef.current]);
    return (<div className={`w-screen drawer lg:drawer-open`}>
            <DeleteModal>
                <div className="bg-base-100 rounded-3xl shadow p-8">
                    <h3 className="font-bold text-xl">你确定要删除吗!</h3>
                    <p className="py-4 text-nowrap">请注意此操作无法恢复!</p>
                    <div className="modal-action">
                        <button onClick={closeDeleteModal} className="btn">取消</button>
                        <button onClick={realDelete} className="btn btn-error">删除</button>
                    </div>
                </div>
            </DeleteModal>
            <RenameModal>
                <div className="w-96 bg-base-100 rounded-3xl shadow p-8">
                    <h3 className=" font-bold text-lg">重命名</h3>
                    <div className="gap-5 py-6 form-control">
                        <div>
                            <input ref={renameInputRef}
                                   type="text" placeholder="对话名称"
                                   className="input-bordered input w-full" />
                        </div>
                    </div>
                    <div className="modal-action">
                        <form method="dialog" className="flex gap-4">
                            <button onClick={closeRenameModal} className="btn">取消</button>
                            <button onClick={realRename} className="btn btn-primary">修改</button>
                        </form>
                    </div>
                </div>
            </RenameModal>
            <input id="drawer" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content">
                <div className="navbar bg-base-100 border-b border-base-300 shadow-xl">
                    <div className="lg:hidden flex-1">
                        <label htmlFor="drawer" className="btn btn-ghost drawer-button lg:hidden"><Menu /></label>
                        <Logo name={flowData.flow_name} />
                    </div>
                    <div className="grow"></div>
                    <div className="flex-none gap-2">
                        <div className="dropdown dropdown-end">
                            <div tabIndex={0} role="button" className="btn m-1">
                                主题
                            </div>
                            <ul tabIndex={0}
                                className="bg-base-200 dropdown-content z-[1] p-2 shadow-2xl rounded-box w-52">
                                {Object.entries(theme).map((item, index) => {
                                    return (<li key={index}>
                                        <a type="radio" name="theme-dropdown"
                                           className=" btn btn-sm btn-block justify-start "
                                           data-set-theme={item[0]} data-act-class="!btn-primary">
                                            {item[1]}
                                        </a>
                                    </li>)
                                })}
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="overflow-auto bg-base-200 h-[calc(100vh-4rem)] p-4">
                    <div className="form-control items-center">
                        {(chatId === undefined || currentChat.history === undefined) &&

                            <div className="card w-96 bg-base-100 shadow-xl">
                                <div className="card-body">
                                    <h2 className="card-title">{flowData.flow_name}</h2>
                                    <p>{flowData.flow_desc}</p>
                                    <div className="card-actions justify-end">
                                        <button onClick={() => {
                                            if (Object.keys(currentChat).length === 0)
                                                newChat(true)
                                            setCurrentChat({
                                                ...currentChat,
                                                history: []
                                            })
                                        }} className="btn btn-primary">开始对话
                                        </button>
                                    </div>
                                </div>
                            </div>}
                        {(chatId !== undefined && currentChat.history !== undefined) &&
                            (
                                <div className="xl:w-4/5 h-[calc(100vh-8rem)] w-full">
                                    <Chat json={flowData.flow_json} setMessageList={setMessageList}
                                          messageList={messageList} setTitle={(str) => {
                                          setCurrentChat({
                                              ...currentChat,
                                              name: str
                                          })

                                    }}/>
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>
            <div className="shadow-2xl drawer-side">
                <label htmlFor="drawer" className="drawer-overlay"></label>
                <div className="bg-base-100 min-h-full form-control">
                    <ul className=" grow gap-1 menu p-4 w-64 min-h-full">
                        <div className="form-control mb-5">
                            <div className="flex">
                                <Logo name={flowData.flow_name} />
                            </div>
                        </div>
                        <li>
                            <a onClick={() => {
                                newChat()
                            }}
                               className="border border-base-300 shadow-md"><Edit
                                className="stroke-primary" />新建对话
                            </a>
                        </li>
                        <div className="divider"></div>
                        {
                            Object.keys(storage)
                                .filter((key) => key.startsWith(`chat-${flowId}-`))
                                .map((item) => JSON.parse(storage.getItem(item)))
                                .sort((a, b) => {
                                    if (a.name > b.name) return 1;
                                    if (a.name < b.name) return -1;
                                    return 0;
                                })
                                .map((item, key) => (
                                        <li key={key}>
                                            <NavLink to={`/chat/${flowId}/${item.id}`} className="flex">
                                                {item.name}
                                                <div className="grow "></div>
                                                <div className="group/more">
                                                    <div className="btn btn-square btn-xs ">
                                                        <EllipsisIcon className="size-5" />
                                                    </div>
                                                    <div className="group-hover/more:block hidden">
                                                        <ul className="text-base-content z-10 bg-base-200 right-0 top-8 absolute menu">
                                                            <li>
                                                                <div onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    e.preventDefault()
                                                                    setCurrentEditChatId(item.id)
                                                                    openRenameModal()
                                                                }}>重命名
                                                                </div>
                                                            </li>
                                                            <li>
                                                                <div onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    e.preventDefault()
                                                                    setCurrentEditChatId(item.id)
                                                                    openDeleteModal()
                                                                }} className="text-error">移除
                                                                </div>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </NavLink>
                                        </li>
                                    )
                                )
                        }
                    </ul>
                </div>
            </div>
        </div>
        // <div className="drawer lg:drawer-open">
        //     <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
        //     <div className="drawer-content flex flex-col items-center justify-center">

        //         <label htmlFor="my-drawer-2" className="btn btn-primary drawer-button lg:hidden">Open drawer</label>
        //     </div>
        //     <div className="drawer-side">
        //         <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay"></label>
        //         <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
        //             <li>
        //                 <a>Sidebar Item 1</a>
        //             </li>
        //             <li>
        //                 <a>Sidebar Item 2</a>
        //             </li>
        //         </ul>
        //     </div>
        // </div>

    )
}