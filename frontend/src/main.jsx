import {StrictMode} from 'react'
import ReactDOM from 'react-dom/client'

import './index.css'
import {createBrowserRouter, RouterProvider,} from "react-router-dom";
import Home from './routes/Home.jsx'
import View from './routes/View.jsx';
import DesignPage from "./routes/Design.jsx";
import ErrorPage from "./error-page";
import Frame from "./components/Frame.jsx";
import Flows from "./routes/Flows.jsx";
import Community from "./routes/Community.jsx";
import Models from "./routes/Models.jsx";
import ModelsTest from "./routes/ModelsTest.jsx";
import DrawingPage from "./routes/DrawingPage.jsx";
import Root from "./routes/Root.jsx";
import LoginLike from "./components/Page/LoginLike.jsx";
import User from "./routes/User.jsx";
import App from "./routes/App.jsx";
import Chat from "./components/Chat.jsx";
import DesignChat from "./routes/DesignChat.jsx";
import ViewChat from "./routes/ViewChat.jsx";
import AppList from "./components/AppList.jsx";
import Apps from "./routes/Apps.jsx";
import errorLogging from "./errorLogging.js";
import 'react-app-polyfill/ie11'; // if you need to support Internet Explorer 11
import 'react-app-polyfill/stable'; // for other modern features
import 'core-js/stable'; // polyfills for various ES6+ features
import 'regenerator-runtime/runtime'; // for async/await
import 'whatwg-fetch'; // polyfill for fetch API

// Save the original console.error method
const originalConsoleError = console.error;

// Override console.error
console.error = (...args) => {
    // Call the original console.error method
    originalConsoleError.apply(console, args);

    // Send the error to the backend
    errorLogging.logError(...args);
};

const router = createBrowserRouter([
        {
            path: "/",
            element: <Root/>,
            errorElement: <ErrorPage />,
            children: [
                {
                    path: "/design/:flowId",
                    element: <DesignPage/>,
                },
                {
                    path: "/design/chat/:flowId",
                    element: <DesignChat/>
                },
                {
                    path: "/app/:appId",
                    element: <App/>,
                },
                {
                    path: "draw",
                    element: <DrawingPage/>
                },
                {
                    path: "/chat/:flowId/:chatId?",
                    element: <ViewChat/>,
                },
                {
                    path: "/",
                    element: <Frame/>,
                    children: [
                        {
                            path: "",
                            element: <Home/>
                        },
                        {
                            path: "flows",
                            element: <Flows/>
                        },
                        {
                            path: "community",
                            element: <Community/>
                        },
                        {
                            path: "apps",
                            element: <Apps/>
                        },
                        {
                            path: "models",
                            element: <Models/>
                        },
                        {
                            path: "trash",
                            element: <DrawingPage/>
                        },
                        {
                            path: "/view/:flowId",
                            element: <View/>
                        },
                        {
                            path: "/user/:userId",
                            element: <User />
                        }
                    ]
                }
            ]

        }
    ]
);


ReactDOM.createRoot(document.getElementById('root')).render(
    <StrictMode>


        <RouterProvider router={router}/>
    </StrictMode>,
)
