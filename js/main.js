//mm_lib.js also needs to be loaded in

// functions

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
    // Display parameters
    // console.log('param1:', param1);
    // console.log('param2:', param2);

    // start the timer
    var updateTimeInterval = 10000;
    setInterval(updateTime, updateTimeInterval);

    // Add click event listener to change the image
    const imageContainer = document.getElementById('image-container');
    imageContainer.addEventListener('click', function(){
      changeImage(true);
    });

    //menu interaction
    setupMenu();

    //show the new image and kick this off
    updateTime();
}

//UI STUFF
function setupMenu(){
  //menu clicks
  document.getElementById('menu-toggle-button').addEventListener('click', function() {
    // Toggle the 'open' class on the dropdown
    // console.log('toggle');
    document.getElementById('menu').classList.toggle('open');
  });
  document.addEventListener('click', function (event) {
    const menu = document.getElementById('menu');
    // const toggleButton = document.getElementById('toggleButton');

    if (!menu.contains(event.target)) {
      menu.classList.remove('open');
    }
  });

  //menu items
  document.getElementById('fullscreen-button').addEventListener('click', function() {
    if (document.fullscreenElement) {
        // If already in fullscreen, exit fullscreen
        document.exitFullscreen();
    } else {
        // If not in fullscreen, request fullscreen
        document.documentElement.requestFullscreen();
    }
    closeMenu();
  });
  var viewSelect = document.getElementById("view-select");
  var modeSelect = document.getElementById("mode-select");
  viewSelect.addEventListener("change", function () {
    // Perform some action when the view selection changes
    // console.log("View selection changed:", viewSelect.value);
    const body = document.body;
    body.classList.remove(currentView);
    currentView = viewSelect.value;
    body.classList.add(currentView);
    closeMenu();
  });

  modeSelect.addEventListener("change", function () {
    // Perform some action when the view selection changes
    // console.log("View selection changed:", viewSelect.value);
    const body = document.body;
    body.classList.remove(currentMode);
    currentMode = modeSelect.value;
    body.classList.add(currentMode);
    closeMenu();
  });
  // document.getElementById('mode-button').addEventListener('click', function() {
  // const body = document.body;
  // body.classList.toggle('light-mode');
  // body.classList.toggle('dark-mode');
  // });
}
function openMenu(){
  document.getElementById('menu').classList.add('open');
}
function closeMenu(){
  document.getElementById('menu').classList.remove('open');
}

//time and images
function updateTime() {
  const timeDisplay = document.getElementById('time-display');
  const currentTime = new Date();
  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  if(currentHour != hours || currentMinute!=minutes){
      currentHour = hours;
      currentMinute = minutes;
      changeImage();
  }

  currentHour = hours;
  currentMinute = minutes;
  
  //display time text
  // Format the time (12-hour format)
  const formattedTime = `${hours % 12 || 12}:${minutes < 10 ? '0' : ''}${minutes} <span class="am-pm">${hours < 12 ? 'AM' : 'PM'}<span>`;

  timeDisplay.innerHTML = `${formattedTime}`;
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
      mainImageTrans.style.transform = 'rotate('+rotValue+'deg)';

      mainImage.style.transition = 'opacity '+fadeDuration+'s ease-out, transform '+cssDuration+'s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      mainImage.style.transform = 'rotate(0deg)';
  }, duration); // 500ms is the duration of the CSS transition
  // mainImage.src = newImageSrc;
}

//
function updateMetaData(data){
  const metaDisplay = document.getElementById('meta-display');
  metaDisplay.innerHTML = formatMetaData(data);//formatted;
}

//state
var loading = true;
var currentView="view-circle"
var currentMode="light-mode"
var img_index=0;
var mattress_data=[]
var current_data=null
var next_data=null
var currentHour=-1
var currentMinute=-1;

loadImageData().then((imageData) => {
  console.log('loaded');
  mattress_data = imageData;
  console.log(mattress_data);
  loading = false;
  init();
});