const unReadMessages1 = document.querySelectorAll('.unread1');
const unReadMessages2 = document.querySelectorAll('.unread2');
const unReadMessages3 = document.querySelectorAll('.unread3');
const unReadMessages4 = document.querySelectorAll('.unread4');
const unReadMessages5 = document.querySelectorAll('.unread5');
const unReadMessages6 = document.querySelectorAll('.unread6');
const unReadMessages7 = document.querySelectorAll('.unread7');


const unReadMessagesCount = document.getElementById('num-of-notif');
const markAll = document.getElementById('mark-as-read');

unReadMessagesCount.innerText = unReadMessages1.length + unReadMessages2.length + unReadMessages3.length + unReadMessages4.length + unReadMessages5.length + unReadMessages6.length + unReadMessages7.length ;

unReadMessages1.forEach((message) => {
    message.addEventListener('click', () => {
        message.classList.remove('unread1');
        const newUnreadMessages = document.querySelectorAll('.unread1');
        unReadMessagesCount.innerText = newUnreadMessages.length;

        unReadMessages1.forEach((button) => {
            button.addEventListener('click', () => {
                const form = document.getElementById('readNotificationFormClub1');
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
                const form = document.getElementById('readNotificationFormClub2');
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
                const form = document.getElementById('readNotificationFormClub3');
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
                const form = document.getElementById('readNotificationFormClub4');
                if (form) {
                    form.submit();
                }
            });
        });
    });
});

unReadMessages5.forEach((message) => {
    message.addEventListener('click', () => {
        message.classList.remove('unread5');
        const newUnreadMessages = document.querySelectorAll('.unread5');
        unReadMessagesCount.innerText = newUnreadMessages.length;

        unReadMessages5.forEach((button) => {
            button.addEventListener('click', () => {
                const form = document.getElementById('readNotificationFormClub5');
                if (form) {
                    form.submit();
                }
            });
        });
    });
});

unReadMessages6.forEach((message) => {
    message.addEventListener('click', () => {
        message.classList.remove('unread6');
        const newUnreadMessages = document.querySelectorAll('.unread6');
        unReadMessagesCount.innerText = newUnreadMessages.length;

        unReadMessages6.forEach((button) => {
            button.addEventListener('click', () => {
                const form = document.getElementById('readNotificationFormClub6');
                if (form) {
                    form.submit();
                }
            });
        });
    });
});

unReadMessages7.forEach((message) => {
    message.addEventListener('click', () => {
        message.classList.remove('unread7');
        const newUnreadMessages = document.querySelectorAll('.unread7');
        unReadMessagesCount.innerText = newUnreadMessages.length;

        unReadMessages7.forEach((button) => {
            button.addEventListener('click', () => {
                const form = document.getElementById('readNotificationFormClub7');
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
    unReadMessages5.forEach((message) => {
        message.classList.remove('unread5');
    });
    const newUnreadMessages = document.querySelectorAll('.unread1 .unread2 .unread3 .unread4 .unread5');
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

