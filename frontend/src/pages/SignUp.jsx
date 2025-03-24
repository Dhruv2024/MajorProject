import { useContext } from "react"
import signupImg from "../assets/Images/signup.webp"
// import signupImg from "../assets/Images/eduSphereSignup.webp"
import Template from "../components/core/Auth/Template"
import { ThemeContext } from "../provider/themeContext"


function Signup() {
    const { darkTheme } = useContext(ThemeContext)
    return (
        <Template
            title="Join the millions learning to code with EduSphere for free"
            description1="Build skills for today, tomorrow, and beyond."
            description2="Education to future-proof your career."
            image={signupImg}
            formType="signup"
            darkTheme={darkTheme}
        />
    )
}

export default Signup