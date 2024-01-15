function buildPage(dataArray) {
    var contentDiv = document.getElementById('content');

    var details={};
    details.count = dataArray.length;

    dataArray.forEach(function(data) {
        // Create HTML elements for each data object
        var container = document.createElement('li');
        container.classList.add('data-container');

        var imagelink = document.createElement('a');
        imagelink.href = imagePath(data);

        var image = document.createElement('img');
        image.src = thumbPath(data); //.filename;
    //   image.alt = data.id; // Use a relevant attribute for alt text

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
            // li.classList.toggle('selected');
        });
        // onchange="handleCheckboxChange(this)"
        checkbox.value = data.id; // Assuming 'id' is the unique identifier for each item

        var description = document.createElement('p');
        // var additionalMeta = `${data.filename}<br/>size:${data.width}x${data.height}<br/>set: ${data.data_set}.json`;
        var tagStr="";
        if(data.tags!=null && data.tags!=undefined){
            tagStr = `<br/>tags: ${data.tags}`
        }
        description.innerHTML = `${data.filename}<br/>${formatMetaData(data)}<br/>size:${data.width}x${data.height}<br/>set: ${data.data_set}.json${tagStr}`; //`ID: ${data.id}<br/>Taken with: ${data.make} ${data.model}<br/>${data.date_taken}`;

        // Append elements to the container
        imagelink.append(image);
        container.appendChild(imagelink);
        container.appendChild(description);
        container.appendChild(checkbox);

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

//actions
function getSelectedItems() {
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
    document.getElementById('get-selected-button').addEventListener('click', function() {
        var dataItems = getSelectedItems();
        console.log(dataItems);

    });
    document.getElementById('unselect-all-button').addEventListener('click', function() {
        console.log(unSelectAll());
    });
    //
}

loadImageData().then((imageData) => {
    console.log('loaded');
    mattress_data = imageData;
    // console.log(mattress_data[0].id, mattress_data[1].id, mattress_data[2].id);
    mattress_data.sort(sortByDate);
    init();
    
});