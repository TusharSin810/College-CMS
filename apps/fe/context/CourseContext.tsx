import React, { createContext, ReactNode , useContext} from "react";
import { useCourse } from "../hooks/Course";

type CourseHook = ReturnType<typeof useCourse>;

const Context_course = createContext<CourseHook | null>(null);

export const CourseProvider = ({children}:{children: ReactNode}) => {
    const courseHook = useCourse();    
    return(
        <Context_course.Provider value={courseHook}>
            {children}
        </Context_course.Provider>
    )
}

export function CourseContext() {
    const ctx = useContext(Context_course);
    if(!ctx){
        throw new Error("Provider Missing")
    }
    return ctx;
}