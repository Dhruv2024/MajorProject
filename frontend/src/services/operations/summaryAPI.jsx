import { toast } from "react-hot-toast"

import { apiConnector } from "../apiConnector"

import { summaryEndpoints } from "../apis";
import { useSelector } from "react-redux";
const {
    GENERATE_SUMMARY,
    GENERATE_QUIZ_RESULT_SUMMARY
} = summaryEndpoints;

const parseMessage = (message) => {
    const sections = message.split("\n\n"); // Split the message into sections based on double line breaks
    const parsedSections = sections.map((section) => {
        // Split by ** to identify headers and content
        const parts = section.split("\n");
        const header = parts[0]?.replace("**", "").trim();
        const content = parts.slice(1).join("\n").trim();

        return { header, content };
    });

    return parsedSections;
};
export function generateSummary(videoUrl, token, navigate) {
    return async (dispatch) => {
        const toastId = toast.loading("Loading...");
        let result = "";

        try {
            const response = await apiConnector(
                "POST",
                GENERATE_SUMMARY,
                { lectureUrl: videoUrl },
                { Authorization: `Bearer ${token}` }
            );

            if (!response.data.success) {
                throw new Error(response.data.message);
            }

            result = response.data.message;

            // Ensure that special characters like newlines and other formatting issues are handled correctly
            if (result) {
                // Handle escaped newlines (\r\n and \n)
                result = result.replace(/\\r\\n/g, "\r\n")  // Handle escaped \r\n
                    .replace(/\\n/g, "\n")      // Handle escaped \n
                    .trim();                    // Remove unnecessary leading/trailing whitespace

                // Replace text wrapped in ** ** with bold HTML tags
                result = result.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

                // Add line breaks after bold sections so the following text starts on a new line
                result = result.replace(/(\*\*.*?\*\*)/g, "$1<br>");

                // Ensure that each section (Problem, Solution, Market) starts on a new line
                result = result.replace(/\n/g, "<br>"); // Replace newlines with <br> to ensure proper formatting in HTML
            }

        } catch (error) {
            console.log("GENERATE SUMMARY API ERROR............", error);
            toast.error("Could Not Generate summary");
        }

        toast.dismiss(toastId);
        return result;
    }
}

export const generateQuizResultSummary = async (detailedTopicStats, token, navigate) => {

    const toastId = toast.loading("Loading...");
    let summaryResult = "";

    try {
        const quizResultTopicWise = detailedTopicStats;
        const response = await apiConnector(
            "POST",
            GENERATE_QUIZ_RESULT_SUMMARY,
            { quizResultTopicWise },
            { Authorization: `Bearer ${token}` }
        );

        if (!response.data.success) {
            throw new Error(response.data.message);
        }

        summaryResult = response.data.message;
        // console.log(summaryResult);
        // Ensure that special characters like newlines and other formatting issues are handled correctly
        if (summaryResult) {
            // Handle escaped newlines (\r\n and \n)
            summaryResult = summaryResult.replace(/\\r\\n/g, "\r\n")  // Handle escaped \r\n
                .replace(/\\n/g, "\n")      // Handle escaped \n
                .trim();                    // Remove unnecessary leading/trailing whitespace

            // Replace text wrapped in ** ** with bold HTML tags
            summaryResult = summaryResult.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

            // Add line breaks after bold sections so the following text starts on a new line
            summaryResult = summaryResult.replace(/(\*\*.*?\*\*)/g, "$1<br>");

            // Ensure that each section (Problem, Solution, Market) starts on a new line
            summaryResult = summaryResult.replace(/\n/g, "<br>"); // Replace newlines with <br> to ensure proper formatting in HTML
        }

    } catch (error) {
        console.log("GENERATE SUMMARY API ERROR............", error);
        toast.error("Could Not Generate summary");
    }

    toast.dismiss(toastId);
    return summaryResult;
}































export function signUp(
    accountType,
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    otp,
    navigate
) {
    return async (dispatch) => {
        const toastId = toast.loading("Loading...")
        dispatch(setLoading(true))
        try {
            const response = await apiConnector("POST", SIGNUP_API, {
                accountType,
                firstName,
                lastName,
                email,
                password,
                confirmPassword,
                otp,
            })

            // console.log("SIGNUP API RESPONSE............", response)

            if (!response.data.success) {
                throw new Error(response.data.message)
            }
            toast.success("Signup Successful")
            navigate("/login")
        } catch (error) {
            console.log("SIGNUP API ERROR............", error)
            toast.error("Signup Failed")
            navigate("/signup")
        }
        dispatch(setLoading(false))
        toast.dismiss(toastId)
    }
}

export function login(email, password, navigate) {
    return async (dispatch) => {
        const toastId = toast.loading("Loading...")
        dispatch(setLoading(true))
        try {
            const response = await apiConnector("POST", LOGIN_API, {
                email,
                password,
            })

            // console.log("LOGIN API RESPONSE............", response)

            if (!response.data.success) {
                throw new Error(response.data.message)
            }

            toast.success("Login Successful")
            dispatch(setToken(response.data.token))
            const userImage = response.data?.user?.image
                ? response.data.user.image
                : `https://api.dicebear.com/5.x/initials/svg?seed=${response.data.user.firstName} ${response.data.user.lastName}`
            dispatch(setUser({ ...response.data.user, image: userImage }))
            localStorage.setItem("token", JSON.stringify(response.data.token))
            localStorage.setItem("user", JSON.stringify(response.data.user));
            navigate("/dashboard/my-profile")
        } catch (error) {
            console.log("LOGIN API ERROR............", error)
            toast.error("Login Failed")
        }
        dispatch(setLoading(false))
        toast.dismiss(toastId)
    }
}


export function getPasswordResetToken(email, setEmailSent) {
    return async (dispatch) => {
        const toastId = toast.loading("Loading...")
        dispatch(setLoading(true))
        try {
            const response = await apiConnector("POST", RESETPASSTOKEN_API, {
                email,
            })

            // console.log("RESETPASSTOKEN RESPONSE............", response)

            if (!response.data.success) {
                throw new Error(response.data.message)
            }

            toast.success("Reset Email Sent")
            setEmailSent(true)
        } catch (error) {
            console.log("RESETPASSTOKEN ERROR............", error)
            toast.error("Failed To Send Reset Email")
        }
        toast.dismiss(toastId)
        dispatch(setLoading(false))
    }
}

export function resetPassword(password, confirmPassword, token, navigate) {
    return async (dispatch) => {
        const toastId = toast.loading("Loading...")
        dispatch(setLoading(true))
        try {
            const response = await apiConnector("POST", RESETPASSWORD_API, {
                password,
                confirmPassword,
                token,
            })

            // console.log("RESETPASSWORD RESPONSE............", response)

            if (!response.data.success) {
                throw new Error(response.data.message)
            }

            toast.success("Password Reset Successfully")
            navigate("/login")
        } catch (error) {
            console.log("RESETPASSWORD ERROR............", error)
            toast.error("Failed To Reset Password")
        }
        toast.dismiss(toastId)
        dispatch(setLoading(false))
    }
}

export function logout(navigate) {
    return (dispatch) => {
        dispatch(setToken(null))
        dispatch(setUser(null))
        dispatch(resetCart())
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        toast.success("Logged Out")
        navigate("/")
    }
}