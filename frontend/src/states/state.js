// src/store/tokenStore.js
import create from 'zustand';
import { persist } from 'zustand/middleware';
import { axios } from "../Constrains.jsx";
import createAuthRefreshInterceptor from 'axios-auth-refresh';
import { toast } from "react-hot-toast";
import storage from "../storage.jsx";

const useFlowRunning = create(
    (set) => ({
        models: {},
        setModels: (newModels) => () => ({
            models: newModels,
        }),

    })
)

// 创建Token Store
const useTokenStore = create(
    persist(
        (set) => ({
            accessToken: '',
            refreshToken: '',
            setTokens: (accessToken, refreshToken) => {
                axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                set({ accessToken, refreshToken });
            },
            clearTokens: () => {
                axios.post("/api/logout_access").then(() => {});
                axios.post("/api/logout_refresh", {
                }, {
                    headers: {
                        Authorization: `Bearer ${useTokenStore.getState().refreshToken}`
                    },
                }).then(() => {
                    toast.success("成功登出账号");
                });
                set({
                    accessToken: '',
                    refreshToken: '',
                    user: {
                        username: null,
                        nickname: null,
                        phone: null,
                        avatar: null,
                        id: null
                    }
                });
                window.indexedDB.deleteDatabase("keyval-store")
                delete axios.defaults.headers.common['Authorization'];
                window.location.reload();

            },
            user: {
                username: null,
                nickname: null,
                phone: null,
                avatar: null,
                id: null
            },
            setUser: (user) => {
                set({ user });
            }
        }),
        {
            name: 'token-storage', // 用于存储token的唯一名称
            getStorage: () => storage, // 使用localStorage进行存储
        }
    )
);

// 定义刷新授权逻辑
export const refreshAuthLogic = async (failedRequest) => {
    const { refreshToken } = useTokenStore.getState();

    if (!refreshToken) {
        // 如果没有refreshToken，则跳过重试
        return Promise.reject(failedRequest);
    }

    try {
        const response = await axios.get('/api/access', {
            headers: {
                'Authorization': `Bearer ${refreshToken}`
            }
        });
        console.log(response.data);
        const accessToken = response.data["access_token"];
        // 更新本地存储的accessToken
        useTokenStore.getState().setTokens(accessToken, refreshToken);

        // 更新失败请求的Authorization头部
        failedRequest.response.config.headers['Authorization'] = `Bearer ${accessToken}`;
        return Promise.resolve();
    } catch (error) {
        useTokenStore.getState().clearTokens();
        return Promise.reject(error);
    }
};



export default useTokenStore;