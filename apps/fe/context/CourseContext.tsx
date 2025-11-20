import React, { createContext, ReactNode } from "react";
import { useCourse } from "../hooks/Course";

type CourseHook = ReturnType<typeof useCourse>;

const CourseContext = createContext<CourseHook | null>(null);

export const CourseProvider = ({children}:{children: ReactNode}) => {
    const courses = useCourse();    
    return(
        <CourseContext.Provider value={courses}>
            {children}
        </CourseContext.Provider>
    )
}