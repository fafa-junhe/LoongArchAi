import PropTypes from 'prop-types'

export default function LoginLike({children, title = "欢迎登录平台"}) {
    LoginLike.propTypes = {
        children: PropTypes.node.isRequired,
    }
    return (
        <div className="flex items-center justify-center h-[80vh]">
            <div className="block w-[90vw]">
                <div className="shadow-2xl card bg-base-300 h-[80vh]">
                    <div className="card-body">
                        <div className="h-20 w-20"></div>
                        <h1 className="text-center text-xl">{title}</h1>
                        <p>Click the button to watch on Jetflix app.</p>
                        <div className="justify-end card-actions">
                            <button className="btn btn-primary">Watch</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}