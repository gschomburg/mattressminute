function buildPage(dataArray) {
    var contentDiv = document.getElementById('content');

    var details={};
    details.count = dataArray.length;

    dataArray.forEach(function(data) {
      // Create HTML elements for each data object
      var container = document.createElement('div');
      container.classList.add('data-container');
    
      var imagelink = document.createElement('a');
      imagelink.href = imagePath(data);

      var image = document.createElement('img');
      image.src = thumbPath(data); //.filename;
    //   image.alt = data.id; // Use a relevant attribute for alt text

      var description = document.createElement('p');
      var meta = data.filename;
      description.innerHTML = `${data.filename}<br/>${formatMetaData(data)}`; //`ID: ${data.id}<br/>Taken with: ${data.make} ${data.model}<br/>${data.date_taken}`;

      // Append elements to the container
      imagelink.append(image);
      container.appendChild(imagelink);
      container.appendChild(description);

      // Append the container to the main content div
      contentDiv.appendChild(container);
    });

    updateDetails(details);
  }
  function updateDetails(details)
  {
    const detailsEl = document.getElementById('details');
    var formatted="";

    if(details.count != null){
    formatted+=`files:${details.count}`;
    }
    detailsEl.innerHTML = formatted;
  }

  loadImageData().then((imageData) => {
    console.log('loaded');
    mattress_data = imageData;
    // console.log(mattress_data[0].id, mattress_data[1].id, mattress_data[2].id);
    mattress_data.sort(sortByDate);
    // var dateString = "2015:03:10 09:40:11";
    // var formattedDateString = dateString.split(' ')[0].replace(/:/g, '-');
    // var dateObject = new Date(formattedDateString);
    // console.log("formatted", formattedDateString);
    // console.log("obj", dateObject);
    // console.log("after sort", mattress_data[0].id, mattress_data[1].id, mattress_data[2].id);
    // console.log(mattress_data);
    // loading = false;
    // updateTime();
    // changeImage();
    buildPage(mattress_data);
});