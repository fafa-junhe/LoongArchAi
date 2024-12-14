import {useEffect, useState} from "react";
import {getModels} from "../Constrains.jsx";
import {toast} from "react-hot-toast";

export default function Models() {
    const [models, setModels] = useState([])
    useEffect(() => {
        getModels().then((res) => {
            setModels(res.data);
        }).catch(() => {
            toast.error("无法连接至服务器");
        });

    }, []);
    return (
        <div className="overflow-x-auto">
            <table className="table">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>名字</th>
                    <th>描述</th>
                    <th>类型</th>
                </tr>
                </thead>
                <tbody>
                {models.map((model) => {
                    return (
                        <tr key={model.id}>
                            <td>{model.id}</td>
                            <td>{model.name}</td>
                            <td>{model.desc}</td>
                            <td>{model.type}</td>

                        </tr>
                    )
                })}
                </tbody>
                <tfoot>
                <tr>
                    <th>ID</th>
                    <th>名字</th>
                    <th>描述</th>
                    <th>类型</th>
                </tr>
                </tfoot>

            </table>
        </div>
    )
}