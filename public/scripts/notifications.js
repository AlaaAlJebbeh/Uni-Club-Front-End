const unReadMessages = document.querySelectorAll('.unread');
const unReadMessages2 = document.querySelectorAll('.unread2');
const unReadMessages3 = document.querySelectorAll('.unread3');

const unReadMessagesCount = document.getElementById('num-of-notif');
const markAll = document.getElementById('mark-as-read');

unReadMessagesCount.innerText = unReadMessages.length + unReadMessages2.length + unReadMessages3.length;

unReadMessages.forEach((message) => {
    message.addEventListener('click', () => {
        message.classList.remove('unread');
        const newUnreadMessages = document.querySelectorAll('.unread');
        unReadMessagesCount.innerText = newUnreadMessages.length;

        unReadMessages.forEach((button) => {
            button.addEventListener('click', () => {
                const form = document.getElementById('readNotificationForm');
                if (form) {
                    form.submit();
                }
            });
        });
    });
});

unReadMessages2.forEach((message) => {
    message.addEventListener('click', () => {
        message.classList.remove('unread2');
        const newUnreadMessages = document.querySelectorAll('.unread2');
        unReadMessagesCount.innerText = newUnreadMessages.length;

        unReadMessages2.forEach((button) => {
            button.addEventListener('click', () => {
                const form = document.getElementById('readNotificationFormPosts');
                if (form) {
                    form.submit();
                }
            });
        });
    });
});

unReadMessages3.forEach((message) => {
    message.addEventListener('click', () => {
        message.classList.remove('unread3');
        const newUnreadMessages = document.querySelectorAll('.unread3');
        unReadMessagesCount.innerText = newUnreadMessages.length;

        unReadMessages3.forEach((button) => {
            button.addEventListener('click', () => {
                const form = document.getElementById('readNotificationFormPostsEdits');
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
    const newUnreadMessages = document.querySelectorAll('.unread, .unread2');
    unReadMessagesCount.innerHTML = newUnreadMessages.length;

    
});

$(document).ready(function() {
    // Add click event listener to all buttons with the class 'post-button'
    $('.read-notification').click(function() {
        // Retrieve the post ID from the button's ID
        var eventToShareId = parseInt($(this).attr('id').split('_')[1]);
        console.log('Button clicked for eventToShareId ID:', eventToShareId);
        // Perform further actions if needed
    });
})