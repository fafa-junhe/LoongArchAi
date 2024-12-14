import React, {memo, useContext} from 'react';
import {EdgeLabelRenderer, getBezierPath, useReactFlow} from 'reactflow';
import {LucideX} from "lucide-react";
import {ModelsContext} from "../Contexts.jsx";

const TextEdge = memo(function TextEdge({
                                     id,
                                     sourceX,
                                     sourceY,
                                     targetX,
                                     targetY,
                                     sourcePosition,
                                     targetPosition,
                                     style = {},
                                     markerEnd,
                                     label
                                 }) {
    const xEqual = sourceX === targetX;
    const yEqual = sourceY === targetY;
    const { deleteEdges } = useContext(ModelsContext).current

    const [edgePath, labelX, labelY] = getBezierPath({
        // we need this little hack in order to display the gradient for a straight line
        sourceX: xEqual ? sourceX + 0.0001 : sourceX,
        sourceY: yEqual ? sourceY + 0.0001 : sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const onEdgeClick = () => {
        console.log(deleteEdges, id)
        setTimeout(() => deleteEdges(id), 10)
    };

    return (
        <>
            <path
                id={id}
                style={style}
                className="react-flow__edge-path !stroke-info !stroke-2"
                d={edgePath}
                markerEnd={markerEnd}
            />
            <EdgeLabelRenderer>
                <div style={{
                    transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                }}
                     className="form-control items-center absolute"
                >
                    <div
                        className="line-clamp-4 text-wrap max-w-64 hover:z-50 hover:line-clamp-6 nodrag nopan pointer-events-auto  bg-base-100">
                        {label}
                    </div>
                    <div className="pointer-events-auto btn btn-circle btn-error btn-sm"
                         onClick={onEdgeClick}><LucideX /></div>
                </div>
            </EdgeLabelRenderer>
        </>
    );
});
export default TextEdge