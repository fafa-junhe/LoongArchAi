import React, {memo, useEffect, useMemo, useRef, useState} from 'react';
import {CheckCheck, Copy, LucideBot, LucideEraser, LucideSend, LucideUser, RefreshCcw} from "lucide-react";
import PropTypes from "prop-types";
import {axios, summarizeTitle} from "../Constrains.jsx";
import ReactMarkdown from 'react-markdown'
import Highlight from "react-highlight";
import {toast} from "react-hot-toast";
import "highlight.js/styles/vs2015.css"
import {useParams} from "react-router-dom";

const messageTypes = {
    robot: -1,
    user: 0,
    clear: 1
}
const Message = ({messageType = messageTypes.user, name, message, time, removeSelf}) => {
    return (
        <div>
            {/*若为清除标注，显示分割线*/}
            {messageType === messageTypes.clear &&
                <div className="divider">
                    上下文已删除
                    <a className="link-primary cursor-pointer" onClick={removeSelf}>撤销</a>
                </div>
            }
            {messageType !== messageTypes.clear &&
                <div className={`chat ${messageType === messageTypes.robot ? "chat-start" : "chat-end"}`}>
                    <div className="chat-image avatar">
                        <div className="size-12 flex bg-base-300 rounded-full">
                            {
                                messageType === messageTypes.robot ?
                                    <LucideBot className="mt-2 size-8 w-full" /> :
                                    <LucideUser className="mt-2 size-8 w-full" />
                            }
                        </div>
                    </div>
                    <div className="chat-header">
                        {name}
                        <time className="text-xs opacity-50">{time}</time>
                    </div>
                    <div
                        className={`chat-bubble *:break-words text-selectable ${messageType === messageTypes.robot ? " chat-bubble-warning shadow-[-3px_4px_15px] shadow-warning" : " chat-bubble-primary shadow-[3px_4px_15px] shadow-primary"} `}>
                        <ReactMarkdown components={{
                            code: (props) => {
                                const {children, className, node, ...rest} = props
                                const match = /language-(\w+)/.exec(className || '')
                                return match ? (

                                    <div className="not-prose [&_*]:text-gray-200 mockup-code">
                                        <Highlight
                                            {...rest}
                                            className={`language-${match[1]}`}
                                        >
                                            {String(children).split("\n").map((item, index) => {
                                                return (
                                                    <pre data-prefix={index + 1} key={index}>
                                                {item}
                                                        {'\n'}
                                            </pre>
                                                )
                                            })}
                                        </Highlight>
                                    </div>
                                ) : (
                                    <code {...rest} className={`bg- ${className}`}>
                                        {children}
                                    </code>
                                )
                            },
                            pre: ({children}) => (<>{children}</>)
                        }} className="prose">
                            {message}
                        </ReactMarkdown>
                    </div>
                    <div className="chat-footer opacity-50 flex gap-1">
                        {
                            messageType === messageTypes.robot ?
                                <>
                                    <div className="cursor-pointer p-1 rounded-full hover:bg-base-100 shadow">
                                        <RefreshCcw className="size-5" /></div>
                                    <div className="cursor-pointer p-1 rounded-full hover:bg-base-100 shadow">
                                        <Copy className="size-5" onClick={
                                            () => {
                                                toast.success("消息已复制")
                                                navigator.clipboard.writeText(message);
                                            }
                                        } />
                                    </div>
                                </>
                                :
                                <>
                                    <CheckCheck className="size-5" />
                                    已送达
                                </>
                        }
                    </div>
                </div>
            }
        </div>
    )
}
ReadableStream.prototype[Symbol.asyncIterator] = async function* () {
    const reader = this.getReader()
    try {
        while (true) {
            const {done, value} = await reader.read()
            if (done) return
            yield value
        }
    }
    finally {
        reader.releaseLock()
    }
}
const Chat = ({json, messageList, setMessageList, setTitle, className}) => {

    const textRef = useRef(<input />);
    const scrollRef = useRef(<div />);


    Chat.propTypes = {
        json: PropTypes.shape({
            name: PropTypes.string.isRequired,
            opening: PropTypes.string.isRequired,
            user_name: PropTypes.string.isRequired,
            prompt: PropTypes.string.isRequired,
            model: PropTypes.string.isRequired,
            temperature: PropTypes.number.isRequired,
            top_k: PropTypes.number.isRequired,
            top_p: PropTypes.number.isRequired,
            selection: PropTypes.array,
            first_selection: PropTypes.array
        }),
        messageList: PropTypes.array,
        setMessageList: PropTypes.func,
        setTitle: PropTypes.func
    }

    const send = () => {
        if (textRef.current.value.length === 0){
            return;
        }
        if (messageList.length === 0){
            summarizeTitle(textRef.current.value, setTitle)
        }
        setMessageList(
            [...messageList, {
                message: textRef.current.value,
                messageType: messageTypes.user,
            }]
        )
        textRef.current.value = ""


    }
    useEffect(() => {
        if (messageList[messageList.length - 1]?.messageType === messageTypes.user) {
            let text = []
            messageList.forEach((message) => {
                if (message.messageType === messageTypes.clear){
                    text = [];
                    return;
                }
                text.push({
                    role: message.messageType === messageTypes.robot ? "assistant" : "user",
                    content: message.message,
                })
            })
            axios.post(
                "/api/model/stream_response",
                {
                    "id": json.model,
                    "data": {
                        text: text,
                        prompt: json.prompt,
                        top_k: json.top_k,
                        top_p: json.top_p,
                        temperature: json.temperature
                    }
                }, {
                    responseType: 'stream',
                    adapter: 'fetch', // <- this option can also be set in axios.create()

                }
            ).then((res) => {
                const reader = res.data.getReader();
                return new ReadableStream({
                    start(controller) {
                        // The following function handles each data chunk
                        function push() {
                            // "done" is a Boolean and value a "Uint8Array"
                            reader.read().then(({done, value}) => {
                                // If there is no more data to read
                                if (done) {
                                    controller.close();
                                    return;
                                }

                                // Get the data and send it to the browser via the controller
                                controller.enqueue(value);
                                // Check chunks by logging to the console
                                const s = new TextDecoder().decode(value)
                                const strList = s.split("}{")
                                let jsonString
                                if (strList.length !== 1) {
                                    jsonString = JSON.parse("{" + strList[strList.length - 1]);
                                } else {
                                    jsonString = JSON.parse(s);
                                }
                                setMessageList(
                                    [...messageList, {
                                        ...jsonString,
                                        messageType: messageTypes.robot
                                    }]
                                )
                                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                                push();
                            }).catch((...error) => {
                                console.log(error)

                                toast.error("出现错误" + error.toString())
                            });
                        }

                        push();
                    },
                });
            })
        }


    }, [json.model, json.prompt, json.temperature, json.top_k, json.top_p, messageList, setMessageList]);

    const clearContext = () => {
        setMessageList(
            [...messageList, {
                messageType: messageTypes.clear
            }]
        )
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;

    }


    return (
        <div className={` form-control bg-base-200 h-full ${className}`}>
            <div ref={scrollRef} className="mt-5 gap-4 grow overflow-auto lg:px-8 pt-0 form-control rounded-xl">
                {(json.opening || json.opening.length !== 0) &&
                    <Message message={json.opening} messageType={messageTypes.robot} name={json.name} />}
                {messageList.map((jsons, index) => (
                    <Message key={index} message={jsons.message} messageType={jsons.messageType}
                             name={jsons.messageType ? json.name : json.user_name}
                             removeSelf={() => {
                                 setMessageList(messageList.filter((message) => {
                                     return message !== jsons
                                 }))
                             }} />
                ))}
                {(messageList.length === 0 && json.first_selection)
                    &&
                    json.first_selection.map((item, index) => {
                        return (
                            <div key={index}>
                                <a onClick={() => {
                                    if (messageList.length === 0){
                                        summarizeTitle(item, setTitle)
                                    }
                                    setMessageList(
                                        [...messageList, {
                                            message: item,
                                            messageType: messageTypes.user,
                                        }]
                                    )
                                }} className="btn shadow-xl bg-base-100 w-full justify-start">
                                    {item}
                                </a>
                            </div>
                        )
                    })



                }
                {(messageList.length !== 0 && messageList[messageList.length - 1].messageType === messageTypes.robot && json.first_selection)
                    &&
                    json.selection.map((item, index) => {
                        return (
                            <div key={index}>
                                <a onClick={() => {
                                    if (messageList.length === 0){
                                        summarizeTitle(item, setTitle)
                                    }
                                    setMessageList(
                                        [...messageList, {
                                            message: item,
                                            messageType: messageTypes.user,
                                        }]
                                    )
                                }} className="btn shadow-xl bg-base-100 w-full justify-start">
                                    {item}
                                </a>
                            </div>
                        )
                    })



                }
            </div>
            <div className="self-center lg:px-8 w-full flex">
                <div className="tooltip" data-tip="清除上下文">
                    <button onClick={clearContext} className="mr-2 btn-ghost btn-circle btn "><LucideEraser /></button>
                </div>
                <form onSubmit={(e) => e.preventDefault()} className="w-full join flex">
                    <input type="text" ref={textRef}
                           className="mb-4 join-item focus:outline-none grow input input-primary input-bordered" />
                    <button onClick={send} className="btn btn-primary join-item"><LucideSend /></button>
                </form>
            </div>
        </div>
    );
};

export default Chat;