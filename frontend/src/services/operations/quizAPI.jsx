import { apiConnector } from "../apiConnector"
import { toast } from "react-hot-toast"
import { quizEndpoints } from "../apis";
const {
    FETCH_QUIZ, SUBMIT_QUIZ, GET_QUIZ_RESULT
} = quizEndpoints;

export const fetchQuiz = async (data, token, navigate, location) => {
    const toastId = toast.loading("Loading...");
    let quiz;
    try {
        const response = await apiConnector("POST", FETCH_QUIZ, data, {
            Authorization: `Bearer ${token}`,
        })
        // console.log("response of fetchQuiz...");
        // console.log(response?.data?.data);
        if (response?.data?.attempted) {
            toast.error("You have already attempted the quiz");
            // console.log(location);
            if (window.history.length > 1) {
                navigate(-1);
            }
        }
        quiz = response?.data?.data;
    }
    catch (error) {
        console.log("FETCH_QUIZ_API API ERROR............", error)
        toast.error(error.message)
    }
    toast.dismiss(toastId);
    return quiz;
}

export const submitQuiz = async (data, token) => {
    const toastId = toast.loading("Submitting...");
    let result;
    try {
        const response = await apiConnector("POST", SUBMIT_QUIZ, data, {
            Authorization: `Bearer ${token}`,
        });

    }
    catch (error) {
        console.log("SUBMIT_QUIZ_API API ERROR............", error)
        toast.error(error.message)
    }
    finally {
        toast.dismiss(toastId);
    }
}

export const getQuizResult = async (quizId, token) => {
    const toastId = toast.loading("Submitting...");
    let result;
    try {
        const response = await apiConnector("POST", GET_QUIZ_RESULT, { quizId }, {
            Authorization: `Bearer ${token}`,
        });
        // console.log("Fetched quiz Result");
        // console.log(response?.data);
        result = response?.data;
    }
    catch (error) {
        console.log("GET_QUIZ_RESULT API ERROR............", error)
        toast.error(error.message)
    }
    finally {
        toast.dismiss(toastId);
    }
    return result;
}