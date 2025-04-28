import React from 'react'

const ExpiredAccessCards = () => {
    return (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="flex justify-center items-center mb-6">
                <svg
                    className="w-10 h-10 text-red mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
                <h2 className="text-xl font-semibold text-pure-greys-800">
                    Course Access Expired
                </h2>
            </div>
            <p className="text-pure-greys-600 mb-4">
                Your enrollment period for this course has ended. To regain access to:
            </p>
            <ul className="list-disc list-inside text-pure-greys-600 mb-4">
                <li>Lectures</li>
                <li>Unattempted Quizzes</li>
                <li>Live Meetings</li>
            </ul>
            {
                isEnrollmentOpen ? (
                    <button
                        onClick={handleEnrollAgain} // Assuming handleEnrollAgain is defined in your component
                        className="bg-caribbeangreen-500 hover:bg-caribbeangreen-700 text-white font-bold py-3 px-6 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400"
                    >
                        Re-enroll Now
                    </button>
                ) : (
                    <div>Enrollement will open on :{formatDateTime(courseEntireData.enrollmentOpenAt)}</div>
                )
            }
            <p className="mt-4 text-sm text-pure-greys-500">
                Have questions? <a href="#" className="text-blue-500 hover:underline">Contact Support</a>
            </p>
        </div>
    )
}

export default ExpiredAccessCards