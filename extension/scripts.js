document.addEventListener('DOMContentLoaded', () => {
    console.log('Study Flow script loaded successfully!');
    const addButton = document.getElementById('add');

    addButton.addEventListener('click', () => {
        showColorOptions();
    });
    

    chrome.storage.sync.get(['boxes', 'currentTask'], (data) => {
        if (data.boxes) {
            data.boxes.forEach(boxData => createMovableBox(boxData));
        }
        if (data.currentTask) {
            const { topic, duedate, assignment, time } = data.currentTask;
            document.querySelectorAll('.box').forEach(box => {
                const boxTopic = box.querySelector('#topic').textContent;
                if (boxTopic === topic) {
                    startTask(box);
                }
            });
        }
    });
});

function showColorOptions() {
    const colors = ['#add8e6', '#F8DE7E', '#F8C8DC', '	#AFE1AF', '#E6E6FA'];
    const addButton = document.getElementById('add');

    colors.forEach((color, index) => {
        const colorButton = document.createElement('button');
        colorButton.className = 'color-option';
        colorButton.style.backgroundColor = color;

        const angle = (index / colors.length) * (2 * Math.PI);
        const offset = 80; 
        const left = addButton.offsetLeft + offset * Math.cos(angle);
        const top = addButton.offsetTop + offset * Math.sin(angle);

        colorButton.style.left = `${left + 22}px`;
        colorButton.style.top = `${top + 25}px`;

        colorButton.addEventListener('click', () => {
            createMovableBox(null, color);
            removeColorOptions();
        });

        document.body.appendChild(colorButton);

        // Apply the animation after appending to the body to ensure the animation runs
        requestAnimationFrame(() => {
            colorButton.style.animation = 'expandFromCenter 0.3s ease-out';
        });
    });
}

function removeColorOptions() {
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        option.classList.add('fade-out');
        option.addEventListener('animationend', () => {
            option.remove();
        });
    });
}

function removeColorOptions() {
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => option.remove());
}

