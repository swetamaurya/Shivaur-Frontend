export async function status_popup(message_you_want_to_show, status_true_or_false) {
    // Inject FontAwesome CSS
    (function() {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
    })();

    // Inject CSS styles
    (function() {
        var style = document.createElement('style');
        style.innerHTML = `
        .overlay_message_curd_1_my {
            position: fixed;
            left: 0;
            top: 0;
            width: 100vw;
            height: 100vh;
            background-color: rgba(0, 0, 0, 0.7);
            z-index: 10;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .succes_1_my {
            background-color: #ff902f;
        }

        .fail_1_my {
            background-color: #CA0B00;
        }

        .my_overlay_btn {
            position: absolute;
            right: 15px;
            top: 10px;
            background: none;
            border: none;
            padding: 0;
            cursor: pointer;
        }

        .my_overlay_btn i {
            font-size: 24px;
            color: black;
        }

        .succes-animation_1_my {
            animation: succes-pulse_1_my 2s infinite;
        }

        .danger-animation_1_my {
            animation: danger-pulse_1_my 2s infinite;
        }

        .custom-modal_1_my {
            position: relative;
            width: 350px;
            min-height: 250px;
            background-color: #fff;
            border-radius: 30px;
            margin: 40px 10px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .custom-modal_1_my .content_1_my {
            position: relative;
            width: 100%;
            text-align: center;
            padding: 20px 0;
            margin-top: 145px;
        }

        .custom-modal_1_my .content_1_my .type_1_my {
            font-size: 18px;
            color: #999;
        }

        .custom-modal_1_my .content_1_my .message-type_1_my {
            font-size: 24px;
            color: #000;
        }

        .custom-modal_1_my .border-bottom_1_my {
            position: absolute;
            width: 300px;
            height: 20px;
            border-radius: 0 0 30px 30px;
            bottom: -20px;
            margin: 0 25px;
        }

        .custom-modal_1_my .icon-top_1_my {
            position: absolute;
            width: 100px;
            height: 100px;
            border-radius: 50%;
            top: -30px;
            margin: 0 125px;
            font-size: 30px;
            color: #fff;
            line-height: 100px;
            text-align: center;
        }

        @keyframes succes-pulse_1_my {
            0% {
                box-shadow: 0px 0px 30px 20px rgba(255, 144, 47, 0.2);
            }
            50% {
                box-shadow: 0px 0px 30px 20px rgba(255, 144, 47, 0.4);
            }
            100% {
                box-shadow: 0px 0px 30px 20px rgba(255, 144, 47, 0.2);
            }
        }

        @keyframes danger-pulse_1_my {
            0% {
                box-shadow: 0px 0px 30px 20px rgba(202, 11, 0, 0.2);
            }
            50% {
                box-shadow: 0px 0px 30px 20px rgba(202, 11, 0, 0.4);
            }
            100% {
                box-shadow: 0px 0px 30px 20px rgba(202, 11, 0, 0.2);
            }
        }
        `;
        document.head.appendChild(style);
    })();

    // Main logic
    let c;
    try {
        const timer_1 = 3;

        // Ternary operator
        let content = `<div class="custom-modal_1_my">
                             ${
                                status_true_or_false
                                    ? `<div class="succes_1_my succes-animation_1_my icon-top_1_my" style="margin-top: 50px;" id="b1b1">${timer_1}</div>
                                       <div class="succes_1_my border-bottom_1_my"></div>
                                       <div class="content_1_my">
                                           <p class="message-type_1_my">${message_you_want_to_show}</p>
                                       </div>`
                                    : `<div class="fail_1_my danger-animation_1_my icon-top_1_my" style="margin-top: 50px;" id="b1b1">${timer_1}</div>
                                       <div class="fail_1_my border-bottom_1_my"></div>
                                       <div class="content_1_my">
                                           <p class="message-type_1_my">${message_you_want_to_show}</p>
                                       </div>`
                            }
                        </div>`;

        // Create a new div for the popup
        const popup = document.createElement('div');
        popup.innerHTML = content;
        popup.classList.add('overlay_message_curd_1_my');
        popup.id = 'overlay_message_curd_1_my';
        document.body.appendChild(popup);

        c = setInterval(function () {
            let timerElement = document.getElementById('b1b1');
            if (Number(timerElement.innerText) <= 1) {
                document.body.removeChild(document.getElementById('overlay_message_curd_1_my'));
                clearInterval(c);
                return;
            }
            timerElement.innerText = Number(timerElement.innerText) - 1;
        }, 1000);
    } catch (error) {
        console.error(error);
        clearInterval(c);
        document.body.removeChild(document.getElementById('overlay_message_curd_1_my'));
    }
    try {
        // document.querySelector('.my_overlay_btn').addEventListener('click', function () {
        //     clearInterval(c);
        //     document.body.removeChild(document.getElementById('overlay_message_curd_1_my'));
        // });
    } catch (error) {
        console.error(error);
    }
}

// =======================================================================================
// =======================================================================================
// =======================================================================================
// =======================================================================================
export async function loading_shimmer() {
    // Inject FontAwesome CSS
    (function() {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
    })();

    // Inject CSS styles
    (function() {
        var style = document.createElement('style');
        style.innerHTML = `
        .overlay_loading_shimmer {
            position: fixed;
            left: 0;
            top: 0;
            width: 100vw;
            height: 100vh;
            background-color: rgba(0, 0, 0, 0.7);
            z-index: 9;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .shimmer-container {
            position: relative;
            width: 150px;
            height: 150px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }

        .loading-circle {
            width: 80px;
            height: 80px;
            border: 8px solid rgba(255, 255, 255, 0.3);
            border-top: 8px solid #ff902f; /* Orange color */
            border-radius: 50%;
            animation: spin 1.5s linear infinite;
            margin-bottom: 20px;
        }

        .shimmer-text {
            font-size: 18px;
            color: white;
            font-weight: bold;
            text-align: center;
        }

        @keyframes spin {
            0% {
                transform: rotate(0deg);
            }
            100% {
                transform: rotate(360deg);
            }
        }
        `;
        document.head.appendChild(style);
    })();

    // Create and display shimmer loading element
    const shimmerPopup = document.createElement('div');
    shimmerPopup.innerHTML = `
        <div class="shimmer-container">
            <div class="loading-circle"></div>
            <div class="shimmer-text">PLEASE WAIT</div>
        </div>
    `;
    shimmerPopup.classList.add('overlay_loading_shimmer');
    shimmerPopup.id = 'overlay_loading_shimmer';
    document.body.appendChild(shimmerPopup);
}

// To remove the shimmer manually, add this function
export function remove_loading_shimmer() {
    const shimmer = document.getElementById('overlay_loading_shimmer');
    if (shimmer) {
        document.body.removeChild(shimmer);
    }
}

