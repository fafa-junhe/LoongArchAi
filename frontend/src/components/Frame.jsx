import SidePanel from "./SidePanel.jsx";
import {
    Menu, User, Eye, EyeOff, Bot
} from "lucide-react";
import Logo from "./Logo.jsx";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {Outlet, useNavigate} from "react-router-dom"
import {useLocation} from 'react-router-dom'
import {useModal} from 'react-hooks-use-modal';
import {FrameContext} from "../Contexts.jsx"
import {axios, theme} from "../Constrains.jsx";
import {toast} from "react-hot-toast";
import Avatar from 'boring-avatars';
import useTokenStore from "../states/state.js";
import ViewChat from "../routes/ViewChat.jsx";
import Chat from "./Chat.jsx";
const pathName = {
    "/": "主页",
    "/flows": "我的功能",
    "/community": "社区",
    "/apps": "我的应用",
    "/models": "所有模型",
    "/models_test": "模型测试",
    "/user": "个人中心"
}



export default function Frame() {
    const [currentPathName, setCurrentPathName] = useState()
    const location = useLocation();
    const showPasswordCheckbox = useRef(null);
    const usernameInput = useRef(null);
    const passwordInput = useRef(null);
    const phoneInput = useRef(null);
    const codeInput = useRef(null);
    const [phoneFormat, setPhoneFormat] = useState(false)
    const [resendCodeTimeLeft, setResendCodeTimeLeft] = useState(0)
    const {accessToken, setTokens, clearTokens, user, setUser} = useTokenStore();
    const navigate = useNavigate()
    const [avatar, setAvatar] = useState(
        <div className="w-10 rounded-full">
            <User className="size-10 p-1"/>
        </div>
    )
    const [messageList, setMessageList] = useState([])
    const [isChatOpen, setIsChatOpen] = useState(false)



    useEffect(() => {
        setCurrentPathName(pathName[location.pathname])
    }, [location.pathname]);

    const isLegitPhone = useCallback(() => {
        if (phoneInput.current)
            return new RegExp("^(13[0-9]|14[5-9]|15[0-3,5-9]|166|17[0-8]|18[0-9]|19[8,9])\\d{8}$").test(phoneInput.current.value)
    }, [])

    useEffect(() => {
        setTimeout(
            () => {
                if (resendCodeTimeLeft > 0) {
                    setResendCodeTimeLeft(resendCodeTimeLeft - 1)
                    setPhoneFormat(false);
                } else if (resendCodeTimeLeft === 0 && isLegitPhone()) {
                    setPhoneFormat(true);
                }
            }
            , 1000)
    }, [isLegitPhone, resendCodeTimeLeft]);

    const [isTextLogin, setIsTextLogin] = useState(false)

    const [Modal, open, close] = useModal('root', {
        preventScroll: true,
    });


    useEffect(() => {
        axios.get(
            "/api/user"
        ).then((res) => {
            setUser(res.data)
            setAvatar(
                <Avatar
                    size={40}
                    name={res.data.username}
                    variant="beam"
                    colors={['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90']} // TODO change color
                />
            )
        }).catch(() => {
            setUser({
                username: null,
                nickname: null,
                phone: null,
                avatar: null,
                id: null
            })
            setAvatar(
                <div className="w-10 rounded-full">
                    <User className="size-10 p-1"/>
                </div>
            )
        })
    }, [accessToken, setUser]);


    const register = useCallback(() => {
        axios.post(
            "/api/user",
            {
                "nickname": usernameInput.current.value,
                "username": usernameInput.current.value,
                "password": passwordInput.current.value,
                "phone": null
            }
        ).then((res) => {
            toast.success(res.data.message);
            close()
        })
    }, [close]);

    const loginByText = useCallback(() => {
        if (!phoneInput.current.value) {
            toast.error("手机号未填写")
            return;
        }
        if (!codeInput.current.value) {
            toast.error("验证码未填写")
            return;
        }
        axios.post(
            "/api/user",
            {
                "phone": phoneInput.current.value,
                "code": codeInput.current.value
            }
        ).then((res) => {
            toast.success(res.data.message);
        }).catch((res) => {
            toast.error(res.response.data.message)

        })
    }, [])

    const login = useCallback(() => {
        if (isTextLogin) {
            loginByText()
            return;
        }
        axios.post(
            "/api/login",
            {
                "username": usernameInput.current.value,
                "password": passwordInput.current.value
            }
        ).then((res) => {
            console.log(res.data)

            toast.success(res.data.message);

            setTokens(res.data["access_token"], res.data["refresh_token"]);
            close()
        }).catch((res) => {
            toast.error(res.response.data.message)

        })
    }, [close, isTextLogin, loginByText, setTokens]);

    const onPhoneChange = useCallback(() => {
        if (isLegitPhone()) {
            setPhoneFormat(true)
        } else {
            setPhoneFormat(false)
        }
    }, [isLegitPhone])


    const validatePhone = useCallback(() => {
        if (resendCodeTimeLeft === 0 && isLegitPhone()) {

            setResendCodeTimeLeft(60);
            axios.post(
                "/api/send_code",
                {
                    "phone": phoneInput.current.value
                }
            ).then((res) => {
                toast.success(res.data.message);
            })
        }
    }, [isLegitPhone, resendCodeTimeLeft])
    const openLoginModal = useCallback(() => {
        if (user.username) {
            navigate(`/user/${user.id}`)
            return;
        }
        open()

    }, [navigate, open, user.id, user.username])

    return (<>
        <FrameContext.Provider value={{open, close, openLoginModal}}>

            <Modal>
                <div className="bg-base-100 rounded-3xl shadow p-8">
                    <div className="justify-center items-center gap-4 form-control">
                        <div className="flex pb-5">
                            <a onClick={() => setIsTextLogin(false)}
                               className={!isTextLogin ? "text-primary" : "cursor-pointer"}>
                                密码登录
                            </a>
                            <div className="divider divider-horizontal"></div>
                            <a onClick={() => setIsTextLogin(true)}
                               className={isTextLogin ? "text-primary" : "cursor-pointer"}>
                                短信登录
                            </a>
                        </div>
                        <form className="w-92 bg-base-100 form-control">

                            {isTextLogin ?
                                <>
                                    <div
                                        className="justify-center items-center rounded-t-xl px-4 border border-primary flex">
                                        手机号
                                        <input placeholder="请输入手机号" autoComplete="mobile" type="text"
                                               ref={phoneInput}
                                               onChange={onPhoneChange}
                                               className="grow bg-base-100 p-4 outline-none"/>
                                        <div className="!py-2 divider divider-horizontal"></div>
                                        <a href="#"
                                           onClick={validatePhone}
                                           className={phoneFormat ? "text-primary" : "cursor-not-allowed text-base-300"}>
                                            {resendCodeTimeLeft !== 0 &&
                                                <span className="mr-2 countdown">
                                                    <span style={{
                                                        "--value": resendCodeTimeLeft
                                                    }}></span>
                                                </span>
                                            }
                                            获取验证码</a>
                                    </div>
                                    <div
                                        className="justify-center items-center rounded-b-xl px-4 border border-primary flex">
                                        验证码
                                        <input placeholder="请输入验证码" type="text"
                                               ref={codeInput}
                                               className="grow bg-base-100 p-4 outline-none"/>
                                    </div>
                                    <div className="mt-4 w-2/3 self-center flex gap-4">
                                        <div onClick={login} className="btn btn-primary grow">登录/注册</div>
                                    </div>
                                </>
                                :
                                <>
                                    <div
                                        className="justify-center items-center rounded-t-xl px-4 border border-primary flex">
                                        用户名
                                        <input placeholder="请输入用户名" autoComplete="username" type="text"
                                               ref={usernameInput}
                                               className="grow bg-base-100 p-4 outline-none"/>
                                    </div>
                                    <div
                                        className="justify-center items-center rounded-b-xl px-4 border border-primary flex">
                                        密码
                                        <input autoComplete="current-password" placeholder="请输入密码"
                                               ref={passwordInput}
                                            // type={showPasswordCheckbox.current.checked ? "password" : "text"}
                                               type="password"
                                               className="grow bg-base-100 p-4 outline-none"/>
                                        <label className="swap swap-rotate h-10">
                                            <input ref={showPasswordCheckbox} type="checkbox"/>
                                            <Eye className="swap-off"/>
                                            <EyeOff className="swap-on"/>
                                        </label>
                                        <a className="text-primary mx-2">忘记密码?</a>
                                    </div>
                                    <div className="mt-4 flex w-full gap-4">
                                        <div onClick={register} className="btn grow">注册</div>
                                        <div onClick={login} className="btn btn-primary grow">登录</div>
                                    </div>
                                </>
                            }
                        </form>


                    </div>
                </div>

            </Modal>
            <SidePanel>

                <div className="lg:hidden navbar bg-base-100 border-b border-base-300 shadow-xl">

                    <div className=" ">
                        <label htmlFor="drawer" className="btn btn-ghost drawer-button lg:hidden"><Menu/></label>

                        <Logo/>
                    </div>
                    <div className="ml-4 flex-1 font-bold lg:justify-start justify-center">{currentPathName}</div>
                    <div className="flex-none gap-2">
                        <div className="dropdown dropdown-end">
                            <div tabIndex={0} role="button" className="btn m-1">
                                主题
                            </div>
                            <ul tabIndex={0}
                                className="bg-base-200 dropdown-content z-[1] p-2 shadow-2xl rounded-box w-52">
                                {
                                    Object.entries(theme).map((item, index) => {
                                        return (
                                        <li key={index}>
                                            <a type="radio" name="theme-dropdown"
                                                   className=" btn btn-sm btn-block justify-start "
                                                   data-set-theme={item[0]} data-act-class="!btn-primary">
                                                {item[1]}
                                            </a>
                                        </li>)
                                    })
                                }

                            </ul>
                        </div>
                        <div onClick={openLoginModal} className="dropdown dropdown-hover dropdown-end">
                            <div tabIndex="0" role="button" className="btn btn-ghost btn-circle avatar">
                                {avatar}
                            </div>
                            <ul tabIndex="0"
                                className="-mt-1 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
                                <div className="text-center">欢迎你 {user.nickname}</div>
                                <div className="divider"></div>

                                <li><a onClick={clearTokens}>登出</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="overflow-auto h-screen p-8">
                    <Outlet></Outlet>
                </div>
            </SidePanel>
            <div className="absolute right-5 bottom-5 ">

                {isChatOpen && <div className="mb-4 bg-base-200 shadow-2xl rounded-2xl overflow-hidden">
                    <div
                        className="text-center w-full mt-2"
                    >龙芯元AI平台智能助手
                    </div>
                    <div
                        className="font-extralight text-center w-full"
                    >平台使用过程中有什么不会的都可以问我哦
                    </div>
                    <div className="divider"></div>
                    <Chat json={
                        {
                            "prompt": "你是一个智能助理，专门为“基于龙架构的人工智能多元交互平台”提供帮助和支持。以下是你需要了解的信息和可能遇到的用户问题：\n\n## 平台概述\n“基于龙架构的人工智能多元交互平台”是一个旨在简化大模型应用开发的系统。通过图形化界面和拖拽组件，用户可以快速构建智能应用。该平台支持文本、语音、图像等多模态交互，具备情感识别、自然语言处理、图像理解与生成能力。\n\n## 主要功能\n1. **可视化工作流系统**：通过图形化界面，用户可以轻松编写提示词和拖拽组件，快速完成应用构建。\n2. **自定义对话系统**：用户可以创建自定义的对话模型，与平台进行智能交互。\n3. **多用户协作**：支持多用户协作开发和应用发布。\n4. **平台兼容性**：支持多种平台，包括龙芯和云端部署。\n\n## 目标用户\n1. **普通开发者**：降低开发门槛，通过易用的图形化界面进行智能应用开发。\n2. **专业开发者**：提供丰富的功能和工具，支持复杂应用的开发和创新。\n3. **企业用户**：提升业务效率和用户体验，推动企业智能化应用。\n4. **教育和科研人员**：利用大模型进行教学和研究。\n5. **普通用户**：享受便捷的智能交互体验。\n6. **内容创作者**：借助大模型创作内容，提高效率和质量。\n\n## 常见问题和回答\n1. **如何开始使用平台？**\n    - **回答**：请访问我们的官网并注册一个账户。注册后，您可以通过教程了解如何使用平台的各项功能。\n\n2. **如何创建一个新的智能应用？**\n    - **回答**：在平台上，进入“应用”模块，点击“新建应用”。您可以使用拖拽组件和图形化界面来设计您的应用流程。\n\n3. **平台支持哪些编程语言？**\n    - **回答**：前端使用JavaScript（React），后端使用Python（Flask）。我们提供了详细的编程规范和示例代码。\n\n4. **如何部署我的应用？**\n    - **回答**：您可以选择在本地部署或云端部署。请参考我们的部署指南，按照步骤配置环境并部署您的应用。\n\n5. **平台如何保证数据隐私和安全？**\n    - **回答**：我们采用了多层次的数据安全措施，包括加密传输、用户认证、权限管理等，确保您的数据安全。\n\n6. **如何进行多用户协作？**\n    - **回答**：您可以邀请其他用户加入您的项目，并为他们分配不同的权限。协作功能支持实时同步和版本控制。\n\n7. **平台是否支持情感识别？**\n    - **回答**：是的，平台具备情感识别能力，可以根据用户情绪调整回应方式，提供更自然的交互体验。\n\n8. **遇到问题如何寻求帮助？**\n    - **回答**：您可以通过平台内置的帮助中心查找常见问题的解决方案，或者联系在线客服获取实时支持。\n\n## 技术架构与设计\n- **前端技术**：React、React Router、Tailwind CSS、DaisyUI、axios-cache-interceptor、ReactFlow。\n- **后端技术**：Python、Flask、APScheduler、Flask-JWT-Extended、SQLAlchemy ORM。\n- **数据库**：人大金仓数据库（KingbaseES）。\n\n## 提示词示例\n- **项目背景**：介绍项目背景和开发目的。\n- **如何使用**：指导用户如何使用平台的各项功能。\n- **技术支持**：提供技术问题的解决方案。\n- **应用发布**：帮助用户发布和分享他们的智能应用。\n- **多模态交互**：解释平台的多模态交互能力及其使用方法。\n\n你现在已经掌握了所有必要信息，请根据用户的具体问题提供准确、详细的回答。",
                            "name": "龙芯元AI",
                            "opening": "",
                            "model": "qwen1.5-32b-chat",
                            "user_name": "",
                            "top_p": 0.8,
                            "top_k": 50,
                            "temperature": 0.3,
                            "search": false,
                            "selection": [],
                            "first_selection": []
                        }}
                          messageList={messageList}
                          setMessageList={setMessageList}
                          setTitle={() => {
                          }} className=" !h-[70dvh] !max-w-[40vw] float-right"></Chat>
                </div>}
                <div onClick={() => setIsChatOpen(!isChatOpen)} className="float-right btn btn-circle btn-primary"><Bot/></div>
            </div>
        </FrameContext.Provider>

    </>);
}