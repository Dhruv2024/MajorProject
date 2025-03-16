import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import SignUp from './pages/SignUp'
import Home from './pages/Home'
import Login from './pages/Login'
import { VerifyEmail } from './pages/VerifyEmail'
import { IoSunnyOutline } from "react-icons/io5";
import Navbar from './components/common/Navbar';
import { IoMoonOutline } from "react-icons/io5";
import { ForgotPassword } from './pages/ForgotPassword'
import { UpdatePassword } from './pages/UpdatePassword'
import OpenRoute from './components/core/Auth/OpenRoute'
import { useSelector } from 'react-redux'
import { Error } from './pages/Error'

function App() {
  const [darkTheme, setTheme] = useState(false);
  const { user } = useSelector((state) => state.profile);
  useEffect(() => {
    const handleContextmenu = e => {
      e.preventDefault()
    }
    document.addEventListener('contextmenu', handleContextmenu)
    return function cleanup() {
      document.removeEventListener('contextmenu', handleContextmenu)
    }
  }, [])
  return (
    <div className={`w-screen min-h-screen ${darkTheme ? "bg-richblack-900 text-white" : "bg-white text-black"} flex flex-col font-inter `}>
      <Navbar darkTheme={darkTheme} />
      {
        darkTheme ? (
          <IoSunnyOutline className=' text-blue-50 text-4xl fixed bottom-2 right-2 cursor-pointer' onClick={
            () => {
              setTheme(!darkTheme);
            }
          } />
        ) : (
          <IoMoonOutline className=' text-blue-50 text-4xl fixed bottom-2 right-2 cursor-pointer' onClick={
            () => {
              setTheme(!darkTheme);
            }
          } />
        )
      }

      <Routes>
        <Route path='/' element={<Home darkTheme={darkTheme} />} />
        <Route path='/signup' element={
          <OpenRoute>
            <SignUp darkTheme={darkTheme} />
          </OpenRoute>
        } />
        <Route path='/login' element={
          <OpenRoute>
            <Login darkTheme={darkTheme} />
          </OpenRoute>
        } />
        <Route path='/verify-email' element={
          <OpenRoute>
            <VerifyEmail darkTheme={darkTheme} />
          </OpenRoute>
        } />
        <Route path='/forgot-password' element={
          <OpenRoute>
            <ForgotPassword darkTheme={darkTheme} />
          </OpenRoute>
        } />
        <Route
          path="update-password/:id"
          element={
            <OpenRoute>
              < UpdatePassword darkTheme={darkTheme} />
            </OpenRoute>
          }
        />
        <Route path="*" element={<Error darkTheme={darkTheme} />} />
      </Routes>
    </div>
  )
}

export default App
