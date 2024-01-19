function buildPage(dataArray) {
    console.log("building");
    var contentDiv = document.getElementById('content');

    var details={};
    details.count = dataArray.length;

    dataArray.forEach(function(data) {
        // Create HTML elements for each data object
        var container = document.createElement('li');
        container.classList.add('data-container');

        var imagelink = document.createElement('a');
        imagelink.href = imagePath(data);
        imagelink.target="_blank";

        var image = document.createElement('img');
        image.src = thumbPath(data); //.filename;

        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList.add('selection');
        checkbox.addEventListener('change', function() {
            console.log(this);
            var li = this.closest('.data-container');
            if(this.checked){
                li.classList.add('selected');
            }else{
                li.classList.remove('selected');
            }
        });
        checkbox.value = data.id; // Assuming 'id' is the unique identifier for each item

        var img_data = document.createElement('div');
        // var additionalMeta = `${data.filename}<br/>size:${data.width}x${data.height}<br/>set: ${data.data_set}.json`;
        // var tagStr="";
        // if(data.tags!=null && data.tags!=undefined){
        //     tagStr = `<br/>tags: ${data.tags}`
        // }
        img_data.classList.add('img-data');

        
        var titleIn = createTextInput('title-'+data.id, 'title:');
        img_data.append(titleIn.label);
        img_data.append(titleIn.input);
        img_data.innerHTML += '<br/>';
        var tagsIn = createTextInput('tags-'+data.id, 'tags:');
        img_data.append(tagsIn.label);
        img_data.append(tagsIn.input);

        img_data.innerHTML += `<br/>${data.filename}<br/>${formatMetaData(data)}<br/>size:${data.width}x${data.height}<br/>set: ${data.data_set}.json<br/>`; //`ID: ${data.id}<br/>Taken with: ${data.make} ${data.model}<br/>${data.date_taken}`;

        // Append elements to the container
        imagelink.append(image);
        container.appendChild(imagelink);
        // container.appendChild(tagsIn);
        container.appendChild(img_data);
        container.appendChild(checkbox);

        // Append the container to the main content div
        contentDiv.appendChild(container);

        // tagsIn.input.value = "HERE?";
        // console.log(tagsIn.input);
        // console.log(tagsIn.input.value);
        //add listeners
    });

    updateDetails(details);
    setInputContent();
}
function setInputContent(){
    mattress_data.forEach(function(data) {
        var tagsEL = document.getElementById('tags-'+data.id);
        if(tagsEL){
            if(data.tags){
                tagsEL.value=data.tags;
            }
            tagsEL.addEventListener('change', function() {
                // Get the id and new tags value
                var id = data.id;  // Replace with the actual id from your input
                var newValue = tagsEL.value;
                updateDB(id, 'tags', newValue);
            });
        }
        var titleEL = document.getElementById('title-'+data.id);
        if(titleEL ){
            if(data.title){
                titleEL.value=data.title;
            }
            titleEL.addEventListener('change', function() {
                // Get the id and new tags value
                var id = data.id;  // Replace with the actual id from your input
                var newValue = titleEL.value;
                updateDB(id, 'title', newValue);
            });
        }
    });
}
function updateDB(id, key, value){
    //set the key value for that img id
    var foundObject = mattress_data.find(obj => obj.id === id);
    if (foundObject) {
        foundObject[key] = value;
        console.log('Tags updated for object with id:', id);
        console.log(key, value);
        // console.log('Updated array:', mattress_data);
    }
}
function createTextInput(elID, labelText){

    var label = document.createElement('label')
    label.textContent = labelText;
    label.setAttribute('for', elID);
    // var label = document.createElement('label');
    var tInput = document.createElement('input');
    tInput.type = 'text';
    tInput.id = elID;
    tInput.placeholder = 'none'
    //set the content of the fields later for some reason setting here does not work
    return {'label':label, 'input':tInput};
}
function updateDetails(details)
{
    const detailsEl = document.getElementById('file-count');
    var formatted="";

    if(details.count != null){
    formatted+=`files:${details.count}`;
    }
    detailsEl.innerHTML = formatted;
}

//actions
function copySelectedItems() {
    var selectedIds = [];

    // Get all checkboxes
    var checkboxes = document.querySelectorAll('.data-container input[type="checkbox"]:checked');

    // Extract the value (ID) from each checked checkbox
    checkboxes.forEach(function (checkbox) {
        selectedIds.push(checkbox.value);
    });
    const filteredObjects = getObjectsByIds(selectedIds, mattress_data);
    var jsonStr = JSON.stringify(filteredObjects)
    navigator.clipboard.writeText(jsonStr)
                .then(() => alert("Copied json to clipboard: " + filteredObjects.length + " items"))
                .catch(err => console.error("Unable to copy to clipboard", err));

    // alert("Copied to clipboard: " + content);

    return selectedIds;
}
function selectAll(){
    var checkboxes = document.querySelectorAll('.data-container input[type="checkbox"]');
    checkboxes.forEach(function (checkbox) {
        // selectedIds.push(checkbox.value);
        checkbox.checked = true;
    });
    //remove classes from li
    var items = document.querySelectorAll('.data-container');
    items.forEach(function (item) {
        // selectedIds.push(checkbox.value);
        // checkbox.checked = false;
        item.classList.add('selected');
    });
}
function unSelectAll(){
    var checkboxes = document.querySelectorAll('.data-container input[type="checkbox"]:checked');
    checkboxes.forEach(function (checkbox) {
        // selectedIds.push(checkbox.value);
        checkbox.checked = false;
    });
    //remove classes from li
    var items = document.querySelectorAll('.data-container');
    items.forEach(function (item) {
        // selectedIds.push(checkbox.value);
        // checkbox.checked = false;
        item.classList.remove('selected');
    });
}
function analyzePlot(data)
{
    var average = data.reduce((sum, value) => sum + value, 0) / data.length;
    var minValue = Math.min(...data);
    var maxValue = Math.max(...data);
    return `AVG:${Math.floor(average)} | MIN:${minValue} | MAX:${maxValue}`
}
function plotDataDist(){
    var info = document.getElementById('plot-info');
    var ctx = document.getElementById('myChart').getContext('2d');
    var data = testHash();
    info.innerHTML = analyzePlot(data);
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.map((_, index) => index), // X-coordinates are indices
          datasets: [{
            label: 'Dist for Year',
            data: data, // Y-values are array values
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          }]
        },
        options: {
          scales: {
            x: {
              type: 'linear',
              position: 'bottom'
            },
            y: {
              beginAtZero: true,
            }
          }
        }
      });
}

function init()
{
    //make the page
    buildPage(mattress_data);

    //plotting
    plotDataDist();

    //ui actions
    document.getElementById('copy-selected-button').addEventListener('click', function() {
        var dataItems = copySelectedItems();
        console.log(dataItems);

    });
    document.getElementById('unselect-all-button').addEventListener('click', function() {
        unSelectAll()
        // console.log(unSelectAll());
    });
    document.getElementById('select-all-button').addEventListener('click', function() {
        // console.log(unSelectAll());
        selectAll();
    });
    //
}
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOMContentLoaded");
}, false);
loadImageData().then((imageData) => {
    console.log('loaded');
    mattress_data = imageData;
    // console.log(mattress_data[0].id, mattress_data[1].id, mattress_data[2].id);
    mattress_data.sort(sortByDate);
    // alert("loaded!");
    init();
});