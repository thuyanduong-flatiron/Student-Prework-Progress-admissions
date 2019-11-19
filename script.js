var batchId = parseInt(window.location.href.split("batches/")[1]);
var trackId = 62141; //change this number every time there is a new prewrok
var totalLessons = 166; //change this number every time there is a new prewrok
var errorMessage = `
Error Generating Prework Report! Are you on a Learn.co page? Does the URL begin with:
  https://learn.co/batches/

Note: This report generator only works with the PREWORK: Software Engineering (fswd-prework-2-01) track. If the Prework has been updated recently, you will need to update this tool.
`

function init() {
    var report = document.querySelector("#fried-chicken")
    if(!report){
      report = document.createElement("div")
      report.id = "fried-chicken"
      document.querySelector("#main").prepend(report)
      report.style.cssText = "padding: 75px; display: block; position: fixed; z-index: 100; width: 100%; height: 100%; overflow: auto; background-color: rgb(245,245,245)"
    }
    report.innerHTML = `<button>Back To Batch View</button><h1>Loading results... <span id="chocolate-bar">0/${totalLessons}</span></h1><div id="penguins"></div><div id="waffles"></div>`
    report.querySelector("button").addEventListener("click", () => {
        report.style.display = "none"
    })
    getLessons()
}

function getLessons() {
    var studentsURL = `https://learn.co/api/v1/batches/${batchId}/tracks/${trackId}/progress`
    var lessonsURL = `https://learn.co/api/v1/batches/${batchId}/tracks/${trackId}/deployed`
    var studentsPromise = fetch(studentsURL).then(res => res.json())
    var lessonsPromise = fetch(lessonsURL).then(res => res.json())
    Promise.all([studentsPromise, lessonsPromise]).then(promiseArray => {
      var studentData = promiseArray[0].map(student => {
        student.lessons = []
        student.num_lessons_completed = 0
        return student
      })
      var lessonsData = promiseArray[1]
      getIndividualData(studentData, lessonsData)
    })
}

function getIndividualData(studentData, lessonsData) {
    var allLessonsPromises = []
    var counter = 0;
    lessonsData.topics.forEach(topic => {
        topic.units.forEach(unit => {
            unit.lessons.forEach(lesson => {
                var promise = fetch(`https://learn.co/api/v1/batches/${batchId}/lessons/${lesson.node.id}`)
                  .then(res => {
                    counter++;
                    document.querySelector("#chocolate-bar").innerText = `${counter}/${totalLessons}`
                    return res.json()
                  });
                allLessonsPromises.push(promise)
            })
        })
    });
    Promise.all(allLessonsPromises).then(lessonsStudentsData => {
        compileResults(studentData, lessonsStudentsData)
    })
}

function compileResults(studentData, lessonsStudentsData){
  lessonsStudentsData.forEach(lesson => {
    lesson.students.forEach(student => {
      let studentsData = studentData.find(studentsData => studentsData.id === student.id)
      let progress
      if(student.completed_at){
        studentsData.num_lessons_completed += 1
        progress = `✅ `
      }else if(student.started_at && !student.completed_at){
        progress = `💪 `
      }else if(!student.started_at){
        progress = `❌ `
      }
      progress += lesson.title
      studentsData.lessons.push(progress)
    })
  })
  printStudentProgress(studentData)
}

function printStudentProgress(studentData) {
  var penguins = document.querySelector("#penguins")
  penguins.innerHTML='<h5>Students:</h5>'
    addContent("", "p")
    studentData.forEach(student => {
        var link = document.createElement("p")
        link.innerHTML = `<a href="#penguin-${student.id}">${student.full_name}</a>: <span>${student.num_lessons_completed}/${totalLessons}<span>`
        penguins.append(link)
        addContent(`${student.full_name}:`, "h3", `penguin-${student.id}`)
        student.lessons.forEach(studentsLesson => {
            addContent(studentsLesson, "p")
        })
        addContent("", "p")
        addContent(`<a href="#penguins">Back To The Top</a>`, "p")
    })
}

function addContent(content, tag, id) {
    var el = document.createElement(tag);
    if(id){
      el.id = id
    }
    el.innerHTML = content
    document.querySelector("#waffles").append(el)
}

if(Number.isInteger(batchId) && Number.isInteger(trackId)){
  init()
}else{
  alert(errorMessage)
}
