import Design from "./Design.jsx";
import React, {useEffect, useState} from "react";
import SidePanel from "../components/SidePanel.jsx";
import FlowList from "../components/FlowList.jsx";
import {User, Menu, Search} from "lucide-react"
import Logo from "../components/Logo.jsx";
import QuickStart from "../components/QuickStart.jsx";
import {axios} from "../Constrains.jsx";
import AppList from "../components/AppList.jsx";
import useTokenStore from "../states/state.js";

export default function Home() {
    const [flowList, setFlowList] = useState([])
    const [appList, setAppList] = useState([])
    const {accessToken, setTokens, clearTokens, user, setUser} = useTokenStore();

    useEffect(() => {
        axios.get("/api/flows", {}, {
            id: 'list-flows'
        }).then((response) => {
            setFlowList(response.data.message)
        })
        axios.get("/api/apps", {}, {
            id: 'list-apps'
        }).then((response) => {
            setAppList(response.data.message)
        })
    }, []);
    const getGreeting = () => {
        const now = new Date();
        const hours = now.getHours();
        let greeting;

        if (hours < 12 && hours > 6) {
            greeting = "早上好";
        } else if (hours < 18) {
            greeting = "下午好";
        } else if (hours < 22){
            greeting = "晚上好";
        } else {
            greeting = "深夜了"
        }

        return greeting;
    }

    return (
        <>
            {/*<div className="border bg-primary/25 rounded-2xl">*/}
            {/*    <div className="form-control justify-center px-4 py-16">*/}
            {/*        <div className="h-10 input">*/}
            {/*            <div className="flex gap-4 text-gray-400 relative left-0 top-2">*/}
            {/*                <Search className="size-6"/>*/}
            {/*                搜索*/}
            {/*            </div>*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*</div>*/}
            <div className="text-xl pt-5 font-extrabold">
                {
                    getGreeting()
                //     if (hours < 12) {
                //     greeting = "Good morning!";
                // } else if (hours < 18) {
                //     greeting = "Good afternoon!";
                // } else {
                //     greeting = "Good evening!";
                // }
                }，{user.nickname}
            </div>
            <div className="opacity-60 mt-2 mb-5 text-sm">开始今天的创作吧！</div>
            <div className="divider"></div>

            <h3 className="py-5 ">
                快速开始
            </h3>
            <QuickStart />
            <h3 className="py-5 ">
                最近打开
            </h3>
            <div className="p-3">
                <p className="pb-3">流程图</p>
                <FlowList flowList={flowList} />
            </div>
            <div className="p-3">
                <p className="pb-3">应用</p>
                <AppList appList={appList}/>
            </div>
        </>
    );
}