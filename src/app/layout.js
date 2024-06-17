import { Inter } from 'next/font/google'
import Image from 'next/image'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {

  title: `❌n⭕`,
  description: 'Play with your friends',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
      <Image src={'/bg.jpg'} className='abs' fill sizes='100%' priority alt='...'/>
      {children}
      <script src="https://kit.fontawesome.com/e2d9bf708f.js" crossorigin="anonymous" defer></script>
      </body>
    </html>
  )
}
