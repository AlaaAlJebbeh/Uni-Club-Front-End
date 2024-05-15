
const search = document.querySelector('.input-group input'),
    table_rows = document.querySelectorAll('tbody tr'),
    table_headings = document.querySelectorAll('thead th');

// 1. Searching for specific data of HTML table
search.addEventListener('input', searchTable);

function searchTable() {
    table_rows.forEach((row, i) => {
        let table_data = row.textContent.toLowerCase(),
            search_data = search.value.toLowerCase();

        row.classList.toggle('hide', table_data.indexOf(search_data) < 0);
        row.style.setProperty('--delay', i / 25 + 's');
    })

    document.querySelectorAll('tbody tr:not(.hide)').forEach((visible_row, i) => {
        visible_row.style.backgroundColor = (i % 2 == 0) ? 'transparent' : '#0000000b';
    });
}

// 2. Sorting | Ordering data of HTML table

table_headings.forEach((head, i) => {
    let sort_asc = true;
    head.onclick = () => {
        table_headings.forEach(head => head.classList.remove('active'));
        head.classList.add('active');

        document.querySelectorAll('td').forEach(td => td.classList.remove('active'));
        table_rows.forEach(row => {
            row.querySelectorAll('td')[i].classList.add('active');
        })

        head.classList.toggle('asc', sort_asc);
        sort_asc = head.classList.contains('asc') ? false : true;

        sortTable(i, sort_asc);
    }
})


function sortTable(column, sort_asc) {
    [...table_rows].sort((a, b) => {
        let first_row = a.querySelectorAll('td')[column].textContent.toLowerCase(),
            second_row = b.querySelectorAll('td')[column].textContent.toLowerCase();

        return sort_asc ? (first_row < second_row ? 1 : -1) : (first_row < second_row ? -1 : 1);
    })
        .map(sorted_row => document.querySelector('tbody').appendChild(sorted_row));
}

// 3. Converting HTML table to PDF

const pdf_btn = document.querySelector('#toPDF');
const customers_table = document.querySelector('#customers_table');


const toPDF = function (customers_table) {
    const html_code = `
    <!DOCTYPE html>
    <link rel="stylesheet" type="text/css" href="style.css">
    <main class="table" id="customers_table">${customers_table.innerHTML}</main>`;

    const new_window = window.open();
     new_window.document.write(html_code);

    setTimeout(() => {
        new_window.print();
        new_window.close();
    }, 400);
}

pdf_btn.onclick = () => {
    toPDF(customers_table);
}

// 4. Converting HTML table to JSON

const json_btn = document.querySelector('#toJSON');

const toJSON = function (table) {
    let table_data = [],
        t_head = [],

        t_headings = table.querySelectorAll('th'),
        t_rows = table.querySelectorAll('tbody tr');

    for (let t_heading of t_headings) {
        let actual_head = t_heading.textContent.trim().split(' ');

        t_head.push(actual_head.splice(0, actual_head.length - 1).join(' ').toLowerCase());
    }

    t_rows.forEach(row => {
        const row_object = {},
            t_cells = row.querySelectorAll('td');

        t_cells.forEach((t_cell, cell_index) => {
            const img = t_cell.querySelector('img');
            if (img) {
                row_object['customer image'] = decodeURIComponent(img.src);
            }
            row_object[t_head[cell_index]] = t_cell.textContent.trim();
        })
        table_data.push(row_object);
    })

    return JSON.stringify(table_data, null, 4);
}

json_btn.onclick = () => {
    const json = toJSON(customers_table);
    downloadFile(json, 'json')
}

// 5. Converting HTML table to CSV File

const csv_btn = document.querySelector('#toCSV');

const toCSV = function (table) {
    // Code For SIMPLE TABLE
    // const t_rows = table.querySelectorAll('tr');
    // return [...t_rows].map(row => {
    //     const cells = row.querySelectorAll('th, td');
    //     return [...cells].map(cell => cell.textContent.trim()).join(',');
    // }).join('\n');

    const t_heads = table.querySelectorAll('th'),
        tbody_rows = table.querySelectorAll('tbody tr');

    const headings = [...t_heads].map(head => {
        let actual_head = head.textContent.trim().split(' ');
        return actual_head.splice(0, actual_head.length - 1).join(' ').toLowerCase();
    }).join(',') + ',' + 'image name';

    const table_data = [...tbody_rows].map(row => {
        const cells = row.querySelectorAll('td'),
            img = decodeURIComponent(row.querySelector('img').src),
            data_without_img = [...cells].map(cell => cell.textContent.replace(/,/g, ".").trim()).join(',');

        return data_without_img + ',' + img;
    }).join('\n');

    return headings + '\n' + table_data;
}

csv_btn.onclick = () => {
    const csv = toCSV(customers_table);
    downloadFile(csv, 'csv', 'customer orders');
}

// 6. Converting HTML table to EXCEL File

const excel_btn = document.querySelector('#toEXCEL');

