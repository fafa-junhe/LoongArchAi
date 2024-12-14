import PropTypes from "prop-types";
import { PenLine } from "lucide-react";
import { useState } from "react";
import { useReactFlow } from "reactflow";

NodeHeader.propTypes = {
    nodeId: PropTypes.string.isRequired,
    label: PropTypes.string,
    color: PropTypes.oneOf(["primary", "success", "accent", "secondary"]),
    isViewMode: PropTypes.bool
};

const colorVariants = {
    primary: "bg-primary",
    success: "bg-success",
    accent: "bg-accent",
    secondary: "bg-secondary",
};

const textVariants = {
    primary: "text-primary-content",
    success: "text-success-content",
    accent: "text-accent-content",
    secondary: "text-accent-secondary",
};

const strokeVariants = {
    primary: "text-primary-content",
    success: "text-success-content",
    accent: "text-accent-content",
    secondary: "text-accent-secondary",
};

const borderVariants = {
    primary: "border-b-primary-content border-b",
    success: "border-b-success-content border-b",
    accent: "border-b-accent-content border-b",
    secondary: "border-b-secondary-content border-b",
};

export default function NodeHeader({ label, color = "primary", nodeId }) {
    const [editMode, setEditMode] = useState(false);
    const [currentLabel, setCurrentLabel] = useState(label);

    // Only call useReactFlow if isViewMode is false
    const reactFlow = useReactFlow();

    const saveLabel = () => {
        setEditMode(false);
        if (reactFlow) {
            const { setNodes } = reactFlow;
            setNodes((nodes) =>
                nodes.map((n) => {
                    if (n.id === nodeId) {
                        n.data = { ...n.data, label: currentLabel };
                    }
                    return n;
                })
            );
        }
    };

    return (
        <>
            {!editMode && <div className="node-header-drag absolute h-9 w-full"></div>}
            <div className={`node-header ${colorVariants[color]}`}>

                        <div>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    saveLabel();
                                }}
                            >
                                <input
                                    type="text"
                                    value={currentLabel}
                                    onChange={(e) => {
                                        setCurrentLabel(e.target.value);
                                    }}
                                    className={`text-center ${editMode ? borderVariants[color] : ""} ${colorVariants[color]} outline-none font-bold text-md ${textVariants[color]}`}
                                />
                            </form>
                        </div>
                        <PenLine
                            onClick={() => {
                                if (editMode) saveLabel();
                                setEditMode(!editMode);
                            }}
                            className={`absolute top-2.5 right-2 cursor-pointer size-6 ${strokeVariants[color]}`}
                        />

            </div>
        </>
    );
}