const unReadMessages1 = document.querySelectorAll('.unread1');
const unReadMessages2 = document.querySelectorAll('.unread2');
const unReadMessages3 = document.querySelectorAll('.unread3');
const unReadMessages4 = document.querySelectorAll('.unread4');



const unReadMessagesCount = document.getElementById('num-of-notif');
const markAll = document.getElementById('mark-as-read');

unReadMessagesCount.innerText = unReadMessages1.length + unReadMessages2.length + unReadMessages3.length + unReadMessages4.length;

unReadMessages1.forEach((message) => {
    message.addEventListener('click', () => {
        message.classList.remove('unread1');
        const newUnreadMessages = document.querySelectorAll('.unread1');
        unReadMessagesCount.innerText = newUnreadMessages.length;

        unReadMessages1.forEach((button) => {
            button.addEventListener('click', () => {
                const form = document.getElementById('readNotificationSks1');
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
                const form = document.getElementById('readNotificationSks2');
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
                const form = document.getElementById('readNotificationSks3');
                if (form) {
                    form.submit();
                }
            });
        });
    });
});

unReadMessages4.forEach((message) => {
    message.addEventListener('click', () => {
        message.classList.remove('unread4');
        const newUnreadMessages = document.querySelectorAll('.unread4');
        unReadMessagesCount.innerText = newUnreadMessages.length;

        unReadMessages4.forEach((button) => {
            button.addEventListener('click', () => {
                const form = document.getElementById('readNotificationSks4');
                if (form) {
                    form.submit();
                }
            });
        });
    });
});


// Mark as All read part
markAll.addEventListener('click', () => {
    unReadMessages1.forEach((message) => {
        message.classList.remove('unread1');
    });
    unReadMessages2.forEach((message) => {
        message.classList.remove('unread2');
    });
    unReadMessages3.forEach((message) => {
        message.classList.remove('unread3');
    });
    unReadMessages4.forEach((message) => {
        message.classList.remove('unread4');
    });
    const newUnreadMessages = document.querySelectorAll('.unread1 .unread2 .unread3 .unread4');
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