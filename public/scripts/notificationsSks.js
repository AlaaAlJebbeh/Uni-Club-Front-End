const unReadMessages = document.querySelectorAll('.unread');

const unReadMessagesCount = document.getElementById('num-of-notif');
const markAll = document.getElementById('mark-as-read');

unReadMessagesCount.innerText = unReadMessages.length;

unReadMessages.forEach((message) => {
    message.addEventListener('click', () => {
        message.classList.remove('unread');
        const newUnreadMessages = document.querySelectorAll('.unread');
        unReadMessagesCount.innerText = newUnreadMessages.length;

        unReadMessages.forEach((button) => {
            button.addEventListener('click', () => {
                const form = document.getElementById('readNotificationFormNewEvent');
                if (form) {
                    form.submit();
                }
            });
        });
    });
});


// Mark as All read part
markAll.addEventListener('click', () => {
    unReadMessages.forEach((message) => {
        message.classList.remove('unread');
    });
    const newUnreadMessages = document.querySelectorAll('.unread');
    unReadMessagesCount.innerHTML = newUnreadMessages.length;

    
});

$(document).ready(function() {
    // Add click event listener to all buttons with the class 'post-button'
    $('.read-notification').click(function() {
        // Retrieve the post ID from the button's ID
        var notify_id = parseInt($(this).attr('id').split('_')[1]);
        console.log('Button clicked for eventToShareId ID:', notify_id);
        // Perform further actions if needed
    });
})