var batchId = parseInt(window.location.href.split("batches/")[1]),
    trackId = 62141;

function init() {
    var e = document.querySelector("#fried-chicken");
    e || ((e = document.createElement("div")).id = "fried-chicken", document.querySelector("#main").prepend(e)), e.style.cssText = "padding: 75px; display: block; position: fixed; z-index: 100; width: 100%; height: 100%; overflow: auto; background-color: rgb(245,245,245)",
    e.innerHTML = '<button>Back To Batch View</button><h1>Loading results... <span id="chocolate-bar"></span></h1><div id="penguins"></div><div id="waffles"></div>', e.querySelector("button").addEventListener("click", () => {
        document.querySelector("#fried-chicken").style.display = "none"
    }), getLessons()
}

function getLessons() {
    var e = `https://learn.co/api/v1/batches/${batchId}/tracks/${trackId}/deployed`,
        t = fetch(`https://learn.co/api/v1/batches/${batchId}/tracks/${trackId}/progress`).then(e => e.json()),
        n = fetch(e).then(e => e.json());
    Promise.all([t, n]).then(e => {
        getIndividualData(e[0].map(e => (e.lessons = [], e)), e[1])
    })
}

function getIndividualData(e, t) {
    let n = [],
        o = 0,
        a = 0;
    t.topics.forEach(e => {
        e.units.forEach(e => {
            o += e.lessons.length
        })
    }), t.topics.forEach(e => {
        e.units.forEach(e => {
            e.lessons.forEach(e => {
                let t = fetch(`https://learn.co/api/v1/batches/${batchId}/lessons/${e.node.id}`).then(e => (a++, document.querySelector("#chocolate-bar").innerText = `${a}/${o}`, e.json()));
                n.push(t)
            })
        })
    }), Promise.all(n).then(t => {
        compileResults(e, t)
    })
}

function compileResults(e, t) {
    t.forEach(t => {
        t.students.forEach(n => {
            var o, a = e.find(e => e.id === n.id);
            n.completed_at ? o = "✅ " : n.started_at && !n.completed_at ? o = "💪 " : n.started_at || (o = "❌ "), o += t.title, a.lessons.push(o)
        })
    }), printStudentProgress(e)
}

function printStudentProgress(studentData) {
  var penguins = document.querySelector("#penguins")
  penguins.innerHTML='<h5>Students:</h5>'
    addContent("", "p"), studentData.forEach(student => {
        var link = document.createElement("p")
        link.innerHTML = `<a href="#penguin-${student.id}">${student.full_name}</a>`
        penguins.append(link)
        addContent(`${student.full_name}:`, "h3", `penguin-${student.id}`), student.lessons.forEach(e => {
            addContent(e, "p")
        }), addContent("", "p")
        addContent(`<a href="#penguins">Back To The Top</a>`, "p")
    })
}

function addContent(e, t, id) {
    var n = document.createElement(t);
    if(id){
      n.id = id
    }
    n.innerHTML = e, document.querySelector("#waffles").append(n)
}
Number.isInteger(batchId) && Number.isInteger(trackId) ? init() : alert(`Error! Are you on a Learn.co page? Does the URL begin with:
  https://learn.co/batches/ ?

Note: If the Prework track has been updated recently, this will also break this report generator.
  `);
