import { CourseContext } from "../context/CourseContext";
import { CoursesContext } from "../context/CoursesContext";


export function CourseToggle() {
    const {loading, selectedCourse, selectCourseById} = CourseContext();
    const {courses} = CoursesContext();
    
    if(loading) return <div>Loading...</div>
    return(
        <div>
            <select value={selectedCourse?.id} onChange={(e) => selectCourseById(e.target.value)}>
                {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                        {course.title}
                    </option>
                ))}
            </select>
        </div>
    )
}