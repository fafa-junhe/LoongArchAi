import {Link, useNavigate} from "react-router-dom";
import {
    Ellipsis,
    Pencil,
    Play,
    Share,
    GalleryThumbnails,
    TextCursorInput,
    BadgeInfo,
    Trash2,
    Images, Workflow, CircleUser, LucideBotMessageSquare
} from "lucide-react";
import React, {useCallback, useContext, useEffect, useRef, useState} from "react";
import {axios, timeDifference} from "../Constrains.jsx";
import PropTypes from "prop-types";
import {FlowContext, FrameContext} from "../Contexts.jsx";
import useTokenStore from "../states/state.js";
import {useModal} from "react-hooks-use-modal";
import {toast} from "react-hot-toast";


export default function FlowPreview({
                                        flow,
                                        index,
                                        onContextMenu,
                                        setContextMenuContent,
                                        isViewOnly,
                                        isClickable,
                                        onClick
                                    }) {
    FlowPreview.propTypes = {
        flow: PropTypes.shape({
            id: PropTypes.number.isRequired,
            author: PropTypes.number.isRequired,
            flow_type: PropTypes.number.isRequired,
            flow_name: PropTypes.string.isRequired,
            flow_desc: PropTypes.string.isRequired,
            public: PropTypes.bool.isRequired,
            update_time: PropTypes.string.isRequired
        }),
        index: PropTypes.number.isRequired,
        onContextMenu: PropTypes.func,
        setContextMenuContent: PropTypes.func,
        isViewOnly: PropTypes.bool,
        isClickable: PropTypes.bool,
        onClick: PropTypes.func
    }
    const [flowImage, setFlowImage] = useState("");
    const {openLoginModal} = useContext(FrameContext)
    const {user} = useTokenStore();
    const [nickname, setNickname] = useState("")
    const navigate = useNavigate()
    const [DeleteModal, openDeleteModal, closeDeleteModal] = useModal('root', {
        preventScroll: true,
    });
    const [EditModal, openEditModal, closeEditModal] = useModal('root', {
        preventScroll: true,
    });
    const nameInput = useRef();
    const descInput = useRef();
    const publicInput = useRef();

    const {update} = useContext(FlowContext)

    useEffect(() => {
        axios.get(`/api/flow/${flow.id}/thumbnail`, {
            id: `flow-image-${flow.id}`
        }).then(res => {
            setFlowImage(res.data)
        }).catch(() => {
            setFlowImage(undefined)
        });
        axios.get(`/api/user/${flow.author}`).then((res) => {
            setNickname(res.data.nickname)
        })
    }, [flow, index]);
    const realEdit = useCallback(() => {
        toast.promise(axios.put(`/api/flow/${flow["id"]}`,
                {
                    name: nameInput.current.value,
                    desc: descInput.current.value,
                    public: publicInput.current.checked
                },
                {
                    cache: {
                        update: {
                            'list-my-flows': 'delete',
                            'list-flows': 'delete',
                            [`flow-${flow.id}`]: 'delete',
                            [`flow-image-${flow.id}`]: 'delete'
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
    }, [closeEditModal, flow, update])

    const realDelete = useCallback(() => {
        toast.promise(axios.delete(`/api/flow/${flow["id"]}`,
                {
                    cache: {
                        update: {
                            'list-my-flows': 'delete',
                            'list-flows': 'delete',
                            ['flow-' + flow.id]: 'delete',
                            ['flow-image-' + flow.id]: 'delete'

                        }
                    }
                }),
            {
                success: "删除成功",
                error: "删除失败",
                loading: "删除中"
            }).then(() => {
            update();
            closeDeleteModal();

        });
    }, [closeDeleteModal, flow, update])


    const onPreviewContextMenu = (e) => {
        e.stopPropagation()
        setContextMenuContent(
            <div className="[&>svg]:size-6">
                <li>
                    <a onClick={() => navigateToDesign(flow["id"])}><Pencil />编辑</a>
                </li>
                <li>
                    <a onClick={() => navigateToView(flow["id"])}><Play />预览</a>
                </li>
                <li>
                    <a onClick={() => toast.success("已复制到剪贴板")}><Share />分享</a>
                </li>
                <div className="divider"></div>
                <li>

                    <a onClick={()=>{
                        document.getElementById(`flow-file-${flow.id}`).click()
                    }}><GalleryThumbnails />设置封面</a>
                </li>
                <li>
                    <a onClick={openEditModal}><TextCursorInput />重命名</a>
                </li>
                <li>
                    <a onClick={openEditModal}><BadgeInfo />详细消息</a>
                </li>
                <div className="divider"></div>
                <li>
                    <a className="text-error" onClick={openDeleteModal}><Trash2 />删除</a>
                </li>
            </div>
        )
        onContextMenu(e)
    }
    const navigateToDesign = (id, e) => {
        if (!isClickable) {
            onClick(e);
            return;
        }
        if (user.id === null) {
            openLoginModal()
            return;
        }
        if (flow.flow_type === 0) {
            navigate(`/design/chat/${id}`)
            return;
        }
        navigate(`/design/${id}`)
    }
    const navigateToView = (id, e) => {
        if (!isClickable) {
            onClick(e);
            return;
        }
        if (user.id === null) {
            openLoginModal()
            return;
        }
        if (flow.flow_type === 0) {
            navigate(`/chat/${id}`)
            return;
        }
        navigate(`/view/${id}`)
    }


    return (
        <div>
            <input onChange={
                (e) => {
                    const file = e.target.files[0];
                    console.log(file)
                    if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            const base64Data = reader.result;

                            toast.promise(
                                axios.put(`/api/flow/${flow["id"]}`,
                                    {img: base64Data},
                                    {
                                        cache: {
                                            update: {
                                                'list-my-flows': 'delete',
                                                'list-flows': 'delete',
                                                [`flow-${flow.id}`]: 'delete',
                                                [`flow-image-${flow.id}`]: 'delete'
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
            } id={`flow-file-${flow.id}`} className="hidden" type="file" accept="image/*" />
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
                            <input defaultValue={flow["flow_name"]} ref={nameInput} type="text" placeholder="流程图名称"
                                   className="input-bordered input w-full" />
                        </div>
                        <div>
                        <textarea defaultValue={flow["flow_desc"]} ref={descInput} placeholder="流程图描述"
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
            <div key={index}
                 tabIndex={0}
                 className="overflow-hidden cursor-pointer group border-base-300 border-2 card hover:shadow-2xl transform  focus:shadow-2xl focus:scale-105 focus:shadow-primary transition shadow-xl"
                 onContextMenu={onPreviewContextMenu}
            >
                <div data-id={flow.id}>
                    <figure onClick={(e) => navigateToDesign(flow.id, e)}
                            className={flowImage === "" ? "skeleton" : ""}>
                        <div className="w-48 h-28">
                            {flowImage && <div className="relative">
                                <img src={flowImage} alt="flow image" />
                            </div>}
                            {flowImage === undefined &&
                                <div className="bg-gray-100 h-full flex justify-center items-center">
                                    <div className="relative size-20">
                                        {
                                            flow.flow_type === 1 ?
                                                <Workflow className="size-20 stroke-primary" /> :
                                                <LucideBotMessageSquare className="size-20 stroke-primary" />
                                        }
                                    </div>
                                </div>
                            }
                        </div>
                    </figure>
                    {!isViewOnly &&
                        <div
                            className="z-10 flex px-4 w-full absolute top-4 invisible group-hover:visible has-[:checked]:visible">
                            <input className="checkbox size-4 rounded" type="checkbox" />
                            <div className="grow">
                            </div>
                            <div
                                className="cursor-pointer group-hover:!visible group-has-[:checked]:invisible flex shadow -mt-1 justify-center items-center size-6 rounded border bg-base-100"
                                onClick={onPreviewContextMenu}
                            >
                                <Ellipsis className="size-4 stroke-base-content/50" />
                            </div>
                        </div>
                    }
                    <div onClick={(e) => navigateToDesign(flow.id, e)} className="form-control p-4 w-48">
                        <h2 className="font-bold text-xl overflow-hidden text-ellipsis">{flow.flow_name === "" ? "无标题" : flow.flow_name}</h2>
                        <p className="h-12 font-light break-words line-clamp-2">{flow.flow_desc === "" ? "暂无描述" : flow.flow_desc}</p>
                        <div className="my-2 flex gap-2">
                            <div className="badge badge-neutral gap-2">
                                {flow.public ? "公开" : "私有"}
                            </div>
                            <div className="badge badge-primary gap-2">
                                {flow.flow_type === 0 ? "对话" : "流程图"}
                            </div>
                        </div>
                        <div className="flex">
                            <span
                                className="grow text-sm font-extralight">{timeDifference(new Date(), new Date(flow.update_time))} 修改</span>
                            <a
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    navigate(`/user/${flow.author}`)
                                }}
                                className="gap-1 text-sm font-extralight flex items-center">
                                <CircleUser className="stroke-1 size-4" />
                                {nickname}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}