const toExcel = function (table) {
    // Code For SIMPLE TABLE
    // const t_rows = table.querySelectorAll('tr');
    // return [...t_rows].map(row => {
    //     const cells = row.querySelectorAll('th, td');
    //     return [...cells].map(cell => cell.textContent.trim()).join('\t');
    // }).join('\n');

    const t_heads = table.querySelectorAll('th'),
        tbody_rows = table.querySelectorAll('tbody tr');

    const headings = [...t_heads].map(head => {
        let actual_head = head.textContent.trim().split(' ');
        return actual_head.splice(0, actual_head.length - 1).join(' ').toLowerCase();
    }).join('\t') + '\t' + 'image name';

    const table_data = [...tbody_rows].map(row => {
        const cells = row.querySelectorAll('td'),
            img = decodeURIComponent(row.querySelector('img').src),
            data_without_img = [...cells].map(cell => cell.textContent.trim()).join('\t');

        return data_without_img + '\t' + img;
    }).join('\n');

    return headings + '\n' + table_data;
}

excel_btn.onclick = () => {
    const excel = toExcel(customers_table);
    downloadFile(excel, 'excel');
}

const downloadFile = function (data, fileType, fileName = '') {
    const a = document.createElement('a');
    a.download = fileName;
    const mime_types = {
        'json': 'application/json',
        'csv': 'text/csv',
        'excel': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }
    a.href = `
        data:${mime_types[fileType]};charset=utf-8,${encodeURIComponent(data)}
    `;
    document.body.appendChild(a);
    a.click();
    a.remove();
}


$(document).ready(function() {
    // Add click event listener to all buttons with the class 'post-button'
    $('.details-button').click(function() {
        // Retrieve the post ID from the button's ID
        var PostID = parseInt($(this).attr('id').split('_')[1]);
        console.log('Button clicked for profile edit ID:', PostID);
        // Perform further actions if needed
    });
});

function showPopup(buttonId) {
    // Make a GET request to fetch the popup content for the given button ID
    fetch(`/popupPost?buttonId=${buttonId}`)
    .then(response => response.text())
    .then(data => {
        // Insert the fetched popup content into the popup container
        document.getElementById("popupPost").innerHTML = data;
        // Display the popup
        document.getElementById("popupPost").style.display = "block";
    })
    .catch(error => console.error('Error fetching popup content:', error));
}

function showPopupedit(buttonId) {
    // Make a GET request to fetch the popup content for the given button ID
    fetch(`/popupContentedit?buttonId=${buttonId}`)
    .then(response => response.text())
    .then(data => {
        // Insert the fetched popup content into the popup container
        document.getElementById("popupedit").innerHTML = data;
        // Display the popup
        document.getElementById("popupedit").style.display = "block";
    })
    .catch(error => console.error('Error fetching popup content:', error));
}


/////DONT TOUCH THIS CODE YET/////

/*function approvePost(PostId, temp_id, requestTypeMap) {
    let endpoint = `/approvePost?postId=${PostId}`; // Default endpoint for regular posts

    // Check if RequestId is defined
    if (temp_id) {
        endpoint = `/approvePostEdit?postId=${PostId}&RequestId=${temp_id}`; // Use endpoint for post edit requests
    }

    fetch(endpoint, {
        method: 'POST' // Assuming you're using POST method for updating data
    })
    .then(response => {
        if (response.ok) {
            const statusElement = document.getElementById(`buttonId${PostId}_${temp_id}`); // Update status element ID
            if (statusElement) {
                statusElement.textContent = "approved";
            }
            console.log('post approved successfully!');
            // Optionally, update the UI to reflect the approval
        } else {
            console.error('Failed to approve profile edit:', response.statusText);
        }
    })
    .catch(error => console.error('Error approving profile edit:', error));
    
}
approvePost(PostId, temp_id, requestTypeMap);*/

/*function reject(temp_id) {
    window.selectedRequestId = temp_id;
    showPopup2(temp_id);
}

function reject2(postId) {
    window.selectedPostID = postId;
    showPopup2(postId);
}


function sendRejectionReason() {
    const rejectionReason = document.getElementById('rejectionReason').value;
    const temp_id = window.selectedRequestId; // Use temp_id for profile edits
    // Send rejection reason to server
    fetch(`/rejectProfileEdit?temp_id=${temp_id}`, { // Use /rejectProfileEdit endpoint
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rejectionReason: rejectionReason })
    }).then(response => {
        if (response.ok) {
            // Profile edit rejected successfully, close popup or do something else
            closePopup2();
        } else {
            // Handle error
        }
    }).catch(error => {
        console.error('Error sending rejection reason:', error);
        // Handle error
    });
}

function sendRejectionReason2() {
    const rejectionReason = document.getElementById('rejectionReason').value;
    const postId = window.selectedPostID;
    // Send rejection reason to server
    fetch(`/rejectPost?postId=${postId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rejectionReason: rejectionReason })
    }).then(response => {
        if (response.ok) {
            // Post rejected successfully, close popup or do something else
            closePopup2();
        } else {
            // Handle error
        }
    }).catch(error => {
        console.error('Error sending rejection reason:', error);
        // Handle error
    });
}



  // Function to display the popup
  // Function to display the popup
function showPopup2(id) {
    var popup = document.getElementById("reject_" + id);
    popup.style.display = "block";
}

  // Function to close the popup
  function closePopup2() {
    var popup = document.getElementById("reject");
    popup.style.display = "none";
  }
*/
////////I REPEAT DONT TOUCH THIS CODEE///
