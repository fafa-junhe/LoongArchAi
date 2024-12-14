import {useParams} from "react-router-dom";
import React, {useCallback, useContext, useEffect, useState} from "react";
import {axios} from "../Constrains.jsx";
import Avatar from "boring-avatars";
import Flows from "./Flows.jsx";
import FlowList from "../components/FlowList.jsx";
import {toast} from "react-hot-toast";
import {FrameContext} from "../Contexts.jsx";
import { SketchPicker } from 'react-color'

export default function User() {
    const {userId} = useParams()
    const [userInfo, setUserInfo] = useState({
        username: null,
        nickname: null,
        avatar: null
    })
    const [flowList, setFlowList] = useState(null)
    const {open, close, modalContent, setModalContent} = useContext(FrameContext)


    useEffect(() => {
        axios.get("/api/my_flows").then(response => {
            setFlowList(response.data.message);
        });
    }, []);
    useEffect(() => {
        axios.get(`/api/user/${userId}`)
            .then((res) => {
                    setUserInfo(res.data);
                }
            )
    }, [userId]);

    const onNickNameBlur = useCallback((e) => {
        toast.promise(
            axios.put(
                "/api/user",
                {
                    "nickname": e.target.value
                }
            ),{
                loading: "修改中",
                success: "成功修改",
                error: "发生错误"
            }
        )
    }, []);

    const changeAvatar = useCallback(() => {
        setModalContent(
            <div>
                <form>
                    <SketchPicker />
                </form>
            </div>
        )
        open()
    }, [])

    return (
        <div className="bg-base-100">
            <div className="bg-base-200">
                <div className=" rounded-t-2xl h-32 w-full bg-primary">
                </div>
            </div>
            <div className=" px-4 shadow-2xl -mt-12 py-5 items-center gap-4 flex">
                <div onClick={changeAvatar} className="hover:drop-shadow-2xl hover:scale-110 transition-all">
                    <Avatar
                        size={100}
                        name={"" + userInfo.username}
                        variant="beam"
                        colors={['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90']} // TODO change color
                    />
                </div>
                <div className="mt-4 w-full flex">
                    <div className="form-control grow">
                        <form onSubmit={(e) => {
                            e.preventDefault()
                        }}>
                            <input onBlur={onNickNameBlur} className="select-text bg-base-100"
                                   defaultValue={userInfo.nickname}/>
                        </form>
                        <span className="min-w-[26rem] select-text font-extralight">
                        {userInfo.username}
                            <span className="ml-8 font-light">
                                <span className="text-xl">231.3万<span className="text-sm ml-2 mr-4">粉丝</span>
                                    321<span className="text-sm ml-2 mr-4">关注</span>
                                    982.3万<span className="text-sm ml-2">获得的赞
                                </span></span>
                            </span>
                    </span>
                    </div>
                    <div onClick={(e)=>{
                        e.currentTarget.className += " btn-outline"
                        e.currentTarget.innerHTML = "已关注"
                    }} className="mr-4 btn btn-primary w-20">关注</div>
                </div>
            </div>
            <div className=" bg-base-100 h-8">
                <div role="tablist"
                     className="[&>:hover]:tab-active [&>:hover]:drop-shadow-2xl [&>input]:!border-b-2 [&>input]:shadow-primary [&>:hover]:!text-primary [&>:hover]:!border-b-primary tabs tabs-bordered">
                    <input defaultChecked="checked" type="radio" name="my_tabs_1" role="tab" className="tab"
                           aria-label="主页"/>
                    <input type="radio" name="my_tabs_1" role="tab" className="tab" aria-label="流程图"/>
                    <input type="radio" name="my_tabs_1" role="tab" className="tab" aria-label="应用"/>
                    <input type="radio" name="my_tabs_1" role="tab" className="tab" aria-label="点赞过的"/>
                </div>


            </div>
            <div className="shadow-inner h-8 bg-base-200"></div>
            <div className="bg-base-200">
                <div className="overflow-hidden rounded-2xl p-4 bg-base-100 w-full">
                    <div className="py-2 text-2xl">
                        流程图
                    </div>
                    <div className="divider"></div>
                    <FlowList flowList={flowList} isViewOnly={true}>

                    </FlowList>
                    <div className="py-4 mt-4 text-2xl">
                        应用
                    </div>
                    <div className="divider"></div>
                    <FlowList flowList={flowList} isViewOnly={true}>

                    </FlowList>
                </div>
            </div>
        </div>
    )
}