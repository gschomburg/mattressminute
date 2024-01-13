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
        var additionalMeta = `${data.filename}<br/>set: ${data.data_set}.json`;
        description.innerHTML = `${additionalMeta}<br/>${formatMetaData(data)}`; //`ID: ${data.id}<br/>Taken with: ${data.make} ${data.model}<br/>${data.date_taken}`;

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

function init()
{
    //make the page
    buildPage(mattress_data);

    //ui actions
    document.getElementById('get-selected-button').addEventListener('click', function() {
        console.log(getSelectedItems());
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