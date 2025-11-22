import React, {createContext, ReactNode, useContext} from "react"
import { useCourses } from "../hooks/Course"

type CoursesHook = ReturnType<typeof useCourses>;

const Context_courses = createContext<CoursesHook | null>(null);

export const CoursesProvider = ({children}:{children:ReactNode}) => {
    const coursesHook = useCourses();

    return(
        <Context_courses.Provider value={coursesHook}>
            {children}
        </Context_courses.Provider>
    )
}

export function CoursesContext() {
    const ctx = useContext(Context_courses);
    if(!ctx){
        throw new Error("Provider Missing")
    }
    return ctx;
}