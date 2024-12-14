import {useDroppable} from '@dnd-kit/core';

export default function DesignPanel({children}) {
    const {isOver, setNodeRef} = useDroppable({
        id: 'droppable',
    });
    const style = {
        background: isOver ? 'green' : undefined,
    };
    return (
        <div ref={setNodeRef} style={style} className="h-screen flex-1">
            <div
                className="h-screen overflow-y-scroll scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar scrollbar-thumb-slate-700 scrollbar-track-slate-300">
                <div className="h-screen bg-slate-400">
                    {children}
                </div>
            </div>
        </div>
    )
}