function createMovableBox(savedData = null, selectedColor = '#add8e6') {
    var box_amounts = savedData?.number || document.querySelectorAll(".box").length;

    const box = document.createElement('div');
    box.className = 'box';
    box.style.backgroundColor = savedData?.color || selectedColor;
    box.setAttribute("number", box_amounts);
    box.innerHTML = `
        <h2 id="topic" contenteditable="false">Topic</h2>
        <p id="duedate">Due Date</p>
        <p id="assignment" contenteditable="false">Assignment Info</p>
        <p id="time" contenteditable="false">Time</p>`;
    document.body.appendChild(box);

    const controls = document.createElement('div');
    controls.className = 'controls';
    controls.setAttribute("number", box_amounts);
    controls.innerHTML = `
        <button class="start-btn" style="display: block;"><i class="fa-solid fa-play" style="color: #63E6BE;"></i></button>
        <button class="pause-btn" style="display: none;"><i class="fa-solid fa-pause" style="color: #FFA500;"></i></button>
        <button class="finish-btn" style="display: none;"><i class="fa-solid fa-check" style="color: #28a745;"></i></button>
        <button class="edit-btn"><i class="fa-solid fa-pen-to-square"></i></button>
        <button class="trash-btn"><i class="fa-solid fa-trash"></i></button>
    `;
    document.body.appendChild(controls);

    const topic = box.querySelector("#topic");
    const duedate = box.querySelector("#duedate");
    const notes = box.querySelector("#assignment");
    const time = box.querySelector("#time");

    box.style.left = "40%";
    box.style.top = "40%";
    topic.textContent = 'Topic';
    duedate.textContent = 'Due Date';
    notes.textContent = 'Assignment';
    time.textContent = 'Time to complete';

    updateControlsPosition()

    if (savedData) {
        controls.style.left = savedData.controls_left;
        controls.style.top = savedData.controls_top;
        box.style.left = savedData.left;
        box.style.top = savedData.top;
        topic.textContent = savedData.topic || 'Topic';
        notes.textContent = savedData.assignment || 'Assignment';
        time.textContent = savedData.time || 'Time';

        if (savedData.duedate) {
            box.setAttribute("date", savedData.duedate);
            const luxonDate = luxon.DateTime.fromMillis(savedData.duedate);
            duedate.textContent = luxonDate.toRelative({ base: luxon.DateTime.now() });
        
            if (luxonDate < luxon.DateTime.now()) {
                duedate.classList.add('past-due');
            } else {
                duedate.classList.remove('past-due');
            }
        } else {
            duedate.textContent = "Due Date";
        }
        if (savedData.status === 'active') {
            controls.querySelector('.start-btn').style.display = 'none';
            controls.querySelector('.pause-btn').style.display = 'block';
            controls.querySelector('.finish-btn').style.display = 'block';
        } else if (savedData.status === 'paused') {
            controls.querySelector('.start-btn').style.display = 'block';
            controls.querySelector('.pause-btn').style.display = 'none';
            controls.querySelector('.finish-btn').style.display = 'block';
        }
    } 

    function saveBoxes() {
        const boxes = Array.from(document.querySelectorAll('.box')).map(box => {
            const number = box.getAttribute("number");
            const controls = document.querySelector(`.controls[number="${number}"]`);

            let status;
            if (controls.querySelector('.start-btn').style.display === 'block') {
                status = 'paused';
            } else {
                status = 'active';
            }

            const duedate = parseInt(box.getAttribute("date"));

            return {
                number: number,
                color: box.style.backgroundColor, // Save the color
                controls_left: controls.style.left,
                controls_top: controls.style.top,
                left: box.style.left,
                top: box.style.top,
                topic: box.querySelector('#topic').textContent,
                duedate: duedate,
                assignment: box.querySelector('#assignment').textContent,
                time: box.querySelector('#time').textContent,
                status: status
            };
        });
        chrome.storage.sync.set({ boxes });
    }
    var edit_mode = false;

    function updateControlsPosition() {
        const boxRect = box.getBoundingClientRect();
        controls.style.left = boxRect.right + 'px';
        controls.style.top = (boxRect.top - controls.offsetHeight) + 'px';
    }

    function toggleControls() {
        if (controls.style.display === 'none' || controls.style.display === '') {
            controls.style.display = 'block';
            controls.classList.remove('fade-out');
            updateControlsPosition();
        } else {
            controls.classList.add('fade-out');
            setTimeout(() => {
                controls.style.display = 'none';
            }, 500); 
        }
    }

    function enterEditMode() {
        edit_mode = true;
        topic.contentEditable = true;
        notes.contentEditable = true;
        time.contentEditable = true;
        box.classList.add('editing');

        const text = duedate.textContent;
        const currentDate = parseInt(box.getAttribute("date"));
        if (text !== 'Due Date') {
            const luxonDate = luxon.DateTime.fromMillis(currentDate);
            duedate.innerHTML = `<input type="date" value="${luxonDate.toFormat('yyyy-MM-dd')}">`;
        } else {
            duedate.innerHTML = `<input type="date">`;
        }

        setTimeout(() => {
            document.addEventListener('click', exitEditMode);
        }, 0);
    }

    function exitEditMode(event) {
        if (!box.contains(event.target) && !controls.contains(event.target)) {
            edit_mode = false;
            topic.contentEditable = false;
            notes.contentEditable = false;
            time.contentEditable = false;

            const dateInput = duedate.querySelector('input');
            if (dateInput) {
                const selectedDate = luxon.DateTime.fromISO(dateInput.value);
                box.setAttribute("date", selectedDate.ts);
                duedate.textContent = selectedDate.toRelative({ base: luxon.DateTime.now() });
            }

            box.classList.remove('editing');

            saveBoxes(); 

            document.removeEventListener('click', exitEditMode);
        }
    }

    function startTask(box, save = true) {
        document.querySelectorAll('.box').forEach(b => {
            if (b !== box) {
                const controls = b.nextElementSibling;
                controls.querySelector('.start-btn').style.display = 'block';
                controls.querySelector('.pause-btn').style.display = 'none';
                controls.querySelector('.finish-btn').style.display = 'none';
            }
        });

        const controls = box.nextElementSibling;
        controls.querySelector('.start-btn').style.display = 'none';
        controls.querySelector('.pause-btn').style.display = 'block';
        controls.querySelector('.finish-btn').style.display = 'block';

        if (save) {
            const data = {
                topic: box.querySelector('#topic').textContent,
                duedate: box.querySelector('#duedate').textContent,
                assignment: box.querySelector('#assignment').textContent,
                time: box.querySelector('#time').textContent,
                status: 'started'
            };
            chrome.storage.sync.set({ currentTask: data }, () => {
                setTimeout(() => {
                    window.close();
                }, 750); // 0.75s and then we close the window
            });
        }
    }

    function pauseTask() {
        const controls = box.nextElementSibling;
        controls.querySelector('.start-btn').style.display = 'block';
        controls.querySelector('.pause-btn').style.display = 'none';
        controls.querySelector('.finish-btn').style.display = 'block';

        chrome.storage.sync.set({ currentTask: null });
        saveBoxes();
    }

    function finishTask() {
        const controls = box.nextElementSibling;
        if (confirm('Have you completed the task?')) {
            try {
                const boxRect = box.getBoundingClientRect();
                const boxCenterX = boxRect.left + boxRect.width / 2;
                const boxCenterY = boxRect.top + boxRect.height / 2;
    
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: {
                        x: boxCenterX / window.innerWidth,
                        y: boxCenterY / window.innerHeight
                    }
                });
            } catch (e) {
                console.error('Confetti function is not defined:', e);
            }
            
            
            box.classList.add('fade-out');
            controls.classList.add('fade-out');
            setTimeout(() => {
                box.remove();
                controls.remove();
                chrome.storage.sync.set({ currentTask: null });
                saveBoxes();
            }, 500); 
        }
    }
    
    
    
    

    controls.querySelector('.start-btn').onclick = function() {
        startTask(box);
    };

    controls.querySelector('.pause-btn').onclick = function() {
        pauseTask();
    };

    controls.querySelector('.finish-btn').onclick = function() {
        finishTask();
    };

    controls.querySelector(".edit-btn").onclick = function(event) {
        event.stopPropagation();
        if (!edit_mode) {
            enterEditMode();
        } else {
            exitEditMode({ target: document.body });
        }
    };

    controls.querySelector('.trash-btn').onclick = function() {
        box.classList.add('fade-out');
        controls.classList.add('fade-out');
        setTimeout(() => {
            box.remove();
            controls.remove(); 
            saveBoxes(); 
        }, 500); 
    };

    let isDragging = false;

    function mousedown(event) {
        isDragging = false;

        let shiftX = event.clientX - box.getBoundingClientRect().left;
        let shiftY = event.clientY - box.getBoundingClientRect().top;

        let minTop = 0;

        function moveAt(pageX, pageY) {
            isDragging = true;
            let newTop = pageY - shiftY;
            box.style.top = Math.max(minTop, newTop) + 'px';
            box.style.left = pageX - shiftX + 'px';
            updateControlsPosition();
        }

        function onMouseMove(event) {
            moveAt(event.pageX, event.pageY);
        }

        document.addEventListener('mousemove', onMouseMove);

        box.onmouseup = function() {
            document.removeEventListener('mousemove', onMouseMove);
            box.onmouseup = null;
            saveBoxes(); 
        };
    }

    box.onmousedown = mousedown;

    box.onclick = function(event) {
        if (!isDragging && !edit_mode) {
            toggleControls();
        }
    };

    box.ondragstart = function() {
        return false;
    };

    saveBoxes(); 
}
