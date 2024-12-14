import TextInput from "./nodes/inputs/TextInput.jsx";
import AudioInput from "./nodes/inputs/AudioInput.jsx";
import ImageInput from "./nodes/inputs/ImageInput.jsx";
import TextModel from "./nodes/models/TextModel.jsx";
import Text2AudioModel from "./nodes/models/Text2AudioModel.jsx";
import Text2ImageModel from "./nodes/models/Text2ImageModel.jsx";
import Image2TextModel from "./nodes/models/Image2TextModel.jsx";
import TextOutput from "./nodes/outputs/TextOutput.jsx";
import AudioOutput from "./nodes/outputs/AudioOutput.jsx";
import ImageOutput from "./nodes/outputs/ImageOutput.jsx";
import TextEdge from "./edges/TextEdge.jsx";
import {toast} from "react-hot-toast";
import Axios from "axios";
import IfLogic from "./nodes/logics/IfLogic.jsx";
import NumberInput from "./nodes/inputs/NumberInput.jsx";
import TextJoin from "./nodes/inputs/TextJoin.jsx";
import Audio2TextModel from "./nodes/models/Audio2TextModel.jsx";
import {buildWebStorage, setupCache} from 'axios-cache-interceptor';
import useTokenStore, {refreshAuthLogic} from "./states/state.js";
import createAuthRefreshInterceptor from "axios-auth-refresh";
import ImageModel from "./nodes/models/ImageModel.jsx";
import ImageMerge from "./nodes/models/ImageMerge.jsx";
import {indexedDbStorage} from "./indexedDbCache.js";

const instance = Axios.create();
// export const axios = instance;
export const axios = setupCache(instance,
    {
        // As localStorage is a public storage, you can add a prefix
        // to all keys to avoid collisions with other code.
        storage: indexedDbStorage
    }
);
// 实例化拦截器
createAuthRefreshInterceptor(axios, refreshAuthLogic, {
    statusCodes: [422, 401]
});


if (useTokenStore.getState().accessToken){
    axios.defaults.headers.common['Authorization'] =  `Bearer ${useTokenStore.getState().accessToken}`;
    console.log("set")
}
export const nodeTypes = {
    textInput: TextInput,
    textJoin: TextJoin,
    audioInput: AudioInput,
    imageInput: ImageInput,
    textModel: TextModel,
    imageModel: ImageModel,
    imageMerge: ImageMerge,
    text2AudioModel: Text2AudioModel,
    audio2TextModel: Audio2TextModel,
    text2ImageModel: Text2ImageModel,
    image2TextModel: Image2TextModel,
    textOutput: TextOutput,
    audioOutput: AudioOutput,
    imageOutput: ImageOutput,
    ifLogic: IfLogic,
    numberInput: NumberInput

}

export const timeDifference = (current, previous) => {
    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;
    const msPerMonth = msPerDay * 30;
    const msPerYear = msPerDay * 365;

    const elapsed = current - previous + msPerHour * 8;

    if (elapsed < msPerMinute) {
        const seconds = Math.round(elapsed / 1000);
        return seconds + '秒' + (elapsed >= 0 ? '前' : '后');
    } else if (elapsed < msPerHour) {
        const minutes = Math.round(elapsed / msPerMinute);
        return minutes + '分钟' + (elapsed >= 0 ? '前' : '后');
    } else if (elapsed < msPerDay) {
        const hours = Math.round(elapsed / msPerHour);
        return hours + '小时' + (elapsed >= 0 ? '前' : '后');
    } else if (elapsed < msPerMonth) {
        const days = Math.round(elapsed / msPerDay);
        return days + '天' + (elapsed >= 0 ? '前' : '后');
    } else if (elapsed < msPerYear) {
        const months = Math.round(elapsed / msPerMonth);
        return months + '个月' + (elapsed >= 0 ? '前' : '后');
    } else {
        const years = Math.round(elapsed / msPerYear);
        return years + '年' + (elapsed >= 0 ? '前' : '后');
    }
}
export const edgeTypes = {
    textEdge: TextEdge,
}

