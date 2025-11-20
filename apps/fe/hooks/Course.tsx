import axios from "axios"
import { useEffect, useState } from "react"

interface Course {
    id: string,
    slug: string,
    title: string
}

export const useCourses = () => {
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState([]);
    
    useEffect(() => {
        axios.get(`${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000"}`)
            .then(res => {
                setCourses(res.data.courses);
                setLoading(false)
            })
    }, [])
    return {loading, courses}
}

export const useCourse = () => {
    const { loading, courses } = useCourses();
    const [selsctedCourse, setSelectedCourse] = useState<Course>();

    useEffect(() => {
        setSelectedCourse(courses[0])
    }, [courses])

    return{
        loading, selsctedCourse, setSelectedCourse
    }
}