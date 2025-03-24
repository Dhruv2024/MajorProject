import { messageEndpoints } from "../apis"
import { apiConnector } from "../apiConnector"
import toast from "react-hot-toast";
const { VALIDATE_USER, FETCH_MESSAGES, FETCH_COURSE_DETAILS } = messageEndpoints

export const validateUser = async (roomId, token, navigate) => {
    let validatedUser = false;
    const toastId = toast.loading("Loading...");

    try {
        const response = await apiConnector("POST", VALIDATE_USER, { roomId }, {
            Authorization: `Bearer ${token}`,
        })
        // console.log(response);
        if (response?.data?.status) {
            validatedUser = true;
        }
        else {
            navigate("/dashboard/my-profile")
        }
    }
    catch (error) {
        console.log("EVALIDATE USER API ERROR............", error)
        toast.error(error.message)
    }
    toast.dismiss(toastId)
    return validatedUser;
}

export const fetchMessages = async (roomId, token, setMessages, navigate) => {
    const toastId = toast.loading("Loading...");

    try {
        const response = await apiConnector("POST", FETCH_MESSAGES, { roomId }, {
            Authorization: `Bearer ${token}`,
        })
        console.log("Response of Fetch Messages...");
        console.log(response);
        if (response?.data?.success) {
            setMessages(response?.data?.messages);
        }
        else {
            navigate("/dashboard/my-profile")
        }
    }
    catch (error) {
        console.log("EVALIDATE USER API ERROR............", error)
        toast.error(error.message)
    }
    toast.dismiss(toastId)
}

export const fetchRoomDetailsForRoom = async (roomId, token, navigate) => {
    const toastId = toast.loading("Loading...");
    let response;
    try {
        const [courseDetails, messageDetails] = await Promise.all([
            await apiConnector("POST", FETCH_COURSE_DETAILS, { roomId }, {
                Authorization: `Bearer ${token}`,
            }),
            await apiConnector("POST", FETCH_MESSAGES, { roomId }, {
                Authorization: `Bearer ${token}`,
            })
        ])
        // console.log("Response of Fetch Course Deatils...");
        // console.log(courseDetails);
        // console.log("response of messagesDetails");
        // console.log(messageDetails)
        if (courseDetails?.data?.success && messageDetails?.data?.success) {
            response = [
                courseDetails?.data?.courseDetails?.courseName,
                messageDetails?.data?.messages,
            ]
        }
        else {
            navigate("/dashboard/my-profile")
        }
    }
    catch (error) {
        console.log("EVALIDATE USER API ERROR............", error)
        toast.error(error.message)
    }
    toast.dismiss(toastId)
    return response;
}
