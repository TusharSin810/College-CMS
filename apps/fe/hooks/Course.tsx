import axios from "axios"
import { useEffect, useState } from "react"

export interface Course {
    id: string,
    slug: string,
    title: string
}

export const useCourses = () => {
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState<Course[]>([]);
    
    useEffect(() => {
        axios.get(`${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000"}/courses`,{
            headers:{
                Authorization: `Bearer ${localStorage.getItem("college_cms_token")}`
            }
        })
            .then(res => {
                setCourses(res.data.courses);
                setLoading(false)
            })
    }, [])
    return {loading, courses}
}

export const useCourse = () => {
    const { loading, courses } = useCourses();
    const [selectedCourse, setSelectedCourse] = useState<Course>();

    useEffect(() => {
        setSelectedCourse(courses[0])
    }, [courses]);
    
    const selectCourseById = (id?: string) => {
    if (!id) {
      setSelectedCourse(undefined);
      return;
    }
    const found = courses.find((c) => c.id === id);
        setSelectedCourse(found);
    };
    
    return{
        loading, selectedCourse, selectCourseById
    }
}