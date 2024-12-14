import {useNavigate, useParams} from "react-router-dom";
import {
    Bot,
    Copy,
    Delete,
    LucideApple,
    LucideAppWindow,
    Plus,
    Scissors,
    Search,
    Settings,
    Workflow,
    GalleryThumbnails,
    Images,
    Moon
} from "lucide-react";
import useContextMenu from "../hooks/useContextMenu.jsx";
import React, {useEffect, useState} from "react";
import {useModal} from "react-hooks-use-modal";
import FlowList from "../components/FlowList.jsx";
import {axios} from "../Constrains.jsx";
import {toast} from "react-hot-toast";

function AppIcon({children, title}) {
    return (
        <div className="p-4 btn btn-ghost h-full items-center gap-4 form-control">
            <div className="text-primary-content p-4 rounded-full bg-primary">
                {children}
            </div>
            {title === "" ? "无标题" : title}
        </div>
    )
}

export default function App() {
    const {appId} = useParams();
    const [onContextMenu, onMouseDownCapture, Menu, setContextMenuContent] = useContextMenu()
    const [Modal, open, close] = useModal('root', {
        preventScroll: true,
    });
    const [selectFlow, setSelectFlow] = useState(-1)
    const [app, setApp] = useState({
        flows: []
    })
    useEffect(() => {
        setContextMenuContent(
            <div className="">
                <li>
                    <a onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        document.getElementById(`app-background-${appId}`).click()
                    }}><Images />设置背景
                    </a>
                </li>
                <li>
                    <a onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        document.getElementById(`app-img-${appId}`).click()
                    }}><GalleryThumbnails />设置封面
                    </a>
                </li>
                <li>
                    <a><Moon />
                        <input
                            onChange={

                                (e) => {
                                    console.log(app.app_theme);
                                    toast.promise(

                                        axios.put(`/api/app/${appId}`,
                                            {
                                                theme: app.app_theme === "dark" ? "light" : "dark"
                                            },
                                            {
                                                cache: {
                                                    update: {
                                                        'list-my-apps': 'delete',
                                                        'list-apps': 'delete',
                                                        [`app-${appId}`]: 'delete',
                                                    }
                                                }
                                            }
                                        ),
                                        {
                                            success: "修改成功",
                                            error: "修改失败",
                                            loading: "修改中"
                                        }
                                    ).then(() => {
                                        e.target.checked = !e.target.checked
                                        update();
                                    });
                                }
                            }
                            type="checkbox" className="toggle"
                            defaultChecked={app.app_theme === null ? true : app.app_theme === "dark"}
                        />
                    </a>
                </li>
            </div>);
    }, [setContextMenuContent, app, appId]);

    const onClick = () => {
        open()
    }
    const navigator = useNavigate()
    const [flowList, setFlowList] = useState([])
    const [searchText, setSearchText] = useState("")
    const [appImage, setAppImage] = useState("");
    const [appBackground, setAppBackground] = useState("");
    useEffect(() => {
        axios.get("/api/flows", {
            id: `list-flows`
        }).then((response) => {
            setFlowList(response.data.message)
        })
    }, []);
    const update = () => {
        axios.get(`/api/app/${appId}`, {
            id: `app-${appId}`
        })
        .then((response) => {
            console.log(response.data)
            setApp(response.data.message)
        })
    }
    useEffect(() => {
        update()
    }, []);
    const onFlowSelect = (e) => {
        setSelectFlow(parseInt(e.currentTarget.parentNode.dataset.id))// 拿到父节点的dataset为选中id

    }
    useEffect(() => {
        axios.get(`/api/app/${app.id}/thumbnail`, {
            id: `app-image-${app.id}`
        }).then(res => {
            setAppImage(res.data)
        }).catch(() => {
            setAppImage(undefined)
        });
        axios.get(`/api/app/${app.id}/background`, {
            id: `app-background-${app.id}`
        }).then(res => {
            setAppBackground(res.data)
        }).catch(() => {
            setAppBackground(undefined)
        });

    }, [app]);
    const selected = () => {
        if (selectFlow === -1){
            toast.error("未选择任何流程图")
            return;
        }
        console.log(app.flows)
        axios.put(`/api/app/${appId}`, {
            flows: [...app.flows.map((flow, index)=>(flow.id)), selectFlow]
        }, {
            cache: {
                update: {
                    ["app-" + appId]: "delete"
                }
            }
        }).then(()=>{
            close()
            update()
        })
    }

    return (
        <div style={{
            backgroundImage: `url(${appBackground})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundPosition: 'center',

        }} data-theme={app.app_theme === null ? "dark" : app.app_theme}>
            <input onChange={
                (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            const base64Data = reader.result;

                            toast.promise(
                                axios.put(`/api/app/${app.id}`,
                                    {
                                        img: base64Data
                                    },
                                    {
                                        cache: {
                                            update: {
                                                'list-my-apps': 'delete',
                                                'list-apps': 'delete',
                                                [`app-${app.id}`]: 'delete',
                                                [`app-image-${app.id}`]: 'delete'
                                            }
                                        }
                                    }
                                ),
                                {
                                    success: "修改成功",
                                    error: "修改失败",
                                    loading: "修改中"
                                }
                            ).then(() => {

                            });
                        };
                        reader.readAsDataURL(file);
                    }
                }
            } id={`app-img-${app.id}`} className="hidden" type="file" accept="image/*" />
            <input onChange={
                (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            const base64Data = reader.result;

                            toast.promise(
                                axios.put(`/api/app/${app.id}`,
                                    {
                                        background: base64Data
                                    },
                                    {
                                        cache: {
                                            update: {
                                                'list-my-apps': 'delete',
                                                'list-apps': 'delete',
                                                [`app-${app.id}`]: 'delete',
                                                [`app-image-${app.id}`]: 'delete'
                                            }
                                        }
                                    }
                                ),
                                {
                                    success: "修改成功",
                                    error: "修改失败",
                                    loading: "修改中"
                                }
                            ).then(() => {

                            });
                        };
                        reader.readAsDataURL(file);
                    }
                }
            } id={`app-background-${app.id}`} className="hidden" type="file" accept="image/*" />
            <Modal>
                <div className=" bg-base-100 rounded-3xl shadow p-8">
                    <h3 className=" font-bold text-lg">添加</h3>
                    <input className="opacity-0 pointer-events-none"></input>
                    <div className="p-7 flex gap-8 max-w-4xl h-72 overflow-y-auto">
                        <FlowList onClick={onFlowSelect} flowList={flowList} isClickable={false}
                                  isViewOnly={true}></FlowList>
                    </div>
                    <div className="modal-action">
                        <form method="dialog" className="flex gap-4">
                            <button onClick={() => {
                                close()
                                setSelectFlow(-1)
                            }} className="btn">取消
                            </button>
                            <button onClick={() => {
                                selected()
                            }} className="btn btn-primary">确定
                            </button>
                        </form>
                    </div>
                </div>
            </Modal>
            <Menu className="mr-4"></Menu>
            <div onMouseDownCapture={onMouseDownCapture} className="h-screen justify-center items-center flex w-full">
                <div className="absolute top-4 right-8">
                    <div onClick={onContextMenu} className="btn-circle btn btn-ghost">
                        <Settings />
                    </div>
                </div>
                <div className="group gap-8 form-control w-full items-center">
                    <div
                        className="overflow-hidden group-has-[:focus]:opacity-0 ease-out duration-100 btn-circle btn size-36">
                        {appImage &&
                            <div className="relative">
                                <img src={appImage} alt="app image" />
                            </div>
                        }
                        {
                            appImage === undefined && <LucideAppWindow className="size-24" />
                        }
                    </div>
                    <div className="text-xl font-extrabold group-has-[:focus]:opacity-0">
                        {app.app_name}
                    </div>
                    <span className="text-sm font-extralight group-has-[:focus]:opacity-0">
                        {app.app_desc}
                    </span>
                    <div
                        className="transition-all ease-out duration-300 has-[:focus]:-mt-64 gap-4 items-center px-4 flex max-w-[40rem] w-1/2 border-4 rounded-full">
                        <Search className="size-4" />
                        <input onChange={(e) => setSearchText(e.target.value)} type="text" placeholder="搜索"
                               className="bg-transparent w-full py-2 outline-none" />
                    </div>
                    <section
                        className="group-has-[:focus]:max-h-96 transition-[max-height] duration-500 max-h-64 ease-out overflow-y-auto min-w-96 flex flex-wrap w-1/3 justify-center gap-8">
                        {app.flows.filter((flow, index) => {
                            if (searchText === "" || searchText.includes(flow.flow_name)) {
                                return true
                            }
                        }).map((flow, index) => (
                            <div key={index} onClick={
                                () => {
                                    navigator(flow.flow_type === 0 ? `/chat/${flow.id}` : `/design/${flow.id}`)
                                }
                            }><AppIcon title={flow.flow_name}>
                                {
                                    flow.flow_type === 0 ?
                                        <><Bot /></>
                                        :
                                        <><Workflow /></>
                                }
                            </AppIcon>
                            </div>
                        ))}
                        <div onClick={onClick}>
                            <AppIcon title="添加功能">
                                <Plus />
                            </AppIcon>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}