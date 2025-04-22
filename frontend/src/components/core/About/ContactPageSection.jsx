import React, { useContext } from 'react';
import { ContactUsForm } from '../../common/ContactUsForm';
import { ThemeContext } from '../../../provider/themeContext';

export const ContactPageSection = () => {
    const { darkTheme } = useContext(ThemeContext);

    return (
        <div className={`mx-auto ${darkTheme ? 'bg-richblack-900 text-white' : 'bg-white text-richblack-900'} py-16`}>
            <h1 className="text-center text-4xl font-semibold">
                Get in Touch
            </h1>
            <p className={`text-center mt-3 ${darkTheme ? 'text-richblack-300' : 'text-richblack-600'}`}>
                We&apos;d love to hear from you, Please fill out this form.
            </p>
            <div className="mt-12 mx-auto">
                <ContactUsForm />
            </div>
        </div>
    );
};
