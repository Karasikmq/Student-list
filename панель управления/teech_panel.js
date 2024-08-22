document.addEventListener('DOMContentLoaded', function() {
    const studentsTableBody = document.getElementById('students-table').querySelector('tbody');
    const addStudentForm = document.getElementById('add-student-form');
    
    const filterFio = document.getElementById('filter-fio');
    const filterFaculty = document.getElementById('filter-faculty');
    const filterStartYear = document.getElementById('filter-start-year');
    const filterEndYear = document.getElementById('filter-end-year');

    let students = [];
    let displayedStudents = [];

    function loadStudents() {
        const savedStudents = localStorage.getItem('students');
        if (savedStudents) {
            students = JSON.parse(savedStudents);
            students.forEach(student => {
                student.birthDate = new Date(student.birthDate);
            });
        }
        displayedStudents = [...students];
        renderStudentsTable(displayedStudents);
    }

    function saveStudents() {
        const studentsToSave = students.map(student => ({
            ...student,
            birthDate: student.birthDate.toISOString()
        }));
        localStorage.setItem('students', JSON.stringify(studentsToSave));
    }

    function calculateAge(birthDate) {
        const diff = new Date() - birthDate;
        const age = new Date(diff).getUTCFullYear() - 1970;
        return age;
    }

    function getCurrentCourse(startYear) {
        const currentYear = new Date().getFullYear();
        const course = currentYear - startYear + 1;
        return (course >= 1 && course <= 4) ? `не закончил, ${course} курс` : "Закончил";
    }

    function renderStudentsTable(studentsArray) {
        studentsTableBody.innerHTML = '';
        studentsArray.forEach((student, index) => {
            const endYear = student.startYear + 4;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.lastName} ${student.firstName} ${student.patronymic}</td>
                <td>${student.birthDate.toLocaleDateString()} (${calculateAge(student.birthDate)} лет)</td>
                <td>${student.startYear} (${getCurrentCourse(student.startYear)})</td>
                <td>${student.faculty}</td>
                <td>${endYear}</td>
                <td><button class="delete-student" data-index="${index}">Удалить</button></td>
            `;
            studentsTableBody.appendChild(row);
        });

        const deleteButtons = document.querySelectorAll('.delete-student');
        deleteButtons.forEach(button => {
            button.addEventListener('click', deleteStudent);
        });
    }

    function applyFilters() {
        displayedStudents = students.filter(student => {
            const fullName = `${student.lastName} ${student.firstName} ${student.patronymic}`.toLowerCase();
            const fioMatch = fullName.includes(filterFio.value.toLowerCase());
            const facultyMatch = student.faculty.toLowerCase().includes(filterFaculty.value.toLowerCase());
            const startYearMatch = filterStartYear.value ? student.startYear.toString().startsWith(filterStartYear.value) : true;
            const endYearMatch = filterEndYear.value ? (student.startYear + 4).toString().startsWith(filterEndYear.value) : true;

            return fioMatch && facultyMatch && startYearMatch && endYearMatch;
        });
        renderStudentsTable(displayedStudents);
    }

    function deleteStudent(event) {
        const studentIndex = event.target.getAttribute('data-index');
        students.splice(studentIndex, 1);
        saveStudents();
        renderStudentsTable(displayedStudents);
    }

    function sortStudentsBy(field, order = 'asc') {
        const sortedStudents = [...displayedStudents];
        const sortOrder = order === 'asc' ? 1 : -1;
        sortedStudents.sort((a, b) => {
            if (field === 'fio') {
                const nameA = `${a.lastName} ${a.firstName} ${a.patronymic}`.toLowerCase();
                const nameB = `${b.lastName} ${b.firstName} ${b.patronymic}`.toLowerCase();
                return sortOrder * nameA.localeCompare(nameB);
            }
            
            if (field === 'birthDate') {
                return sortOrder * (a.birthDate - b.birthDate);
            }
            
            if (field === 'startYear') {
                return sortOrder * (a.startYear - b.startYear);
            }
            
            if (field === 'faculty') {
                return sortOrder * a.faculty.toLowerCase().localeCompare(b.faculty.toLowerCase());
            }
            
            return 0;
        });
    
        renderStudentsTable(sortedStudents);
    }
    

    function initializeSort() {
        let currentSort = {
            field: null,
            order: 'asc'
        };
    
        document.querySelectorAll('th[data-sort]').forEach(th => {
            th.addEventListener('click', function() {
                const sortKey = th.getAttribute('data-sort');
    
                if (currentSort.field === sortKey) {
                    currentSort.order = currentSort.order === 'asc' ? 'desc' : 'asc';
                } else {
                    currentSort.field = sortKey;
                    currentSort.order = 'asc';
                }
                sortStudentsBy(currentSort.field, currentSort.order);
            });
        });
    }
    

    filterFio.addEventListener('input', applyFilters);
    filterFaculty.addEventListener('input', applyFilters);
    filterStartYear.addEventListener('input', applyFilters);
    filterEndYear.addEventListener('input', applyFilters);

    addStudentForm.addEventListener('submit', function(event) {
        event.preventDefault();

        document.querySelectorAll('.error-message').forEach(span => span.textContent = '');

        const firstName = document.getElementById('first-name').value.trim();
        const lastName = document.getElementById('last-name').value.trim();
        const patronymic = document.getElementById('patronymic').value.trim();
        const birthDateValue = document.getElementById('birth-date').value;
        const birthDate = new Date(birthDateValue);
        const startYear = parseInt(document.getElementById('start-year').value.trim());
        const faculty = document.getElementById('faculty').value.trim();

        const minBirthDate = new Date('1940-01-01');
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        let valid = true;

        if (!firstName) {
            document.getElementById('first-name-error').textContent = 'Пожалуйста, введите имя.';
            valid = false;
        }

        if (!lastName) {
            document.getElementById('last-name-error').textContent = 'Пожалуйста, введите фамилию.';
            valid = false;
        }

        if (!patronymic) {
            document.getElementById('patronymic-error').textContent = 'Пожалуйста, введите отчество.';
            valid = false;
        }

        if (isNaN(birthDate) || birthDate < minBirthDate || birthDate > currentDate) {
            document.getElementById('birth-date-error').textContent = 'Пожалуйста, введите корректную дату рождения (от 1940 года до текущего дня).';
            valid = false;
        }

        if (isNaN(startYear) || startYear < 2000 || startYear > currentYear) {
            document.getElementById('start-year-error').textContent = 'Пожалуйста, введите корректный год поступления.';
            valid = false;
        }

        if (!faculty) {
            document.getElementById('faculty-error').textContent = 'Пожалуйста, введите факультет.';
            valid = false;
        }

        if (!valid) {
            return;
        }

        const newStudent = {
            firstName: firstName,
            lastName: lastName,
            patronymic: patronymic,
            birthDate: birthDate,
            startYear: startYear,
            faculty: faculty,
        };

        students.push(newStudent);
        saveStudents();
        displayedStudents = [...students];
        // applyFilters();
        renderStudentsTable(displayedStudents);
        addStudentForm.reset();
    });

    loadStudents();
    initializeSort();
});