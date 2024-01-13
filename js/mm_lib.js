//setup
async function loadImageData() {
    try {
        const response = await fetch('images/2024_01_12.json');
        const imageData = await response.json();
        return imageData;
    } catch (error) {
        console.error('Error loading image data:', error);
        return [];
    }
}

//main stuff
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
    const formattedTime = `${hours % 12 || 12}:${minutes < 10 ? '0' : ''}${minutes} ${hours < 12 ? 'AM' : 'PM'}`;

    timeDisplay.textContent = `${formattedTime}`;
}

function getImgIndex(){
    //for time
    const currentTime = new Date();
    return img_index%mattress_data.length;
}
function getMattressData(hour, minute){
    //add in the day of the year
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const diff = now - startOfYear;
    const oneDay = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds
    const dayOfYear = Math.floor(diff / oneDay);

    var mult = hour*minute;
    var div = minute/hour;
    var extrawild = mult+div;
    var numStr = "min" + hour.toString() + minute.toString() + dayOfYear.toString() + extrawild.toString();
    console.log("numStr", numStr);
    var timeNum = simpleHash(numStr);
    console.log("timeNum", timeNum);
    var index = timeNum%mattress_data.length;
    return mattress_data[index];
    // return minute;
}
function getRandomData(){
    return mattress_data[Math.floor(Math.random()*(mattress_data.length-1))];
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
    console.log("next_data:", next_data);
    console.log("current_data:", current_data);
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
//https://www.google.com/maps/place/40%C2%B043'22.8%22N+73%C2%B056'40.8%22W
function formatLatLong(latLongString) {
    // Split the string into latitude and longitude parts
    const [latPart, longPart] = latLongString.split('+');
    
    // Split each part into degrees, minutes, and seconds
    const [latDeg, latMin, latSec] = latPart.split(',').map(parseFloat);
    const [longDeg, longMin, longSec] = longPart.split(',').map(parseFloat);

    // Format each part with symbols
    const formattedLat = `${latDeg}°${latMin}'${latSec}"N`;
    const formattedLong = `${longDeg}°${longMin}'${longSec}"W`;

    // Create the Google Maps link
    const googleMapsLink = `https://www.google.com/maps/place/${encodeURIComponent(formattedLat)}+${encodeURIComponent(formattedLong)}`;

    // Return the formatted string along with the Google Maps link
    return {
    formattedString: `${formattedLat}, ${formattedLong}`,
    googleMapsLink: googleMapsLink
    };
}

function updateMetaData(data){
    const metaDisplay = document.getElementById('meta-display');
    formatted = "";
    if(data.id!=null){
    formatted += `${data.id}<br>`
    }
    if(data.lat_long_dms != null){
    let formLatLong = formatLatLong(data.lat_long_dms)
    formatted+=`<a href="${formLatLong.googleMapsLink}">${formLatLong.formattedString}</a><br>`;
    }
    if(data.make != null){
    formatted+=`${data.make} ${data.model}<br>`;
    }
    if(data.date_taken != null){
    formatted+=`${data.date_taken}`;
    }
    metaDisplay.innerHTML = formatted;
}
function formatMetaData(data){
    // const metaDisplay = document.getElementById('meta-display');
    formatted = "";
    if(data.id!=null){
    formatted += `${data.id}<br>`
    }
    if(data.lat_long_dms != null){
    let formLatLong = formatLatLong(data.lat_long_dms)
    formatted+=`<a href="${formLatLong.googleMapsLink}">${formLatLong.formattedString}</a><br>`;
    }
    if(data.make != null){
    formatted+=`${data.make} ${data.model}<br>`;
    }
    if(data.date_taken != null){
    formatted+=`${data.date_taken}`;
    }
    return formatted;
}
function setupMenu(){
    document.getElementById('menu').addEventListener('click', function() {
    // Toggle the 'open' class on the dropdown
    // console.log('toggle');
    document.getElementById('menu').classList.toggle('open');
    });
    document.getElementById('fullscreen-button').addEventListener('click', function() {
    if (document.fullscreenElement) {
        // If already in fullscreen, exit fullscreen
        document.exitFullscreen();
    } else {
        // If not in fullscreen, request fullscreen
        document.documentElement.requestFullscreen();
    }
    });
    document.getElementById('mode-button').addEventListener('click', function() {
    const body = document.body;
    body.classList.toggle('light-mode');
    body.classList.toggle('dark-mode');
    });
}

//get the image paths
function imagePath(data){
    const path = 'images/';
    const subpath = '2024_01_12/';
    return path + subpath + data.filename;
}
function thumbPath(data){
    const path = 'images/';
    const subpath = '2024_01_12/thumbnails/t_';
    return path + subpath + data.filename;
}

// Using the SHA-256 hash function
// function hashNumbers(num1, num2) {
//     const inputString = num1.toString() + "mattress" + num2.toString();
//     const hashedString = sha256(inputString); // You'll need a SHA-256 implementation

//     // Convert the hexadecimal hash to a decimal value between 0 and 1
//     const decimalValue = parseInt(hashedString, 16) / (Math.pow(16, hashedString.length));

//     return decimalValue;
// }
// async function sha256(inputString) {
//     const encoder = new TextEncoder();
//     const data = encoder.encode(inputString);
//     const hashBuffer = await crypto.subtle.digest('SHA-256', data);

//     // Convert the buffer to a hexadecimal string
//     const hashArray = Array.from(new Uint8Array(hashBuffer));
//     const hashedString = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

//     return hashedString;
// }

function simpleHash(inputString) {
    let hash = 0;

    for (let i = 0; i < inputString.length; i++) {
        const charCode = inputString.charCodeAt(i);
        hash = (hash << 5) - hash + charCode;
    }

    // Ensure the result is non-negative
    return Math.abs(hash);
}

//sorting
function sortByDate(a, b) {
    if (!a.date_taken && !b.date_taken) {
      return 0;
    }
  
    if (!a.date_taken) {
      return 1;
    }
  
    if (!b.date_taken) {
      return -1;
    }
  
    var dateA = new Date(a.date_taken.split(' ')[0].replace(/:/g, '-'));
    var dateB = new Date(b.date_taken.split(' ')[0].replace(/:/g, '-'));
  
    return dateA - dateB;
  }