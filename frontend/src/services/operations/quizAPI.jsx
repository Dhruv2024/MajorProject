import { apiConnector } from "../apiConnector"
import { toast } from "react-hot-toast"
import { quizEndpoints } from "../apis";
const {
    FETCH_QUIZ
} = quizEndpoints;

export const fetchQuiz = async (data, token) => {
    const toastId = toast.loading("Loading...");
    let quiz;
    try {
        const response = await apiConnector("POST", FETCH_QUIZ, data, {
            Authorization: `Bearer ${token}`,
        })
        // console.log("response of fetchQuiz...");
        // console.log(response?.data?.data);
        quiz = response?.data?.data;
    }
    catch (error) {
        console.log("FETCH_QUIZ_API API ERROR............", error)
        toast.error(error.message)
    }
    toast.dismiss(toastId);
    return quiz;
}