import { useContext } from "react"
import ChangeProfilePicture from "./ChangeProfilePicture"
import DeleteAccount from "./DeleteAccount"
import EditProfile from "./EditProfile"
import UpdatePassword from "./UpdatePassword"
import { ThemeContext } from "../../../../provider/themeContext"

export default function Settings() {
  const { darkTheme } = useContext(ThemeContext);
  return (
    <>
      <h1 className={`mb-14 text-3xl font-medium ${darkTheme ? "text-richblack-5" : " text-black"}`}>
        Edit Profile
      </h1>
      {/* Change Profile Picture */}
      <ChangeProfilePicture darkTheme={darkTheme} />
      {/* Profile */}
      <EditProfile />
      {/* Password */}
      <UpdatePassword />
      {/* Delete Account */}
      <DeleteAccount />
    </>
  )
}