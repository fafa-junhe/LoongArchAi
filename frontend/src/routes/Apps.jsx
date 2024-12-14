import AppList from "../components/AppList.jsx";
import FlowList from "../components/FlowList.jsx";
import React, {useCallback, useEffect, useRef, useState} from "react";
import useContextMenu from "../hooks/useContextMenu.jsx";
import {Pencil} from "lucide-react";
import {axios} from "../Constrains.jsx";
import {toast} from "react-hot-toast";
import {useModal} from "react-hooks-use-modal";
import {AppContext} from "../Contexts.jsx";

export default function Apps() {
    const [onContextMenu, onMouseDownCapture, Menu, setContextMenuContent] = useContextMenu()
    const update = () => {
        axios.get("/api/my_apps", {
            id: "list-my-apps"
        }).then(response => {
            console.log(response.data);
            setAppList(response.data.message);
        });
    }
    const [appList, setAppList] = useState([]);
    const [Modal, open, close] = useModal('root', {
        preventScroll: true,
    });
    const nameInput = useRef();
    const descInput = useRef();
    const publicInput = useRef();

// Fetch flow list on component mount
    useEffect(() => {
        update();
    }, []);


    const createApp = useCallback(() => {
        toast.promise(axios.post("/api/app", {
                "name": nameInput.current.value,
                "desc": descInput.current.value,
                "public": publicInput.current.checked
            }, {
                cache: {
                    update: {
                        'list-my-apps': 'delete'
                    }
                }
            }),
            {
                loading: "创建中",
                success: "创建成功",
                error: "创建失败"
            }).then(() => {
            close();
            update();
        })
    }, [close])


    const onPageContextMenu = useCallback((e) => {
        e.stopPropagation()
        setContextMenuContent(
            <>
                <li>
                    <a onClick={open}><Pencil />创建</a>
                </li>
            </>
        )
        onContextMenu(e)
    }, [onContextMenu, open, setContextMenuContent]);
    return (
        <AppContext.Provider value={{update}}>
        <Modal>
                <div className="w-96 bg-base-100 rounded-3xl shadow p-8">
                    <h3 className=" font-bold text-lg">新建应用</h3>
                    <div className="gap-5 py-6 form-control">
                        <div>
                            <input ref={nameInput} type="text" placeholder="应用名称"
                                   className="input-bordered input w-full" />
                        </div>
                        <div>
                            <textarea ref={descInput} placeholder="应用描述"
                                      className="textarea-bordered h-32 textarea resize-none w-full"></textarea>
                        </div>
                        <div className="form-control">
                            <label className="label cursor-pointer">
                                <span className="label-text">是否公开</span>
                                <input ref={publicInput} name="public" type="checkbox" className="toggle"
                                       defaultChecked="false" />
                            </label>
                        </div>
                    </div>
                    <div className="modal-action">
                        <form method="dialog" className="flex gap-4">
                            <button className="btn">取消</button>
                            <button onClick={() => {
                                createApp()
                            }} className="btn btn-primary">创建
                            </button>
                        </form>
                    </div>
                </div>
            </Modal>
            <Menu></Menu>
            <div className="h-full" onContextMenu={onPageContextMenu} onMouseDownCapture={onMouseDownCapture}>
                <div className="py-5">
                    我的应用
                    <div className="float-right">
                        <a
                            onClick={open}
                            className="w-28 btn btn-primary"
                        >
                            {appList === null ? <span className="loading loading-spinner"></span> : <>创建应用</>}
                        </a>
                    </div>
                </div>
                <AppList appList={appList} onContextMenu={onContextMenu} setContextMenuContent={setContextMenuContent}
                />
            </div>
        </AppContext.Provider>
    )
}