export const getInputNodes = data => data.nodes.filter(node => node.type.endsWith("Input"));
export const getOutputNodes = (data) => data.nodes.filter(node => node.type.endsWith("Output"))

function mergeStrings(stringList, ruleString) {
    let mergedString = ruleString;
    let index = 0;


    for (let i = 0; i < Object.keys(stringList).length; i++) {
        const placeholder = '$' + i;
        if (stringList["a" + i] === undefined){
            continue
        }
        if (mergedString.includes(placeholder)) {
            mergedString = mergedString.replace(new RegExp('\\' + placeholder, 'g'), stringList["a" + i]);
        } else {
            while (mergedString.includes('$' + index)) {
                index++;
            }
            mergedString = mergedString.replace(new RegExp('\\$' + index, 'g'), stringList["a" + i]);
            index++;
        }
    }
    console.log(stringList, ruleString, mergedString)

    return mergedString;
}

// 该函数根据节点类型运行模型并处理数据
export const runModel = async (node, data, setNodes) => {
    switch (node.type) {
        case "textModel": { // 文本模型
            const res = await axios.post(
                "/api/model/response",
                {
                    id: node.data.model,
                    data: {
                        text: node.data.prompt.includes("$0") ?
                            node.data.prompt.replace("$0", data[0]) :
                            node.data.prompt + data
                    }
                }
            );
            console.log(node.data)
            data = res.data.message;
            break;
        }
        case "textJoin": { // 文本合并
            data = mergeStrings(data, node.data.rule);
            break;
        }
        case "imageMerge": {
            const image1 = await loadImage(data.b);
            const image2 = await loadImage(data.a);

            const canvas = document.createElement("canvas");
            canvas.width = Math.max(image1.width, image2.width);
            canvas.height = Math.max(image1.height, image2.height);
            const context = canvas.getContext('2d');

            if (node.data.stretch) {
                context.drawImage(image1, 0, 0, canvas.width, canvas.height);
                context.drawImage(image2, 0, 0, canvas.width, canvas.height);
            } else {
                context.drawImage(image1, 0, 0);
                context.drawImage(image2, 0, 0);
            }

            data = canvas.toDataURL('image/png');
            break;
        }
        // 下面的 case 用于不同类型的模型
        case "text2AudioModel":
        case "audio2TextModel":
        case "imageModel":
        case "text2ImageModel": {
            const res = await axios.post(
                "/api/model/response",
                {
                    id: node.data.model,
                    data: {
                        text: data,

                    }
                }
            );
            data = res.data.message;
            break;
        }
        case "image2TextModel": {
            const res = await axios.post(
                "/api/model/response",
                { id: node.data.model,  data: {
                        text: node.data.prompt,
                        image: data
                    }}
            );
            data = res.data.message;
            break;
        }
        case "textOutput":
        case "audioOutput":
        case "imageOutput": { // 输出节点
            setNodes((nodes) =>
                nodes.map((n) => {
                    if (n.id === node.id) {
                        n.data = { ...n.data, output: data };
                    }
                    return n;
                })
            );
            break;
        }
        default: {
            console.log("未知节点类型" + node.type);
            break;
        }
    }
    console.log("跑到了", node.type + node.data.label);
    return data;
};

// 加载图像的辅助函数
const loadImage = (src) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = src;
    });
};

// 检测data URI的类型为哪一种，音频数据还是图片数据
export const checkDataURIType = (dataURI) => {
    if (!dataURI.startsWith("data:")){
        return dataURI;

    }
    const mediaType = dataURI.split(':')[1].split(';')[0];

    // 列出音频数据和图片数据的类型
    const audioMIMETypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/ogg'];
    const imageMIMETypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];


    if (audioMIMETypes.includes(mediaType)) {
        return '音频数据';
    } else if (imageMIMETypes.includes(mediaType)) {
        return '图片数据';
    } else {
        return dataURI;
    }
}


