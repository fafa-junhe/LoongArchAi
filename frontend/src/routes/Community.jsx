import FlowList from "../components/FlowList.jsx";
import AppList from "../components/AppList.jsx";
import {axios} from "../Constrains.jsx";
import React, {useEffect, useState} from "react";

export default function Community() {
    const [flowList, setFlowList] = useState([])
    const [appList, setAppList] = useState([])

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
    return (
        <>
            <div className="p-3">
                <p className="pb-3">流程图</p>
                <FlowList flowList={flowList} />
            </div>
            <div className="p-3">
                <p className="pb-3">应用</p>
                <AppList appList={appList} />
            </div>
        </>
    )
}