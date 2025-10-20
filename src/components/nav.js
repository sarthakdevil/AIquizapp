"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const Navbar = () => {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleNavigation = (path) => {
    router.push(path)
    setIsMenuOpen(false)
  }

  return (
    <nav className="bg-indigo-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <button
                onClick={() => handleNavigation("/")}
                className="bg-yellow-500 hover:bg-yellow-600 text-indigo-900 font-extrabold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105"
              >
                Quizify
              </button>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Button
                variant="ghost"
                className="text-white hover:bg-indigo-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-300 ease-in-out"
                onClick={() => handleNavigation("/")}
              >
                pdfify
              </Button>
              <Button
                variant="ghost"
                className="text-white hover:bg-indigo-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-300 ease-in-out"
                onClick={() => handleNavigation("/create")}
              >
                create quiz
              </Button>
              <Button
                variant="ghost"
                className="text-white hover:bg-indigo-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-300 ease-in-out"
                onClick={() => handleNavigation("/multiplayer")}
              >
                multiplayer
              </Button>
              <Button
                variant="ghost"
                className="text-white hover:bg-indigo-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-300 ease-in-out"
                onClick={() => handleNavigation("/otherquiz")}
              >
                other quizzes
              </Button>
            </div>
          </div>
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-indigo-800">
                <DropdownMenuItem
                  onClick={() => handleNavigation("/")}
                  className="text-white hover:bg-indigo-700 cursor-pointer"
                >
                  pdfify
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleNavigation("/create")}
                  className="text-white hover:bg-indigo-700 cursor-pointer"
                >
                  create quiz
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleNavigation("/multiplayer")}
                  className="text-white hover:bg-indigo-700 cursor-pointer"
                >
                  multiplayer
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleNavigation("/otherquiz")}
                  className="text-white hover:bg-indigo-700 cursor-pointer"
                >
                  other quizzes
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

