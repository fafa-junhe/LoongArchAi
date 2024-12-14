import {Boxes } from "lucide-react";

export default function Logo({className = "", name = "龙芯元AI"}) {
    return (
        <div className={"btn btn-ghost flex gap-2 text-lg font-extrabold" + className}>
            <Boxes strokeWidth={0.4} className="!size-8 stroke-primary"/>
            {name}
        </div>
    )
}