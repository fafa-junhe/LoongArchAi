import { useCallback, useEffect, useRef, useState } from "react";

export default function useContextMenu() {
    const [visible, setVisible] = useState(false);
    const [initialPoints, setInitialPoints] = useState({ x: -1, y: -1 });
    const [points, setPoints] = useState({ x: -1, y: -1 });
    const [contextMenuContent, setContextMenuContent] = useState(null);
    const contextMenuRef = useRef(null);

    const onContextMenu = useCallback((e) => {
        e.preventDefault();
        setInitialPoints({ x: e.pageX, y: e.pageY });
        setVisible(true);
    }, []);

    const onMouseDownCapture = useCallback((e) => {
        if (e.button === 0 && visible) {
            setVisible(false);
            setPoints({ x: -1, y: -1 });
        }
    }, [visible]);

    useEffect(() => {
        if (visible && contextMenuRef.current) {
            const menuWidth = contextMenuRef.current.scrollWidth;
            const menuHeight = contextMenuRef.current.scrollHeight;
            const { innerWidth: windowWidth, innerHeight: windowHeight } = window;

            let x = initialPoints.x;
            let y = initialPoints.y;

            if (x + menuWidth > windowWidth) {
                x -= menuWidth / 2;
            }
            if (y + menuHeight > windowHeight + 90) {
                y -= menuHeight / 2;
            }
            if (y + menuHeight > windowHeight + 80) {
                y -= menuHeight / 2;
            }

            setPoints({ x, y });
        }
    }, [visible, initialPoints]);

    const Menu = () => (
        visible && contextMenuContent !== null && (
            <div
                onContextMenu={(e) => e.preventDefault()}
                className="context-menu"
                style={{
                    top: points.y === -1 ? "-9999px" : points.y + "px",
                    left: points.x === -1 ? "-9999px" : points.x + "px"
                }}
            >
                <ul
                    ref={contextMenuRef}
                    onClick={(e) => {
                        console.log(e.target.parentElement)
                        setVisible(false);
                        setPoints({ x: -1, y: -1 });

                    }}
                    className="w-44 p-3 menu"
                >
                    <div>
                    {contextMenuContent}
                    </div>
                </ul>
            </div>
        )
    );

    return [onContextMenu, onMouseDownCapture, Menu, setContextMenuContent];
}