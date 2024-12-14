import {AppWindow, Bot, Plus, Workflow} from "lucide-react"
import {useCallback, useContext} from "react";
import {FrameContext} from "../Contexts.jsx";
import useTokenStore from "../states/state.js";
import {useNavigate} from "react-router-dom";
import {axios} from "../Constrains.jsx";
import {toast} from "react-hot-toast";

function QuickStartComponent({children, title, onClick}) {
    return (
        <div onClick={onClick} className="gap-1 cursor-pointer w-48 h-40 form-control">
            <div className="shadow-xl w-48 h-32 overflow-hidden">
                <div className="flex justify-center items-center w-48 h-32">
                    {children}
                </div>
                <div
                    className="relative left-0 -top-32 w-48 h-32 duration-300 transition ease-out hover:bg-base-content/10 hover:backdrop-blur-sm">
                </div>
            </div>
            <div className="text-sm text-center">{title}</div>

        </div>
    )
}

export default function QuickStart() {
    const { openLoginModal } = useContext(FrameContext)
    const { user} = useTokenStore();
    const navigate = useNavigate();

    const createAFlow = useCallback((chat) => {
        if (user.id === null){
            openLoginModal();
            return;
        }
        axios.post(
            "/api/flow"
        , {
                flow_type: chat ? 0 : 1
            }).then((res) => {
                toast.success("创建成功")
                if (chat){
                    navigate("/design/chat/" + res.data["flow_id"])
                    return;
                }
                navigate("/design/" + res.data["flow_id"])
        })
    }, [navigate, openLoginModal, user.id]);

    const createAApp = () => {
        if (user.id === null){
            openLoginModal();
            return;
        }
        axios.post(
            "/api/app"
            , {
                name: "新建应用",
                desc: "应用描述",
                public: false

            }).then((res) => {
            toast.success("创建成功")
            // console.log(res.data)
            navigate("/app/" + res.data["app_id"])
        })
    }

    return (
        <div className=" m-2 flex ">
            <div className="flex rounded-2xl overflow-hidden">
                <QuickStartComponent onClick={() => createAFlow(false)} title="新建流程图">
                <div
                    className="size-full bg-primary text-primary-content cursor-pointer flex justify-center items-center w-48 h-32 ">
                    <Workflow className="size-16 ">
                    </Workflow>
                </div>
            </QuickStartComponent>
                <QuickStartComponent onClick={() => createAFlow(true)} title="新建对话">
                    <div
                        className="size-full bg-primary text-primary-content flex justify-center items-center w-48 h-32 ">
                        <Bot className="size-16 ">
                        </Bot>
                    </div>
                </QuickStartComponent>
                <QuickStartComponent onClick={() => createAApp()} title="新建应用">
                    <div
                        className="size-full bg-primary text-primary-content flex justify-center items-center w-48 h-32 ">
                        <AppWindow className="size-16 ">
                        </AppWindow>
                    </div>
                </QuickStartComponent></div>

        </div>
    )
}