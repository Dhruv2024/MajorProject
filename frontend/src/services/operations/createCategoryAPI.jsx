import toast from "react-hot-toast"
import { apiConnector } from "../apiConnector";
import { categories } from "../apis";
const { CREATE_CATEGORY_API } = categories
export const createCategory = async (name, description, token) => {
    const toastId = toast.loading("Loading...");
    try {
        const response = await apiConnector("POST", CREATE_CATEGORY_API,
            {
                name,
                description
            },
            {
                Authorization: `Bearer ${token}`,
            }
        )
        if (!response?.data?.success) {
            throw new Error("Could Not create category")
        }
        toast.success("Category Created Succesfully");
    }
    catch (err) {
        console.log("Something went wrong while creating category");
        console.log("CREATE CATEGORY API ERROR............")
        toast.error(err.message)
    }
    toast.dismiss(toastId);
}