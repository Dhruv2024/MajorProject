import { useContext } from "react"
import loginImg from "../assets/Images/login.webp"
import Template from "../components/core/Auth/Template"
import { ThemeContext } from "../provider/themeContext"

function Login() {
    const { darkTheme } = useContext(ThemeContext);
    return (
        <Template
            title="Welcome Back"
            description1="Build skills for today, tomorrow, and beyond."
            description2="Education to future-proof your career."
            image={loginImg}
            formType="login"
            darkTheme={darkTheme}
        />
    )
}

export default Login