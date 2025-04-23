const {instance} = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");

const { default: mongoose } = require("mongoose");
const crypto = require("crypto");
const { courseEnrollmentEmail } = require("../mail/templates/courseEnrollmentEmail");
const { paymentSuccessEmail } = require("../mail/templates/paymentSuccessfulEmail");
const CourseProgress = require("../models/CourseProgress");
const CourseExpiry = require("../models/CourseExpiry");
const Rooms = require("../models/Rooms");

//initiate the razorpay order
exports.capturePayment = async(req, res) => {

    const {courses,reEnroll} = req.body;
    const userId = req.user.id;

    if(courses.length === 0) {
        return res.json({success:false, message:"Please provide Course Id"});
    }

    let totalAmount = 0;

    for(const course_id of courses) {
        let course;
        try{
           
            course = await Course.findById(course_id);
            if(!course) {
                return res.status(200).json({success:false, message:"Could not find the course"});
            }

            const uid  = new mongoose.Types.ObjectId(userId);
            if(course.studentsEnrolled.includes(uid) && !reEnroll) {
                return res.status(200).json({success:false, message:"Student is already Enrolled"});
            }
            if (!course?.enrollmentOpen) {
                return res.status(403).json({
                    success: false,
                    message: `Enrollment is currently closed for ${course.courseName}`,
                });
            }
            totalAmount += course.price;
        }
        catch(error) {
            console.log(error);
            return res.status(500).json({success:false, message:error.message});
        }
    }
    const currency = "INR";
    const options = {
        amount: totalAmount * 100,
        currency,
        receipt: Math.random(Date.now()).toString(),
    }

    try{
        const paymentResponse = await instance.orders.create(options);
        res.json({
            success:true,
            message:paymentResponse,
        })
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({success:false, mesage:"Could not Initiate Order"});
    }

}


//verify the payment
exports.verifyPayment = async(req, res) => {
    const razorpay_order_id = req.body?.razorpay_order_id;
    const razorpay_payment_id = req.body?.razorpay_payment_id;
    const razorpay_signature = req.body?.razorpay_signature;
    const courses = req.body?.courses;
    console.log("printing.........");
    // console.log(req.body);
    const {reEnroll} = req.body || false;
    const userId = req.user.id;
    console.log(reEnroll);
    if(!razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature || !courses || !userId) {
            return res.status(200).json({success:false, message:"Payment Failed"});
    }

    let body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(body.toString())
        .digest("hex");

        if(expectedSignature === razorpay_signature) {
            //enroll karwao student ko
            await enrollStudents(courses, userId, res,reEnroll);
            //return res
            return res.status(200).json({success:true, message:"Payment Verified"});
        }
        return res.status(200).json({success:"false", message:"Payment Failed"});

}


const enrollStudents = async(courses, userId, res,reEnroll=false) => {

    if(!courses || !userId) {
        return res.status(400).json({success:false,message:"Please Provide data for Courses or UserId"});
    }

    for(const courseId of courses) {
        try {
            if (reEnroll) {
                console.log("re enrolling student");
                const enrolledCourse = await Course.findById(courseId);
                const courseDurationInMs = enrolledCourse.courseDurationDays * 24 * 60 * 60 * 1000; // days to ms
                const calculatedExpiryDate = new Date(enrolledCourse.enrollmentOpenAt.getTime() + courseDurationInMs);

                const courseExpiry = await CourseExpiry.findOneAndUpdate(
                    { userId: userId, courseId: courseId },
                    { expiryDate: calculatedExpiryDate },
                    { new: true }  // To return the updated document
                );

                if (!courseExpiry) {
                    return res.status(500).json({ success: false, message: "Could not update expiry date" });
                }
                console.log(`Updated expiry date for user: ${userId} in course: ${courseId}`);
                const enrolledStudent = await User.findById(userId);
                ///bachhe ko mail send kardo
                const emailResponse = await mailSender(
                    enrolledStudent.email,
                    `Successfully Enrolled into ${enrolledCourse.courseName}`,
                    courseEnrollmentEmail(enrolledCourse.courseName, `${enrolledStudent.firstName}`)
                )   
                // return res.status(200).json({
                //     success: true,
                //     message:"user has been enrolled in course again successfully"
                // })
            }
            else {
                 //find the course and enroll the student in it
                const enrolledCourse = await Course.findOneAndUpdate(
                    { _id: courseId },
                    { $push: { studentsEnrolled: userId } },
                    { new: true },
                );
                const courseDurationInMs = enrolledCourse.courseDurationDays * 24 * 60 * 60 * 1000; // days to ms
                const calculatedExpiryDate = new Date(enrolledCourse.enrollmentOpenAt.getTime() + courseDurationInMs);
                if(!enrolledCourse) {
                    return res.status(500).json({success:false,message:"Course not Found"});
                };
                const roomNumber = enrolledCourse.room;
                const courseProgress = await CourseProgress.create({
                    courseID: courseId,
                    userId: userId,
                    completedVideos: [],
                });
                //find the student and add the course to their list of enrolledCOurses
                const enrolledStudent = await User.findByIdAndUpdate(userId,
                    {
                        $push: {
                            courses: courseId,
                            courseProgress: courseProgress._id,
                        }
                    }, { new: true });
                const enrollInRoom = await Rooms.findByIdAndUpdate(roomNumber,
                    {
                        $push: {
                            studentsEnrolled: userId,
                        }
                    }, { new: true });
                const courseExpiry = await CourseExpiry.create({
                    courseId,
                    userId,
                    expiryDate:calculatedExpiryDate,
                })
                    ///bachhe ko mail send kardo
                    const emailResponse = await mailSender(
                        enrolledStudent.email,
                        `Successfully Enrolled into ${enrolledCourse.courseName}`,
                        courseEnrollmentEmail(enrolledCourse.courseName, `${enrolledStudent.firstName}`)
                    )    
            }
            //console.log("Email Sent Successfully", emailResponse.response);
        }
        catch(error) {
            console.log(error);
            return res.status(500).json({success:false, message:error.message});
        }
    }

}

