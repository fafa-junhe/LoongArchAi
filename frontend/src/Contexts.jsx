import {createContext, useRef} from "react";

export const ModelsContext = createContext(
    {
        current: {
            models: null,
            run: null,
            deleteEdges: null
        }
    }
);
export const FrameContext = createContext({});
export const FlowContext = createContext({});
export const AppContext = createContext({});
