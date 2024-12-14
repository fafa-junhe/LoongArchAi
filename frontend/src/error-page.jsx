import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
    const error = useRouteError();
    console.error(error);

    return (
        <div className="w-screen gap-8 h-screen form-control justify-center items-center">
            <p className="text-5xl">不好！</p>
            <p>有些坏事发生了。</p>
            <p>
                <i>{error.statusText || error.message}</i>
            </p>
        </div>
    );
}