exports.sendPaymentSuccessEmail = async(req, res) => {
    const {orderId, paymentId, amount} = req.body;

    const userId = req.user.id;

    if(!orderId || !paymentId || !amount || !userId) {
        return res.status(400).json({success:false, message:"Please provide all the fields"});
    }

    try{
        //student ko dhundo
        const enrolledStudent = await User.findById(userId);
        await mailSender(
            enrolledStudent.email,
            `Payment Recieved`,
             paymentSuccessEmail(`${enrolledStudent.firstName}`,
             amount/100,orderId, paymentId)
        )
    }
    catch(error) {
        console.log("error in sending mail", error)
        return res.status(500).json({success:false, message:"Could not send email"})
    }
}




// const {instance} = require("../config/razorpay");
// const Course = require("../models/Course");
// const User = require("../models/User");
// const mailSender = require("../utils/mailSender");
// const {courseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail");
// const { default: mongoose } = require("mongoose");



// //capture the payment and initiate the Razorpay order
// exports.capturePayment = async (req, res) => {
//     //get courseId and UserID
//     const {course_id} = req.body;
//     const userId = req.user.id;
//     //validation
//     //valid courseID
//     if(!course_id) {
//         return res.json({
//             success:false,
//             message:'Please provide valid course ID',
//         })
//     };
//     //valid courseDetail
//     let course;
//     try{
//         course = await Course.findById(course_id);
//         if(!course) {
//             return res.json({
//                 success:false,
//                 message:'Could not find the course',
//             });
//         }

//         //user already pay for the same course
//         const uid = new mongoose.Types.ObjectId(userId);
//         if(course.studentsEnrolled.includes(uid)) {
//             return res.status(200).json({
//                 success:false,
//                 message:'Student is already enrolled',
//             });
//         }
//     }
//     catch(error) {
//         console.error(error);
//         return res.status(500).json({
//             success:false,
//             message:error.message,
//         });
//     }
    
//     //order create
//     const amount = course.price;
//     const currency = "INR";

//     const options = {
//         amount: amount * 100,
//         currency,
//         receipt: Math.random(Date.now()).toString(),
//         notes:{
//             courseId: course_id,
//             userId,
//         }
//     };

//     try{
//         //initiate the payment using razorpay
//         const paymentResponse = await instance.orders.create(options);
//         console.log(paymentResponse);
//         //return response
//         return res.status(200).json({
//             success:true,
//             courseName:course.courseName,
//             courseDescription:course.courseDescription,
//             thumbnail: course.thumbnail,
//             orderId: paymentResponse.id,
//             currency:paymentResponse.currency,
//             amount:paymentResponse.amount,
//         });
//     }
//     catch(error) {
//         console.log(error);
//         res.json({
//             success:false,
//             message:"Could not initiate order",
//         });
//     }
    

// };

// //verify Signature of Razorpay and Server

// exports.verifySignature = async (req, res) => {
//     const webhookSecret = "12345678";

//     const signature = req.headers["x-razorpay-signature"];

//     const shasum =  crypto.createHmac("sha256", webhookSecret);
//     shasum.update(JSON.stringify(req.body));
//     const digest = shasum.digest("hex");

//     if(signature === digest) {
//         console.log("Payment is Authorised");

//         const {courseId, userId} = req.body.payload.payment.entity.notes;

//         try{
//                 //fulfil the action

//                 //find the course and enroll the student in it
//                 const enrolledCourse = await Course.findOneAndUpdate(
//                                                 {_id: courseId},
//                                                 {$push:{studentsEnrolled: userId}},
//                                                 {new:true},
//                 );

//                 if(!enrolledCourse) {
//                     return res.status(500).json({
//                         success:false,
//                         message:'Course not Found',
//                     });
//                 }

//                 console.log(enrolledCourse);

//                 //find the student andadd the course to their list enrolled courses me 
//                 const enrolledStudent = await User.findOneAndUpdate(
//                                                 {_id:userId},
//                                                 {$push:{courses:courseId}},
//                                                 {new:true},
//                 );

//                 console.log(enrolledStudent);

//                 //mail send krdo confirmation wala 
//                 const emailResponse = await mailSender(
//                                         enrolledStudent.email,
//                                         "Congratulations from CodeHelp",
//                                         "Congratulations, you are onboarded into new CodeHelp Course",
//                 );

//                 console.log(emailResponse);
//                 return res.status(200).json({
//                     success:true,
//                     message:"Signature Verified and COurse Added",
//                 });


//         }       
//         catch(error) {
//             console.log(error);
//             return res.status(500).json({
//                 success:false,
//                 message:error.message,
//             });
//         }
//     }
//     else {
//         return res.status(400).json({
//             success:false,
//             message:'Invalid request',
//         });
//     }


// };