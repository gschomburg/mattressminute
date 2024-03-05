//mm_lib.js also needs to be loaded in

/*
next previous random
show: id date
toggle only show 'untitled'

submit
    tags
    title
    submit date
*/

// functions

//https://mattressminute.com/data/mattress.php?uId=1&idOffset=-1&needsTitle=1
function isTrueParam(val){
    if(val==="true"){
        return true;
    }
    return false;
}
function init(){
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);

    // Read parameters
    const admin = params.get('admin');
    // const param2 = params.get('param2');
    if(admin){
        const body = document.body;
        body.classList.toggle('admin');
    }

    secretKey = params.has('secret_key') ? params.get('secret_key') : '';//params.get('secretKey');
    currentUId = params.has('u_id') ? params.get('u_id') : 4; //params.get('uId');
    needsTitleOnly = params.has('needs_title') ? isTrueParam(params.get('needs_title')) : false;//params.get('needsTitle')
    console.log('init | needsTitleOnly: ' + needsTitleOnly)
    // Display parameters
    // console.log('param1:', param1);
    // console.log('param2:', param2);

    // start the timer
    // var updateTimeInterval = 1000;
    // setInterval(updateTime, updateTimeInterval);

    //every second
    // setInterval(updateTicker, 1000);

    // Add click event listener to change the image
    // const imageContainer = document.getElementById('image-container');
    // imageContainer.addEventListener('click', function(){
    //   changeImage(true);
    // });
    setupForm();
    setupControls();
    //menu interaction
    // setupMenu();

    //show the new image and kick this off
    // updateTime();
}
function updateURL(params){
    var newURL = window.location.protocol + "//" + window.location.host + window.location.pathname + "?";

    // Loop through the params object and append key-value pairs to the URL
    for (var key in params) {
        if (params.hasOwnProperty(key)) {
            newURL += key + "=" + encodeURIComponent(params[key]) + "&";
        }
    }

    // Remove the trailing '&' and update the URL
    newURL = newURL.slice(0, -1);
    window.history.pushState({ path: newURL }, '', newURL);
}
var currentUId = 0; //default
var currentData = null; //current loaded data object
var needsTitleOnly=false;
var secretKey="";
var isSubmitting=false;
const path = 'https://mattressminute.com/data/';

