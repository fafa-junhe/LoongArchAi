import {
    Workflow, Home, Earth, AppWindow, Package, Trash2, LucideLogOut, User

} from "lucide-react"
import Logo from "./Logo.jsx";
import {NavLink} from 'react-router-dom'
import useTokenStore from "../states/state.js";


export default function SidePanel({children}) {
    const {clearTokens, user} = useTokenStore();

    return (<div className="w-screen drawer lg:drawer-open">
        <input id="drawer" type="checkbox" className="drawer-toggle"/>
        <div className="drawer-content">
            {children}
        </div>
        <div className="[&_svg]:size-4 border-r-2 drawer-side">
            <label htmlFor="drawer" className="drawer-overlay"></label>
            <div className="bg-base-100 min-h-full form-control">
                <ul className="form-control [&_a]:mx-4 [&_a]:my-2 [&_:has(a.active)_svg]:fill-primary-content [&_:has(a.active)_a.active]:font-bold [&_a]:font-semibold [&_:has(a.active)_a.active]:!opacity-100 [&_a]:opacity-50 [&_a]:items-center [&_svg]:mr-2 [&_a]:flex [&_a]:w-full grow gap-1 p-4 w-64 min-h-full">
                    <div className="form-control mb-5">
                        <div className="flex">
                            <Logo />
                        </div>
                    </div>
                    <li><NavLink to="/"><Home />主页</NavLink></li>
                    <li><NavLink
                        to="/flows"><Workflow />我的功能</NavLink></li>
                    <li><NavLink
                        to="/apps"><AppWindow />我的应用</NavLink></li>
                    <li><NavLink
                        to="/models"><Package />所有模型</NavLink></li>
                    <li><NavLink
                        to="/community"><Earth />社区</NavLink></li>
                    <li><NavLink
                        to={`/user/${user.id}`}><User />个人中心</NavLink></li>
                    <div className="grow"></div>
                    <li>
                        <a href="#"
                           onClick={clearTokens}><LucideLogOut />登出
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </div>)
}