// 运行流程图的主函数
export const runTest = (json, setNodes, setEdges) => {
    return new Promise((resolve, reject) => {
        const data = json;
        const nodeEdges = data.edges;
        const walkedNode = new Set(); // 已处理的节点集合
        const inputNodes = getInputNodes(data); // 输入节点数组

        const incomingData = {}; // 当前节点的输入数据
        const incomingEdgesCount = {}; // 每个节点的输入线数

        // 初始化每个节点的输入边数
        data.nodes.forEach(node => {
            incomingEdgesCount[node.id] = 0;
        });

        // 计算每个节点的输入边数
        nodeEdges.forEach(edge => {
            incomingEdgesCount[edge.target] = (incomingEdgesCount[edge.target] || 0) + 1;
        });

        const walk = async (node, currentData, targetHandle = null) => {
            // 处理节点输入数据
            if (!incomingData[node.id]) {
                incomingData[node.id] = {};
            }
            incomingData[node.id][targetHandle] = currentData;
            let length = Object.keys(incomingData[node.id]).length;

            if (Object.keys(incomingData[node.id]).includes("resolve")) {
                length -= 1;
            }

            // 等待所有输入到达
            if (length < incomingEdgesCount[node.id]) {
                if (!incomingData[node.id].promise) {
                    incomingData[node.id].promise = new Promise((resolve) => {
                        incomingData[node.id].resolve = resolve;
                    });
                }
                console.log("等待更多输入" + node.id);
                await incomingData[node.id].promise;
                console.log("输入成功" + node.id);
            } else if (incomingData[node.id].resolve) {
                incomingData[node.id].resolve();
            }

            // 更新当前数据
            currentData = incomingData[node.id];
            walkedNode.add(node.id);

            // 如果只有一个输入，转换为单个值
            if (Object.keys(incomingData[node.id]).length === 1) {
                currentData = currentData[targetHandle];
            }

            currentData = await runModel(node, currentData, setNodes);

            // 更新线的标签
            setEdges(edges =>
                edges.map(edge => {
                    if (edge.source === node.id) {
                        edge.label = checkDataURIType(currentData.toString().substring(0, 250));
                    }
                    return edge;
                })
            );

            // 处理下一个节点
            const nextEdges = nodeEdges.filter(edge => edge.source === node.id);
            const promises = nextEdges.map(async edge => {
                const targetNode = data.nodes.find(item => item.id === edge.target);
                if (targetNode) {
                    await walk(targetNode, currentData, edge.targetHandle);
                }
            });

            // 等待所有子节点处理完成
            await Promise.all(promises);
        };

        // 从输入节点开始运行
        const initialPromises = inputNodes.map(node => {
            const nodeData = node.data;
            if (nodeData.input == null) {
                console.error(`未填写 ${nodeData.label} 节点的输入`);
                return Promise.reject(`未填写 ${nodeData.label} 节点的输入`);
            }
            const initialData = nodeData.input;
            return walk(node, initialData);
        });

        // 等待所有输入节点处理完成
        Promise.all(initialPromises)
            .then(() => {
                // 解析所有 nodePromises
                Object.values(incomingData).forEach(data => {
                    if (data.resolve) {
                        data.resolve();
                    }
                });
                resolve();
            })
            .catch(reject);

    });
};


export const restore = (flowId) => {
    return axios.get(
        `/api/flow/${flowId}`,
        {
            id: `flow-${flowId}`
        }
    )
}

export const getModels = async () => {
    return await axios.get("/api/models")

}

export const theme = {
    default: "跟随系统",
    light: "浅色",
    dark: "深色"
}

export const summarize = async () => {
    axios.post()
}

export const summarizeTitle = async (text, setTitle) => {
    const prompt = "总结一段话" +
        "总结成小于20个字的一段简洁能突出特点的话，随着这段话的语言改变你的输出。" +
        "只需要总结这一段话，不需要加入其他的说明语。请不要回答任何问题。"
    console.log(text)
    await axios.post("/api/model/response", {
        id: "moonshot-v1-8k",
        data: {
            prompt: prompt,
            text: text
        }
    }).then((res) => {
        setTitle(res.data.message);
    })
}