function loadNext(){
    load(currentUId, 1, needsTitleOnly);
}
function loadPrevious(){
    load(currentUId, -1, needsTitleOnly);
}
function loadRandom(){
    load(null, undefined, needsTitleOnly);
}
function load(_uId, _offset, _needsTitle){
    //if uId is null it's random
    var script = 'mattress.php';
    let url = path + script +`?uId=${_uId}`;
    if(_uId==null){
        url = path + script +`?random=1`;
    }
    //add cache buster
    var cacheBuster = Math.random();
    url += `&cache=${cacheBuster}`;
    if (_needsTitle !== undefined) {
        if(_needsTitle){
            url += `&needsTitle=1`;
        }else{
            url += `&needsTitle=0`;
        }
        
    }
    if (_offset !== undefined) {
        url += `&idOffset=${_offset}`;
    }
    console.log(url);
    fetch(url)
        .then(response => response.json())
        .then(data => {
            // Handle the response data here
            console.log(data);
            currentUId = data.uId;
            currentData = data;
            setImage(data);
            updateURL({
                'u_id':data.uId,
                'secret_key':secretKey,
                'needs_title':needsTitleOnly
            });
            updateData(data);
        })
        .catch(error => {
            // Handle errors here
            console.error('Error:', error);
        });
}
function updateData(data) {
    var titleInput = document.getElementById("titleInput");
    titleInput.value = data.title;
    var div = document.getElementById("data-display");
    var html = "";
    html += "<ul>";
    for (var key in data) {
        html += "<li><strong>" + key + ":</strong> " + data[key] + "</li>";
    }
    html += "</ul>";
    div.innerHTML = html;
}
// function updateTicker()
// {
//   const ticker = document.getElementById('ticker');
//   ticker.classList.toggle('down');
// }
//UI STUFF
function setupForm()
{
    document.getElementById("updateForm").addEventListener("submit", function(event) {
        if(isSubmitting){
            console.log('already submitting');
            return;
        }
        isSubmitting=true;
        event.preventDefault(); // Prevent form submission
        
        var button = document.getElementById("submit-button");
        button.classList.add("inactive");
        // Serialize form data into JSON format
        var formData = {
            uId: currentData.uId,
            title: document.getElementById("titleInput").value,
            secretKey: secretKey // Include your secret key here
        };

        // Send AJAX request to PHP script
        let url = "https://mattressminute.com/data/update.php"
        var xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    console.log(xhr.responseText);
                    // document.getElementById("response").textContent = xhr.responseText;
                } else {
                    console.log('error: ' + xhr.statusText);
                    // document.getElementById("response").textContent = "Error: " + xhr.statusText;
                }
                button.classList.remove("inactive");
                isSubmitting=false;
            }
        };
        console.log(JSON.stringify(formData));
        xhr.send(JSON.stringify(formData));
    });
}
function setupControls(){
    var checkbox = document.getElementById("needsTitle");
    checkbox.checked = needsTitleOnly;

    checkbox.addEventListener("change", function(event) {
        // Update the variable in JavaScript
        needsTitleOnly = event.target.checked;

        console.log('checkbox change: ' + needsTitleOnly);
        updateURL({
            'u_id':currentData.uId,
            'secret_key':secretKey,
            'needs_title':needsTitleOnly
        });
        // Do something with the updated variable
        // console.log("Checkbox is checked:", isChecked);
    });

    document.getElementById('next-button').addEventListener('click', function() {
        // document.getElementById('menu').classList.toggle('open');
        loadNext();
    });
    document.getElementById('prev-button').addEventListener('click', function() {
        // document.getElementById('menu').classList.toggle('open');
        loadPrevious();
    });
    document.getElementById('rand-button').addEventListener('click', function() {
        loadRandom();
    });
}
// function setupMenu(){
//   //menu clicks
//   document.getElementById('menu-toggle-button').addEventListener('click', function() {
//     // Toggle the 'open' class on the dropdown
//     // console.log('toggle');
//     document.getElementById('menu').classList.toggle('open');
//   });
//   document.addEventListener('click', function (event) {
//     const menu = document.getElementById('menu');
//     // const toggleButton = document.getElementById('toggleButton');

//     if (!menu.contains(event.target)) {
//       menu.classList.remove('open');
//     }
//   });

//   //menu items
//   document.getElementById('fullscreen-button').addEventListener('click', function() {
//     if (document.fullscreenElement) {
//         // If already in fullscreen, exit fullscreen
//         document.exitFullscreen();
//     } else {
//         // If not in fullscreen, request fullscreen
//         document.documentElement.requestFullscreen();
//     }
//     closeMenu();
//   });
//   var viewSelect = document.getElementById("view-select");
//   var modeSelect = document.getElementById("mode-select");
//   viewSelect.addEventListener("change", function () {
//     // Perform some action when the view selection changes
//     // console.log("View selection changed:", viewSelect.value);
//     const body = document.body;
//     body.classList.remove(currentView);
//     currentView = viewSelect.value;
//     body.classList.add(currentView);
//     closeMenu();
//   });

//   modeSelect.addEventListener("change", function () {
//     // Perform some action when the view selection changes
//     // console.log("View selection changed:", viewSelect.value);
//     const body = document.body;
//     body.classList.remove(currentMode);
//     currentMode = modeSelect.value;
//     body.classList.add(currentMode);
//     closeMenu();
//   });
//   // document.getElementById('mode-button').addEventListener('click', function() {
//   // const body = document.body;
//   // body.classList.toggle('light-mode');
//   // body.classList.toggle('dark-mode');
//   // });
// }
// function openMenu(){
//   document.getElementById('menu').classList.add('open');
// }
// function closeMenu(){
//   document.getElementById('menu').classList.remove('open');
// }

//time and images
// function updateTime() {
//   const timeDisplay = document.getElementById('time-display');
//   const currentTime = new Date();
//   const hours = currentTime.getHours();
//   const minutes = currentTime.getMinutes();
//   const seconds = currentTime.getSeconds();
//   if(currentHour != hours || currentMinute!=minutes){
//       currentHour = hours;
//       currentMinute = minutes;
//       changeImage();
//   }

