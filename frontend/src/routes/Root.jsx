import {Outlet, ScrollRestoration} from "react-router-dom";
import React, {useEffect} from "react";
import {Toaster} from "react-hot-toast";
import {CookiesProvider} from "react-cookie";
import {themeChange} from "theme-change";

export default function Root() {
    useEffect(() => {
        themeChange(false)
    }, [])
    return (
        <div>
            <CookiesProvider>

            <Toaster
                position="top-center"
                reverseOrder={false}
                toastOptions={{
                    // Define default options
                    className: '!bg-primary/75 !text-primary-content !drop-shadow-2xl !glass',
                    // Default options for specific types
                    success: {
                        theme: {
                            primary: 'green',
                            secondary: 'black',
                        },
                    },
                }}
            />

            <Outlet></Outlet>
            <ScrollRestoration/>
            </CookiesProvider>
        </div>
    )
}