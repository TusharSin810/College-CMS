import React, {createContext, ReactNode} from "react"
import { useCourses } from "../hooks/Course"

type CoursesHook = ReturnType<typeof useCourses>;

export const CoursesContext = createContext<CoursesHook | null>(null);

export const CoursesProvider = ({children}:{children:ReactNode}) => {
    const coursesHook = useCourses();

    return(
        <CoursesContext.Provider value={coursesHook}>
            {children}
        </CoursesContext.Provider>
    )
}