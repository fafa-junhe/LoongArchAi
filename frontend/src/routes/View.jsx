import React, {useEffect, useState} from "react";
import {getModels, nodeTypes, restore, runTest} from "../Constrains.jsx";
import {ModelsContext} from "../Contexts.jsx"
import {useParams} from "react-router-dom";

export default function View() {
    const [json, setJson] = useState({
        nodes: []
    });
    const {flowId} = useParams();
    const [models, setModels] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const fetchedModels = await getModels();
            setModels(fetchedModels.data);
        };
        fetchData();
        console.log(flowId)
        restore(flowId).then((res) => {
            console.log(res.data.message)
            setJson(res.data.message.flow_json);
        });
    }, []);

    const setNode = (newNode) => {
        setJson({
            ...json, nodes: newNode(json.nodes)
        })
    };
    return (

        <ModelsContext.Provider value={models}>
            <div className="py-5 items-center flex">
                <p className="grow">预览</p>
                <button
                    className="w-32 btn btn-primary"
                    onClick={() => {
                        runTest(json, setNode, () => {
                        });
                    }}
                >
                    运行
                </button>
            </div>

            <div className="form-control">
                <table className="w-full table-fixed align-top">
                    <thead>
                    <tr>
                        <th>输入列</th>
                        <th>输出列</th>
                    </tr>
                    </thead>
                    <tbody>
                    {(() => {
                        // 收集输入和输出节点
                        const inputNodes = json.nodes.filter((item) => item.type.endsWith("Input"));
                        const outputNodes = json.nodes.filter((item) => item.type.endsWith("Output"));

                        // 确定最长的集合长度
                        const maxLength = Math.max(inputNodes.length, outputNodes.length);

                        // 创建表格行
                        const rows = [];
                        for (let i = 0; i < maxLength; i++) {
                            const inputItem = inputNodes[i];
                            const outputItem = outputNodes[i];

                            const NodeComponentInput = inputItem && nodeTypes[inputItem.type];
                            const NodeComponentOutput = outputItem && nodeTypes[outputItem.type];

                            rows.push(
                                <tr key={i}>
                                    <td className="content-start">
                                        {inputItem ? (
                                            <div>
                                                <NodeComponentInput
                                                    data={inputItem.data}
                                                    isConnectable={false}
                                                    isViewMode={true}
                                                />
                                            </div>
                                        ) : (
                                            <div></div> // 空白占位
                                        )}
                                    </td>
                                    <td className="content-start">
                                        {outputItem ? (
                                            <div>
                                                <NodeComponentOutput
                                                    data={outputItem.data}
                                                    isConnectable={false}
                                                    isViewMode={true}
                                                />
                                            </div>
                                        ) : (
                                            <div></div> // 空白占位
                                        )}
                                    </td>
                                </tr>
                            );
                        }

                        return rows;
                    })()}
                    </tbody>
                </table>

            </div>
        </ModelsContext.Provider>
    );
}