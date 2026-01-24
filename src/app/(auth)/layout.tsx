import AuthBg from "@public/images/authbg.png"
import Image from "next/image"
import { PropsWithChildren } from "react"
const AuthLayout = ({children}:PropsWithChildren) => {
  return (
    <main className="flex">
        <div className=" hidden lg:block lg:w-1/2 shrink-0 h-screen relative">
        <Image src={AuthBg} placeholder="blur" loading="lazy" fill className="object-cover object-center" alt="auth background"/>
        </div>
        <div className="w-full">
            {children}
        </div>
    </main>
  )
}

export default AuthLayout