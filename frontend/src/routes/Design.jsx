import {useCallback, useEffect, useRef, useState} from 'react';
import ReactFlow, {
    addEdge,
    applyEdgeChanges,
    applyNodeChanges,
    Background,
    BackgroundVariant,
    Controls,
    getRectOfNodes,
    getTransformForBounds,
    MiniMap,
    ReactFlowProvider,
    updateEdge,
    useOnSelectionChange,
    useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';
import useContextMenu from "../hooks/useContextMenu.jsx";
import {axios} from "../Constrains.jsx";
import {
    BookAudio,
    BookImage,
    BookText,
    Check,
    ChevronRight,
    CircleArrowRight,
    CirclePlay,
    ClipboardPaste,
    Copy,
    Delete,
    FileDigit,
    FileMusic,
    FileType2,
    FileVolume,
    ImageDown,
    ImagePlus,
    ImageUp,
    Import,
    LayoutPanelLeft,
    Network,
    Save,
    Scissors,
    ScrollText,
    X
} from "lucide-react";
import {toast} from "react-hot-toast";
import {edgeTypes, getModels, nodeTypes, restore, runTest} from "../Constrains.jsx";
import {ModelsContext} from "../Contexts.jsx";
import DesignBar from "../components/DesignBar.jsx";
import {toPng} from 'html-to-image';
import {useParams} from "react-router-dom";
import useUndoable from "use-undoable";
import Hotkeys from 'react-hot-keys';
import useTokenStore from "../states/state.js";


const getId = () => (Math.random() + 1).toString(36).substring(7);


const nodeClassName = (node) => {
    switch (node.type) {
        case 'textInput':
        case 'audioInput':
        case 'imageInput':
            return 'fill-primary';
        case 'textModel':
        case 'text2AudioModel':
        case 'text2ImageModel':
        case 'image2TextModel':
            return 'fill-accent';
        case 'textOutput':
        case 'audioOutput':
        case 'imageOutput':
            return 'fill-success';
        default:
            return '';
    }
};

const deleteKeyCode = ["Backspace", "Delete"];
const imageWidth = 1500;
const imageHeight = 1000;

const Design = () => {
    const edgeUpdateSuccessful = useRef(true);
    const connectingNodeId = useRef(null);
    const selectedNodes = useRef([]);
    const timer = useRef(null);
    const reactFlow = useReactFlow();
    const {screenToFlowPosition, setViewport, getNodes} = reactFlow;
    const [models, setModels] = useState([]);
    const rflInstance = useRef({});
    const [onContextMenu, onMouseDownCapture, Menu, setContextMenuContent] = useContextMenu();
    const clipboard = useRef([]);
    const snapToGrid = useRef(false)
    const {accessToken} = useTokenStore();

    const [flowName, setFlowName] = useState("");
    const [elements, setElements, {undo, redo, canUndo, canRedo, reset}] = useUndoable({
        nodes: [], edges: [],
    }, {
        ignoreIdenticalMutations: false, cloneState: false, behavior: "destroyFuture"
    });
    const [intermediate, setIntermediate] = useState(false)
    const {flowId} = useParams();
    const triggerUpdate = (t, v) => {
        setElements(elements => ({
            nodes: t === 'nodes' ? v : elements.nodes, edges: t === 'edges' ? v : elements.edges,
        }), null, intermediate);
    }

    const setNodes = (nodesOrPayload) => {
        triggerUpdate('nodes', typeof nodesOrPayload === "function" ? nodesOrPayload(elements.nodes) : nodesOrPayload);
    };

    const setEdges = (edgesOrPayload) => {
        triggerUpdate('edges', typeof edgesOrPayload === "function" ? edgesOrPayload(elements.edges) : edgesOrPayload);
    }

    const updateName = useCallback( () => {

    }, [])

    const deleteEdges = (id) => {
        setEdges((edges) => edges.filter((edge) => edge.id !== id));
    }


    const read = useCallback(() => {
        return restore(flowId).then(res => {
            const flow = res.data.message.flow_json;
            setFlowName(res.data.message.flow_name)
            if (flow) {
                const {x = 0, y = 0, zoom = 1} = flow.viewport || {};
                setViewport({x, y, zoom});
                reset({nodes: flow.nodes || [], edges: flow.edges || []});
                setIntermediate(true);
                timer.current = setTimeout(() => setIntermediate(false), 100);
            }
        });
    }, [accessToken, flowId, reset, setViewport]);

    useEffect(() => {
        getModels().then((res) => {
            setModels(res.data);
        }).catch(() => {
            toast.error("无法连接至服务器");
        });
        read();

    }, [read]);

    useOnSelectionChange({
        onChange: ({nodes}) => selectedNodes.current = nodes.map(node => node.id),
    })

    const handleDelete = () => {
        setNodes((nds) => nds.filter((node) => !selectedNodes.current.includes(node.id)));
        setEdges((eds) => eds.filter((edge) => !selectedNodes.current.includes(edge.source) && !selectedNodes.current.includes(edge.target)));
    };

    const handleCopy = () => {
        clipboard.current = elements.nodes.filter((node) => selectedNodes.current.includes(node.id));
    };

    const handleCut = () => {
        handleCopy();
        handleDelete();
    };

    const handlePaste = () => {
        if (clipboard.current.length === 0) return;
        const newNodes = clipboard.current.map((node) => ({
            ...node, id: getId(), position: {x: node.position.x + 20, y: node.position.y + 20}, // Offset to avoid overlap
        }));
        clipboard.current = clipboard.current.map((node) => ({
            ...node, position: {x: node.position.x + 20, y: node.position.y + 20}, // Offset to avoid overlap
        }));
        setNodes((nds) => nds.concat(newNodes));
    };

    const action = useRef({
        handleDelete, handleCut, handlePaste, handleCopy
    })

    action.current = {
        handleDelete, handleCut, handlePaste, handleCopy
    }

    const save = useCallback(async () => {
        const nodesBounds = getRectOfNodes(getNodes());
        const transform = getTransformForBounds(nodesBounds, imageWidth, imageHeight, 0.5, 2);

        let image = await toPng(document.querySelector('.react-flow__viewport'), {
            backgroundColor: '#f3f3f5',
            width: imageWidth,
            height: imageHeight,
            cacheBust: true,
            preferredFontFormat: "woff2",
            fontEmbedCSS: "",
            style: {
                width: imageWidth,
                height: imageHeight,
                transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
            },
        });

        await axios.put(`/api/flow/${flowId}`, {
            json: elements,
            img: image,
            name: flowName
            
        }, {
            cache: {
                update: {
                    ["flow-" + flowId]: 'delete',
                    "list-my-flows": 'delete',
                    "list-flows": 'delete'
                }
            }
        });
    }, [flowId, flowName, getNodes]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (canUndo) {
                toast.promise(save(), {
                    loading: '自动保存中...', success: <b>保存成功!</b>, error: <b>保存失败.</b>,
                });
            }
        }, 30000);
        return () => clearInterval(intervalId);
    }, [canUndo, save]);

    const onConnectStart = (_, {nodeId}) => {
        connectingNodeId.current = nodeId;
    };

    const onConnect = (params) => {
        triggerUpdate('edges', addEdge({
            ...params, type: "textEdge", interactionWidth: 50
        }, elements.edges));
        connectingNodeId.current = null;
    };

    const onNodesChange = (changes) => {
        triggerUpdate('nodes', applyNodeChanges(changes, elements.nodes));
    };

    const onEdgesChange = (changes) => {
        triggerUpdate('edges', applyEdgeChanges(changes, elements.edges));
    }

    const onNodeDrag = () => {
        setIntermediate(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => {
            setIntermediate(false);
        }, 300);
    };

    const onNodeDragStart = () => {
        setIntermediate(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => {
            setIntermediate(false);
        }, 300);
    };

    const onNodeContextMenu = useCallback((event, node) => {
        if (selectedNodes.current.length === 0)
            selectedNodes.current = [node.id];
        event.preventDefault();
        event.stopPropagation();
        setContextMenuContent(<>
            <li><a onClick={action.current.handleCopy}><Copy/>复制</a></li>
            <li><a onClick={action.current.handleCut}><Scissors/>剪切</a></li>
            <li><a onClick={action.current.handleDelete}><Delete/>删除</a></li>
        </>);
        onContextMenu(event);
    }, [onContextMenu, setContextMenuContent])


    const onEdgeUpdateStart = useCallback(() => {
        edgeUpdateSuccessful.current = false;
    },[])

    const onEdgeUpdate = useCallback((oldEdge, newConnection) => {
        edgeUpdateSuccessful.current = true;
        setEdges((els) => updateEdge(oldEdge, newConnection, els));
    },[setEdges])

    const onEdgeUpdateEnd = useCallback((_, edge) => {
        if (!edgeUpdateSuccessful.current) {
            setEdges((eds) => eds.filter((e) => e.id !== edge.id));
        }
        edgeUpdateSuccessful.current = true;
    },[setEdges])

    const run = useCallback(() => {
        toast.promise(runTest(elements, setNodes, setEdges), {
            success: "运行完成", loading: "运行中", error: "出现未知错误"
        }).catch((err) => {
            console.log(err)
        });
    }, [elements, setEdges, setNodes]);

    const onFlowContextMenu = useCallback((event) => {
        const createNode = (type, name, event) => {
            const id = getId();
            let newNode = {
                id, position: screenToFlowPosition({
                    x: event.clientX, y: event.clientY,
                }), origin: [0.5, 0.0], dragHandle: '.node-header-drag', data: {label: name}, type: type,
            };
            setNodes((nds) => nds.concat(newNode));
        }


        setContextMenuContent(<>
            <li>
                <div className="!block dropdown dropdown-right dropdown-hover [&>svg]:size-6">
                    <div onClick={(event) => {
                        event.stopPropagation()
                    }} tabIndex="0" role="button" className="flex">
                        <span className="ml-2 grow">新建节点</span>
                        <span className="grow-0"><ChevronRight/></span>
                    </div>
                    <ul tabIndex="0"
                        className="p-3 -ml-0 h-64 *:!text-base-content w-52 overflow-auto !bg-base-200 dropdown-content z-10 rounded-3xl">
                        <li><a
                            onClick={() => createNode("textInput", "文本输入", event)}><FileType2/>文本输入</a>
                        </li>
                        <li><a
                            onClick={() => createNode("imageInput", "图像输入", event)}><ImageUp/>图像输入</a>
                        </li>
                        <li><a
                            onClick={() => createNode("audioInput", "音频输入", event)}><FileMusic/>音频输入</a>
                        </li>
                        <li><a
                            onClick={() => createNode("numberInput", "数字输入", event)}><FileDigit/>数字输入</a>
                        </li>
                        <li><a
                            onClick={() => createNode("textJoin", "文本合并", event)}><FileType2/>文本合并</a>
                        </li>
                        <div className="divider"></div>
                        <li><a
                            onClick={() => createNode("textModel", "语言模型", event)}><BookText/>语言模型</a>
                        </li>
                        <li><a
                            onClick={() => createNode("imageModel", "图片模型", event)}><BookImage/>图片模型</a>
                        </li>
                        <li><a
                            onClick={() => createNode("imageMerge", "图片合并", event)}><BookImage/>图片合并</a>
                        </li>
                        <li><a
                            onClick={() => createNode("text2AudioModel", "文本转语音模型", event)}><BookAudio/>文本转语音模型</a>
                        </li>
                        <li><a
                            onClick={() => createNode("audio2TextModel", "语音识别模型", event)}><BookAudio/>语音识别模型</a>
                        </li>
                        <li><a onClick={() => createNode("text2ImageModel", "图片生成模型", event)}><BookImage/>图片生成模型</a>
                        </li>
                        <li><a onClick={() => createNode("image2TextModel", "图片理解模型", event)}><ImagePlus/>图片理解模型</a>
                        </li>
                        <div className="divider"></div>
                        <li><a
                            onClick={() => createNode("textOutput", "文本输出", event)}><ScrollText/>文本输出</a>
                        </li>
                        <li><a
                            onClick={() => createNode("imageOutput", "图像输出", event)}><ImageDown/>图像输出</a>
                        </li>
                        <li><a
                            onClick={() => createNode("audioOutput", "音频输出", event)}><FileVolume/>音频输出</a>
                        </li>
                        <div className="divider"></div>
                        <li><a onClick={() => createNode("ifLogic", "判断节点", event)}><Network/>判断节点</a>
                        </li>
                    </ul>
                </div>
            </li>
            <div className="divider"></div>
            <li><a onClick={action.current.handlePaste}><ClipboardPaste/>粘贴</a></li>
            <div className="divider"></div>

            <li><a onClick={() => {
                toast.promise(save(), {
                    loading: '保存中...', success: <b>保存成功!</b>, error: <b>保存失败.</b>,
                });
            }}><Save/>保存</a></li>
            <li><a onClick={() => read()}><Import/>读取</a></li>
            <div className="divider"></div>

            <li><a
                onClick={() => run()}><CirclePlay/>测试</a>
            </li>
            <li>
                <a onClick={() => {
                    snapToGrid.current = !snapToGrid.current
                }}>
                    <LayoutPanelLeft/>
                    对齐网格
                    {snapToGrid.current ? <Check/> : <X/>}
                </a>
            </li>
        </>);
        onContextMenu(event);
    }, [handlePaste, onContextMenu, read, run, save, screenToFlowPosition, setContextMenuContent, setNodes])

    const onConnectEnd = (event) => {
        if (!connectingNodeId.current || !edgeUpdateSuccessful.current) return;
        const targetIsPane = event.target.classList.contains('react-flow__pane');
        if (targetIsPane) {
            onFlowContextMenu(event);
        }
    }

    const onKeyDown = (key, event) => {
        switch (key) {
            case "ctrl+z":
                undo()
                break;
            case "ctrl+y":
            case "ctrl+shift+z":
                redo()
                break;
            case "ctrl+s":
                event.preventDefault();
                toast.promise(save(), {
                    loading: '保存中...', success: <b>保存成功!</b>, error: <b>保存失败.</b>,
                })
                break;
            case "ctrl+c":
                handleCopy()
                break;
            case "ctrl+x":
                handleCut()
                break;
            case "ctrl+v":
                handlePaste()
                break;
        }
    }

    const modelsContextContent = useRef({
        models,
        run,
        deleteEdges
    })

    modelsContextContent.current = {
        models,
        run,
        deleteEdges
    }



    return (<div>
        <Hotkeys
            keyName="ctrl+s,ctrl+z,ctrl+shift+z,ctrl+y,ctrl+x,ctrl+c,ctrl+v"
            onKeyDown={onKeyDown}
        >
            <DesignBar flowName={flowName} updateName={updateName} setFlowName={setFlowName} undo={undo} redo={redo} canUndo={canUndo}
                       canRedo={canRedo}/>
            <div>
                <Menu/>
                <div className="h-screen w-screen bg-base-100" onContextMenu={onFlowContextMenu}
                     onMouseDownCapture={onMouseDownCapture}>
                    <ModelsContext.Provider value={modelsContextContent}>
                        <ReactFlow
                            className="group"
                            nodes={elements?.nodes}
                            edges={elements?.edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnectStart={onConnectStart}
                            onNodeDrag={onNodeDrag}
                            onNodeDragStart={onNodeDragStart}
                            onConnect={onConnect}
                            onConnectEnd={onConnectEnd}
                            nodeTypes={nodeTypes}
                            onInit={(rfl) => {
                                rflInstance.current = rfl;
                            }}
                            edgeTypes={edgeTypes}
                            onNodeContextMenu={onNodeContextMenu}
                            onEdgeUpdate={onEdgeUpdate}
                            onEdgeUpdateStart={onEdgeUpdateStart}
                            onEdgeUpdateEnd={onEdgeUpdateEnd}
                            fitView
                            onlyRenderVisibleElements={false}
                            snapToGrid={snapToGrid.current}
                            deleteKeyCode={deleteKeyCode}
                            fitViewOptions={{padding: 2}}
                            snapGrid={[10, 10]}
                            proOptions={{hideAttribution: true}}
                        >
                            <Background
                                variant={BackgroundVariant.Dots}
                                color="#777"
                                gap={10}
                            />
                            <Controls/>

                            <MiniMap
                                zoomable
                                pannable
                                nodeClassName={nodeClassName}
                                nodeBorderRadius={20}
                                className="!bg-base-100 !fill-base-100"
                            />
                        </ReactFlow>
                    </ModelsContext.Provider>
                </div>
            </div>
        </Hotkeys>
    </div>);


}


export default function DesignPage() {
    return (<ReactFlowProvider>
        <Design>
        </Design>
    </ReactFlowProvider>)
}