//   currentHour = hours;
//   currentMinute = minutes;
  
//   const tickBar = document.getElementById('tick-bar');
//   tickBar.style.width = `${(1 - (seconds/60)) * 100}%`;
//   //display time text
//   // Format the time (12-hour format)
//   const formattedTime = `${hours % 12 || 12}:${minutes < 10 ? '0' : ''}${minutes} <span class="am-pm">${hours < 12 ? 'AM' : 'PM'}<span>`;

//   timeDisplay.innerHTML = `${formattedTime}`;
// }
function setImage(data){
    const path = 'images/';
    const mainImage = document.getElementById('m-image');
    // const newImageSrc = imagePath(data);
    mainImage.src = imagePath(data); //path + subpath + next_data.filename;

}
function changeImage(randomize=false) {
  if(loading) return;

  const path = 'images/';
  const subpath = '2024_01_12/';
  //change image based on current time
  const mainImage = document.getElementById('m-image');
  const mainImageTrans = document.getElementById('m-image-trans');
  const nextImagePreload = document.getElementById('m-image-preload');

  // const currentImageSrc = mainImage.src;
  
  // Change to a different image source
  // const currentTime = new Date();
  var now = new Date();
  if(next_data==null){
  //also load in the current
  current_data = getMattressData(now.getHours(), now.getMinutes())
  }else{
  current_data = next_data;
  }
  
  if(randomize){
  next_data = getRandomData();
  }else{
  var nextTime = new Date();
  nextTime.setMinutes(now.getMinutes() + 1);
  const nextHours = nextTime.getHours();
  const nextMinutes = nextTime.getMinutes();
  next_data = getMattressData(nextHours, nextMinutes)
  }
  //also preload the image here
  // console.log("next_data:", next_data);
  // console.log("current_data:", current_data);
  updateMetaData(current_data);
  const newImageSrc = path + subpath + current_data.filename//currentImageSrc.includes('your-image.jpg') ? 'new-image.jpg' : 'your-image.jpg';
  img_index++;

  //preload next
  nextImagePreload.src = path + subpath + next_data.filename;
  
  var rotValue = 10;
  //prep images for transition
  mainImageTrans.style.transition = 'none';
  mainImageTrans.style.opacity = 1;
  mainImageTrans.src = mainImage.src;
  mainImageTrans.style.transform = 'rotate(0deg)';
  
  if(currentView != "view-circle"){
    rotValue = 0;
  }
  
  mainImage.style.transition = 'none';
  mainImage.src = newImageSrc;
  mainImage.style.transform = 'rotate(-'+rotValue+'deg)';

  const duration = 10;//ms
  const fadeDuration = 0.3;
  const cssDuration = 0.25;
  setTimeout(() => {
      //swap images and bring back to 100% opacity
      // mainImage.src = newImageSrc;
      // mainImage.style.opacity = 1;
      mainImageTrans.style.transition = 'opacity '+fadeDuration+'s ease-out, transform '+cssDuration+'s cubic-bezier(0.175, 0.885, 0.32, 1.275)'; //should be transition
      mainImageTrans.style.opacity = 0;
      mainImageTrans.style.transform = 'rotate('+rotValue+'deg) translateZ(0)';

      mainImage.style.transition = 'opacity '+fadeDuration+'s ease-out, transform '+cssDuration+'s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      mainImage.style.transform = 'rotate(0deg)';
  }, duration); // 500ms is the duration of the CSS transition
  // mainImage.src = newImageSrc;
}

//
function updateMetaData(data){
//   const metaDisplay = document.getElementById('meta-display');
//   metaDisplay.innerHTML = formatMetaData(data);//formatted;
}

//state
var loading = true;
var currentView="view-fit"
var currentMode="light-mode"
// var img_index=0;
// var mattress_data=[]
// var current_data=null
// var next_data=null
// var currentHour=-1
// var currentMinute=-1;

init();
load(currentUId);
loading = false;

// loadImageData().then((imageData) => {
//   console.log('loaded');
//   mattress_data = imageData;
//   // console.log(mattress_data);
//   loading = false;
//   init();
// });