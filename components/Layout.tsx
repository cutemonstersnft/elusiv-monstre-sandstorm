import { PropsWithChildren } from "react";
import Footer from "./Footer";

export default function Layout({ children }: PropsWithChildren<{}>) {
  return (
    <div className='min-h-screen flex flex-col gap-16 bg-gradient-to-b from-gray-700 via-gray-900 to-black'>
      <main className='mb-auto pt-24'>
        {children}
      </main>
      <Footer />
    </div>
  )
}
