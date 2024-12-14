import {Link, useNavigate} from "react-router-dom";
import {
    BadgeInfo,
    CirclePlay,
    CircleUser,
    GalleryThumbnails,
    LucideAppWindow,
    Pencil,
    Play,
    Share,
    TextCursorInput, Trash2,
    Workflow
} from "lucide-react";
import React, {useEffect, useState, useContext, useRef} from "react";
import {axios, timeDifference} from "../Constrains.jsx";
import PropTypes from "prop-types";
import {useModal} from "react-hooks-use-modal";

import {toast} from "react-hot-toast";
import {AppContext, FlowContext} from "../Contexts.jsx";

export default function AppPreview({app, index, onContextMenu, setContextMenuContent}) {
    AppPreview.propTypes = {
        app: PropTypes.shape({
            id: PropTypes.number.isRequired,
            author: PropTypes.number.isRequired,
            app_name: PropTypes.string.isRequired,
            app_desc: PropTypes.string.isRequired,
            update_time: PropTypes.string.isRequired,
            public: PropTypes.bool.isRequired
        }),
        index: PropTypes.number.isRequired,
        onContextMenu: PropTypes.func.isRequired,
        setContextMenuContent: PropTypes.func.isRequired,
    }
    const [appImage, setAppImage] = useState("");
    const navigate = useNavigate()
    const [nickname, setNickname] = useState("")
    const nameInput = useRef();
    const descInput = useRef();
    const publicInput = useRef();
    const [DeleteModal, openDeleteModal, closeDeleteModal] = useModal('root', {
        preventScroll: true,
    });
    const [EditModal, openEditModal, closeEditModal] = useModal('root', {
        preventScroll: true,
    });
    const {update} = useContext(AppContext)

    useEffect(() => {
        axios.get(`/api/app/${app.id}/thumbnail`, {
            id: `app-image-${app.id}`
        }).then(res => {
            setAppImage(res.data)
        }).catch(() => {
            setAppImage(undefined)
        });

        axios.get(`/api/user/${app.author}`).then((res) => {
            setNickname(res.data.nickname)
        })
    }, [app, index]);

    const realEdit = () => {
        toast.promise(axios.put(`/api/app/${app["id"]}`,
                {
                    name: nameInput.current.value,
                    desc: descInput.current.value,
                    public: publicInput.current.checked
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
                }),
            {
                success: "修改成功",
                error: "修改失败",
                loading: "修改中"
            }).then(() => {
                closeEditModal()
                update();
        });
    }

    const realDelete = () => {
        toast.promise(axios.delete(`/api/app/${app["id"]}`,
                {
                    cache: {
                        update: {
                            'list-my-apps': 'delete',
                            'list-apps': 'delete',
                            ['app-' + app.id]: 'delete',
                            ['app-image-' + app.id]: 'delete'

                        }
                    }
                }),
            {
                success: "删除成功",
                error: "删除失败",
                loading: "删除中"
            }).then(() => {
            closeDeleteModal();
            update();

        });
    };


    const onPreviewContextMenu = (e) => {
        e.stopPropagation()
        setContextMenuContent(
            <div className="[&>svg]:size-6">
                <li>
                    <a onClick={() => toast.success("已复制到剪贴板")}><Share />分享</a>
                </li>
                <div className="divider"></div>
                <li>
                    <a onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        document.getElementById(`app-file-${app.id}`).click()
                    }}><GalleryThumbnails />设置封面
                    </a>
                </li>
                <li>
                    <a onClick={openEditModal}><TextCursorInput />重命名</a>
                </li>
                <li>
                    <a><BadgeInfo />详细消息</a>
                </li>
                <div className="divider"></div>
                <li>
                    <a className="text-error" onClick={openDeleteModal}><Trash2 />删除</a>
                </li>
            </div>
        )
        onContextMenu(e)
    }

    return (
        <div>
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
            <EditModal>
                <div className="w-96 bg-base-100 rounded-3xl shadow p-8">
                    <h3 className=" font-bold text-lg">修改名称</h3>
                    <div className="gap-5 py-6 form-control">
                        <div>
                            <input defaultValue={app["app_name"]} ref={nameInput} type="text" placeholder="应用名称"
                                   className="input-bordered input w-full" />
                        </div>
                        <div>
                        <textarea defaultValue={app["app_desc"]} ref={descInput} placeholder="应用描述"
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
                            <button onClick={closeEditModal} className="btn">取消</button>
                            <button onClick={() => {
                                realEdit()
                            }} className="btn btn-primary">修改
                            </button>
                        </form>
                    </div>
                </div>
            </EditModal>
            <input onChange={
                (e) => {
                    const file = e.target.files[0];
                    console.log(file)
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
                                update();
                            });
                        };
                        reader.readAsDataURL(file);
                    }
                }
            } id={`app-file-${app.id}`} className="hidden" type="file" accept="image/*" />
            <a onClick={() => navigate(`/app/${app.id}`)} key={index}
               onContextMenu={onPreviewContextMenu}
               className=" cursor-pointer border-base-300 border-2 card hover:shadow-2xl transform hover:scale-105 focus:shadow-2xl focus:scale-105 focus:shadow-primary transition shadow-xl">
                <figure className={appImage === "" ? "skeleton" : ""}>
                    <div className="w-48 h-28">
                        {appImage && <div className="relative">
                            <img src={appImage} alt="app image" />
                        </div>}
                        {appImage === undefined &&
                            <div className="bg-gray-100 h-full flex justify-center items-center">
                                <div className="relative size-20">
                                    <LucideAppWindow className="size-20 stroke-primary" />
                                </div>
                            </div>
                        }
                    </div>
                </figure>
                <div className="form-control p-4 w-48">
                    <h2 className="font-bold text-xl overflow-hidden text-ellipsis">{app.app_name === "" ? "无标题" : app.app_name}</h2>
                    <p className="h-12 font-light break-words line-clamp-2">{app.app_desc === "" ? "暂无描述" : app.app_desc}</p>
                    <div className="my-2 flex">
                        <div className="badge badge-neutral gap-2">
                            {app.public ? "公开" : "私有"}
                        </div>
                    </div>
                    <div className="flex">
                    <span
                        className="grow text-sm font-extralight">{timeDifference(new Date(), new Date(app.update_time))} 修改</span>
                        <a onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            navigate(`/user/${app.author}`)
                        }} className="gap-1 text-sm font-extralight flex items-center">
                            <CircleUser className="stroke-1 size-4" />
                            {nickname}
                        </a>
                    </div>
                </div>
            </a>
        </div>
    )
}