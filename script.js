// connet to locat host
const socket = io.connect("http://localhost:3000");

let username = "";
let roomId = "";
let imgUrl = "";

/****************************
    Dom elements Starts
*****************************/
// login form dom elements
const loginSection = document.getElementById("login-section");
const joinChatBtn = document.getElementById("joinChat-btn");
const userInput = document.getElementById("username-input");
const roomInput = document.getElementById("roomId-input");
const urlInput = document.getElementById("url-input");

// Online users and notifications dom elements
const onlineFriendsContainer = document.getElementById(
  "online-friends-container"
);
const notifications = document.getElementById("notifications");
const notificationConnection = document.getElementById(
  "notification-connection"
);
const welcomeMsg = document.getElementById("welcome-msg");
const typingMsg = document.getElementById("typing-msg");

// send message dom elemets
const homePage = document.getElementById("home-page");
const messageContainer = document.getElementById("message-container");
const sendButton = document.getElementById("send-button");
const messageInput = document.getElementById("message-input");

/*********************************************************
    Dom elements ends
**********************************************************/

// Join the chat starts --------------------------------------------------------
joinChatBtn.addEventListener("click", () => {
  if (userInput.value && roomInput.value && urlInput.value) {
    // join the chat room
    username = userInput.value;
    roomId = roomInput.value;
    imgUrl = urlInput.value;
    socket.emit("join_room", { username, roomId, imgUrl });
    welcomeMsg.textContent = `Welcome! ${username}`;

    // disable the form section
    loginSection.style.display = "none";

    // Enable the home page
    homePage.style.display = "block";
  }
}); // Join chat ends ---------------------------------------------

// Send the message starts ----------------------------------------
sendButton.addEventListener("click", () => {
  const message = messageInput.value;
  messageInput.value = "";
  const messageObj = {
    username,
    time: Date.now(),
    message: message,
    img: imgUrl,
  };
  socket.emit("message_data", roomId, messageObj);
}); // Send the message ends --------------------------------------------

/*******************************************************************************************************************
 * 
    Listen from the server starts here
 * 
********************************************************************************************************************/

// join notification
socket.on("join_notification", (msg) => {
  console.log(msg);
  const newNotification = `
    <li> ${msg}</li>
    `;
  notifications.insertAdjacentHTML("afterbegin", newNotification);
});

// On user online
socket.on("online_users", (data) => {
  // Connected user notification
  notificationConnection.innerHTML = `Connected Users: ${data.length}`;

  // load connected users
  onlineFriendsContainer.innerHTML = "";
  data.forEach((user) => {
    addOnlineUser(user);
  });
});

// Load previous chat
socket.on("previous_chat", (data) => {
  data.forEach((chat) => {
    addMessage(chat);
  });
});

//
socket.on("sendMessage", (data) => {
  console.log(data);

  addMessage(data);
});

socket.on("connected_message", (data) => {
  console.log(data);
});
/*******************************************************************************************************************
    Listen from the server ends here
********************************************************************************************************************/

/*******************************************************************************************************************
 * 
    funtion defination
 * 
********************************************************************************************************************/
// Function to add new message into message container
//----------------------------------------------------
function addMessage(data) {
  const newMessage = `
    <li class="d-flex ${
      username == data.username ? "flex-row-reverse" : ""
    } justify-content-between mb-4">
      <img
          src=${data.img}
          alt="avatar"
          class="rounded-circle object-fit-cover ${
            username == data.username ? "ms-3" : "me-3"
          }   shadow-1-strong"
          width="60"
          height='60'
      />
      <div class="card mask-custom w-100">
          <div class="card-header d-flex justify-content-between p-3"
          style="border-bottom: 1px solid rgba(255, 255, 255, 0.3)"
          >
              <p class="fw-bold mb-0 me-5">${data.username}</p>
              <p class="text-light small mb-0">
                  <i class="far fa-clock"></i> ${new Date(
                    data.createdAt
                  ).toLocaleTimeString()}
              </p>
          </div>
          <div class="card-body">
              <p class="mb-0">
                  ${data.message}
              </p>
          </div>
      </div>
      </li>`;
  messageContainer.insertAdjacentHTML("beforeend", newMessage);
}

// Function to add online user to the online friends container
//-------------------------------------------------------------
function addOnlineUser(data) {
  const newOnlineUser = `
  <li class="d-flex justify-content-between align-items-center mb-2">
    <div class="d-flex flex-row align-items-center">
      <div class="position-relative">
        <span
          class="position-absolute translate-middle p-2 bg-success border border-light rounded-circle"
          style="margin-top: 10px; margin-left: 55px"
        ></span>
        <img
          src=${data.img}
          alt="avatar"
          class="rounded-circle object-fit-cover me-3 shadow-1-strong"
          width="60"
          height='60'
        />
      </div>

      <div class="pt-1">
        <p class="fw-bold mb-0">${data.username}</p>
      </div>
    </div>
  </li>`;
  onlineFriendsContainer.insertAdjacentHTML("beforeend", newOnlineUser);
}
/*******************************************************************************************************************
    Function definition ends 
********************************************************************************************************************/
