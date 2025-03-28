import "./App.css";
import { Route, Routes } from "react-router-dom";
import Home from './pages/Home'
import Navbar from './components/common/Navbar';
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import OpenRoute from './components/core/Auth/OpenRoute'
import { ForgotPassword } from './pages/ForgotPassword'
import { UpdatePassword } from './pages/UpdatePassword'
import { VerifyEmail } from './pages/VerifyEmail'
import { About } from "./pages/About";
import { Dashboard } from './pages/Dashboard'
import { MyProfile } from './components/core/Dashboard/MyProfile'
import { Error } from './pages/Error'
import PrivateRoute from './components/core/Auth/PrivateRoute'
import Settings from "./components/core/Dashboard/Settings";
import { EnrolledCourses } from "./components/core/Dashboard/EnrolledCourses";
import Cart from "./components/core/Dashboard/Cart/index";
import { useDispatch, useSelector } from "react-redux";
import { ACCOUNT_TYPE } from "./utils/constants";
// import Contact from "./pages/Contact";
import AddCourse from "./components/core/Dashboard/AddCourse";
import MyCourses from "./components/core/Dashboard/MyCourses";
import EditCourse from "./components/core/Dashboard/EditCourse";
import Catalog from "./pages/Catalog";
import CourseDetails from "./pages/CourseDetails";
import ViewCourse from "./pages/ViewCourse";
import VideoDetails from "./components/core/ViewCourse/VideoDetails";
import Instructor from "./components/core/Dashboard/Instructor";
import { useContext, useEffect, useState } from "react";
import CreateCategory from "./components/core/Dashboard/AdminDashboard/CreateCategory";
import { io } from 'socket.io-client';
import { SocketContext } from "./provider/socketContext";
import ChatPage from "./pages/ChatPage";
import { IoSunnyOutline } from "react-icons/io5";
import { IoMoonOutline } from "react-icons/io5";
import { ThemeContext } from "./provider/themeContext";


function App() {
  // const [darkTheme, setTheme] = useState(false);
  const { user } = useSelector((state) => state.profile);
  useEffect(() => {
    const handleContextmenu = e => {
      e.preventDefault()
    }
    document.addEventListener('contextmenu', handleContextmenu)
    return function cleanup() {
      document.removeEventListener('contextmenu', handleContextmenu)
    }
  }, []);
  // const dispatch = useDispatch();
  // useEffect(() => {
  //   socket.connect();
  //   // console.log(socket);
  //   if (socket.connected) {
  //     dispatch(setSocket(socket));
  //   }
  //   return () => {
  //     dispatch(disconnectSocket());  // Disconnect socket and clear Redux state
  //   };
  // }, [dispatch])
  const { socket, setSocket } = useContext(SocketContext);
  const { darkTheme, toggleTheme } = useContext(ThemeContext)
  useEffect(() => {
    const establishConnection = async () => {
      if (socket?.connected) {
        console.log("socket already connected");
        return;
      }

      // Create a new socket connection
      // console.log(import.meta.env.VITE_APP_SOCKET_URL)
      const newSocket = io(import.meta.env.VITE_SOCKET_URL, {
        transports: ['websocket', 'polling'], // Ensure proper fallback transports
      });

      // Wait for the socket to connect
      await new Promise((resolve, reject) => {
        newSocket.on('connect', () => {
          resolve(newSocket); // Resolve once connected
        });
        newSocket.on('connect_error', (err) => {
          reject(err); // Reject if there's a connection error
        });
      });

      setSocket(newSocket); // Set the socket in the context
      // console.log("new socket established", newSocket);

      return () => {
        if (newSocket.connected) {
          newSocket.disconnect();
          console.log("socket disconnected");
        }
      };
    };

    establishConnection().catch((err) => {
      console.error("Socket connection failed:", err);
    });
  }, []);

  return (
    <div className={`w-screen min-h-screen ${darkTheme ? "bg-richblack-900 text-white" : "bg-white text-black"} flex flex-col font-inter `}>
      <Navbar darkTheme={darkTheme} />
      {
        darkTheme ? (
          <IoSunnyOutline className=' text-blue-50 text-4xl fixed bottom-2 right-2 cursor-pointer z-20' onClick={
            () => {
              toggleTheme();
            }
          } />
        ) : (
          <IoMoonOutline className=' text-blue-50 text-4xl fixed bottom-2 right-2 cursor-pointer z-20' onClick={
            () => {
              toggleTheme();
            }
          } />
        )
      }

      <Routes>
        <Route path='/' element={<Home />} />
        <Route path="/catalog/:catalogName" element={<Catalog />} />
        <Route path="courses/:courseId" element={<CourseDetails />} />
        <Route path='/signup' element={
          <OpenRoute>
            <SignUp />
          </OpenRoute>
        } />
        <Route path='/login' element={
          <OpenRoute>
            <Login />
          </OpenRoute>
        } />
        <Route path='/verify-email' element={
          <OpenRoute>
            <VerifyEmail />
          </OpenRoute>
        } />
        <Route path='/forgot-password' element={
          <OpenRoute>
            <ForgotPassword />
          </OpenRoute>
        } />
        <Route
          path="update-password/:id"
          element={
            <OpenRoute>
              < UpdatePassword />
            </OpenRoute>
          }
        />
        <Route
          path="about"
          element={<About />}
        />
        {/* <Route
          path="/contact"
          element={<Contact />}
        /> */}
        <Route
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        >
          <Route path="/dashboard/my-profile" element={<MyProfile />} />
          <Route path="/dashboard/settings" element={<Settings />} />
          <Route path="/dashboard/chat/:roomId" element={<ChatPage />} />
          {
            user?.accountType === ACCOUNT_TYPE.STUDENT && (
              <>
                <Route path="/dashboard/enrolled-courses" element={<EnrolledCourses />} />
                <Route path="/dashboard/cart" element={<Cart />} />
              </>
            )
          }
          {
            user?.accountType === ACCOUNT_TYPE.INSTRUCTOR && (
              <>
                <Route path="dashboard/instructor" element={<Instructor />} />
                <Route path="dashboard/add-course" element={<AddCourse />} />
                <Route path="dashboard/my-courses" element={<MyCourses />} />
                <Route path="dashboard/edit-course/:courseId" element={<EditCourse />} />
              </>
            )
          }{
            user?.accountType === ACCOUNT_TYPE.ADMIN && (
              <>
                <Route path="/dashboard/create-category" element={<CreateCategory />} />
              </>
            )
          }
        </Route>
        <Route element={
          <PrivateRoute>
            <ViewCourse />
          </PrivateRoute>
        }>

          {
            user?.accountType === ACCOUNT_TYPE.STUDENT && (
              <>
                <Route
                  path="view-course/:courseId/section/:sectionId/sub-section/:subSectionId"
                  element={<VideoDetails />}
                // element={"Hello"}
                />
              </>
            )
          }

        </Route>
        <Route path="*" element={<Error />} />
      </Routes>
    </div>
  )
}

export default App
