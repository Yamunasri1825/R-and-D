// import React from 'react';

// interface Course {
//   id: number;
//   name: string;
// }

// interface CoursesProps {
//   onSelectCourse: (courseName: string) => void;
// }

// const courses: Course[] = [
//   { id: 1, name: 'React' },
//   { id: 2, name: 'Node.js' },
//   { id: 3, name: 'Python' },
//   { id: 4, name: 'Data Science' }
// ];

// const Courses: React.FC<CoursesProps> = ({ onSelectCourse }) => {
//   return (
//     <div className="courses">
//       <h2>Available Courses</h2>
//       <ul>
//         {courses.map(course => (
//           <li key={course.id} onClick={() => onSelectCourse(course.name)}>
//             {course.name}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default Courses;